"""식사 기록 · 증상 기록   화면 D1~D4, E0~E2

담당: 협업자 (B-3, B-4, B-5)
단, GET /meals/{id}/insight 의 본문 생성은 A-4 가 채운다 (관찰 + 교란 요인 병기).
"""

from fastapi import APIRouter, Depends, File, UploadFile

from deps import device_id, ex
from schemas import IdentifyIn, MealIn, ResolveIn, SymptomIn

router = APIRouter(tags=["기록"])


# ── 식사 ──────────────────────────────────────

_IDENTIFY_EXAMPLE = {
    "food_id": 3,
    "food_name": "김치찌개",
    "has_broth": True,
    "ingredients": [
        {"id": 8, "name": "김치", "checked": True},
        {"id": 21, "name": "돼지고기", "checked": True},
        {"id": 12, "name": "양파", "checked": True},
    ],
    "confidence": "high",
}


@router.post(
    "/meals/identify",
    summary="D1→D2 · 텍스트로 재료 식별",
    responses=ex(_IDENTIFY_EXAMPLE),
)
async def identify_text(body: IdentifyIn, dev: str = Depends(device_id)):
    """마스터에 없는 재료는 지어내지 않는다. 못 찾으면 ingredients 가 빈 배열로 온다."""
    # TODO(B-4): OpenAI 구조화 출력 + ingredients.aliases 매칭
    return _IDENTIFY_EXAMPLE


@router.post(
    "/meals/identify-photo",
    summary="D1→D2 · 사진으로 재료 식별",
    responses=ex(_IDENTIFY_EXAMPLE),
)
async def identify_photo(photo: UploadFile = File(...), dev: str = Depends(device_id)):
    # TODO(B-4): Vision 호출. 결과는 ai_calls 에 전량 로깅한다.
    return _IDENTIFY_EXAMPLE


@router.post(
    "/meals",
    summary="D2 확정 → D4 기록 완료",
    responses=ex({"meal_id": 91, "has_insight": True}),
)
async def create_meal(body: MealIn, dev: str = Depends(device_id)):
    """has_insight 가 false 면 D3 를 건너뛰고 바로 D4 로 간다."""
    # TODO(B-3): meals / meal_ingredients 저장
    # TODO(A-3): 저장 직후 meal_fodmap 6축 계산
    return {"meal_id": 91, "has_insight": True}


@router.get(
    "/meals/{meal_id}/insight",
    summary="D3 참고 정보와 대체안",
    responses=ex({
        "food_name": "김치찌개",
        "note": "국물에 양파즙이 들어있을 수 있어요",
        "observation": {
            "title": "최근 기록을 보면",
            "body": "양파가 들어간 식사 4번 중 3번, 몇 시간 뒤 불편함이 기록됐어요.",
            "caveat": "다만 그중 2번은 수면이 5시간 이하였어요. 음식 때문이라고 단정하기는 일러요.",
        },
        "suggestions": [
            {"rank": 1, "title": "소량부터 시도해보기", "detail": "평소보다 조금만"},
            {"rank": 2, "title": "반 그릇만 드시기", "detail": "국물은 조금, 건더기 위주로"},
            {"rank": 3, "title": "마늘 빼달라고 요청하기", "detail": "식당에서도 대부분 가능해요"},
            {"rank": 4, "title": "다른 메뉴 골라보기", "detail": "맑은 국 · 된장찌개"},
        ],
    }),
)
async def meal_insight(meal_id: int, dev: str = Depends(device_id)):
    """caveat 은 절대 생략하지 않는다.

    관찰만 보여주고 교란 요인을 같이 안 보여주면 그게 판정이 된다 (절대 원칙 ①).
    caveat 이 null 인 경우가 있고, 그때만 프론트가 안 그린다.
    """
    # TODO(A-4)
    return await _insight_stub()


async def _insight_stub():
    return {
        "food_name": "김치찌개",
        "note": "국물에 양파즙이 들어있을 수 있어요",
        "observation": {
            "title": "최근 기록을 보면",
            "body": "양파가 들어간 식사 4번 중 3번, 몇 시간 뒤 불편함이 기록됐어요.",
            "caveat": "다만 그중 2번은 수면이 5시간 이하였어요. 음식 때문이라고 단정하기는 일러요.",
        },
        "suggestions": [
            {"rank": 1, "title": "소량부터 시도해보기", "detail": "평소보다 조금만"},
            {"rank": 2, "title": "반 그릇만 드시기", "detail": "국물은 조금, 건더기 위주로"},
            {"rank": 3, "title": "마늘 빼달라고 요청하기", "detail": "식당에서도 대부분 가능해요"},
            {"rank": 4, "title": "다른 메뉴 골라보기", "detail": "맑은 국 · 된장찌개"},
        ],
    }


# ── 증상 ──────────────────────────────────────

@router.post(
    "/symptoms",
    summary="E0·E1·E2 를 한 번에",
    responses=ex({
        "symptom_log_id": 44,
        "red_flag": False,
        "followup_at": "2026-08-19T22:00:00+09:00",
    }),
)
async def create_symptom(body: SymptomIn, dev: str = Depends(device_id)):
    """red_flag 가 true 면 저장은 하되 프론트는 즉시 B1x 병원 안내로 보낸다.

    followup_at 에 "이제 좀 괜찮아지셨어요?" 푸시가 간다.
    아플 때 기록하고 나을 때는 기록하지 않기 때문에 2단계로 나눴다.
    """
    # TODO(B-5): symptom_logs / symptom_details / symptom_contexts 저장
    return {
        "symptom_log_id": 44,
        "red_flag": body.blood_in_stool,
        "followup_at": "2026-08-19T22:00:00+09:00",
    }


@router.patch(
    "/symptoms/{log_id}/resolve",
    summary="후속 푸시를 눌렀을 때",
    responses=ex({"ok": True}),
)
async def resolve_symptom(log_id: int, body: ResolveIn, dev: str = Depends(device_id)):
    # TODO(B-5)
    return {"ok": True}
