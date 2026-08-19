"""기기 식별자로 사용자를 찾거나 만든다."""

from sqlalchemy.orm import Session

from models import User


def get_or_create(db: Session, device: str) -> User:
    u = db.query(User).filter(User.device_id == device).one_or_none()
    if u is None:
        u = User(device_id=device)
        db.add(u)
        db.commit()
    return u
