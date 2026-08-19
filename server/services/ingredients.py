"""재료·음식 마스터 매칭   B-4

LLM 이 뽑은 이름은 자유 텍스트다. 마스터(ingredients/foods)에 있는 것만
화면에 보여준다 — 마스터에 없는 재료를 지어내면 그대로 버린다.
"""

from sqlalchemy.orm import Session

from models import Food, FoodIngredient, Ingredient

# 사용자가 D2 에서 직접 입력한, 마스터에 없던 재료의 카테고리.
# A-3 6축 계산은 category 로 그램을 추정하는데, 이 재료들은 FODMAP 값이
# 아예 없어 계산엔 안 잡힌다. 그래도 NULL 로 두지 않고 태그를 달아
# (교란 없이) 도전 제안·집계에서 구분할 수 있게 한다.
USER_INPUT_CATEGORY = "사용자입력"


def _build_lookup(db: Session) -> tuple[dict[str, Ingredient], dict[str, Ingredient]]:
    all_ings = db.query(Ingredient).all()  # 재료 수가 적어(수백 이내) 매번 전체를 훑어도 된다
    by_name = {i.name: i for i in all_ings}
    by_alias: dict[str, Ingredient] = {}
    for i in all_ings:
        for alias in i.aliases:
            by_alias.setdefault(alias, i)
    return by_name, by_alias


def _resolve_one(name: str, by_name: dict, by_alias: dict) -> Ingredient | None:
    """이름 하나를 마스터에 맞춘다. exact → alias → 수식어 포함 순."""
    name = name.strip()
    if not name:
        return None

    ing = by_name.get(name) or by_alias.get(name)
    if ing is not None:
        return ing

    # 수식어가 붙은 경우 ("다진 마늘", "국내산 양파"): 마스터 이름/별칭이
    # 입력에 통째로 들어있으면 그걸로 본다. 가장 긴(=구체적인) 후보를 고른다.
    # 반대 방향(입력이 마스터에 들어있음)은 '파'가 '대파·양파·파스타' 에 걸려 위험해서 안 쓴다.
    # 1글자 후보도 오탐이 많아 제외한다.
    best_len, best = 0, None
    for table in (by_name, by_alias):
        for key, cand in table.items():
            if len(key) >= 2 and key in name and len(key) > best_len:
                best_len, best = len(key), cand
    return best


def match_many(db: Session, names: list[str]) -> list[Ingredient]:
    """이름 목록을 ingredients.name / aliases 에 맞춰본다.

    순서를 유지하고 중복은 제거한다. 못 찾은 이름은 조용히 버린다
    (마스터에 없는 재료를 지어내지 않는다).
    """
    if not names:
        return []

    by_name, by_alias = _build_lookup(db)
    seen: set[int] = set()
    matched: list[Ingredient] = []
    for raw in names:
        ing = _resolve_one(raw, by_name, by_alias)
        if ing is not None and ing.id not in seen:
            seen.add(ing.id)
            matched.append(ing)
    return matched


def get_or_create(db: Session, name: str) -> Ingredient:
    """D2 '+ 직접 추가' — 마스터에 없는 재료 이름.

    meal_ingredients.ingredient_id 가 NOT NULL FK 라 이름만 저장할 자리가 없다.
    먼저 별칭·수식어까지 맞춰본다 — "다진마늘" 을 새로 만들면 마늘의 FODMAP 이
    계산에서 통째로 빠지므로, 기존 재료가 있으면 반드시 거기에 붙인다.
    정말 없을 때만 최소 정보로 새로 만든다.
    """
    name = name.strip()
    by_name, by_alias = _build_lookup(db)
    existing = _resolve_one(name, by_name, by_alias)
    if existing is not None:
        return existing

    ing = Ingredient(name=name, aliases=[], category=USER_INPUT_CATEGORY)
    db.add(ing)
    db.flush()
    return ing


def find_food(db: Session, food_name: str) -> Food | None:
    """foods.name 에 맞춰본다. 못 찾으면 None (마스터에 없는 음식일 수 있다)."""
    name = food_name.strip()
    if not name:
        return None

    f = db.query(Food).filter(Food.name == name).one_or_none()
    if f is not None:
        return f

    # 수식어 포함 — 마스터 음식명이 입력에 통째로 들어있으면. 가장 긴 후보 우선.
    best_len, best = 0, None
    for cand in db.query(Food).all():
        if len(cand.name) >= 2 and cand.name in name and len(cand.name) > best_len:
            best_len, best = len(cand.name), cand
    return best


def default_ingredients(db: Session, food_id: int) -> list[Ingredient]:
    """B2 에서 미리 체크된 상태로 보여줄 기본 레시피 재료."""
    return (
        db.query(Ingredient)
        .join(FoodIngredient, FoodIngredient.ingredient_id == Ingredient.id)
        .filter(FoodIngredient.food_id == food_id)
        .all()
    )
