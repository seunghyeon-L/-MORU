"""나의 식탁   화면 G

담당: 나 (A-6). 상태를 바꾸는 건 여기뿐이다.

데이터 규칙 8 — 나의 식탁 상태는 **도전 결과로만** 바뀐다.
그냥 먹고 아팠던 기록(캐주얼 관찰)은 여기를 못 바꾼다.
그건 다음에 뭘 제안할지 순서에만 쓰인다.
"""

from datetime import datetime, timezone

from sqlalchemy import or_
from sqlalchemy.orm import Session

from models import Ingredient, MyTableItem, UserAllergy

SECTION_TITLES = [
    ("safe", "안심하고 먹는 음식"),
    ("candidate", "확인된 후보"),
    ("to_try", "다시 먹어볼 음식"),
]


def seed_from_onboarding(db: Session, user_id: int, avoided: list[str],
                         allergies: list[str], celiac: str | None) -> int:
    """B3 "피하고 계신 음식" 을 to_try 구획으로 넣는다.

    G 화면에는 "피하는 음식" 구획이 없다. 3구획뿐이다 —
    안심하고 먹는 / 확인된 후보 / 다시 먹어볼.
    지금 피하고 있지만 확인해본 적은 없는 것들이니 "다시 먹어볼 음식" 이 맞다.
    avoiding 은 사용자가 "안 할래요" 한 것에만 쓴다.

    알레르기와 셀리악(밀)은 **넣지 않는다.**
    나의 식탁에 들어오면 언젠가 도전 제안 대상이 되는데,
    알레르기는 양과 무관하게 위험해서 제안 자체가 있으면 안 된다. (SF-02)
    """
    blocked = set(allergies)
    if celiac == "yes":
        blocked |= {"밀", "밀·빵", "밀빵"}

    added = 0
    for label in avoided:
        if any(b and b in label for b in blocked):
            continue
        exists = (db.query(MyTableItem)
                  .filter(MyTableItem.user_id == user_id, MyTableItem.label == label)
                  .one_or_none())
        if exists:
            continue
        # 마스터에 있으면 연결한다. 없으면 이름만 담는다 ('매운 음식' 같은 것).
        #
        # B3 칩은 "우유·유제품" 처럼 묶음 이름이라 재료 이름과 다르다.
        # 그건 aliases 에 들어 있으므로 별칭으로도 찾는다 (마이그레이션 004).
        ing = (db.query(Ingredient)
               .filter(or_(Ingredient.name == label,
                           Ingredient.aliases.any(label)))
               .first())
        db.add(MyTableItem(
            user_id=user_id, ingredient_id=ing.id if ing else None,
            label=label, status="to_try",
        ))
        added += 1
    db.commit()
    return added


def view(db: Session, user_id: int) -> dict:
    """G 화면.

    headline 의 개수는 되찾은 개수다. 제한이 아니라 확장을 센다.
    그래도 게이지로 그리지 않는다 — 문장으로만. (절대 원칙 ②)
    """
    items = db.query(MyTableItem).filter(MyTableItem.user_id == user_id).all()
    by = {s: [i for i in items if i.status == s] for s, _ in SECTION_TITLES}
    recovered = len(by["safe"])
    total = len(items)

    sections = []
    for status, title in SECTION_TITLES:
        rows = []
        for i in by[status]:
            row = {"id": i.id, "label": i.label}
            if i.note:
                row["note"] = i.note
            if status == "candidate":
                row["hint"] = "양을 줄여보세요"
            if status == "to_try":
                row.setdefault("note", "아직 확인 전")
            if status == "to_try" and i.ingredient_id:
                row["action"] = {"label": "확인해보기", "screen": "F1",
                                 "ingredient_id": i.ingredient_id}
            rows.append(row)
        if rows:
            sections.append({"status": status, "title": title, "items": rows})

    return {
        "headline": f"처음보다 {recovered}가지를 되찾았어요" if recovered
                    else "아직 시작 전이에요",
        "sub": (f"피하던 음식 {total}가지 중 {recovered}가지를 다시 드실 수 있게 됐어요."
                if recovered else "하나씩 천천히 넓혀가요."),
        "sections": sections,
        "saved_recommendations": [],   # TODO(B-6)
    }


def touch(item: MyTableItem) -> None:
    item.updated_at = datetime.now(timezone.utc)
