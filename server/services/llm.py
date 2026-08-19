"""OpenAI 호출 한 군데.

모든 LLM 호출은 여기를 지난다. ai_calls 에 전량 로깅하기 위해서다.
"어떤 프롬프트에 뭐라고 답했길래 이런 게 나갔나" 를 나중에 짚을 수 있어야 한다.
"""

import json
import os
import time

from openai import OpenAI
from sqlalchemy.orm import Session

from models import AiCall

_client: OpenAI | None = None

CLASSIFIER_MODEL = os.getenv("OPENAI_CLASSIFIER_MODEL", "gpt-4.1-mini")
ANSWER_MODEL = os.getenv("OPENAI_ANSWER_MODEL", "gpt-4.1")


def client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    return _client


def structured(db: Session, *, purpose: str, model: str, system: str, user: str,
               schema: dict, user_id: int | None = None,
               temperature: float = 0.0) -> dict | None:
    """JSON 스키마를 강제해서 부른다. 자유 텍스트를 받지 않는다.

    파싱에 실패하면 None. 부른 쪽이 재시도할지 폴백할지 정한다.
    """
    messages = [{"role": "system", "content": system},
                {"role": "user", "content": user}]
    t0 = time.time()
    raw, parsed, ok = None, None, False
    try:
        r = client().chat.completions.create(
            model=model, messages=messages, temperature=temperature,
            response_format={
                "type": "json_schema",
                "json_schema": {"name": purpose, "strict": True, "schema": schema},
            },
        )
        raw = r.choices[0].message.content
        parsed = json.loads(raw)
        ok = True
    except Exception as e:                       # noqa: BLE001
        raw = f"{type(e).__name__}: {e}"

    db.add(AiCall(
        user_id=user_id, purpose=purpose, model=model,
        prompt={"system": system, "user": user},
        raw_response=raw, parsed_ok=ok,
        latency_ms=int((time.time() - t0) * 1000),
    ))
    db.commit()
    return parsed
