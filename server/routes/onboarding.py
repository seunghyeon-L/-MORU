"""온보딩 · 안전 확인   화면 A1, B1~B6

담당: 협업자 (B-2) — 단 /onboarding/safety 는 A-2 (안전 판정) 로 이미 구현됨.
협업자는 /onboarding/profile 과 /me 의 TODO 만 채우면 된다.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db_session import get_db
from deps import device_id, ex
from models import BaselineSymptom, SafetyScreening, UserAllergy
from schemas import ProfileIn, SafetyIn
from services import mytable, safety, users

router = APIRouter(tags=["온보딩"])


@router.get(
    "/onboarding/safety/questions",
    summary="B1 · 물어볼 항목 목록 (문구까지 서버가 준다)",
    responses=ex({
        "title": "해당되는 것이 있나요?",
        "sub": "아래 중 하나라도 있으면 앱보다 병원이 먼저예요.",
        "items": [
            {"key": "blood_in_stool", "label": "변에 피가 섞이거나 검게 나온 적이 있어요"},
            {"key": "weight_loss", "label": "이유 없이 체중이 줄었어요"},
        ],
        "exception": {"key": "cleared_by_doctor", "label": "이미 병원에서 확인했어요"},
        "none_label": "해당 없어요",
    }),
)
async def safety_questions():
    """항목이 늘거나 문구가 바뀌어도 앱을 새로 배포하지 않아도 되게 서버가 준다."""
    return {
        "title": "해당되는 것이 있나요?",
        "sub": "아래 중 하나라도 있으면 앱보다 병원이 먼저예요.",
        "items": [{"key": k, "label": v} for k, v in safety.FLAGS.items()],
        "exception": {"key": "cleared_by_doctor", "label": "이미 병원에서 확인했어요"},
        "none_label": "해당 없어요",
    }


@router.post(
    "/onboarding/safety",
    summary="B1 안전 확인 — 레드플래그 판정 (규칙 기반, AI 금지)",
    responses=ex({
        "blocked": True,
        "flags": ["blood_in_stool"],
        "title": "먼저 병원에 가보시는 게 좋겠어요",
        "body": "고르신 항목은 MORU가 확인할 수 있는 범위를 넘어서요. 소화기내과에서 한 번 살펴보시는 걸 권해드려요.",
        "footer": "MORU는 질병을 진단하거나 치료하는 서비스가 아니에요.",
    }),
)
async def screen(body: SafetyIn, dev: str = Depends(device_id), db: Session = Depends(get_db)):
    """blocked 가 true 면 프론트는 B1x 로 보내고 온보딩을 끝낸다. 문구는 서버가 준다.

    cleared_by_doctor 로 통과한 경우에도 flags 는 채워져 저장된다.
    """
    answers = body.model_dump()
    cleared = answers.pop("cleared_by_doctor", False)
    v = safety.screen_onboarding(answers, cleared_by_doctor=cleared)

    u = users.get_or_create(db, dev)
    db.add(SafetyScreening(
        user_id=u.id,
        has_blood_in_stool=body.blood_in_stool,
        has_weight_loss=body.weight_loss,
        has_night_symptoms=body.night_symptoms,
        has_fever=body.fever,
        has_vomiting=body.vomiting,
        has_anemia=body.anemia,
        age_over_50=body.onset_after_50,
        cleared_by_doctor=cleared, blocked=v.blocked, flags=v.flags,
        trigger_source="onboarding",
    ))
    u.blocked_at = datetime.now(timezone.utc) if v.blocked else None
    db.commit()

    return v.as_response()


@router.post(
    "/onboarding/profile",
    summary="B2·B3·B4 — 알레르기 · 피하는 음식 · 증상 문진",
    responses=ex({"user_id": 1, "onboarded": True}),
)
async def profile(body: ProfileIn, dev: str = Depends(device_id), db: Session = Depends(get_db)):
    """avoided_foods 는 그대로 나의 식탁의 avoiding 구획이 된다."""
    u = users.get_or_create(db, dev)
    u.nickname = body.nickname
    u.celiac = body.celiac
    u.baseline_frequency = body.baseline_frequency
    u.onboarded_at = datetime.now(timezone.utc)

    for label in body.allergies:
        if not db.get(UserAllergy, (u.id, label)):
            db.add(UserAllergy(user_id=u.id, label=label))

    for label in body.baseline_symptoms:
        if not db.get(BaselineSymptom, (u.id, label)):
            db.add(BaselineSymptom(user_id=u.id, label=label))

    db.commit()

    # A-6 — 알레르기·셀리악은 여기서 걸러진다. 나의 식탁에 아예 안 들어간다.
    mytable.seed_from_onboarding(db, u.id, body.avoided_foods, body.allergies, body.celiac)

    return {"user_id": u.id, "onboarded": True}


@router.get(
    "/me",
    summary="앱 부팅 시 첫 호출",
    responses=ex({"user_id": 1, "nickname": "은솔", "onboarded": True, "blocked": False}),
)
async def me(dev: str = Depends(device_id), db: Session = Depends(get_db)):
    """onboarded=false 면 B1 로, blocked=true 면 B1x 로 보낸다."""
    u = users.get_or_create(db, dev)
    return {
        "user_id": u.id,
        "nickname": u.nickname,
        "onboarded": u.onboarded_at is not None,
        "blocked": u.blocked_at is not None,
    }
