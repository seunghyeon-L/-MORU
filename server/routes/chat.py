"""AI와 대화하기   화면 H1

담당: 나 (A-7). 안전 경계라 협업자에게 넘기지 않는다.
하네스 본체는 services/chat_harness.py.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db_session import get_db
from deps import device_id, ex
from models import ChatMessage, ChatSession
from schemas import ChatIn
from services import chat_harness as harness
from services import users

router = APIRouter(tags=["AI"])


@router.post(
    "/chat/messages",
    summary="H1 메시지 전송 — 3층 하네스",
    responses=ex({
        "session_id": 4,
        "reply": "지난 기록에서 제육볶음은 3번 중 1번 불편함이 있었어요. 마늘을 빼고 드셔보시는 건 어떨까요?",
        "blocked": False,
        "block_reason": None,
        "suggestions": [],
    }),
)
async def send(body: ChatIn, dev: str = Depends(device_id), db: Session = Depends(get_db)):
    """blocked 가 true 여도 프론트는 답변을 그대로 띄우고 후속 입력을 막지 않는다.

    계속 막는 건 서버가 한다. 프론트가 자체 판단으로 차단하지 않는다.

    block_reason 종류
      red_flag          레드플래그 키워드. 답변 LLM 을 부르지도 않았다
      medical_question  의료 질문으로 분류됨
      low_confidence    분류가 애매함 → 보수적으로 막음
      output_rejected   답변이 금지 패턴에 걸려 2회 재시도 후 폴백
    """
    if not body.text.strip():
        raise HTTPException(400, {"code": "EMPTY_MESSAGE",
                                  "message": "메시지를 입력해 주세요."})

    u = users.get_or_create(db, dev)

    session = None
    if body.session_id:
        session = db.get(ChatSession, body.session_id)
        if session and session.user_id != u.id:
            session = None
    if session is None:
        session = ChatSession(user_id=u.id)
        db.add(session)
        db.commit()

    db.add(ChatMessage(session_id=session.id, role="user", content=body.text))
    db.commit()

    r = harness.answer(db, u, body.text)

    db.add(ChatMessage(
        session_id=session.id, role="assistant", content=r["reply"],
        blocked_reason=r["block_reason"], llm_called=r["_llm_called"],
        retry_count=r["_retry"], fell_back=r["_fell_back"],
    ))
    db.commit()

    return {
        "session_id": session.id,
        "reply": r["reply"],
        "blocked": r["blocked"],
        "block_reason": r["block_reason"],
        "suggestions": [],      # TODO(A-7): 음식 질문이면 H4 로 보내는 칩
    }
