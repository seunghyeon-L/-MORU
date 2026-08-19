"""MORU API

프론트가 볼 곳:  https://1-201-117-54.sslip.io/docs
계약 원문:      docs/dev-03-api-contract.md

지금은 전 엔드포인트가 목업 응답을 돌려준다.
프론트는 응답 형태가 확정됐다고 보고 붙이면 되고, 백엔드가 안쪽을 차례로 채운다.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import challenges, chat, content, insights, onboarding, records

app = FastAPI(
    title="MORU API",
    version="0.1.0-mock",
    description=(
        "**모든 요청에 `X-Device-Id` 헤더가 필요합니다.** 앱이 최초 실행 시 만든 UUID 를 넣으세요.\n\n"
        "지금은 전 엔드포인트가 **목업 응답**을 돌려줍니다. 형태는 확정이고 값만 가짜입니다.\n\n"
        "화면 대응은 각 엔드포인트 요약(A1, B1, C, D2 …)을 보세요."
    ),
)

# Expo 개발 중에는 오리진이 계속 바뀐다. 해커톤 범위에서는 전부 연다.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(onboarding.router)
app.include_router(insights.router)
app.include_router(records.router)
app.include_router(challenges.router)
app.include_router(content.router)
app.include_router(chat.router)


@app.get("/", include_in_schema=False)
def root():
    return {"service": "MORU", "status": "ok", "docs": "/docs"}


@app.get("/health", tags=["운영"])
def health():
    return {"ok": True}
