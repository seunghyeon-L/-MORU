"""도전 상태머신 · 2-of-3 재현 판정   F1~F4

분산 반복 단회 도전이다. 3일 연속 계단식이 아니다.
"편한 날 하루" 를 세 번, 연속일 필요 없이 반복한다.

왜 3번인가
  한 번의 반응은 그날의 수면·스트레스·과식과 구분되지 않는다.
  재현성이 낮아서(test-retest ICC 0.70, CV 65~80%, 1년에 29% 역전)
  한 번 봐서는 아무것도 말할 수 없다.

왜 숫자가 아니라 등급인가
  같은 이유다. "당신의 역치는 4.6g" 은 다음 달에 틀린 말이 된다.
  등급으로만 말하고, 나중에 다시 해볼 수 있다고 열어둔다. (절대 원칙 ③)
"""

from datetime import date, datetime, timedelta, timezone

from sqlalchemy.orm import Session

from models import BusyDay, Challenge, ChallengeAttempt, Ingredient, MyTableItem

KST = timezone(timedelta(hours=9))

# 상태
PROPOSED, ELIMINATING, TESTING, DONE, ABANDONED = (
    "proposed", "eliminating", "testing", "done", "abandoned")

# 하드 스톱 (spec-04 V1-652) — 먼저 오는 것
MAX_CANDIDATES = 3          # 확인된 후보가 3개 쌓이면
MAX_MONTHS = 3              # 또는 3개월이 지나면
                            # 또는 SF-03 감지 시  → 확장 제안을 멈춘다


def today() -> date:
    return datetime.now(KST).date()


# ── 생성 ────────────────────────────────────────

def create(db: Session, user_id: int, ingredient_id: int, elimination_days: int) -> Challenge:
    """F2 확정. 제거 기간을 잡고 시도 3칸을 미리 만들어둔다."""
    start = today()
    ch = Challenge(
        user_id=user_id, ingredient_id=ingredient_id, status=ELIMINATING,
        elimination_days=elimination_days,
        eliminate_start=start, testing_start=start + timedelta(days=elimination_days),
    )
    db.add(ch)
    db.flush()
    for seq in (1, 2, 3):
        db.add(ChallengeAttempt(challenge_id=ch.id, seq=seq, result="pending"))
    db.commit()
    return ch


def advance_if_due(db: Session, ch: Challenge) -> Challenge:
    """제거 기간이 끝났으면 스스로 testing 으로 넘어간다.

    사용자가 앱을 안 열어도 시간은 흐르기 때문에, 조회 시점에 따라잡는다.
    """
    if ch.status == ELIMINATING and ch.testing_start and today() >= ch.testing_start:
        ch.status = TESTING
        db.commit()
    return ch


# ── 날짜 제안 ───────────────────────────────────

def available_days(db: Session, ch: Challenge, span: int = 7) -> list[date]:
    """앞으로 span 일 중 시도할 수 있는 날.

    PR-02c 일정 회피 배치 — 약속이나 시험이 있는 날은 뺀다.
    그날 증상이 나면 그게 음식 때문인지 그날 상황 때문인지 알 수 없고,
    무엇보다 중요한 날에 시도하게 만들면 안 된다.
    """
    first = max(today(), ch.testing_start or today())
    busy = {b.day for b in db.query(BusyDay).filter(BusyDay.user_id == ch.user_id)}
    used = {a.scheduled_date for a in db.query(ChallengeAttempt)
            .filter(ChallengeAttempt.challenge_id == ch.id) if a.scheduled_date}
    return [d for i in range(span)
            if (d := first + timedelta(days=i)) not in busy and d not in used]


# ── 판정 ────────────────────────────────────────

def grade(attempts: list[ChallengeAttempt]) -> str | None:
    """2-of-3 재현 판정.

    3번을 다 마치기 전에는 아무 말도 하지 않는다 (None).
    건너뛴 회차가 있으면 판정하지 않는다 — 2번만 보고 재현을 말할 수 없다.
    """
    done = [a for a in attempts if a.result in ("reaction", "no_reaction")]
    if len(done) < 3:
        return None
    hits = sum(1 for a in done if a.result == "reaction")
    if hits >= 2:
        return "reduce_amount"      # 재현됨 → 양을 줄여보는 쪽으로
    return "tolerated"              # 0~1회는 재현이라고 부르지 않는다


GRADE_TEXT = {
    "tolerated": {
        "label": "괜찮았어요",
        "body": "\"안심하고 먹는 음식\"으로 옮길게요. 앞으로도 편하게 드셔도 괜찮아요.",
        "status": "safe",
    },
    "reduce_amount": {
        "label": "확정은 아니에요",
        "body": "\"확인된 후보\"로 저장할게요. 시간이 지나면 달라질 수 있어서, "
                "나중에 더 적은 양으로 다시 해볼 수 있어요.",
        "status": "candidate",
        "hint": "양을 줄여보세요",
    },
    "recheck_later": {
        "label": "아직 알 수 없어요",
        "body": "건너뛴 회차가 있어서 지금은 판단하기 어려워요. 편하실 때 다시 해볼까요?",
        "status": "to_try",
    },
}


def record_attempt(db: Session, ch: Challenge, seq: int, result: str,
                   tested_at: datetime | None, scheduled_date: date | None) -> dict:
    """시도 1회 기록. 3번이 다 차면 판정하고 도전을 닫는다."""
    a = (db.query(ChallengeAttempt)
         .filter(ChallengeAttempt.challenge_id == ch.id, ChallengeAttempt.seq == seq)
         .one_or_none())
    if a is None:
        return {"ok": False, "error": "attempt_not_found"}

    a.result = result
    a.tested_at = tested_at or datetime.now(timezone.utc)
    if scheduled_date:
        a.scheduled_date = scheduled_date
    if ch.status == ELIMINATING:
        ch.status = TESTING

    attempts = (db.query(ChallengeAttempt)
                .filter(ChallengeAttempt.challenge_id == ch.id)
                .order_by(ChallengeAttempt.seq).all())
    pending = [x for x in attempts if x.result == "pending"]

    finished = not pending
    if finished:
        g = grade(attempts) or "recheck_later"
        ch.result_grade = g
        ch.status = DONE
        ch.finished_at = datetime.now(timezone.utc)

    db.commit()
    return {
        "ok": True,
        "next_seq": pending[0].seq if pending else None,
        "finished": finished,
    }


# ── 결과 → 나의 식탁 ────────────────────────────

def save_to_mytable(db: Session, ch: Challenge) -> str:
    """F4 "나의 식탁에 저장하기".

    데이터 규칙 8 — 나의 식탁 상태는 도전 결과로만 바뀐다.
    캐주얼 관찰(그냥 먹고 아팠던 기록)로는 절대 여기가 안 바뀐다.
    """
    if ch.result_grade is None:
        return "not_finished"

    info = GRADE_TEXT[ch.result_grade]
    name = ingredient_name(db, ch.ingredient_id)
    attempts = (db.query(ChallengeAttempt)
                .filter(ChallengeAttempt.challenge_id == ch.id).all())
    hits = sum(1 for a in attempts if a.result == "reaction")

    item = (db.query(MyTableItem)
            .filter(MyTableItem.user_id == ch.user_id, MyTableItem.label == name)
            .one_or_none())
    if item is None:
        item = MyTableItem(user_id=ch.user_id, ingredient_id=ch.ingredient_id, label=name)
        db.add(item)

    item.status = info["status"]
    # 건너뛴 회차가 있으면 "3번 중 2번 반응" 이라고 쓰면 안 된다.
    # 3번을 다 한 것처럼 읽히기 때문이다.
    skipped = any(a.result == "skipped" for a in attempts)
    item.note = ("건너뛴 회차가 있어요" if skipped
                 else f"3번 중 {hits}번 반응" if hits else None)
    item.source_challenge_id = ch.id
    item.updated_at = datetime.now(timezone.utc)
    db.commit()
    return info["status"]


def ingredient_name(db: Session, ingredient_id: int) -> str:
    ing = db.get(Ingredient, ingredient_id)
    return ing.name if ing else f"재료 #{ingredient_id}"


# ── 제안 ────────────────────────────────────────

def hard_stop_reason(db: Session, user_id: int) -> str | None:
    """확장 제안을 멈춰야 하는가.  spec-04 V1-652

    "더 넓혀보자" 를 무한히 밀면 그건 앱이 사용자를 몰아붙이는 것이다.
    """
    from models import User

    candidates = (db.query(MyTableItem)
                  .filter(MyTableItem.user_id == user_id,
                          MyTableItem.status == "candidate").count())
    if candidates >= MAX_CANDIDATES:
        return "candidates_reached"

    u = db.get(User, user_id)
    if u and u.blocked_at:            # SF-03 감지 중이면 제안하지 않는다
        return "safety_flagged"

    first = (db.query(Challenge)
             .filter(Challenge.user_id == user_id)
             .order_by(Challenge.created_at).first())
    if first and first.created_at:
        if (datetime.now(timezone.utc) - first.created_at).days > MAX_MONTHS * 30:
            return "months_reached"
    return None


def next_candidate(db: Session, user_id: int) -> MyTableItem | None:
    """다음에 제안할 항목.

    알레르기·셀리악 항목은 여기 오기 전에 이미 걸러져 있다 —
    온보딩에서 my_table_items 에 아예 넣지 않는다. (services/mytable.py)
    avoiding 은 사용자가 "안 할래요" 한 것이라 다시 꺼내지 않는다.
    """
    open_ch = (db.query(Challenge)
               .filter(Challenge.user_id == user_id,
                       Challenge.status.in_([ELIMINATING, TESTING])).first())
    if open_ch:
        return None               # 진행 중인 도전이 있으면 새로 제안하지 않는다

    from sqlalchemy import or_
    return (db.query(MyTableItem)
            .filter(MyTableItem.user_id == user_id,
                    MyTableItem.status == "to_try",
                    MyTableItem.ingredient_id.isnot(None),
                    # 홈에서 "나중에" 를 누른 건 기한이 지나야 다시 나온다
                    or_(MyTableItem.snoozed_until.is_(None),
                        MyTableItem.snoozed_until <= today()))
            .order_by(MyTableItem.updated_at).first())
