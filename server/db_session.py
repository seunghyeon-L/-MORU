"""DB 연결.

서버에서 돌 때는 /opt/moru/.env 를 읽는다.
내 PC 에서 돌릴 때는 server/db-tunnel.bat 를 켜두면 같은 설정으로 붙는다.
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv(Path(__file__).with_name(".env"))

URL = (
    f"postgresql+psycopg2://{os.getenv('DB_USER','moru')}:{os.getenv('DB_PASSWORD','')}"
    f"@{os.getenv('DB_HOST','127.0.0.1')}:{os.getenv('DB_PORT','5432')}"
    f"/{os.getenv('DB_NAME','moru')}"
)

engine = create_engine(URL, pool_pre_ping=True, pool_size=5, max_overflow=5)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
