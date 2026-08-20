"""식사 기록 · 증상 기록   화면 D1~D4, E0~E2

담당: 협업자 (B-3, B-4, B-5)
단, GET /meals/{id}/insight 의 본문 생성은 A-4 가 채운다 (관찰 + 교란 요인 병기).
"""

import base64
from datetime import datetime, timedelta, timezone
from io import BytesIO

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from PIL import Image
from sqlalchemy.orm import Session

from db_session import get_db
from deps import device_id, ex
from models import (
    Ingredient, Meal, MealIngredient, SafetyScreening,
    SymptomContext, SymptomDetail, SymptomLog,
)
from schemas import IdentifyIn, MealIn, ResolveIn, SymptomIn
from services import ingredients as ingredients_svc
from services import fodmap, llm, patterns, safety, symptoms, users

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

# B-4: 음식·재료 이름만 뽑는다. 판정이 아니라 입력이라 AI 를 써도 된다 (원칙 ④).
_COMMON_RULES = """규칙:
- 실제로 보이거나 언급된 것만 적는다. 확실하지 않으면 넣지 않는다.
- 재료는 짧은 일반 명사로 쓴다 ('국내산 양파' 대신 '양파', '진라면' 대신 '라면').
- 재료가 하나도 없으면 빈 배열을 돌려준다. 지어내지 않는다."""

# 텍스트와 사진은 실패하는 방식이 달라서 지침을 나눈다.
#
# 사진은 "모르겠는데 뭐라도 답해야" 할 때 흔한 음식을 찍는 게 문제다.
# 텍스트는 사용자가 직접 친 이름이라 그런 위험이 없다.
# 사진용 지침을 텍스트에도 쓰면 모델이 "김치찌개" 를 보고도
# is_food=false 를 낸다. 실제로 그렇게 깨졌다.

_IDENTIFY_TEXT_SYSTEM = f"""사용자가 입력한 음식 이름에서 재료를 뽑는 도우미다.

{_COMMON_RULES}

is_food — 사용자가 친 것이 음식·음료 이름이면 true.
  "김치찌개", "아메리카노", "엄마표 잡채" 는 전부 true 다.
  음식과 무관한 말("안녕", "asdf")일 때만 false 다."""

_IDENTIFY_PHOTO_SYSTEM = f"""음식 사진에서 음식 이름과 재료를 뽑는 도우미다.

{_COMMON_RULES}

★ is_food 를 반드시 정직하게 채운다.
  음식이 아니거나(빈 화면·사물·풍경·글자만 있는 사진),
  너무 흐리거나 어두워서 무엇인지 알 수 없으면 is_food = false 다.
  이때 food_name 은 빈 문자열, ingredients 는 빈 배열로 둔다.

  **모르겠으면 흔한 음식을 찍어서 답하지 마라.**
  회색 화면을 보고 "김치찌개" 라고 답하는 것이 가장 나쁜 실패다.
  사용자가 그대로 확인을 누르면 먹지도 않은 식사가 기록된다.
  모르겠다고 답하면 사용자가 직접 입력한다. 그편이 낫다.

  다만 음식이 분명히 보이면 주저하지 말고 채운다.
  지나치게 몸을 사려서 실제 음식을 놓치는 것도 실패다."""


_IDENTIFY_SCHEMA = {
    "type": "object",
    "properties": {
        # 모델에게 "모르겠다" 고 말할 길을 준다.
        # 이 칸이 없으면 모델은 뭐라도 답해야 해서 흔한 음식을 찍는다.
        "is_food": {"type": "boolean"},
        "food_name": {"type": "string"},
        "has_broth": {"type": "boolean"},
        "ingredients": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["is_food", "food_name", "has_broth", "ingredients"],
    "additionalProperties": False,
}

_IDENTIFY_EMPTY = {
    "food_id": None, "food_name": "", "has_broth": False,
    "ingredients": [], "confidence": "low",
}

_MAX_IMAGE_SIDE = 1024   # Vision 은 이 이상 키워봐야 인식률이 안 오르고 토큰만 늘어난다


def _downscale(raw: bytes) -> bytes:
    """업로드 사진을 긴 변 1024px JPEG 로 줄인다.

    폰 원본은 수 MB → base64 로 그대로 보내면 호출당 토큰·지연이 크게 뛴다.
    못 열면(손상·미지원 포맷) 원본을 그대로 돌려준다.
    """
    try:
        img = Image.open(BytesIO(raw))
        img = img.convert("RGB")
        img.thumbnail((_MAX_IMAGE_SIDE, _MAX_IMAGE_SIDE))
        buf = BytesIO()
        img.save(buf, format="JPEG", quality=85)
        return buf.getvalue()
    except Exception:                       # noqa: BLE001
        return raw


def _resolve(db: Session, extracted: dict) -> dict:
    """LLM 이 뽑은 이름을 마스터에 맞춰 응답 모양으로 만든다.

    확정된 음식이 있으면 그 기본 레시피 재료를 미리 체크된 상태로 얹는다 (B2).
    """
    food = ingredients_svc.find_food(db, extracted["food_name"])
    matched = ingredients_svc.match_many(db, extracted["ingredients"])
    matched_ids = {i.id for i in matched}

    if food is not None:
        for d in ingredients_svc.default_ingredients(db, food.id):
            if d.id not in matched_ids:
                matched.append(d)
                matched_ids.add(d.id)

    return {
        "food_id": food.id if food else None,
        "food_name": food.name if food else extracted["food_name"],
        "has_broth": food.has_broth if food else extracted.get("has_broth", False),
        "ingredients": [{"id": i.id, "name": i.name, "checked": True} for i in matched],
        # 마스터 음식과 재료가 하나라도 맞으면 high, 둘 다 불확실하면 low.
        "confidence": "high" if (food is not None and matched) else "low",
    }


@router.post(
    "/meals/identify",
    summary="D1→D2 · 텍스트로 재료 식별",
    responses=ex(_IDENTIFY_EXAMPLE),
)
def identify_text(body: IdentifyIn, dev: str = Depends(device_id), db: Session = Depends(get_db)):
    """마스터에 없는 재료는 지어내지 않는다. 못 찾으면 ingredients 가 빈 배열로 온다."""
    u = users.get_or_create(db, dev)
    r = llm.structured(
        db, purpose="identify_ingredients_text", model=llm.CLASSIFIER_MODEL,
        system=_IDENTIFY_TEXT_SYSTEM, user=body.text, schema=_IDENTIFY_SCHEMA, user_id=u.id,
    )
    if not r or not r.get("is_food"):
        return {**_IDENTIFY_EMPTY, "food_name": body.text}
    return _resolve(db, r)


@router.post(
    "/meals/identify-photo",
    summary="D1→D2 · 사진으로 재료 식별",
    responses=ex(_IDENTIFY_EXAMPLE),
)
def identify_photo(photo: UploadFile = File(...), dev: str = Depends(device_id),
                         db: Session = Depends(get_db)):
    u = users.get_or_create(db, dev)
    raw = photo.file.read()
    if not raw:
        return _IDENTIFY_EMPTY

    jpeg = _downscale(raw)  # 폰 사진은 수 MB — 그대로 보내면 비용·지연이 크다
    data_url = f"data:image/jpeg;base64,{base64.b64encode(jpeg).decode()}"
    r = llm.structured(
        db, purpose="identify_ingredients_photo", model=llm.CLASSIFIER_MODEL,
        system=_IDENTIFY_PHOTO_SYSTEM, user="이 사진 속 음식과 재료를 알려줘.",
        schema=_IDENTIFY_SCHEMA, user_id=u.id, image_data_url=data_url,
    )
    # 음식이 아니라고 하면 그대로 빈 결과를 준다.
    # 여기서 억지로 채우면 먹지도 않은 식사가 기록된다.
    if not r or not r.get("is_food"):
        return _IDENTIFY_EMPTY
    return _resolve(db, r)


@router.post(
    "/meals",
    summary="D2 확정 → D4 기록 완료",
    responses=ex({"meal_id": 91, "has_insight": True}),
)
def create_meal(body: MealIn, dev: str = Depends(device_id), db: Session = Depends(get_db)):
    """has_insight 가 false 면 D3 를 건너뛰고 바로 D4 로 간다."""
    u = users.get_or_create(db, dev)
    meal = Meal(
        user_id=u.id, food_id=body.food_id, food_name=body.food_name,
        eaten_at=body.eaten_at, portion=body.portion, ate_broth=body.ate_broth,
        method=body.method,
    )
    db.add(meal)
    db.flush()  # meal.id 를 받아와야 meal_ingredients 를 연결할 수 있다

    valid_ids = {
        row[0] for row in
        db.query(Ingredient.id).filter(Ingredient.id.in_(body.ingredient_ids)).all()
    } if body.ingredient_ids else set()

    linked: set[int] = set()
    for iid in body.ingredient_ids:
        if iid in valid_ids and iid not in linked:
            db.add(MealIngredient(meal_id=meal.id, ingredient_id=iid, added_by_user=False))
            linked.add(iid)

    for name in body.custom_ingredients:
        ing = ingredients_svc.get_or_create(db, name)
        if ing.id not in linked:
            db.add(MealIngredient(meal_id=meal.id, ingredient_id=ing.id, added_by_user=True))
            linked.add(ing.id)

    db.commit()

    # A-3 — 저장 직후 6축을 계산해 둔다.
    # 나중에 몰아서 하면 패턴 분석이 계산 안 된 식사를 조용히 빼먹는다.
    totals = fodmap.compute_meal(db, meal)

    return {"meal_id": meal.id, "has_insight": bool(totals)}


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
def meal_insight(meal_id: int, dev: str = Depends(device_id),
                       db: Session = Depends(get_db)):
    """caveat 은 절대 생략하지 않는다.

    관찰만 보여주고 교란 요인을 같이 안 보여주면 그게 판정이 된다 (절대 원칙 ①).
    말할 만한 근거가 없으면 observation 이 null 로 오고, 그때는 카드를 안 그린다.
    """
    u = users.get_or_create(db, dev)
    meal = db.get(Meal, meal_id)
    if meal is None or meal.user_id != u.id:
        raise HTTPException(404, {"code": "MEAL_NOT_FOUND",
                                  "message": "기록을 찾지 못했어요."})
    return patterns.meal_insight(db, u, meal)


# ── 증상 ──────────────────────────────────────

@router.post(
    "/symptoms",
    summary="E0·E1·E2 를 한 번에",
    responses=ex({
        "symptom_log_id": 44,
        "red_flag": False,
        "followup_at": "2026-08-19T22:00:00+09:00",
        "notice": None,
    }),
)
def create_symptom(
    body: SymptomIn, dev: str = Depends(device_id), db: Session = Depends(get_db),
):
    """red_flag 가 true 면 저장은 하되 프론트는 즉시 B1x 병원 안내로 보낸다.

    SF-03 상시 감시 — 온보딩을 통과했어도 여기서 다시 걸릴 수 있다.
    교수님 자문 15.2: "위험신호는 상시 감시해야지 입구에서 한 번 봐서는 안 된다"

    followup_at 에 "이제 좀 괜찮아지셨어요?" 푸시가 간다.
    아플 때 기록하고 나을 때는 기록하지 않기 때문에 2단계로 나눴다.
    """
    v = safety.screen_symptom_log(body.blood_in_stool)

    u = users.get_or_create(db, dev)
    now = datetime.now(timezone.utc)

    log = SymptomLog(
        user_id=u.id,
        onset=body.onset,
        onset_at=symptoms.onset_at(body.onset, now),
        location=body.location,
        blood_in_stool=body.blood_in_stool,
    )
    db.add(log)
    db.flush()  # log.id 를 받아와야 detail/context 를 연결할 수 있다

    for d in body.details:
        db.add(SymptomDetail(symptom_log_id=log.id, kind=d.kind, level=d.level))
    for factor in body.contexts:
        db.add(SymptomContext(symptom_log_id=log.id, factor=factor))

    if v.blocked:
        db.add(SafetyScreening(
            user_id=u.id, has_blood_in_stool=True, blocked=True,
            flags=v.flags, trigger_source="symptom_log",
        ))
        u.blocked_at = now

    db.commit()

    return {
        "symptom_log_id": log.id,
        "red_flag": v.blocked,
        "followup_at": (now + symptoms.FOLLOWUP_DELAY).isoformat(),
        # 차단 시 B1x 에 띄울 문구. 온보딩 때와 문장이 다르다.
        "notice": {"title": v.title, "body": v.body, "footer": v.footer} if v.blocked else None,
    }


@router.patch(
    "/symptoms/{log_id}/resolve",
    summary="후속 푸시를 눌렀을 때",
    responses=ex({"ok": True}),
)
def resolve_symptom(log_id: int, body: ResolveIn, dev: str = Depends(device_id),
                          db: Session = Depends(get_db)):
    u = users.get_or_create(db, dev)
    log = db.query(SymptomLog).filter(
        SymptomLog.id == log_id, SymptomLog.user_id == u.id,
    ).one_or_none()
    if log is not None:
        log.resolved_at = body.resolved_at
        db.commit()
    return {"ok": True}


# ── 기록 목록 ──────────────────────────────────

_PORTION_KO = {"half": "반 그릇", "one": "한 그릇", "one_and_half_plus": "한 그릇 반 이상"}
_LEVEL_KO = {"none": "없음", "mild": "조금", "strong": "많이"}
_LOCATION_KO = {"upper": "윗배", "lower": "아랫배"}
_ONSET_KO = {"just_now": "방금", "about_1h": "1시간쯤 전",
             "since_morning": "오전부터", "since_yesterday": "어제부터"}
KST = timezone(timedelta(hours=9))


@router.get(
    "/records",
    summary="기록 메인 — 내가 남긴 식사·증상 목록",
    responses=ex({
        "days": 14,
        "meals": [{
            "id": 91, "food_id": 3, "food_name": "김치찌개",
            "eaten_at": "2026-08-19T12:30:00+09:00",
            "method": "photo", "portion": "one",
            "summary": "한 그릇 · 국물까지", "has_insight": True,
        }],
        "symptoms": [{
            "id": 44,
            "logged_at": "2026-08-19T18:10:00+09:00",
            "onset_at": "2026-08-19T17:10:00+09:00",
            "resolved_at": None,
            "summary": "배가 빵빵함 많이",
            "detail": "1시간쯤 전 · 아랫배",
            "contexts": ["수면 5시간 이하"],
        }],
    }),
)
def records(days: int = 14, dev: str = Depends(device_id),
                  db: Session = Depends(get_db)):
    """기록 메인 화면이 쓰는 목록.

    문구는 서버가 만들어 보낸다. 프론트가 "한 그릇 · 국물까지" 같은 문장을
    조립하면 조사·표기가 화면마다 갈린다.
    """
    u = users.get_or_create(db, dev)
    since = datetime.now(timezone.utc) - timedelta(days=days)

    meals = []
    for m in (db.query(Meal)
              .filter(Meal.user_id == u.id, Meal.eaten_at >= since)
              .order_by(Meal.eaten_at.desc()).all()):
        bits = [_PORTION_KO.get(m.portion, "")]
        if m.ate_broth is True:
            bits.append("국물까지")
        elif m.ate_broth is False:
            bits.append("건더기만")
        meals.append({
            "id": m.id, "food_id": m.food_id, "food_name": m.food_name,
            "eaten_at": m.eaten_at.astimezone(KST).isoformat(),
            "method": m.method, "portion": m.portion,
            "summary": " · ".join(b for b in bits if b),
            "has_insight": m.fodmap_computed_at is not None,
        })

    symptoms = []
    for s in (db.query(SymptomLog)
              .filter(SymptomLog.user_id == u.id, SymptomLog.onset_at >= since)
              .order_by(SymptomLog.onset_at.desc()).all()):
        det = db.query(SymptomDetail).filter(SymptomDetail.symptom_log_id == s.id).all()
        parts = [f"{d.kind} {_LEVEL_KO.get(d.level, '')}".strip()
                 for d in det if d.level != "none"]
        ctx = [patterns.CONTEXT_KO.get(c.factor, c.factor)
               for c in db.query(SymptomContext)
               .filter(SymptomContext.symptom_log_id == s.id) if c.factor != "none"]
        sub = [_ONSET_KO.get(s.onset, "")]
        if s.location:
            sub.append(_LOCATION_KO[s.location])
        symptoms.append({
            "id": s.id,
            "logged_at": s.logged_at.astimezone(KST).isoformat() if s.logged_at else None,
            "onset_at": s.onset_at.astimezone(KST).isoformat(),
            "resolved_at": s.resolved_at.astimezone(KST).isoformat() if s.resolved_at else None,
            "summary": ", ".join(parts) if parts else "불편함 없음",
            "detail": " · ".join(b for b in sub if b),
            "contexts": ctx,
        })

    return {"days": days, "meals": meals, "symptoms": symptoms}
