"""6축 섭취량 계산 + 감쇠 곡선   A-3

여기서 나오는 숫자는 **절대 화면에 그대로 나가지 않는다.**
절대 원칙 ③ — 개인 역치는 숫자가 아니라 등급으로.
이 값은 내부 지표다. 축끼리 견주고, 시간에 따라 흩뿌리는 데만 쓴다.

두 가지를 한다.

  1. 식사 1건 → 6축 섭취 추정량        compute_meal()
  2. 어느 시점의 "장에 도달해 있는 양"   exposure_at()
"""

from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from models import (
    FoodIngredient, Ingredient, IngredientFodmap, Meal, MealFodmap, MealIngredient,
)

AXES = ["fructan", "gos", "lactose", "fructose", "sorbitol", "mannitol"]

# ── 먹은 양 ─────────────────────────────────────
# D2 "얼마나 드셨나요?" 3단계.
# "한 그릇 반 이상" 은 하한이다. 실제로는 더 먹었을 수 있어서 낮게 잡는다 —
# 과대평가해서 "많이 드셨네요" 라고 말하는 것보다 조용한 편이 낫다.
PORTION = {"half": 0.5, "one": 1.0, "one_and_half_plus": 1.5}

# 국물을 안 먹었을 때, 국물에 든 재료가 얼마나 줄어드는가.
# 프럭탄·GOS 는 물에 잘 녹아서 국물로 상당량이 빠져나온다.
# 건더기만 먹으면 노출이 크게 준다. 다만 0 은 아니다.
BROTH_SKIP = 0.3

# 마스터에 그램이 없을 때 쓰는 카테고리 평균. 거친 값이다.
# 이걸 쓴 비율은 estimated_ratio 로 남겨서, A-4 가 보고 말할지 정한다.
CATEGORY_GRAMS = {
    "채소": 40, "과일": 100, "유제품": 150, "곡물": 80, "콩류": 50,
    "음료": 200, "양념": 10, "육류": 100, "수산": 80,
    "반찬": 40, "견과": 20, "해조": 10,
}
DEFAULT_GRAMS = 50


# ══════════════════════════════════════════════
#  1. 식사 1건 → 6축
# ══════════════════════════════════════════════

def compute_meal(db: Session, meal: Meal) -> dict[str, float]:
    """식사 1건의 6축 섭취 추정량을 계산해 meal_fodmap 에 넣는다.

    D2 에서 사용자가 최종 확정한 재료만 쓴다. AI 가 뽑은 원본이 아니라.
    """
    rows = (db.query(MealIngredient, Ingredient)
            .join(Ingredient, Ingredient.id == MealIngredient.ingredient_id)
            .filter(MealIngredient.meal_id == meal.id).all())
    if not rows:
        _clear(db, meal)
        return {}

    # 마스터 음식이면 재료별 그램과 국물 여부를 안다.
    recipe: dict[int, FoodIngredient] = {}
    if meal.food_id:
        recipe = {fi.ingredient_id: fi for fi in db.query(FoodIngredient)
                  .filter(FoodIngredient.food_id == meal.food_id)}

    scale = PORTION.get(meal.portion, 1.0)
    totals = {a: 0.0 for a in AXES}
    guessed_g, total_g = 0.0, 0.0

    for mi, ing in rows:
        fi = recipe.get(ing.id)

        if fi is not None and fi.grams is not None:
            grams = float(fi.grams)
            in_broth = fi.in_broth
        else:
            # 모르는 재료. 카테고리 평균으로 때운다.
            grams = CATEGORY_GRAMS.get(ing.category or "", DEFAULT_GRAMS)
            in_broth = False
            guessed_g += grams

        total_g += grams
        grams *= scale
        if in_broth and meal.ate_broth is False:
            grams *= BROTH_SKIP

        for f in db.query(IngredientFodmap).filter(
                IngredientFodmap.ingredient_id == ing.id):
            totals[f.axis] += grams * float(f.grams_per_100g) / 100.0

    ratio = round(guessed_g / total_g, 3) if total_g else 0.0
    _save(db, meal, totals, ratio)
    return totals


def _clear(db: Session, meal: Meal) -> None:
    db.query(MealFodmap).filter(MealFodmap.meal_id == meal.id).delete()
    meal.fodmap_computed_at = datetime.now(timezone.utc)
    db.commit()


def _save(db: Session, meal: Meal, totals: dict[str, float], ratio: float) -> None:
    db.query(MealFodmap).filter(MealFodmap.meal_id == meal.id).delete()
    for axis, g in totals.items():
        if g > 0:
            db.add(MealFodmap(meal_id=meal.id, axis=axis,
                              grams=round(g, 3), estimated_ratio=ratio))
    meal.fodmap_computed_at = datetime.now(timezone.utc)
    db.commit()


# ══════════════════════════════════════════════
#  2. 감쇠 곡선
# ══════════════════════════════════════════════
#
# 예전 설계는 "먹고 나서 2~8시간" 같은 **사각형 창**이었다.
# 7시간 59분이면 100%, 8시간 1분이면 0% 가 된다. 그런 몸은 없다.
#
# 사다리꼴로 바꿨다. 축마다 몸에서 작용하는 시점이 다르기 때문에 창도 다르다.
#
#   락토스·과당       소장에서 흡수가 안 돼 삼투압으로 작용 → 이르다
#   소르비톨·만니톨   당알코올. 소장~근위 대장 → 중간
#   프럭탄·GOS        대장까지 가서 세균이 발효 → 늦다
#
# E3 화면의 "발효 시점" / "아직 도착 전" 이 이 곡선에서 나온다.
#
#            (t1)────(t2)
#            /            \
#      ─────(t0)          (t3)─────
#
# 시간 단위. (t0 오르기 시작, t1 최대, t2 내리기 시작, t3 끝)
CURVE = {
    "lactose":  (0.5, 1.0, 3.0, 6.0),
    "fructose": (0.5, 1.0, 3.0, 6.0),
    "sorbitol": (1.0, 2.0, 5.0, 9.0),
    "mannitol": (1.0, 2.0, 5.0, 9.0),
    "fructan":  (2.0, 4.0, 8.0, 13.0),
    "gos":      (2.0, 4.0, 8.0, 13.0),
}


def weight(axis: str, hours: float) -> float:
    """식후 hours 시간이 지났을 때, 그 축이 얼마나 작용하고 있는가. 0~1."""
    t0, t1, t2, t3 = CURVE[axis]
    if hours <= t0 or hours >= t3:
        return 0.0
    if hours < t1:
        return (hours - t0) / (t1 - t0)
    if hours <= t2:
        return 1.0
    return (t3 - hours) / (t3 - t2)


def exposure_at(db: Session, user_id: int, when: datetime,
                lookback_h: int = 16) -> dict[str, float]:
    """어느 시점에 장에서 작용하고 있는 6축의 양.

    증상이 생긴 시각에 대고 부르면 "그때 뭐가 작용 중이었나" 가 나온다.
    """
    since = when - timedelta(hours=lookback_h)
    meals = (db.query(Meal)
             .filter(Meal.user_id == user_id,
                     Meal.eaten_at > since, Meal.eaten_at <= when).all())

    out = {a: 0.0 for a in AXES}
    for m in meals:
        h = (when - m.eaten_at).total_seconds() / 3600.0
        for row in db.query(MealFodmap).filter(MealFodmap.meal_id == m.id):
            w = weight(row.axis, h)
            if w:
                out[row.axis] += float(row.grams) * w
    # 반올림한 뒤에 거른다. 먼저 거르면 0.0 으로 반올림된 값이 남는다.
    return {a: r for a, v in out.items() if (r := round(v, 3)) > 0}


# ── 화면에 쓰는 말 ──────────────────────────────

def phase_label(axis: str, hours: float) -> str:
    """E3 타임라인의 오른쪽에 붙는 말.

    숫자를 안 보여주는 대신, 지금 어디쯤인지는 알려준다.
    """
    t0, t1, t2, t3 = CURVE[axis]
    if hours < t0:
        return "아직 도착 전"
    if hours < t1:
        return "도착하는 중"
    if hours <= t2:
        return "발효 시점" if axis in ("fructan", "gos") else "작용 시점"
    if hours < t3:
        return "지나가는 중"
    return "지났어요"


def dominant_axis(exposure: dict[str, float]) -> str | None:
    """가장 큰 축. 없으면 None."""
    return max(exposure, key=exposure.get) if exposure else None


AXIS_KO = {
    "fructan": "프럭탄", "gos": "갈락토올리고당", "lactose": "유당",
    "fructose": "과당", "sorbitol": "소르비톨", "mannitol": "만니톨",
}
