"""홈 · 패턴 · 나의 식탁   화면 C, E3, G

담당: 나 (A-4, A-6, A-8)
여기서 나가는 문장은 전부 "판정하지 않는" 형태여야 한다. 이 파일은 협업자가 건드리지 않는다.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db_session import get_db
from deps import device_id, ex
from services import mytable, users

router = APIRouter(tags=["홈·분석"])


@router.get(
    "/home",
    summary="C 홈 — 카드 배열",
    responses=ex({
        "greeting": "안녕하세요, 은솔님",
        "cards": [
            {"type": "challenge_suggestion",
             "title": "양파, 다시 시도해볼 만해요",
             "body": "실제로 시도한 사람의 71%가 그 음식을 되찾았어요.",
             "action": {"label": "시작할게요", "screen": "F1", "challenge_id": None, "ingredient_id": 12},
             "dismiss": {"label": "나중에"}},
            {"type": "weekly_recap",
             "title": "이번 주 정리해봤어요",
             "body": "과당이 조금 높았어요. 71%가 매일 드시는 오렌지주스에서 왔습니다."},
            {"type": "schedule_note",
             "title": "이번 주는 일정이 여유롭네요",
             "body": "무언가 새로 시도해보기 좋은 때예요."},
        ],
    }),
)
async def home(dev: str = Depends(device_id)):
    """카드는 배열이다. 개수도 순서도 서버가 정한다.

    프론트는 type 별 렌더러만 만들고 반복해서 그린다.
    기록이 없는 신규 사용자는 cards 가 빈 배열이다 — 빈 화면 디자인이 필요하다.
    """
    # TODO(A-8)
    return {
        "greeting": "안녕하세요, 은솔님",
        "cards": [
            {"type": "challenge_suggestion",
             "title": "양파, 다시 시도해볼 만해요",
             "body": "실제로 시도한 사람의 71%가 그 음식을 되찾았어요.",
             "action": {"label": "시작할게요", "screen": "F1", "challenge_id": None, "ingredient_id": 12},
             "dismiss": {"label": "나중에"}},
            {"type": "weekly_recap",
             "title": "이번 주 정리해봤어요",
             "body": "과당이 조금 높았어요. 71%가 매일 드시는 오렌지주스에서 왔습니다."},
            {"type": "schedule_note",
             "title": "이번 주는 일정이 여유롭네요",
             "body": "무언가 새로 시도해보기 좋은 때예요."},
        ],
    }


@router.get(
    "/patterns",
    summary="E3 개인화 패턴 분석",
    responses=ex({
        "headline": "지금까지 기록을 모아봤어요",
        "summary": "양파가 들어간 식사 4번 중 3번, 몇 시간 뒤 불편함이 있었어요.",
        "timeline": [
            {"time": "12:30", "meal": "점심", "food": "김치찌개", "ago": "8시간 전", "phase": "발효 시점"},
            {"time": "19:40", "meal": "저녁", "food": "떡볶이", "ago": "1시간 전", "phase": "아직 도착 전"},
        ],
        "cofactors": [
            {"label": "수면 5시간 이하", "count": 2},
            {"label": "스트레스 높음", "count": 1},
        ],
        "verdict": {
            "title": "음식 때문인지는 아직 알 수 없어요",
            "body": "수면이 겹친 날이 많아서, 지금 단정하기는 일러요. 정확히 알아보고 싶으시면 도와드릴게요.",
            "action": {"label": "확인해보기", "screen": "F1", "ingredient_id": 12},
        },
    }),
)
async def patterns(dev: str = Depends(device_id)):
    """verdict.title 은 항상 유보형이다.

    "양파가 원인입니다" 같은 문장은 서버가 절대 만들지 않는다 (절대 원칙 ①).
    기록이 적으면 summary 가 null, timeline 이 빈 배열로 온다.
    """
    # TODO(A-4): 감쇠 곡선으로 노출-증상 정렬 + 교란 요인 집계
    return {
        "headline": "지금까지 기록을 모아봤어요",
        "summary": "양파가 들어간 식사 4번 중 3번, 몇 시간 뒤 불편함이 있었어요.",
        "timeline": [
            {"time": "12:30", "meal": "점심", "food": "김치찌개", "ago": "8시간 전", "phase": "발효 시점"},
            {"time": "19:40", "meal": "저녁", "food": "떡볶이", "ago": "1시간 전", "phase": "아직 도착 전"},
        ],
        "cofactors": [
            {"label": "수면 5시간 이하", "count": 2},
            {"label": "스트레스 높음", "count": 1},
        ],
        "verdict": {
            "title": "음식 때문인지는 아직 알 수 없어요",
            "body": "수면이 겹친 날이 많아서, 지금 단정하기는 일러요. 정확히 알아보고 싶으시면 도와드릴게요.",
            "action": {"label": "확인해보기", "screen": "F1", "ingredient_id": 12},
        },
    }


@router.get(
    "/mytable",
    summary="G 나의 식탁",
    responses=ex({
        "headline": "처음보다 6가지를 되찾았어요",
        "sub": "피하던 음식 8가지 중 6가지를 다시 드실 수 있게 됐어요.",
        "sections": [
            {"status": "safe", "title": "안심하고 먹는 음식",
             "items": [{"id": 1, "label": "우유"}, {"id": 2, "label": "밀빵"},
                       {"id": 3, "label": "콩류"}, {"id": 4, "label": "커피"}]},
            {"status": "candidate", "title": "확인된 후보",
             "items": [{"id": 5, "label": "양파", "note": "3번 중 2번 반응", "hint": "양을 줄여보세요"}]},
            {"status": "to_try", "title": "다시 먹어볼 음식",
             "items": [{"id": 6, "label": "마늘", "note": "아직 확인 전",
                        "action": {"label": "확인해보기", "screen": "F1", "ingredient_id": 13}}]},
        ],
        "saved_recommendations": [{"kind": "recipe", "ref_id": 3, "title": "속 편한 녹차라떼"}],
    }),
)
async def mytable_view(dev: str = Depends(device_id), db: Session = Depends(get_db)):
    """headline 의 개수는 되찾은 개수다.

    제한이 아니라 확장을 세기 때문에 원칙 ② 의 "점수" 가 아니다.
    다만 프론트는 이걸 게이지나 진행 바로 그리지 않는다. 문장으로만 쓴다.
    """
    u = users.get_or_create(db, dev)
    return mytable.view(db, u.id)
