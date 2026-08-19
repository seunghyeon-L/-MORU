"""온보딩 · 안전 확인   화면 A1, B1~B6

담당: 협업자 (B-2)
단, POST /onboarding/safety 의 판정 로직만 A 가 채운다 (절대 원칙 ④ — 안전 판정은 AI 금지, 결정론 코드).
"""

from fastapi import APIRouter, Depends

from deps import device_id, ex
from schemas import ProfileIn, SafetyIn

router = APIRouter(tags=["온보딩"])


@router.post(
    "/onboarding/safety",
    summary="B1 안전 확인 — 레드플래그 판정",
    responses=ex({
        "blocked": True,
        "title": "먼저 병원에 가보시는 게 좋겠어요",
        "body": "혈변은 앱으로 확인할 수 있는 범위를 넘어서요. 소화기내과 진료를 권해드려요.",
    }),
)
async def safety(body: SafetyIn, dev: str = Depends(device_id)):
    """blocked 가 true 면 프론트는 B1x 로 보내고 온보딩을 끝낸다. 문구는 서버가 준다."""
    # TODO(A-2): 실제 판정. 지금은 혈변만 본다.
    if body.blood_in_stool:
        return {
            "blocked": True,
            "title": "먼저 병원에 가보시는 게 좋겠어요",
            "body": "혈변은 앱으로 확인할 수 있는 범위를 넘어서요. 소화기내과 진료를 권해드려요.",
        }
    return {"blocked": False, "title": None, "body": None}


@router.post(
    "/onboarding/profile",
    summary="B2·B3·B4 — 알레르기 · 피하는 음식 · 증상 문진",
    responses=ex({"user_id": 1, "onboarded": True}),
)
async def profile(body: ProfileIn, dev: str = Depends(device_id)):
    """avoided_foods 는 그대로 나의 식탁의 avoiding 구획이 된다."""
    # TODO(B-2): users / user_allergies / baseline_symptoms / my_table_items 저장
    return {"user_id": 1, "onboarded": True}


@router.get(
    "/me",
    summary="앱 부팅 시 첫 호출",
    responses=ex({"user_id": 1, "nickname": "은솔", "onboarded": True, "blocked": False}),
)
async def me(dev: str = Depends(device_id)):
    """onboarded=false 면 B1 로, blocked=true 면 B1x 로 보낸다."""
    # TODO(B-2)
    return {"user_id": 1, "nickname": "은솔", "onboarded": True, "blocked": False}
