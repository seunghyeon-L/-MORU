"""공통 의존성.

해커톤 범위에서는 로그인이 없다. 앱이 최초 실행 시 만든 UUID 를
X-Device-Id 헤더로 보내면 그걸로 사용자를 식별한다.
"""

from fastapi import Header, HTTPException


async def device_id(x_device_id: str | None = Header(default=None)) -> str:
    if not x_device_id:
        raise HTTPException(
            status_code=401,
            detail={
                "code": "DEVICE_ID_REQUIRED",
                "message": "앱을 다시 실행해 주세요.",
            },
        )
    return x_device_id


def ex(payload: dict) -> dict:
    """Swagger 에 응답 예시를 붙이는 헬퍼.

    목업 단계라 응답 Pydantic 모델은 만들지 않는다.
    프론트는 Swagger 의 이 예시를 보고 붙이면 된다.
    """
    return {200: {"content": {"application/json": {"example": payload}}}}
