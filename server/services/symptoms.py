"""증상 기록 보조   B-5

symptom_logs.onset_at 은 사용자가 고른 onset(대략적인 선택지)을
코드가 실제 시각으로 환산해 채운다. 정확한 발병 시각은 알 수 없으니 근사치다.
"""

from datetime import datetime, timedelta

_ONSET_OFFSET = {
    "just_now": timedelta(0),
    "about_1h": timedelta(hours=1),
    "since_morning": timedelta(hours=6),
    "since_yesterday": timedelta(hours=24),
}

# "이제 좀 괜찮아지셨어요?" 후속 푸시까지의 간격.
FOLLOWUP_DELAY = timedelta(hours=6)


def onset_at(onset: str, now: datetime) -> datetime:
    return now - _ONSET_OFFSET[onset]
