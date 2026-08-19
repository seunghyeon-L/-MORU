"""SQLAlchemy 모델.

server/db/schema.sql 이 원본이다. 스키마를 바꿀 때는 SQL 을 먼저 고치고 여기를 맞춘다.
(Alembic 을 쓰지 않는다. 2주 해커톤에서 마이그레이션 도구는 배보다 배꼽이다.)

지금은 A-2 에 필요한 것만 정의했다. 나머지는 각자 담당이 붙일 때 추가한다.
"""

from datetime import date, datetime

from sqlalchemy import (
    ARRAY, BigInteger, Boolean, Date, DateTime, ForeignKey, Integer,
    Numeric, SmallInteger, String, Text, func,
)
from sqlalchemy.dialects.postgresql import ENUM, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from db_session import Base

# schema.sql 에서 이미 만든 PostgreSQL ENUM 타입을 그대로 쓴다.
# create_type=False 를 안 주면 SQLAlchemy 가 다시 만들려다 충돌하고,
# 그냥 String 으로 두면 배치 INSERT 에서 VARCHAR→ENUM 캐스팅이 깨진다.
TableStatus = ENUM("safe", "candidate", "to_try", "avoiding",
                   name="table_status", create_type=False)
ChallengeStatus = ENUM("proposed", "eliminating", "testing", "done", "abandoned",
                       name="challenge_status", create_type=False)
AttemptResult = ENUM("pending", "reaction", "no_reaction", "skipped",
                     name="attempt_result", create_type=False)
PortionSize = ENUM("half", "one", "one_and_half_plus",
                   name="portion_size", create_type=False)
InputMethod = ENUM("photo", "text", "search",
                   name="input_method", create_type=False)
SymptomOnset = ENUM("just_now", "about_1h", "since_morning", "since_yesterday",
                    name="symptom_onset", create_type=False)
SymptomLocation = ENUM("upper", "lower", name="symptom_location", create_type=False)
SymptomLevel = ENUM("none", "mild", "strong", name="symptom_level", create_type=False)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    device_id: Mapped[str] = mapped_column(Text, unique=True)
    nickname: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    onboarded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    celiac: Mapped[str | None] = mapped_column(Text)
    baseline_frequency: Mapped[str | None] = mapped_column(Text)
    # SF-03 상시 감시. 온보딩을 통과한 뒤에도 차단될 수 있다.
    blocked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class SafetyScreening(Base):
    __tablename__ = "safety_screenings"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"))

    has_blood_in_stool: Mapped[bool] = mapped_column(Boolean, default=False)
    has_weight_loss: Mapped[bool] = mapped_column(Boolean, default=False)
    has_anemia: Mapped[bool] = mapped_column(Boolean, default=False)
    has_night_symptoms: Mapped[bool] = mapped_column(Boolean, default=False)
    has_fever: Mapped[bool] = mapped_column(Boolean, default=False)
    has_vomiting: Mapped[bool] = mapped_column(Boolean, default=False)
    age_over_50: Mapped[bool] = mapped_column(Boolean, default=False)

    cleared_by_doctor: Mapped[bool] = mapped_column(Boolean, default=False)
    blocked: Mapped[bool] = mapped_column(Boolean)
    flags: Mapped[list[str]] = mapped_column(ARRAY(Text), default=list)
    trigger_source: Mapped[str] = mapped_column(String, default="onboarding")
    screened_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


# ═══════════════════════════════════════════
#  A-5 도전 · A-6 나의 식탁
# ═══════════════════════════════════════════

class Ingredient(Base):
    __tablename__ = "ingredients"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    name: Mapped[str] = mapped_column(Text, unique=True)
    aliases: Mapped[list[str]] = mapped_column(ARRAY(Text), default=list)
    category: Mapped[str | None] = mapped_column(Text)


class Food(Base):
    __tablename__ = "foods"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    name: Mapped[str] = mapped_column(Text, unique=True)
    typical_grams: Mapped[float | None] = mapped_column(Numeric(7, 2))
    has_broth: Mapped[bool] = mapped_column(Boolean, default=False)


class FoodIngredient(Base):
    """B2 에서 미리 체크된 상태로 보여줄 기본 레시피."""

    __tablename__ = "food_ingredients"

    food_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("foods.id", ondelete="CASCADE"), primary_key=True)
    ingredient_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("ingredients.id", ondelete="CASCADE"), primary_key=True)
    grams: Mapped[float | None] = mapped_column(Numeric(7, 2))
    in_broth: Mapped[bool] = mapped_column(Boolean, default=False)


class Meal(Base):
    __tablename__ = "meals"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"))
    food_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("foods.id"))
    food_name: Mapped[str] = mapped_column(Text)
    eaten_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    portion: Mapped[str] = mapped_column(PortionSize)
    ate_broth: Mapped[bool | None] = mapped_column(Boolean)
    method: Mapped[str] = mapped_column(InputMethod)
    photo_path: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class MealIngredient(Base):
    """D2 에서 사용자가 최종 확정한 재료. AI 가 뽑은 것과 다를 수 있다."""

    __tablename__ = "meal_ingredients"

    meal_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("meals.id", ondelete="CASCADE"), primary_key=True)
    ingredient_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("ingredients.id"), primary_key=True)
    added_by_user: Mapped[bool] = mapped_column(Boolean, default=False)


class SymptomLog(Base):
    __tablename__ = "symptom_logs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"))
    logged_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    onset: Mapped[str] = mapped_column(SymptomOnset)
    onset_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    location: Mapped[str | None] = mapped_column(SymptomLocation)
    # RC-03 2단계 기록 — 후속 푸시로 나중에 채운다
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    blood_in_stool: Mapped[bool] = mapped_column(Boolean, default=False)


class SymptomDetail(Base):
    __tablename__ = "symptom_details"

    symptom_log_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("symptom_logs.id", ondelete="CASCADE"), primary_key=True)
    kind: Mapped[str] = mapped_column(Text, primary_key=True)
    level: Mapped[str] = mapped_column(SymptomLevel)


class SymptomContext(Base):
    __tablename__ = "symptom_contexts"

    symptom_log_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("symptom_logs.id", ondelete="CASCADE"), primary_key=True)
    factor: Mapped[str] = mapped_column(Text, primary_key=True)


class IngredientFodmap(Base):
    __tablename__ = "ingredient_fodmap"

    ingredient_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("ingredients.id", ondelete="CASCADE"), primary_key=True)
    axis: Mapped[str] = mapped_column(Text, primary_key=True)
    grams_per_100g: Mapped[float] = mapped_column(Numeric(6, 3))
    source: Mapped[str | None] = mapped_column(Text)


class Substitution(Base):
    """H3 성분 대체 방법."""

    __tablename__ = "substitutions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    ingredient_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("ingredients.id", ondelete="CASCADE"))
    replacement: Mapped[str] = mapped_column(Text)
    alt_text: Mapped[str | None] = mapped_column(Text)
    rank: Mapped[int] = mapped_column(SmallInteger, default=1)


class Recipe(Base):
    """H2 대체 레시피."""

    __tablename__ = "recipes"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    title: Mapped[str] = mapped_column(Text)
    servings: Mapped[str | None] = mapped_column(Text)
    tip: Mapped[str | None] = mapped_column(Text)


class RecipeItem(Base):
    __tablename__ = "recipe_items"

    recipe_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("recipes.id", ondelete="CASCADE"), primary_key=True)
    seq: Mapped[int] = mapped_column(SmallInteger, primary_key=True)
    name: Mapped[str] = mapped_column(Text)
    amount: Mapped[str | None] = mapped_column(Text)
    optional: Mapped[bool] = mapped_column(Boolean, default=False)


class MenuAlternative(Base):
    """H5 대체 메뉴."""

    __tablename__ = "menu_alternatives"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    food_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("foods.id", ondelete="CASCADE"))
    alt_name: Mapped[str] = mapped_column(Text)
    why: Mapped[str | None] = mapped_column(Text)
    rank: Mapped[int] = mapped_column(SmallInteger, default=1)


class SavedRecommendation(Base):
    """G '저장한 추천'."""

    __tablename__ = "saved_recommendations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"))
    kind: Mapped[str] = mapped_column(Text)
    ref_id: Mapped[int] = mapped_column(BigInteger)
    saved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class UserAllergy(Base):
    __tablename__ = "user_allergies"

    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    label: Mapped[str] = mapped_column(Text, primary_key=True)


class BaselineSymptom(Base):
    """B4 초기 증상 문진. 나중에 얼마나 나아졌는지 비교하는 기준선."""

    __tablename__ = "baseline_symptoms"

    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    label: Mapped[str] = mapped_column(Text, primary_key=True)


class MyTableItem(Base):
    __tablename__ = "my_table_items"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"))
    ingredient_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("ingredients.id"))
    label: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(TableStatus)     # safe | candidate | to_try | avoiding
    note: Mapped[str | None] = mapped_column(Text)
    source_challenge_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("challenges.id"))
    snoozed_until: Mapped[date | None] = mapped_column(Date)   # 홈 "나중에"
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Challenge(Base):
    __tablename__ = "challenges"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"))
    ingredient_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("ingredients.id"))
    status: Mapped[str] = mapped_column(ChallengeStatus, default="proposed")
    reason_text: Mapped[str | None] = mapped_column(Text)
    elimination_days: Mapped[int | None] = mapped_column(SmallInteger)
    eliminate_start: Mapped[date | None] = mapped_column(Date)
    testing_start: Mapped[date | None] = mapped_column(Date)
    # 원칙 ③ — 등급 텍스트만. 허용량을 g 로 확정하지 않는다.
    result_grade: Mapped[str | None] = mapped_column(Text)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ChallengeAttempt(Base):
    __tablename__ = "challenge_attempts"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    challenge_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("challenges.id", ondelete="CASCADE"))
    seq: Mapped[int] = mapped_column(SmallInteger)
    scheduled_date: Mapped[date | None] = mapped_column(Date)
    tested_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    result: Mapped[str] = mapped_column(AttemptResult, default="pending")
    meal_id: Mapped[int | None] = mapped_column(BigInteger)
    symptom_log_id: Mapped[int | None] = mapped_column(BigInteger)


class BusyDay(Base):
    __tablename__ = "busy_days"

    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    day: Mapped[date] = mapped_column(Date, primary_key=True)


# ═══════════════════════════════════════════
#  A-7 챗봇 하네스
# ═══════════════════════════════════════════

ChatRole = ENUM("user", "assistant", name="chat_role", create_type=False)


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"))
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    session_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("chat_sessions.id", ondelete="CASCADE"))
    role: Mapped[str] = mapped_column(ChatRole)
    content: Mapped[str] = mapped_column(Text)
    # 하네스 흔적. 사후 감사를 위해 전부 남긴다.
    blocked_reason: Mapped[str | None] = mapped_column(Text)
    llm_called: Mapped[bool] = mapped_column(Boolean, default=False)
    retry_count: Mapped[int] = mapped_column(SmallInteger, default=0)
    fell_back: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AiCall(Base):
    """모든 LLM 호출 원문. 하네스가 왜 통과/차단했는지 따질 수 있어야 한다."""

    __tablename__ = "ai_calls"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(BigInteger)
    purpose: Mapped[str] = mapped_column(Text)
    model: Mapped[str] = mapped_column(Text)
    prompt: Mapped[dict] = mapped_column(JSONB)
    raw_response: Mapped[str | None] = mapped_column(Text)
    parsed_ok: Mapped[bool | None] = mapped_column(Boolean)
    latency_ms: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
