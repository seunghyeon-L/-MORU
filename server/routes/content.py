"""대체안 · 레시피 · 성분 치환   화면 H2~H5

담당: 협업자 (B-6)
마스터 데이터를 채우고 조회 API 를 붙이면 끝난다. 판정이 없어서 도메인 리스크가 낮다.
"""

from fastapi import APIRouter, Depends, Query

from deps import device_id, ex
from schemas import SaveIn

router = APIRouter(tags=["대체안"])


@router.get(
    "/foods/{food_id}/alternatives",
    summary="H4 음식 기반 대체안 — 4갈래",
    responses=ex({
        "food_name": "제육볶음",
        "ingredients": ["돼지고기", "양파", "마늘", "고추장", "설탕", "참기름"],
        "options": [
            {"kind": "portion", "title": "양 조절", "detail": "1/2인 또는 고기 양을 줄여보세요."},
            {"kind": "omit", "title": "빼서 먹기", "detail": "마늘, 양파(양념)를 빼거나 줄여보세요."},
            {"kind": "substitute", "title": "대체 성분 제안",
             "detail": "더 편안할 수 있는 재료로 바꿔보세요.", "screen": "H3"},
            {"kind": "menu", "title": "대체 메뉴 제안",
             "detail": "비슷한 맛의 다른 메뉴를 찾아드릴게요.", "screen": "H5"},
        ],
    }),
)
async def alternatives(food_id: int, dev: str = Depends(device_id)):
    # TODO(B-6)
    return {
        "food_name": "제육볶음",
        "ingredients": ["돼지고기", "양파", "마늘", "고추장", "설탕", "참기름"],
        "options": [
            {"kind": "portion", "title": "양 조절", "detail": "1/2인 또는 고기 양을 줄여보세요."},
            {"kind": "omit", "title": "빼서 먹기", "detail": "마늘, 양파(양념)를 빼거나 줄여보세요."},
            {"kind": "substitute", "title": "대체 성분 제안",
             "detail": "더 편안할 수 있는 재료로 바꿔보세요.", "screen": "H3"},
            {"kind": "menu", "title": "대체 메뉴 제안",
             "detail": "비슷한 맛의 다른 메뉴를 찾아드릴게요.", "screen": "H5"},
        ],
    }


@router.get(
    "/foods/{food_id}/menu-alternatives",
    summary="H5 대체 메뉴 제안",
    responses=ex({
        "headline": "제육볶음 대신 이런 메뉴는 어떠세요?",
        "items": [
            {"name": "간장 돼지고기 덮밥", "why": "양념 자극이 적어요."},
            {"name": "두부 간장 덮밥", "why": "식물성 단백질로 편안하게."},
            {"name": "오징어 숙주볶음", "why": "매운 양념 없이 깔끔해요."},
        ],
        "has_more": True,
    }),
)
async def menu_alternatives(food_id: int, dev: str = Depends(device_id)):
    # TODO(B-6)
    return {
        "headline": "제육볶음 대신 이런 메뉴는 어떠세요?",
        "items": [
            {"name": "간장 돼지고기 덮밥", "why": "양념 자극이 적어요."},
            {"name": "두부 간장 덮밥", "why": "식물성 단백질로 편안하게."},
            {"name": "오징어 숙주볶음", "why": "매운 양념 없이 깔끔해요."},
        ],
        "has_more": True,
    }


@router.get(
    "/substitutions",
    summary="H3 성분 대체 방법",
    responses=ex({
        "intro": "이렇게 바꿔보세요",
        "groups": [
            {"ingredient": "우유", "replacement": "락토프리 우유", "alt": "또는 오트우유, 아몬드우유"},
            {"ingredient": "설탕", "replacement": "알룰로스, 스테비아", "alt": "또는 꿀 소량"},
        ],
        "tips": [
            {"seq": 1, "title": "양을 줄여서 시작하기", "detail": "소량으로 먼저 시도해보세요."},
            {"seq": 2, "title": "공복은 피하기", "detail": "식사 후 또는 간식과 함께 드세요."},
        ],
    }),
)
async def substitutions(
    ingredient_ids: str = Query(..., examples=["12,15"]),
    dev: str = Depends(device_id),
):
    # TODO(B-6)
    return {
        "intro": "이렇게 바꿔보세요",
        "groups": [
            {"ingredient": "우유", "replacement": "락토프리 우유", "alt": "또는 오트우유, 아몬드우유"},
            {"ingredient": "설탕", "replacement": "알룰로스, 스테비아", "alt": "또는 꿀 소량"},
        ],
        "tips": [
            {"seq": 1, "title": "양을 줄여서 시작하기", "detail": "소량으로 먼저 시도해보세요."},
            {"seq": 2, "title": "공복은 피하기", "detail": "식사 후 또는 간식과 함께 드세요."},
        ],
    }


@router.get(
    "/recipes/{recipe_id}",
    summary="H2 대체 레시피",
    responses=ex({
        "title": "속 편한 녹차라떼 레시피",
        "servings": "1잔 기준",
        "items": [
            {"name": "우유 (또는 락토프리 우유)", "amount": "150ml", "optional": False},
            {"name": "녹차가루", "amount": "1/2 tsp", "optional": False},
            {"name": "알룰로스", "amount": "1 tsp", "optional": True},
            {"name": "바닐라 익스트랙", "amount": "2~3방울", "optional": True},
        ],
        "tip": "우유를 데울 때 끓이지 마세요. 60도 정도가 가장 부드러워요.",
    }),
)
async def recipe(recipe_id: int, dev: str = Depends(device_id)):
    # TODO(B-6)
    return {
        "title": "속 편한 녹차라떼 레시피",
        "servings": "1잔 기준",
        "items": [
            {"name": "우유 (또는 락토프리 우유)", "amount": "150ml", "optional": False},
            {"name": "녹차가루", "amount": "1/2 tsp", "optional": False},
            {"name": "알룰로스", "amount": "1 tsp", "optional": True},
            {"name": "바닐라 익스트랙", "amount": "2~3방울", "optional": True},
        ],
        "tip": "우유를 데울 때 끓이지 마세요. 60도 정도가 가장 부드러워요.",
    }


@router.post(
    "/saved",
    summary="추천 저장 — G '저장한 추천' 에 쌓인다",
    responses=ex({"ok": True}),
)
async def save(body: SaveIn, dev: str = Depends(device_id)):
    # TODO(B-6)
    return {"ok": True}
