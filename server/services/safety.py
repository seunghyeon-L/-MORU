"""경고 신호 판정   SF-01 · SF-03

여기는 AI 를 절대 쓰지 않는다. 순수 규칙이다. (절대 원칙 ④)
"이 코드가 왜 통과시켰나" 를 나중에 한 줄씩 짚을 수 있어야 하기 때문이다.

근거
  spec-04 V1-211  혈변·흑색변 / 원인불명 체중감소 / 자다가 깰 정도의 야간 증상 /
                  지속 발열 / 반복 구토 / 빈혈 / 50세 이후 첫 발병
  spec-04 V1-212  1개 이상 해당 시 안내 + 진입 차단. 질병명 판정 문구 금지
  spec-04 V1-213  "이미 병원에서 확인함" 선택 시 진입 허용, 기록 보관
  교수님 자문 15.2  위험신호는 상시 감시해야지 입구에서 한 번 봐서는 안 된다
"""

from dataclasses import dataclass

# 화면에 그대로 띄우는 문구까지 여기서 정한다.
# 코드와 문구가 떨어져 있으면 한쪽만 고쳐지는 사고가 난다.
FLAGS: dict[str, str] = {
    "blood_in_stool": "변에 피가 섞이거나 검게 나온 적이 있어요",
    "weight_loss": "이유 없이 체중이 줄었어요",
    "night_symptoms": "자다가 증상 때문에 깰 때가 있어요",
    "fever": "열이 계속 나요",
    "vomiting": "구토를 반복해요",
    "anemia": "빈혈 진단을 받은 적이 있어요",
    "onset_after_50": "50세 이후에 증상이 처음 시작됐어요",
}

# ── 안내 문구 ──────────────────────────────────
# 질병명을 말하지 않는다. "이런 병일 수 있어요" 는 진단이다.
BLOCK_TITLE = "먼저 병원에 가보시는 게 좋겠어요"
BLOCK_BODY = (
    "고르신 항목은 MORU가 확인할 수 있는 범위를 넘어서요. "
    "소화기내과에서 한 번 살펴보시는 걸 권해드려요."
)
BLOCK_FOOTER = "MORU는 질병을 진단하거나 치료하는 서비스가 아니에요."

# SF-03. 쓰는 도중에 새로 나타난 신호는 예외를 인정하지 않는다.
WATCH_TITLE = "지금은 병원에 가보시는 게 좋겠어요"
WATCH_BODY = (
    "방금 남기신 기록은 MORU가 확인할 수 있는 범위를 넘어서요. "
    "소화기내과에서 한 번 살펴보시는 걸 권해드려요."
)


@dataclass
class Verdict:
    blocked: bool
    flags: list[str]
    title: str | None = None
    body: str | None = None
    footer: str | None = None

    def as_response(self) -> dict:
        return {
            "blocked": self.blocked,
            "flags": self.flags,
            "title": self.title,
            "body": self.body,
            "footer": self.footer,
        }


def screen_onboarding(answers: dict, cleared_by_doctor: bool = False) -> Verdict:
    """SF-01 온보딩 스크리닝.

    answers 는 FLAGS 의 키를 그대로 쓴다. 하나라도 참이면 차단한다.

    cleared_by_doctor 는 V1-213 예외다. 이미 병원에서 확인한 사람까지
    막으면 정작 도움이 필요한 사람이 앱을 못 쓴다. 다만 기록은 남긴다.
    """
    hit = [k for k in FLAGS if answers.get(k)]

    if not hit:
        return Verdict(blocked=False, flags=[])

    if cleared_by_doctor:
        # 통과시키되 흔적을 남긴다. blocked=False 지만 flags 는 채워서 저장된다.
        return Verdict(blocked=False, flags=hit)

    return Verdict(
        blocked=True, flags=hit,
        title=BLOCK_TITLE, body=BLOCK_BODY, footer=BLOCK_FOOTER,
    )


def screen_symptom_log(blood_in_stool: bool) -> Verdict:
    """SF-03 상시 감시.

    온보딩을 통과한 뒤에도 증상 기록에서 걸리면 막는다.
    여기서는 "이미 병원에서 확인했다" 를 인정하지 않는다 —
    그때 확인받은 것과 방금 새로 생긴 것은 다른 일이기 때문이다.
    """
    if not blood_in_stool:
        return Verdict(blocked=False, flags=[])
    return Verdict(
        blocked=True, flags=["blood_in_stool"],
        title=WATCH_TITLE, body=WATCH_BODY, footer=BLOCK_FOOTER,
    )
