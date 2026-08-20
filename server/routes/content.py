"""대체안 · 레시피 · 성분 치환   화면 H2~H5

담당: 협업자 (B-6)
마스터 데이터를 채우고 조회 API 를 붙이면 끝난다. 판정이 없어서 도메인 리스크가 낮다.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from db_session import get_db
from deps import device_id, ex
from models import (
    Food, FoodIngredient, Ingredient, IngredientFodmap, MenuAlternative,
    Recipe, RecipeItem, SavedRecommendation, Substitution,
)
from schemas import SaveIn
from services import users
from services.text import w

router = APIRouter(tags=["대체안"])


@router.get(
    "/ingredients/{ingredient_id}/contains",
    summary="F2 · 이 재료가 들어있는 음식 목록 (읽기 전용)",
    responses=ex({
        "ingredient_name": "양파",
        "contains": ["김치찌개", "제육볶음", "카레", "샌드위치", "샐러드"],
    }),
)
async def contains(ingredient_id: int, dev: str = Depends(device_id), db: Session = Depends(get_db)):
    """food_ingredients 를 재료로 역조회한다.

    F2 화면 진입 시 부른다. 도전을 만들지 않는다 —
    3일/7일을 바꿔가며 봐도 아무것도 생기지 않아야 한다.
    """
    ing = db.get(Ingredient, ingredient_id)
    if ing is None:
        return {"ingredient_name": "", "contains": []}

    # "자주 먹는 순" 을 셀 만한 실제 취식 빈도 데이터가 아직 부족해서,
    # 레시피상 들어가는 양(grams)을 순위 대용으로 쓴다.
    rows = (
        db.query(Food.name)
        .join(FoodIngredient, FoodIngredient.food_id == Food.id)
        .filter(FoodIngredient.ingredient_id == ingredient_id)
        .order_by(FoodIngredient.grams.desc().nullslast())
        .limit(8)
        .all()
    )
    return {"ingredient_name": ing.name, "contains": [r[0] for r in rows]}


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
             "detail": "더 편안할 수 있는 재료로 바꿔보세요.",
             "screen": "H3", "ingredient_ids": [12, 15]},
            {"kind": "menu", "title": "대체 메뉴 제안",
             "detail": "비슷한 맛의 다른 메뉴를 찾아드릴게요.",
             "screen": "H5", "food_id": 9},
        ],
    }),
)
async def alternatives(food_id: int, dev: str = Depends(device_id), db: Session = Depends(get_db)):
    food = db.get(Food, food_id)
    if food is None:
        return {"food_name": "", "ingredients": [], "options": []}

    ing_rows = (
        db.query(Ingredient.name)
        .join(FoodIngredient, FoodIngredient.ingredient_id == Ingredient.id)
        .filter(FoodIngredient.food_id == food_id)
        .order_by(FoodIngredient.grams.desc().nullslast())
        .all()
    )
    names = [r[0] for r in ing_rows]

    # "빼서 먹기" 후보 — FODMAP 값이 있는(=6축 계산에 실제로 잡히는) 재료 위주로 최대 2개.
    # 어떤 게 증상 원인인지 판정하는 게 아니라, 그냥 계산에 잡히는 재료를 알려주는 것뿐이다.
    omit_rows = (
        db.query(Ingredient.id, Ingredient.name)
        .join(FoodIngredient, FoodIngredient.ingredient_id == Ingredient.id)
        .join(IngredientFodmap, IngredientFodmap.ingredient_id == Ingredient.id)
        .filter(FoodIngredient.food_id == food_id)
        .distinct()
        .limit(2)
        .all()
    )
    omit_ids = [r[0] for r in omit_rows]
    omit_names = [r[1] for r in omit_rows] or ["양념"]
    # 조사는 마지막 항목에만 — "고추장, 대파를" (O), "고추장을, 대파를" (X)
    omit_text = ", ".join(omit_names[:-1] + [w(omit_names[-1], "을")])

    # H3 로 넘길 재료 — 이 음식에 들어가고 **치환안이 실제로 있는** 것만.
    # 치환안 없는 id 를 넘기면 H3 가 빈 화면이 된다.
    sub_ids = [r[0] for r in (
        db.query(Substitution.ingredient_id)
        .join(FoodIngredient,
              FoodIngredient.ingredient_id == Substitution.ingredient_id)
        .filter(FoodIngredient.food_id == food_id)
        .distinct().all())]

    return {
        "food_name": food.name,
        "ingredients": names,
        "options": [
            {"kind": "portion", "title": "양 조절",
             "detail": f"1/2인 또는 {food.name} 양을 줄여보세요."},
            {"kind": "omit", "title": "빼서 먹기", "detail": f"{omit_text} 빼거나 줄여보세요."},
            {"kind": "substitute", "title": "대체 성분 제안",
             "detail": "더 편안할 수 있는 재료로 바꿔보세요.",
             # H3 로 갈 때 그대로 넘기면 된다. 프론트가 id 를 만들 필요가 없다.
             "screen": "H3", "ingredient_ids": sub_ids},
            {"kind": "menu", "title": "대체 메뉴 제안",
             "detail": "비슷한 맛의 다른 메뉴를 찾아드릴게요.",
             "screen": "H5", "food_id": food_id},
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
async def menu_alternatives(food_id: int, dev: str = Depends(device_id), db: Session = Depends(get_db)):
    food = db.get(Food, food_id)
    if food is None:
        return {"headline": "", "items": [], "has_more": False}

    LIMIT = 3
    rows = (
        db.query(MenuAlternative.alt_name, MenuAlternative.why)
        .filter(MenuAlternative.food_id == food_id)
        .order_by(MenuAlternative.rank)
        .limit(LIMIT + 1)
        .all()
    )
    has_more = len(rows) > LIMIT
    items = rows[:LIMIT]

    return {
        "headline": f"{food.name} 대신 이런 메뉴는 어떠세요?",
        "items": [{"name": name, "why": why} for (name, why) in items],
        "has_more": has_more,
    }


_SUBSTITUTION_TIPS = [
    {"seq": 1, "title": "양을 줄여서 시작하기", "detail": "소량으로 먼저 시도해보세요."},
    {"seq": 2, "title": "공복은 피하기", "detail": "식사 후 또는 간식과 함께 드세요."},
]


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
        "recipes": [{"recipe_id": 1, "title": "속 편한 녹차라떼", "screen": "H2"}],
    }),
)
async def substitutions(
    ingredient_ids: str = Query(..., examples=["12,15"]),
    dev: str = Depends(device_id),
    db: Session = Depends(get_db),
):
    try:
        ids = [int(x) for x in ingredient_ids.split(",") if x.strip()]
    except ValueError:
        ids = []
    if not ids:
        return {"intro": "이렇게 바꿔보세요", "groups": [],
                "tips": _SUBSTITUTION_TIPS, "recipes": []}

    names = dict(
        db.query(Ingredient.id, Ingredient.name).filter(Ingredient.id.in_(ids)).all()
    )
    rows = (
        db.query(Substitution)
        .filter(Substitution.ingredient_id.in_(ids))
        .order_by(Substitution.ingredient_id, Substitution.rank)
        .all()
    )

    groups = []
    seen_ingredient: set[int] = set()
    for row in rows:
        if row.ingredient_id in seen_ingredient:
            continue  # 재료당 대표 대체안(rank 1) 하나만 groups 에 낸다
        seen_ingredient.add(row.ingredient_id)
        groups.append({
            "ingredient": names.get(row.ingredient_id, ""),
            "replacement": row.replacement,
            "alt": row.alt_text,
        })

    # H2 로 가는 유일한 진입점. 레시피는 재료 이름으로 느슨하게 잇는다
    # (recipe_items 는 "우유 (또는 락토프리 우유)" 처럼 문장으로 적혀 있다).
    recipes = []
    for rid, title in db.query(Recipe.id, Recipe.title).all():
        items = db.query(RecipeItem.name).filter(RecipeItem.recipe_id == rid).all()
        blob = " ".join(n for (n,) in items)
        if any(nm and nm in blob for nm in names.values()):
            recipes.append({"recipe_id": rid, "title": title, "screen": "H2"})

    return {"intro": "이렇게 바꿔보세요", "groups": groups,
            "tips": _SUBSTITUTION_TIPS, "recipes": recipes}


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
async def recipe(recipe_id: int, dev: str = Depends(device_id), db: Session = Depends(get_db)):
    r = db.get(Recipe, recipe_id)
    if r is None:
        return {"title": "", "servings": None, "items": [], "tip": None}

    items = (
        db.query(RecipeItem)
        .filter(RecipeItem.recipe_id == recipe_id)
        .order_by(RecipeItem.seq)
        .all()
    )
    return {
        "title": r.title,
        "servings": r.servings,
        "items": [
            {"name": i.name, "amount": i.amount, "optional": i.optional} for i in items
        ],
        "tip": r.tip,
    }


@router.post(
    "/saved",
    summary="추천 저장 — G '저장한 추천' 에 쌓인다",
    responses=ex({"ok": True}),
)
async def save(body: SaveIn, dev: str = Depends(device_id), db: Session = Depends(get_db)):
    u = users.get_or_create(db, dev)
    db.add(SavedRecommendation(user_id=u.id, kind=body.kind, ref_id=body.ref_id))
    db.commit()
    return {"ok": True}
