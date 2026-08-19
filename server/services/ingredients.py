"""재료·음식 마스터 매칭   B-4

LLM 이 뽑은 이름은 자유 텍스트다. 마스터(ingredients/foods)에 있는 것만
화면에 보여준다 — 마스터에 없는 재료를 지어내면 그대로 버린다.
"""

from sqlalchemy.orm import Session

from models import Food, FoodIngredient, Ingredient


def match_many(db: Session, names: list[str]) -> list[Ingredient]:
    """이름 목록을 ingredients.name / aliases 에 맞춰본다.

    순서를 유지하고 중복은 제거한다. 못 찾은 이름은 조용히 버린다
    (마스터에 없는 재료를 지어내지 않는다).
    """
    if not names:
        return []

    all_ings = db.query(Ingredient).all()  # 재료 수가 적어(수백 이내) 매번 전체를 훑어도 된다
    by_name = {i.name: i for i in all_ings}
    by_alias: dict[str, Ingredient] = {}
    for i in all_ings:
        for alias in i.aliases:
            by_alias.setdefault(alias, i)

    seen: set[int] = set()
    matched: list[Ingredient] = []
    for raw in names:
        name = raw.strip()
        if not name:
            continue
        ing = by_name.get(name) or by_alias.get(name)
        if ing is None:
            # 느슨한 매칭 — "다진 마늘" 같은 수식어가 붙은 경우
            for cand_name, cand in by_name.items():
                if cand_name in name or name in cand_name:
                    ing = cand
                    break
        if ing is not None and ing.id not in seen:
            seen.add(ing.id)
            matched.append(ing)
    return matched


def find_food(db: Session, food_name: str) -> Food | None:
    """foods.name 에 맞춰본다. 못 찾으면 None (마스터에 없는 음식일 수 있다)."""
    name = food_name.strip()
    if not name:
        return None
    f = db.query(Food).filter(Food.name == name).one_or_none()
    if f is not None:
        return f
    for cand in db.query(Food).all():
        if cand.name in name or name in cand.name:
            return cand
    return None


def default_ingredients(db: Session, food_id: int) -> list[Ingredient]:
    """B2 에서 미리 체크된 상태로 보여줄 기본 레시피 재료."""
    return (
        db.query(Ingredient)
        .join(FoodIngredient, FoodIngredient.ingredient_id == Ingredient.id)
        .filter(FoodIngredient.food_id == food_id)
        .all()
    )
