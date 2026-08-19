"""AI와 대화하기   화면 H1

담당: 나 (A-7)
3층 하네스 (dev-01 §9). 안전 경계라 협업자에게 넘기지 않는다.

  1층  LLM 호출 전 차단 — 레드플래그 키워드 → 즉시 병원 안내
                          질문 유형 분류 → 의료 질문이면 LLM 미호출
  2층  LLM이 아는 것 제한 — 사용자 기록 + 계산 결과만. 일반 의학 지식 차단
  3층  출력 검증 — 구조화 출력 강제, 금지 패턴, 실패 시 재시도, 2회 실패 시 폴백

애매하면 무조건 보수적으로. 전량 로깅.
"""

from fastapi import APIRouter, Depends

from deps import device_id, ex
from schemas import ChatIn

router = APIRouter(tags=["AI"])

_BLOCK_REPLY = "그건 제가 답할 수 있는 범위를 넘어서요. 소화기내과에서 진료받아보시길 권해드려요."


@router.post(
    "/chat/messages",
    summary="H1 메시지 전송",
    responses=ex({
        "session_id": 4,
        "reply": "지난 기록에서 제육볶음은 3번 중 1번 불편함이 있었어요. 마늘을 빼고 드셔보시는 건 어떨까요?",
        "blocked": False,
        "block_reason": None,
        "suggestions": [{"label": "대체안 보기", "screen": "H4", "food_id": 9}],
    }),
)
async def send(body: ChatIn, dev: str = Depends(device_id)):
    """blocked 가 true 여도 프론트는 답변을 그대로 띄우고 후속 입력을 막지 않는다.

    계속 막는 건 서버가 한다. 프론트가 자체 판단으로 차단하지 않는다.
    """
    # TODO(A-7): 1층 → 2층 → 3층
    return {
        "session_id": body.session_id or 4,
        "reply": "지난 기록에서 제육볶음은 3번 중 1번 불편함이 있었어요. 마늘을 빼고 드셔보시는 건 어떨까요?",
        "blocked": False,
        "block_reason": None,
        "suggestions": [{"label": "대체안 보기", "screen": "H4", "food_id": 9}],
    }
