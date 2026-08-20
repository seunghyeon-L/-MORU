"""도전   화면 F1~F4

담당: 나 (A-5)
분산 반복 단회 도전 + 2-of-3 재현 판정. 판정 로직은 services/challenges.py.
협업자는 이 파일을 건드리지 않는다.
"""

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from db_session import get_db
from deps import device_id, ex
from models import Challenge, ChallengeAttempt
from schemas import AttemptIn, ChallengeIn
from services import challenges as svc
from services import patterns, users
from services.text import w

router = APIRouter(tags=["도전"], prefix="/challenges")

# F1 에 그대로 나가는 문구. 재도입 3단계를 사람 말로 옮긴 것.
STEPS = [
    {"seq": 1, "title": "며칠간 {name}만 빼두기", "detail": "다른 음식은 평소대로 드셔도 돼요"},
    {"seq": 2, "title": "편한 날 하루, 평소만큼", "detail": "연속으로 안 해도 괜찮아요"},
    {"seq": 3, "title": "이걸 세 번 반복", "detail": "한 번으론 알 수 없거든요"},
]
# Foulkes/Lomer 2025 — 재도입 1,361건 중 965건 통과
EVIDENCE = {"figure": "71%", "text": "실제로 시도한 사람이 그 음식을 되찾았어요"}
REASSURANCE = "증상이 나더라도 장에 손상이 가지는 않아요. 편하게 시도해보세요."


def _load(db: Session, dev: str, cid: int) -> Challenge:
    u = users.get_or_create(db, dev)
    ch = db.get(Challenge, cid)
    if ch is None or ch.user_id != u.id:
        raise HTTPException(404, {"code": "CHALLENGE_NOT_FOUND",
                                  "message": "확인 중인 도전을 찾지 못했어요."})
    return ch


@router.get(
    "/suggestion",
    summary="F1 도전 제안 — 없으면 204",
    responses=ex({
        "ingredient_id": 12, "ingredient_name": "양파",
        "title": "양파, 다시 시도해볼까요?",
        "reason": {"title": "왜 제안하냐면", "body": "…"},
        "steps": STEPS, "evidence": EVIDENCE,
    }),
)
def suggestion(response: Response, dev: str = Depends(device_id),
                     db: Session = Depends(get_db)):
    """제안할 게 없으면 204. 알레르기·셀리악 항목은 절대 나오지 않는다.

    하드 스톱(후보 3개 / 3개월 / SF-03 감지)에 걸려도 204 다.
    "더 넓혀보자" 를 무한히 미는 건 앱이 사용자를 몰아붙이는 것이다.
    """
    u = users.get_or_create(db, dev)

    if svc.hard_stop_reason(db, u.id):
        return Response(status_code=204)

    item = svc.next_candidate(db, u.id)
    if item is None or item.ingredient_id is None:
        return Response(status_code=204)

    name = item.label
    return {
        "ingredient_id": item.ingredient_id,
        "ingredient_name": name,
        "title": f"{name}, 다시 시도해볼까요?",
        "reason": {
            "title": "왜 제안하냐면",
            "body": patterns.suggestion_reason(db, u, item.ingredient_id, name),
        },
        "steps": [{**s, "title": s["title"].format(name=name)} for s in STEPS],
        "evidence": EVIDENCE,
    }


@router.post(
    "",
    summary="F2 확정 버튼을 눌렀을 때만 — 도전 생성",
    responses=ex({"challenge_id": 7, "status": "eliminating",
                  "eliminate_until": "2026-08-22"}),
)
def create(body: ChallengeIn, dev: str = Depends(device_id),
                 db: Session = Depends(get_db)):
    """쓰기다. F2 화면에 들어왔다는 이유로 부르면 안 된다.

    F2 가 보여줄 '이런 음식에 양파가 들어있어요' 목록은
    GET /ingredients/{id}/contains 로 따로 읽는다.
    """
    u = users.get_or_create(db, dev)
    try:
        ch = svc.create(db, u.id, body.ingredient_id, body.elimination_days)
    except ValueError as e:
        # SF-02 — 알레르기·셀리악 재료는 도전을 만들 수 없다
        raise HTTPException(409, {"code": "CHALLENGE_BLOCKED", "message": str(e)})
    return {
        "challenge_id": ch.id,
        "status": ch.status,
        "eliminate_until": ch.testing_start.isoformat(),
    }


@router.get(
    "/{challenge_id}",
    summary="F3 표적 도전 진행",
    responses=ex({
        "challenge_id": 7, "ingredient_name": "양파", "status": "testing",
        "current_seq": 2,
        "instruction": "이번 주 아무 날 하루, 양파를 평소만큼 드셔보세요",
        "available_days": ["2026-08-20", "2026-08-21"],
        "reassurance": REASSURANCE,
    }),
)
def detail(challenge_id: int, dev: str = Depends(device_id),
                 db: Session = Depends(get_db)):
    """available_days 는 busy_days 를 뺀 결과다. 프론트는 준 날짜만 활성화한다.

    reassurance 는 생략하면 안 된다.
    도전 자체가 무섭다는 게 설문에서 가장 큰 저항이었다.
    """
    ch = svc.advance_if_due(db, _load(db, dev, challenge_id))
    name = svc.ingredient_name(db, ch.ingredient_id)

    rows = (db.query(ChallengeAttempt)
            .filter(ChallengeAttempt.challenge_id == ch.id)
            .order_by(ChallengeAttempt.seq).all())
    pending = [a for a in rows if a.result == "pending"]
    cur = pending[0].seq if pending else None

    LABEL = {"reaction": "불편함이 있었어요", "no_reaction": "괜찮았어요",
             "skipped": "건너뛰었어요"}
    attempts = [{
        "seq": a.seq,
        "status": ("done" if a.result != "pending"
                   else "current" if a.seq == cur else "upcoming"),
        "label": LABEL.get(a.result, "이번 주" if a.seq == cur else "예정"),
    } for a in rows]

    still_eliminating = ch.status == svc.ELIMINATING
    return {
        "challenge_id": ch.id,
        "ingredient_name": name,
        "status": ch.status,
        "current_seq": cur,
        "instruction": (
            f"{ch.testing_start.strftime('%m월 %d일')}까지 {name}만 빼두세요"
            if still_eliminating
            else f"이번 주 아무 날 하루, {w(name)} 평소만큼 드셔보세요"),
        "note": ("다른 음식은 평소대로 드셔도 돼요."
                 if still_eliminating
                 else "연속으로 하지 않아도 돼요. 편한 날 하루면 됩니다."),
        "available_days": [d.isoformat() for d in svc.available_days(db, ch)],
        "excluded_note": "일정이 있는 날은 빼뒀어요.",
        "attempts": attempts,
        "reassurance": REASSURANCE,
    }


@router.post(
    "/{challenge_id}/attempts/{seq}",
    summary="시도 1회 결과 기록",
    responses=ex({"ok": True, "next_seq": 3, "finished": False}),
)
def attempt(challenge_id: int, seq: int, body: AttemptIn,
                  dev: str = Depends(device_id), db: Session = Depends(get_db)):
    """finished 가 true 면 F4 로 이동한다."""
    ch = _load(db, dev, challenge_id)
    r = svc.record_attempt(db, ch, seq, body.result, body.tested_at, body.scheduled_date)
    if not r["ok"]:
        raise HTTPException(404, {"code": "ATTEMPT_NOT_FOUND",
                                  "message": "해당 회차를 찾지 못했어요."})
    return r


@router.get(
    "/{challenge_id}/result",
    summary="F4 도전 결과 — 2-of-3 판정",
    responses=ex({
        "ratio": "2/3",
        "headline": "양파, 세 번 중 두 번 반응이 있었어요",
        "grade": "reduce_amount", "grade_label": "확정은 아니에요",
    }),
)
def result(challenge_id: int, dev: str = Depends(device_id),
                 db: Session = Depends(get_db)):
    """grade 는 등급 문자열이다. 허용량을 g 숫자로 주지 않는다.

    재현성이 낮아서(ICC 0.70, 1년에 29% 역전) 숫자로 보여주면 거짓 확신을 준다.
    """
    ch = _load(db, dev, challenge_id)
    if ch.result_grade is None:
        raise HTTPException(409, {"code": "NOT_FINISHED",
                                  "message": "아직 세 번을 다 마치지 않았어요."})

    name = svc.ingredient_name(db, ch.ingredient_id)
    rows = (db.query(ChallengeAttempt)
            .filter(ChallengeAttempt.challenge_id == ch.id)
            .order_by(ChallengeAttempt.seq).all())
    hits = sum(1 for a in rows if a.result == "reaction")
    # 건너뛴 회차를 "괜찮았다" 로 세면 안 된다.
    # 두 번을 건너뛰고 한 번만 괜찮았는데 "세 번 다 괜찮았어요" 라고 말하던 자리다.
    done = sum(1 for a in rows if a.result in ("reaction", "no_reaction"))
    skipped = sum(1 for a in rows if a.result == "skipped")
    info = svc.GRADE_TEXT[ch.result_grade]

    LABEL = {"reaction": "불편함 있었어요", "no_reaction": "괜찮았어요",
             "skipped": "건너뛰었어요", "pending": "—"}
    return {
        "ratio": f"{hits}/{done}" if done else "0/0",
        # 3번을 다 못 채웠으면 결론을 말하지 않는다.
        # 판정(grade)은 이미 recheck_later 로 나오는데
        # 헤드라인만 "다 괜찮았어요" 라고 해서 서로 어긋났다.
        "headline": (
            f"{name}, 아직 판단하기 어려워요 (해본 {done}번 · 건너뛴 {skipped}번)"
            if done < 3 else
            f"{name}, 세 번 중 {hits}번 반응이 있었어요" if hits
            else f"{name}, 세 번 다 괜찮았어요"),
        "attempts": [{
            "seq": a.seq,
            "date": a.tested_at.strftime("%m월 %d일") if a.tested_at else "—",
            "label": LABEL.get(a.result, "—"),
        } for a in rows],
        "grade": ch.result_grade,
        "grade_label": info["label"],
        "body": info["body"],
    }


@router.post(
    "/{challenge_id}/save",
    summary="F4 → G '나의 식탁에 저장하기'",
    responses=ex({"ok": True, "moved_to": "candidate"}),
)
def save(challenge_id: int, dev: str = Depends(device_id),
               db: Session = Depends(get_db)):
    """my_table_items 상태 전이는 오직 여기서만 일어난다 (데이터 규칙 8)."""
    ch = _load(db, dev, challenge_id)
    moved = svc.save_to_mytable(db, ch)
    if moved == "not_finished":
        raise HTTPException(409, {"code": "NOT_FINISHED",
                                  "message": "아직 세 번을 다 마치지 않았어요."})
    return {"ok": True, "moved_to": moved}
