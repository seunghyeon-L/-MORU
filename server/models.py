"""SQLAlchemy 모델.

server/db/schema.sql 이 원본이다. 스키마를 바꿀 때는 SQL 을 먼저 고치고 여기를 맞춘다.
(Alembic 을 쓰지 않는다. 2주 해커톤에서 마이그레이션 도구는 배보다 배꼽이다.)

지금은 A-2 에 필요한 것만 정의했다. 나머지는 각자 담당이 붙일 때 추가한다.
"""

from datetime import date, datetime

from sqlalchemy import (
    ARRAY, BigInteger, Boolean, Date, DateTime, ForeignKey, SmallInteger,
    String, Text, func,
)
from sqlalchemy.dialects.postgresql import ENUM
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


class UserAllergy(Base):
    __tablename__ = "user_allergies"

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
