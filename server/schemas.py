"""요청 바디 모델.

프론트가 Swagger에서 실제로 눌러볼 수 있게, 요청 쪽은 전부 Pydantic으로 정의한다.
응답은 routes/ 쪽에서 example 로 붙인다 (목업 단계라 모델까지 만들면 나중에 두 번 고친다).

계약 원문: docs/dev-03-api-contract.md
"""

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field

Portion = Literal["half", "one", "one_and_half_plus"]
Level = Literal["none", "mild", "strong"]
Onset = Literal["just_now", "about_1h", "since_morning", "since_yesterday"]
Location = Literal["upper", "lower"]
Method = Literal["photo", "text", "search"]
AttemptResult = Literal["reaction", "no_reaction", "skipped"]


# ── 온보딩 ────────────────────────────────────

class SafetyIn(BaseModel):
    """spec-04 V1-211 의 경고 신호 목록. 키는 services/safety.py 의 FLAGS 와 같다."""

    blood_in_stool: bool = False
    weight_loss: bool = False
    night_symptoms: bool = False
    fever: bool = False
    vomiting: bool = False
    anemia: bool = False
    onset_after_50: bool = False        # "50세 이상" 이 아니라 "50세 이후 첫 발병"
    cleared_by_doctor: bool = False     # V1-213 예외 — 진입 허용하되 기록은 남긴다


class ProfileIn(BaseModel):
    # 온보딩에 닉네임 입력 단계가 없다. 안 보내도 된다.
    # 없으면 홈 인사가 "안녕하세요" 로만 나간다.
    nickname: str | None = None
    allergies: list[str] = []
    celiac: Literal["yes", "no", "unknown"] = "unknown"
    avoided_foods: list[str] = []
    baseline_symptoms: list[str] = []
    baseline_frequency: Literal[
        "rare", "monthly_1_2", "weekly_few", "weekly_1_2", "almost_daily", "weekly_3plus"
    ] = "weekly_few"


# ── 식사 ──────────────────────────────────────

class IdentifyIn(BaseModel):
    text: str = Field(..., examples=["김치찌개"])


class MealIn(BaseModel):
    food_id: int | None = None
    food_name: str
    eaten_at: datetime
    portion: Portion
    ate_broth: bool | None = None
    method: Method
    ingredient_ids: list[int] = []
    custom_ingredients: list[str] = []


# ── 증상 ──────────────────────────────────────

class SymptomDetailIn(BaseModel):
    kind: str = Field(..., examples=["배가 빵빵함"])
    level: Level


class SymptomIn(BaseModel):
    details: list[SymptomDetailIn]
    onset: Onset
    location: Location | None = None
    blood_in_stool: bool = False
    contexts: list[str] = []


class ResolveIn(BaseModel):
    resolved_at: datetime


# ── 도전 ──────────────────────────────────────

class ChallengeIn(BaseModel):
    ingredient_id: int
    elimination_days: Literal[3, 7]


class AttemptIn(BaseModel):
    result: AttemptResult
    tested_at: datetime | None = None
    scheduled_date: date | None = None


# ── AI ────────────────────────────────────────

class ChatIn(BaseModel):
    session_id: int | None = None
    text: str = Field(..., examples=["제육볶음 먹어도 될까요?"])


class SaveIn(BaseModel):
    kind: Literal["recipe", "substitution", "menu"]
    ref_id: int


class SnoozeIn(BaseModel):
    ingredient_id: int
