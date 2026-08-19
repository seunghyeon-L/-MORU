"""SQLAlchemy 모델.

server/db/schema.sql 이 원본이다. 스키마를 바꿀 때는 SQL 을 먼저 고치고 여기를 맞춘다.
(Alembic 을 쓰지 않는다. 2주 해커톤에서 마이그레이션 도구는 배보다 배꼽이다.)

지금은 A-2 에 필요한 것만 정의했다. 나머지는 각자 담당이 붙일 때 추가한다.
"""

from datetime import datetime

from sqlalchemy import (
    ARRAY, BigInteger, Boolean, DateTime, ForeignKey, String, Text, func,
)
from sqlalchemy.orm import Mapped, mapped_column

from db_session import Base


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
