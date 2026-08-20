"""패턴 분석   A-4 · 화면 E3 · D3 · 홈 주간 정리

이 파일은 **말하지 않는 조건**부터 정하고 시작한다.

절대 원칙 ① — 판정하지 않는다.
  "양파가 원인입니다" 는 물론이고, 근거가 얇을 때 관찰을 꺼내는 것도 판정이다.
  4번 중 3번이라는 말은 사용자에게 인과로 읽힌다. 그 무게를 감당할 데이터가 있을 때만 말한다.

말하지 않는 경우
  1. 그 재료가 든 식사가 3번 미만        — 우연과 구분이 안 된다
  2. 불편함이 따라온 적이 2번 미만       — 한 번은 그날의 일이다
  3. 절반 미만                          — "4번 중 1번" 은 패턴이 아니다
  4. 계산이 추정에 크게 기댐 (0.5 초과)  — 우리가 지어낸 숫자로 판단하는 꼴이다
  5. 그 식사에서 낸 기여가 35% 미만      — 같이 들어간 다른 재료를 놔두고
                                          이 재료를 지목할 근거가 없다

말할 때도 **교란 요인을 반드시 같이 말한다.** 관찰만 꺼내면 그게 판정이 된다.
"""

from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from models import (
    Ingredient, Meal, MealFodmap, MealIngredient, SymptomContext, SymptomDetail,
    SymptomLog, User,
)
from services import fodmap
from services.text import w

# ── 말해도 되는 최소 근거 ──────────────────────
MIN_MEALS = 3          # 그 재료가 든 식사 횟수
MIN_HITS = 2           # 불편함이 따라온 횟수
MIN_RATIO = 0.5        # 비율
MAX_ESTIMATED = 0.5    # 추정으로 때운 비율의 상한

LOOKBACK_DAYS = 30
KST = timezone(timedelta(hours=9))

# 화면에서 고를 수 있는 상황 요인. 키는 프론트와 맞춘 값이다.
# ★ 라벨이 아니라 키로 저장해야 한다.
#   "잠을 적게 잤어요" 를 그대로 저장하면 문장에 끼울 때
#   "잠을 적게 잤어요가 겹친 날이 많아서" 처럼 깨진다.
CONTEXT_KO = {
    "short_sleep": "수면 5시간 이하",
    "high_stress": "스트레스 높음",
    "overeating": "평소보다 많이 먹음",
    "alcohol": "음주",
    "menstruation": "월경 기간",
    "irregular_meal": "불규칙한 식사",
    "busy_schedule": "바쁜 일정",
}


# ══════════════════════════════════════════════
#  재료별 동시발생 세기
# ══════════════════════════════════════════════

def _dominant_axis(db: Session, meal: Meal) -> str | None:
    rows = db.query(MealFodmap).filter(MealFodmap.meal_id == meal.id).all()
    if not rows:
        return None
    return max(rows, key=lambda r: float(r.grams)).axis


def assign_symptoms(db: Session, user_id: int, meals: list[Meal]) -> dict[int, int]:
    """증상 1건을 **식사 한 끼에만** 붙인다.  {meal_id: symptom_log_id}

    ★ 왜 필요한가
      전에는 식사마다 따로 "내 창 안에 증상이 있나" 를 물었다.
      그러면 하루 세 끼를 먹고 배가 **한 번** 아팠을 때
      세 끼 모두가 그 증상을 자기 것으로 세서 "3번 중 3번" 이 됐다.
      단일 사건이 3회 재현으로 둔갑한다. 2-of-3 판정의 전제가 무너진다.

      그래서 증상 하나는 **그 시각에 감쇠 곡선 가중치가 가장 큰 한 끼**에만 붙인다.
      가중치가 가장 크다는 건 그 시점에 장에서 가장 세게 작용하고 있었다는 뜻이다.
      동점이면 더 최근 식사에 붙인다 (더 가까운 쪽이 설명력이 크다).
    """
    if not meals:
        return {}

    axis_of = {m.id: _dominant_axis(db, m) for m in meals}
    span = [m for m in meals if axis_of.get(m.id)]
    if not span:
        return {}

    lo = min(m.eaten_at for m in span)
    hi = max(m.eaten_at for m in span) + timedelta(hours=16)

    logs = (db.query(SymptomLog)
            .join(SymptomDetail, SymptomDetail.symptom_log_id == SymptomLog.id)
            .filter(SymptomLog.user_id == user_id,
                    SymptomLog.onset_at >= lo, SymptomLog.onset_at <= hi,
                    SymptomDetail.level.in_(("mild", "strong")))
            .distinct().all())

    out: dict[int, int] = {}
    for log in logs:
        best, best_w = None, 0.0
        for m in span:
            hours = (log.onset_at - m.eaten_at).total_seconds() / 3600.0
            if hours <= 0:
                continue
            wgt = fodmap.weight(axis_of[m.id], hours)
            if wgt > best_w or (wgt == best_w and best is not None
                                and wgt > 0 and m.eaten_at > best.eaten_at):
                best, best_w = m, wgt
        if best is not None and best_w > 0 and best.id not in out:
            out[best.id] = log.id
    return out


MIN_SHARE = 0.35       # 그 식사에서 이 재료가 낸 기여 비율


def ingredient_stats(db: Session, user_id: int, days: int = LOOKBACK_DAYS) -> list[dict]:
    """재료별로 "든 식사 N번 중 M번 불편함" 을 센다.

    ★ 이건 관찰이지 인과가 아니다. 반환값 어디에도 "원인" 이라는 필드가 없다.

    ★ 한 끼에 들어간 재료는 전부 같은 횟수를 갖는다.
      김치찌개를 4번 먹었으면 김치도 4번, 마늘도 4번이다.
      그래서 횟수만으로 재료를 지목하면 **정렬 순서로 범인이 정해진다.**
      실제로 첫 구현이 그랬고, 프럭탄의 대부분을 내는 마늘 대신
      김치가 지목됐다. 그건 사용자에게 거짓말이다.

      그래서 **그 재료가 실제로 낸 기여량**으로 순위를 매기고,
      기여 비율이 낮으면 아예 말하지 않는다.
    """
    since = datetime.now(timezone.utc) - timedelta(days=days)
    meals = (db.query(Meal)
             .filter(Meal.user_id == user_id, Meal.eaten_at >= since).all())

    assigned = assign_symptoms(db, user_id, meals)

    by_ing: dict[int, dict] = {}
    for meal in meals:
        per, est = fodmap.meal_breakdown(db, meal)
        if not per:
            continue
        # 이 식사에서 축별 총량 → 재료별 기여 비율
        totals: dict[str, float] = {}
        for axes in per.values():
            for a, g in axes.items():
                totals[a] = totals.get(a, 0.0) + g

        for ing_id, axes in per.items():
            axis = max(axes, key=axes.get)
            share = axes[axis] / totals[axis] if totals.get(axis) else 0.0

            ing = db.get(Ingredient, ing_id)
            d = by_ing.setdefault(ing_id, {
                "ingredient_id": ing_id, "name": ing.name if ing else "?",
                "axis": axis, "meals": 0, "hits": 0,
                "estimated": 0.0, "share": 0.0,
                "_num": 0.0, "_den": 0.0, "hit_logs": [],
            })
            d["meals"] += 1
            d["estimated"] = max(d["estimated"], est)
            # ★ share 를 식사별 최댓값으로 잡으면, 어쩌다 한 번 기여가 높았던
            #   미량 재료가 진짜 부하를 밀어내고 지목된다.
            #   전체 기간의 실제 누적 기여로 계산한다.
            d["_num"] += axes[axis]
            d["_den"] += totals.get(axis, 0.0)

            log_id = assigned.get(meal.id)
            if log_id is not None:
                d["hits"] += 1
                d["hit_logs"].append(log_id)

    out = []
    for d in by_ing.values():
        d["share"] = d["_num"] / d["_den"] if d["_den"] else 0.0
        d.pop("_num", None); d.pop("_den", None)
        d["ratio"] = d["hits"] / d["meals"] if d["meals"] else 0.0
        d["speakable"] = (
            d["meals"] >= MIN_MEALS
            and d["hits"] >= MIN_HITS
            and d["ratio"] >= MIN_RATIO
            and d["estimated"] <= MAX_ESTIMATED
            and d["share"] >= MIN_SHARE
        )
        out.append(d)
    # 말해도 되는 것 우선, 그다음 기여 비율, 그다음 비율
    return sorted(out, key=lambda x: (not x["speakable"], -x["share"], -x["ratio"]))


def food_stats(db: Session, user_id: int, days: int = LOOKBACK_DAYS) -> list[dict]:
    """음식 단위로 센다. 재료를 지목할 수 없을 때 쓴다.

    ★ 왜 필요한가
      김치찌개의 프럭탄은 양파 31% · 마늘 31% · 김치 30% 로 갈린다.
      셋 다 35% 를 못 넘어서 재료 단위로는 아무 말도 못 한다.
      그런데 "김치찌개를 5번 드셨는데 3번 불편하셨다" 는 **사실이다.**

      재료를 못 짚는다고 관찰까지 버릴 이유는 없다.
      음식으로 말하고, 그중 무엇 때문인지는 도전으로 가려낸다.
      그게 재도입 프로토콜이 존재하는 이유이기도 하다.
    """
    since = datetime.now(timezone.utc) - timedelta(days=days)
    meals = (db.query(Meal)
             .filter(Meal.user_id == user_id, Meal.eaten_at >= since).all())

    assigned = assign_symptoms(db, user_id, meals)

    by_food: dict[str, dict] = {}
    for meal in meals:
        per, est = fodmap.meal_breakdown(db, meal)
        if not per:
            continue
        totals: dict[str, float] = {}
        for axes in per.values():
            for a, g in axes.items():
                totals[a] = totals.get(a, 0.0) + g
        axis = max(totals, key=totals.get)

        d = by_food.setdefault(meal.food_name, {
            "name": meal.food_name, "axis": axis, "meals": 0, "hits": 0,
            "estimated": 0.0, "hit_logs": [], "contributors": {},
        })
        d["meals"] += 1
        d["estimated"] = max(d["estimated"], est)
        for ing_id, axes in per.items():
            if axis in axes:
                c = d["contributors"]
                c[ing_id] = c.get(ing_id, 0.0) + axes[axis]

        log_id = assigned.get(meal.id)
        if log_id is not None:
            d["hits"] += 1
            d["hit_logs"].append(log_id)

    out = []
    for d in by_food.values():
        d["ratio"] = d["hits"] / d["meals"] if d["meals"] else 0.0
        # ★ 음식 단위 관찰에는 estimated 조건을 걸지 않는다.
        #
        #   estimated 는 "그램을 카테고리 평균으로 때운 비율" 이다.
        #   그런데 "이 음식을 N번 먹고 M번 불편했다" 는 그램과 무관하다.
        #   먹었는지 안 먹었는지는 사용자가 직접 확정한 사실이다.
        #
        #   여기에 estimated 를 걸었더니 **마스터에 없는 음식을 먹는 사람은
        #   아무리 강한 패턴이 있어도 영원히 아무것도 못 봤다.**
        #   집밥 10번 중 7번 불편해도 침묵했다. 한국에서 이건 대부분의 사용자다.
        #
        #   그램 정확도가 필요한 건 재료를 **지목**할 때다.
        #   그건 ingredient_stats 쪽에서 계속 막는다.
        d["speakable"] = (d["meals"] >= MIN_MEALS and d["hits"] >= MIN_HITS
                          and d["ratio"] >= MIN_RATIO)
        out.append(d)
    return sorted(out, key=lambda x: (not x["speakable"], -x["ratio"], -x["meals"]))


def _listing(names: list[str], kind: str = "이") -> str:
    """이름을 나열하고 마지막에만 조사를 붙인다.

    "양파, 마늘, 김치이" (X) → "양파, 마늘, 김치가" (O)
    """
    if not names:
        return ""
    return ", ".join(names[:-1] + [w(names[-1], kind)])


def top_contributors(db: Session, contributors: dict[int, float], n: int = 3) -> list[dict]:
    """그 음식에서 해당 축을 많이 낸 재료들. 도전 후보이기도 하다."""
    ranked = sorted(contributors.items(), key=lambda x: -x[1])[:n]
    out = []
    for ing_id, g in ranked:
        ing = db.get(Ingredient, ing_id)
        if ing:
            out.append({"ingredient_id": ing_id, "name": ing.name, "grams": round(g, 3)})
    return out


def cofactors(db: Session, log_ids: list[int]) -> list[dict]:
    """불편함이 따라온 날들에 같이 있었던 것.

    이게 없으면 관찰이 판정이 된다. 절대 빼지 않는다.
    """
    if not log_ids:
        return []
    counts: dict[str, int] = {}
    for c in db.query(SymptomContext).filter(SymptomContext.symptom_log_id.in_(log_ids)):
        if c.factor == "none":
            continue
        counts[c.factor] = counts.get(c.factor, 0) + 1
    return [{"label": CONTEXT_KO.get(k, k), "count": v}
            for k, v in sorted(counts.items(), key=lambda x: -x[1])]


def _caveat(top: dict, cos: list[dict]) -> str | None:
    """교란 요인이 겹친 만큼을 문장으로.

    겹치는 게 없어도 단정하지 않는다. 3~4번은 여전히 적은 횟수다.
    """
    if cos and cos[0]["count"] >= 2:
        return (f"다만 그중 {cos[0]['count']}번은 {cos[0]['label']}이었어요. "
                f"음식 때문이라고 단정하기는 일러요.")
    if cos:
        return (f"다만 {w(cos[0]['label'], '이')} 겹친 날도 있었어요. "
                f"음식 때문이라고 단정하기는 일러요.")
    return "횟수가 아직 적어서, 음식 때문이라고 단정하기는 일러요."


# ══════════════════════════════════════════════
#  E3 개인화 패턴 분석
# ══════════════════════════════════════════════

def view(db: Session, user: User) -> dict:
    stats = ingredient_stats(db, user.id)
    speakable = [s for s in stats if s["speakable"]]

    now = datetime.now(timezone.utc)
    meals = (db.query(Meal)
             .filter(Meal.user_id == user.id, Meal.eaten_at >= now - timedelta(hours=16))
             .order_by(Meal.eaten_at).all())

    timeline = []
    for m in meals:
        h = (now - m.eaten_at).total_seconds() / 3600.0
        axes = [r.axis for r in db.query(MealFodmap).filter(MealFodmap.meal_id == m.id)]
        local = m.eaten_at.astimezone(KST)
        timeline.append({
            "time": local.strftime("%H:%M"),
            "meal": _meal_slot(local.hour),
            "food": m.food_name,
            "ago": f"{int(h)}시간 전" if h >= 1 else "방금",
            "phase": fodmap.phase_label(axes[0], h) if axes else "—",
        })

    if speakable:
        return _ingredient_view(db, speakable[0], timeline)

    # 재료를 못 짚으면 음식으로 말한다. 관찰까지 버릴 이유는 없다.
    foods = [f for f in food_stats(db, user.id) if f["speakable"]]
    if foods:
        return _food_view(db, foods[0], timeline)

    return {
        "headline": "지금까지 기록을 모아봤어요",
        "summary": None,
        "timeline": timeline,
        "cofactors": [],
        "verdict": {
            "title": "아직 말씀드릴 만한 패턴이 없어요",
            "body": "며칠 더 기록이 모이면 같이 살펴볼게요.",
            "action": None,
        } if timeline else None,
    }


def _ingredient_view(db: Session, top: dict, timeline: list) -> dict:
    cos = cofactors(db, top["hit_logs"])
    return {
        "headline": "지금까지 기록을 모아봤어요",
        "summary": (f"{w(top['name'], '이')} 들어간 식사 {top['meals']}번 중 "
                    f"{top['hits']}번, 몇 시간 뒤 불편함이 있었어요."),
        "timeline": timeline,
        "cofactors": cos,
        "verdict": {
            "title": "음식 때문인지는 아직 알 수 없어요",
            "body": _verdict_body(cos),
            "action": {"label": "확인해보기", "screen": "F1",
                       "ingredient_id": top["ingredient_id"]},
        },
    }


def _food_view(db: Session, top: dict, timeline: list) -> dict:
    """음식 단위 관찰.

    재료를 지목하지 않는다. 대신 후보 재료를 늘어놓고
    "그중 무엇인지는 확인해봐야 안다" 고 말한다.
    """
    cos = cofactors(db, top["hit_logs"])
    cands = top_contributors(db, top["contributors"])
    names = _listing([c["name"] for c in cands])

    body = f"{top['name']}에는 {names} 함께 들어가서, 그중 무엇 때문인지는 알 수 없어요."
    if cos:
        body += f" {w(cos[0]['label'], '이')} 겹친 날도 있었고요."

    return {
        "headline": "지금까지 기록을 모아봤어요",
        "summary": (f"{w(top['name'], '을')} 드신 {top['meals']}번 중 "
                    f"{top['hits']}번, 몇 시간 뒤 불편함이 있었어요."),
        "timeline": timeline,
        "cofactors": cos,
        "verdict": {
            "title": "무엇 때문인지는 아직 알 수 없어요",
            "body": body + " 하나씩 확인해보면 알 수 있어요.",
            "action": ({"label": "확인해보기", "screen": "F1",
                        "ingredient_id": cands[0]["ingredient_id"]} if cands else None),
        },
    }


def _verdict_body(cos: list[dict]) -> str:
    if cos:
        return (f"{w(cos[0]['label'], '이')} 겹친 날이 많아서, 지금 단정하기는 일러요. "
                f"정확히 알아보고 싶으시면 도와드릴게요.")
    return ("횟수가 아직 적어서 지금 단정하기는 일러요. "
            "정확히 알아보고 싶으시면 도와드릴게요.")


def _meal_slot(hour: int) -> str:
    if hour < 11:
        return "아침"
    if hour < 16:
        return "점심"
    if hour < 22:
        return "저녁"
    return "야식"


# ══════════════════════════════════════════════
#  D3 참고 정보와 대체안
# ══════════════════════════════════════════════

def meal_insight(db: Session, user: User, meal: Meal) -> dict:
    """이 식사에 든 재료 중 말할 만한 게 있으면 관찰을 붙인다.

    없으면 observation 이 null 이다. 프론트는 그때 그 카드를 안 그린다.
    """
    ing_ids = {mi.ingredient_id for mi in db.query(MealIngredient)
               .filter(MealIngredient.meal_id == meal.id)}
    stats = [s for s in ingredient_stats(db, user.id)
             if s["ingredient_id"] in ing_ids and s["speakable"]]

    observation, note = None, None
    if stats:
        top = stats[0]
        cos = cofactors(db, top["hit_logs"])
        observation = {
            "title": "최근 기록을 보면",
            "body": (f"{w(top['name'], '이')} 들어간 식사 {top['meals']}번 중 "
                     f"{top['hits']}번, 몇 시간 뒤 불편함이 기록됐어요."),
            "caveat": _caveat(top, cos),
        }
        if meal.ate_broth:
            note = f"국물에 {w(top['name'], '이')} 녹아 있을 수 있어요"
    else:
        # 재료를 못 짚으면 이 음식 자체로 말한다 (E3 와 같은 폴백).
        fs = [f for f in food_stats(db, user.id)
              if f["speakable"] and f["name"] == meal.food_name]
        if fs:
            top = fs[0]
            cos = cofactors(db, top["hit_logs"])
            cands = _listing([c["name"] for c in top_contributors(db, top["contributors"])])
            observation = {
                "title": "최근 기록을 보면",
                "body": (f"{w(meal.food_name, '을')} 드신 {top['meals']}번 중 "
                         f"{top['hits']}번, 몇 시간 뒤 불편함이 기록됐어요."),
                "caveat": (f"{cands} 함께 들어가서 그중 무엇 때문인지는 알 수 없어요. "
                           f"음식 때문이라고 단정하기도 일러요."),
            }

    return {
        "food_name": meal.food_name,
        "note": note,
        "observation": observation,
        "suggestions": _suggestions(db, meal, stats),
    }


def _suggestions(db: Session, meal: Meal, stats: list[dict]) -> list[dict]:
    """"이렇게 하면 드실 수 있어요" 4갈래.

    관찰이 없어도 이건 준다. 못 먹는 걸 알려주는 게 아니라
    먹는 방법을 알려주는 게 이 앱이 하려는 일이다.
    """
    name = stats[0]["name"] if stats else None
    out = [
        {"rank": 1, "title": "소량부터 시도해보기", "detail": "평소보다 조금만"},
        {"rank": 2, "title": "반 그릇만 드시기",
         "detail": "국물은 조금, 건더기 위주로" if meal.ate_broth else "양을 절반으로"},
    ]
    if name:
        out.append({"rank": 3, "title": f"{name} 빼달라고 요청하기",
                    "detail": "식당에서도 대부분 가능해요"})
    if meal.food_id:
        from models import MenuAlternative
        alts = [a.alt_name for a in db.query(MenuAlternative)
                .filter(MenuAlternative.food_id == meal.food_id)
                .order_by(MenuAlternative.rank).limit(2)]
        if alts:
            out.append({"rank": len(out) + 1, "title": "다른 메뉴 골라보기",
                        "detail": " · ".join(alts)})
    return out


# ══════════════════════════════════════════════
#  홈 주간 정리
# ══════════════════════════════════════════════

MIN_WEEK_MEALS = 5


def weekly_recap(db: Session, user: User) -> dict | None:
    """이번 주에 뭘 많이 먹었는지 **서술**한다. 평가하지 않는다.

    "과당이 높았어요" 는 높으면 나쁘다는 말로 읽힌다. 그건 판정이다.
    "가장 많았던 건 과당이에요" 는 사실 서술이다. 후자로 쓴다.
    """
    since = datetime.now(timezone.utc) - timedelta(days=7)
    meals = (db.query(Meal)
             .filter(Meal.user_id == user.id, Meal.eaten_at >= since).all())
    if len(meals) < MIN_WEEK_MEALS:
        return None

    meal_ids = [m.id for m in meals]
    totals: dict[str, float] = {}
    for r in db.query(MealFodmap).filter(MealFodmap.meal_id.in_(meal_ids)):
        totals[r.axis] = totals.get(r.axis, 0.0) + float(r.grams)
    if not totals:
        return None

    axis = max(totals, key=totals.get)
    source = _top_source(db, meals, axis)

    body = f"드신 것 중에서는 {fodmap.AXIS_KO[axis]}이 가장 많았어요."
    if source:
        body += f" 그중 {source['pct']}%는 {source['name']}에서 왔고요."
    return {"type": "weekly_recap", "title": "이번 주 정리해봤어요", "body": body}


def _top_source(db: Session, meals: list, axis: str) -> dict | None:
    """그 축이 어느 재료에서 가장 많이 왔나.

    meal_fodmap 은 식사 단위 합계라 재료별 내역이 없다.
    meal_breakdown 으로 다시 쪼갠다 — 먹은 양과 국물 여부까지 반영된 값이다.
    """
    per_name: dict[str, float] = {}
    for m in meals:
        per, _ = fodmap.meal_breakdown(db, m)
        for ing_id, axes in per.items():
            if axis in axes:
                ing = db.get(Ingredient, ing_id)
                if ing:
                    per_name[ing.name] = per_name.get(ing.name, 0.0) + axes[axis]

    total = sum(per_name.values())
    if not per_name or total <= 0:
        return None
    name = max(per_name, key=per_name.get)
    share = per_name[name] / total
    # 고만고만하면 지목하지 않는다.
    # 김치찌개의 프럭탄은 양파 31 · 마늘 31 · 김치 30 으로 갈린다.
    # 그중 하나를 "31%는 양파에서" 라고 부르면 나머지 둘을 감춘 셈이다.
    if share < 0.5:
        return None
    return {"name": name, "pct": int(round(share * 100))}


# ══════════════════════════════════════════════
#  F1 제안 이유
# ══════════════════════════════════════════════

def suggestion_reason(db: Session, user: User, ingredient_id: int, name: str) -> str:
    """도전을 왜 권하는지. 관찰이 있으면 그걸, 없으면 솔직하게."""
    stats = [s for s in ingredient_stats(db, user.id)
             if s["ingredient_id"] == ingredient_id]
    if stats and stats[0]["speakable"]:
        s = stats[0]
        cos = cofactors(db, s["hit_logs"])
        base = f"{w(name, '이')} 든 식사 {s['meals']}번 중 {s['hits']}번 불편하셨는데, "
        if cos:
            return base + (f"그중 {cos[0]['count']}번은 {w(cos[0]['label'], '이')} 겹쳐 있었어요. "
                           f"지금으로는 확실하지 않아요.")
        return base + "횟수가 적어서 지금으로는 확실하지 않아요."
    return (f"{w(name, '을')} 피하고 계신다고 하셨어요. "
            f"정말 그런지는 아직 확인해보지 않았고요.")
