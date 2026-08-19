"""도전   화면 F1~F4

담당: 나 (A-5)
분산 반복 단회 도전 + 2-of-3 재현 판정. 상태 전이가 전부 여기 있다.
협업자는 이 파일을 건드리지 않는다.
"""

from fastapi import APIRouter, Depends, Response

from deps import device_id, ex
from schemas import AttemptIn, ChallengeIn

router = APIRouter(tags=["도전"], prefix="/challenges")


@router.get(
    "/suggestion",
    summary="F1 도전 제안",
    responses=ex({
        "ingredient_id": 12,
        "ingredient_name": "양파",
        "title": "양파, 다시 시도해볼까요?",
        "reason": {
            "title": "왜 제안하냐면",
            "body": "양파가 든 식사 4번 중 3번 불편하셨는데, 그중 2번은 수면 부족이 겹쳐 있었어요. 지금으로는 확실하지 않아요.",
        },
        "steps": [
            {"seq": 1, "title": "며칠간 양파만 빼두기", "detail": "다른 음식은 평소대로 드셔도 돼요"},
            {"seq": 2, "title": "편한 날 하루, 평소만큼", "detail": "연속으로 안 해도 괜찮아요"},
            {"seq": 3, "title": "이걸 세 번 반복", "detail": "한 번으론 알 수 없거든요"},
        ],
        "evidence": {"figure": "71%", "text": "실제로 시도한 사람이 그 음식을 되찾았어요"},
    }),
)
async def suggestion(response: Response, dev: str = Depends(device_id)):
    """제안할 게 없으면 204. 알레르기·셀리악 항목은 절대 제안에 나오지 않는다."""
    # TODO(A-5)
    return {
        "ingredient_id": 12,
        "ingredient_name": "양파",
        "title": "양파, 다시 시도해볼까요?",
        "reason": {
            "title": "왜 제안하냐면",
            "body": "양파가 든 식사 4번 중 3번 불편하셨는데, 그중 2번은 수면 부족이 겹쳐 있었어요. 지금으로는 확실하지 않아요.",
        },
        "steps": [
            {"seq": 1, "title": "며칠간 양파만 빼두기", "detail": "다른 음식은 평소대로 드셔도 돼요"},
            {"seq": 2, "title": "편한 날 하루, 평소만큼", "detail": "연속으로 안 해도 괜찮아요"},
            {"seq": 3, "title": "이걸 세 번 반복", "detail": "한 번으론 알 수 없거든요"},
        ],
        "evidence": {"figure": "71%", "text": "실제로 시도한 사람이 그 음식을 되찾았어요"},
    }


@router.post(
    "",
    summary="F2 확정 버튼을 눌렀을 때만 — 도전 생성",
    responses=ex({
        "challenge_id": 7,
        "status": "eliminating",
        "eliminate_until": "2026-08-22",
    }),
)
async def create(body: ChallengeIn, dev: str = Depends(device_id)):
    """쓰기다. F2 화면에 들어왔다는 이유로 부르면 안 된다.

    사용자가 "이렇게 시작할게요" 를 누른 순간에만 부른다.
    F2 가 보여줄 '이런 음식에 양파가 들어있어요' 목록은
    GET /ingredients/{id}/contains 로 따로 읽는다.
    """
    # TODO(A-5)
    return {
        "challenge_id": 7,
        "status": "eliminating",
        "eliminate_until": "2026-08-22",
    }


@router.get(
    "/{challenge_id}",
    summary="F3 표적 도전 진행",
    responses=ex({
        "challenge_id": 7,
        "ingredient_name": "양파",
        "status": "testing",
        "current_seq": 2,
        "instruction": "이번 주 아무 날 하루, 양파를 평소만큼 드셔보세요",
        "note": "연속으로 하지 않아도 돼요. 편한 날 하루면 됩니다.",
        "available_days": ["2026-08-20", "2026-08-21", "2026-08-24"],
        "excluded_note": "일정이 있는 날은 빼뒀어요.",
        "attempts": [
            {"seq": 1, "status": "done", "label": "불편함이 있었어요"},
            {"seq": 2, "status": "current", "label": "이번 주"},
            {"seq": 3, "status": "upcoming", "label": "다음 주"},
        ],
        "reassurance": "증상이 나더라도 장에 손상이 가지는 않아요. 편하게 시도해보세요.",
    }),
)
async def detail(challenge_id: int, dev: str = Depends(device_id)):
    """available_days 는 busy_days 를 뺀 결과다. 프론트는 준 날짜만 활성화한다.

    reassurance 는 생략하면 안 된다. 도전 자체가 무섭다는 게 설문에서 가장 큰 저항이었다.
    """
    # TODO(A-5)
    return {
        "challenge_id": challenge_id,
        "ingredient_name": "양파",
        "status": "testing",
        "current_seq": 2,
        "instruction": "이번 주 아무 날 하루, 양파를 평소만큼 드셔보세요",
        "note": "연속으로 하지 않아도 돼요. 편한 날 하루면 됩니다.",
        "available_days": ["2026-08-20", "2026-08-21", "2026-08-24"],
        "excluded_note": "일정이 있는 날은 빼뒀어요.",
        "attempts": [
            {"seq": 1, "status": "done", "label": "불편함이 있었어요"},
            {"seq": 2, "status": "current", "label": "이번 주"},
            {"seq": 3, "status": "upcoming", "label": "다음 주"},
        ],
        "reassurance": "증상이 나더라도 장에 손상이 가지는 않아요. 편하게 시도해보세요.",
    }


@router.post(
    "/{challenge_id}/attempts/{seq}",
    summary="시도 1회 결과 기록",
    responses=ex({"ok": True, "next_seq": 3, "finished": False}),
)
async def attempt(challenge_id: int, seq: int, body: AttemptIn, dev: str = Depends(device_id)):
    """finished 가 true 면 F4 로 이동한다."""
    # TODO(A-5)
    return {"ok": True, "next_seq": seq + 1 if seq < 3 else None, "finished": seq >= 3}


@router.get(
    "/{challenge_id}/result",
    summary="F4 도전 결과 — 2-of-3 판정",
    responses=ex({
        "ratio": "2/3",
        "headline": "양파, 세 번 중 두 번 반응이 있었어요",
        "attempts": [
            {"seq": 1, "date": "8월 1일", "label": "불편함 있었어요"},
            {"seq": 2, "date": "8월 5일", "label": "괜찮았어요"},
            {"seq": 3, "date": "8월 16일", "label": "불편함 있었어요"},
        ],
        "grade": "reduce_amount",
        "grade_label": "확정은 아니에요",
        "body": "\"확인된 후보\"로 저장할게요. 시간이 지나면 달라질 수 있어서, 나중에 더 적은 양으로 다시 해볼 수 있어요.",
    }),
)
async def result(challenge_id: int, dev: str = Depends(device_id)):
    """grade 는 등급 문자열이다. 허용량을 g 숫자로 주지 않는다.

    재현성이 낮아서(ICC 0.70, 1년에 29% 역전) 숫자로 보여주면 거짓 확신을 준다 (절대 원칙 ③).
    """
    # TODO(A-5)
    return {
        "ratio": "2/3",
        "headline": "양파, 세 번 중 두 번 반응이 있었어요",
        "attempts": [
            {"seq": 1, "date": "8월 1일", "label": "불편함 있었어요"},
            {"seq": 2, "date": "8월 5일", "label": "괜찮았어요"},
            {"seq": 3, "date": "8월 16일", "label": "불편함 있었어요"},
        ],
        "grade": "reduce_amount",
        "grade_label": "확정은 아니에요",
        "body": '"확인된 후보"로 저장할게요. 시간이 지나면 달라질 수 있어서, 나중에 더 적은 양으로 다시 해볼 수 있어요.',
    }


@router.post(
    "/{challenge_id}/save",
    summary="F4 → G '나의 식탁에 저장하기'",
    responses=ex({"ok": True, "moved_to": "candidate"}),
)
async def save(challenge_id: int, dev: str = Depends(device_id)):
    """my_table_items 상태 전이는 오직 여기서만 일어난다 (데이터 규칙 8)."""
    # TODO(A-6)
    return {"ok": True, "moved_to": "candidate"}
