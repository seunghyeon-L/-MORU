"""홈 카드 조립   화면 C

담당: 나 (A-8)

카드는 배열이고 **개수도 순서도 서버가 정한다.**
프론트는 type 별 렌더러만 만들고 반복해서 그린다.
이렇게 해야 "지금 이 사람에게 뭘 먼저 보여줄지" 를 앱 배포 없이 바꿀 수 있다.

순서 규칙 (위에서부터 먼저)
  1. 진행 중인 도전   — 지금 하고 있는 게 있으면 그게 제일 급하다
  2. 도전 제안        — 없으면 하나 권한다
  3. 이번 주 정리     — 기록이 쌓였을 때만
  4. 일정 안내        — 시도하기 좋은 때인지

보여줄 게 없으면 빈 배열이다. 억지로 채우지 않는다.
"""

from datetime import timedelta

from sqlalchemy.orm import Session

from models import BusyDay, Challenge, MyTableItem, User
from services import challenges as ch_svc
from services.text import w

# Foulkes/Lomer 2025 — 재도입 1,361건 중 965건 통과
EVIDENCE_71 = "실제로 시도한 사람의 71%가 그 음식을 되찾았어요."


def build(db: Session, user: User) -> dict:
    cards: list[dict] = []

    open_ch = (db.query(Challenge)
               .filter(Challenge.user_id == user.id,
                       Challenge.status.in_([ch_svc.ELIMINATING, ch_svc.TESTING]))
               .first())

    if open_ch:
        cards.append(_progress_card(db, open_ch))
    else:
        if c := _suggestion_card(db, user):
            cards.append(c)

    # TODO(A-4): 이번 주 정리. 식사 기록이 붙어야(B-3) 만들 수 있다.
    #            "과당이 조금 높았어요" 같은 문장은 6축 계산(A-3) 결과다.

    if c := _schedule_card(db, user, has_open=bool(open_ch)):
        cards.append(c)

    greeting = f"안녕하세요, {user.nickname}님" if user.nickname else "안녕하세요"
    return {"greeting": greeting, "cards": cards}


def _progress_card(db: Session, ch: Challenge) -> dict:
    """진행 중인 도전. 여기로 돌아갈 길이 홈에 없으면 사용자가 길을 잃는다."""
    ch = ch_svc.advance_if_due(db, ch)
    name = ch_svc.ingredient_name(db, ch.ingredient_id)

    if ch.status == ch_svc.ELIMINATING:
        until = ch.testing_start.strftime("%m월 %d일")
        title = f"{name} 확인 중이에요"
        body = (f"{until}까지만 {w(name)} 빼두시면 돼요. "
                f"다른 음식은 평소대로 드셔도 괜찮아요.")
    else:
        title = f"{name}, 편한 날 하루 드셔볼까요?"
        body = "연속으로 하지 않아도 돼요. 이번 주 편한 날 하루면 됩니다."

    return {
        "type": "challenge_progress",
        "title": title,
        "body": body,
        "action": {"label": "이어서 하기", "screen": "F3", "challenge_id": ch.id},
    }


def _suggestion_card(db: Session, user: User) -> dict | None:
    """도전 제안. 하드 스톱에 걸리면 아무것도 안 낸다.

    "더 넓혀보자" 를 무한히 미는 건 앱이 사용자를 몰아붙이는 것이다.
    """
    if ch_svc.hard_stop_reason(db, user.id):
        return None
    item = ch_svc.next_candidate(db, user.id)
    if item is None or item.ingredient_id is None:
        return None

    return {
        "type": "challenge_suggestion",
        "title": f"{item.label}, 다시 시도해볼 만해요",
        "body": EVIDENCE_71,
        "action": {"label": "시작할게요", "screen": "F1",
                   "challenge_id": None, "ingredient_id": item.ingredient_id},
        "dismiss": {"label": "나중에", "ingredient_id": item.ingredient_id},
    }


SNOOZE_DAYS = 14


def snooze(db: Session, user_id: int, ingredient_id: int) -> bool:
    """"나중에" — 거절이 아니라 미루기다.

    avoiding 으로 바꾸면 영영 안 나온다. 그건 너무 세다.
    기한만 미뤄두고, 지나면 다시 권한다.
    """
    item = (db.query(MyTableItem)
            .filter(MyTableItem.user_id == user_id,
                    MyTableItem.ingredient_id == ingredient_id)
            .one_or_none())
    if item is None:
        return False
    item.snoozed_until = ch_svc.today() + timedelta(days=SNOOZE_DAYS)
    db.commit()
    return True


def _schedule_card(db: Session, user: User, has_open: bool) -> dict | None:
    """일정 안내.

    권할 게 있을 때만 낸다. 아무것도 제안하지 않으면서
    "시도해보기 좋은 때예요" 라고만 하면 공허하다.
    """
    if has_open:
        return None
    if ch_svc.next_candidate(db, user.id) is None:
        return None

    end = ch_svc.today() + timedelta(days=7)
    busy = (db.query(BusyDay)
            .filter(BusyDay.user_id == user.id,
                    BusyDay.day >= ch_svc.today(), BusyDay.day < end).count())
    if busy:
        return {
            "type": "schedule_note",
            "title": "이번 주는 일정이 좀 있네요",
            "body": "무리하지 않으셔도 돼요. 여유로운 주에 시도하면 됩니다.",
        }
    return {
        "type": "schedule_note",
        "title": "이번 주는 일정이 여유롭네요",
        "body": "무언가 새로 시도해보기 좋은 때예요.",
    }
