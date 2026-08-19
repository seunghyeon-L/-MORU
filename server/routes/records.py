"""식사 기록 · 증상 기록   화면 D1~D4, E0~E2

담당: 협업자 (B-3, B-4, B-5)
단, GET /meals/{id}/insight 의 본문 생성은 A-4 가 채운다 (관찰 + 교란 요인 병기).
"""

import base64
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from db_session import get_db
from deps import device_id, ex
from models import SafetyScreening
from schemas import IdentifyIn, MealIn, ResolveIn, SymptomIn
from services import ingredients as ingredients_svc
from services import llm, safety, users

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
_IDENTIFY_SYSTEM = """음식 사진이나 설명에서 음식 이름과 재료를 뽑는 도우미다.

규칙:
- 실제로 보이거나 언급된 것만 적는다. 확실하지 않으면 넣지 않는다.
- 재료는 짧은 일반 명사로 쓴다 ('국내산 양파' 대신 '양파', '진라면' 대신 '라면').
- 재료가 하나도 없으면 빈 배열을 돌려준다. 지어내지 않는다.
"""

_IDENTIFY_SCHEMA = {
    "type": "object",
    "properties": {
        "food_name": {"type": "string"},
        "has_broth": {"type": "boolean"},
        "ingredients": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["food_name", "has_broth", "ingredients"],
    "additionalProperties": False,
}

_IDENTIFY_EMPTY = {
    "food_id": None, "food_name": "", "has_broth": False,
    "ingredients": [], "confidence": "low",
}


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
async def identify_text(body: IdentifyIn, dev: str = Depends(device_id), db: Session = Depends(get_db)):
    """마스터에 없는 재료는 지어내지 않는다. 못 찾으면 ingredients 가 빈 배열로 온다."""
    u = users.get_or_create(db, dev)
    r = llm.structured(
        db, purpose="identify_ingredients_text", model=llm.CLASSIFIER_MODEL,
        system=_IDENTIFY_SYSTEM, user=body.text, schema=_IDENTIFY_SCHEMA, user_id=u.id,
    )
    if not r:
        return {**_IDENTIFY_EMPTY, "food_name": body.text}
    return _resolve(db, r)


@router.post(
    "/meals/identify-photo",
    summary="D1→D2 · 사진으로 재료 식별",
    responses=ex(_IDENTIFY_EXAMPLE),
)
async def identify_photo(photo: UploadFile = File(...), dev: str = Depends(device_id),
                         db: Session = Depends(get_db)):
    u = users.get_or_create(db, dev)
    raw = await photo.read()
    if not raw:
        return _IDENTIFY_EMPTY

    data_url = f"data:{photo.content_type or 'image/jpeg'};base64,{base64.b64encode(raw).decode()}"
    r = llm.structured(
        db, purpose="identify_ingredients_photo", model=llm.CLASSIFIER_MODEL,
        system=_IDENTIFY_SYSTEM, user="이 사진 속 음식과 재료를 알려줘.",
        schema=_IDENTIFY_SCHEMA, user_id=u.id, image_data_url=data_url,
    )
    if not r:
        return _IDENTIFY_EMPTY
    return _resolve(db, r)


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
        "notice": None,
    }),
)
async def create_symptom(
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
    if v.blocked:
        db.add(SafetyScreening(
            user_id=u.id, has_blood_in_stool=True, blocked=True,
            flags=v.flags, trigger_source="symptom_log",
        ))
        u.blocked_at = datetime.now(timezone.utc)
        db.commit()

    # TODO(B-5): symptom_logs / symptom_details / symptom_contexts 저장
    return {
        "symptom_log_id": 44,
        "red_flag": v.blocked,
        "followup_at": "2026-08-19T22:00:00+09:00",
        # 차단 시 B1x 에 띄울 문구. 온보딩 때와 문장이 다르다.
        "notice": {"title": v.title, "body": v.body, "footer": v.footer} if v.blocked else None,
    }


@router.patch(
    "/symptoms/{log_id}/resolve",
    summary="후속 푸시를 눌렀을 때",
    responses=ex({"ok": True}),
)
async def resolve_symptom(log_id: int, body: ResolveIn, dev: str = Depends(device_id)):
    # TODO(B-5)
    return {"ok": True}
