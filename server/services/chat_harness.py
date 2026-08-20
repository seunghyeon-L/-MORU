"""챗봇 3층 하네스   화면 H1

⚠️ spec-03 §6.3 "자유 상담 챗봇 영구 금지" 를 뒤집은 결정이다.
   챗봇을 넣되 **의학적 진단이 구조적으로 불가능하게** 만든다.

왜 금지어 필터로는 안 되나
    "IBS" 차단  → "과민성 대장" 으로 우회
    "진단" 차단 → "제 증상이 뭘까요" 로 우회
  표현은 무한하고 필터는 유한하다.
  답변을 검열하는 게 아니라 **애초에 물어보지 못하게** 해야 한다.

3층
  1층  LLM 에 보내기 전에 거른다
       레드플래그 키워드 → 즉시 병원 안내. 답변 LLM 호출 자체를 안 함
       질문 유형 분류    → 의료질문이면 정해진 문구. 답변 LLM 안 감
  2층  LLM 이 아는 것을 제한한다
       일반 의학 지식 차단. 사용자 기록 + 우리 계산 결과만 준다
  3층  출력을 검증한다
       구조화 출력 강제 · 금지 패턴 검사 · 실패 시 재시도 · 2회 실패 시 폴백

공통 원칙: **애매하면 무조건 보수적으로.** 그리고 전량 로깅.
"""

import re
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from models import Challenge, Meal, MyTableItem, SymptomLog, User
from services import challenges, llm, patterns
from services.text import w

KST = timezone(timedelta(hours=9))

MAX_RETRY = 2

# ══════════════════════════════════════════
#  문구
# ══════════════════════════════════════════

TO_HOSPITAL = ("그건 제가 답할 수 있는 범위를 넘어서요. "
               "소화기내과에서 진료받아보시길 권해드려요.")
RED_FLAG_REPLY = ("말씀하신 증상은 앱으로 확인할 수 있는 범위를 넘어서요. "
                  "지금 병원에 가보시는 걸 권해드려요.")
FALLBACK = ("죄송해요, 지금은 제대로 답을 못 드리겠어요. "
            "정확한 건 의료진께 여쭤보시는 게 좋겠어요.")
NO_RECORD = "아직 기록이 많지 않아서 말씀드릴 게 없어요. 며칠 더 모아볼까요?"

# 제한을 더 넓히려는 질문에는 LLM 을 태우지 않는다.
# 여기서 "네 그게 안전하죠" 같은 말이 한 번이라도 나가면 안 되기 때문이다.
# 절대 원칙 ② — 제한을 보상하는 설계는 섭식장애 위험을 키운다.
RESTRICTION_REPLY = (
    "먹는 걸 더 줄이는 쪽으로는 도와드리지 않으려고 해요. "
    "안 먹으면 당장은 편할 수 있지만, 먹을 수 있는 게 줄어드는 건 그것대로 힘든 일이니까요. "
    "지금 확인해볼 만한 음식이 있는지 같이 볼까요?")


# ══════════════════════════════════════════
#  1층 — 보내기 전에 거른다
# ══════════════════════════════════════════

# ── 레드플래그 ──────────────────────────────
# 이게 걸리면 분류도 안 하고 바로 병원 안내다.
#
# 인접 패턴("검은 변")만 보면 뚫린다.
#   "변이 짜장면처럼 까맣게 나와요"  ← 실제로 뚫렸던 문장.
#   단어 사이가 벌어져 있고, "짜장면" 때문에 음식 질문처럼 보인다.
# 그래서 배변 단어와 색·피 단어가 **한 문장 안에 같이 나오면** 잡는다.
# "검은콩 먹고 화장실 갔어요" 같은 게 걸릴 수 있지만,
# 놓치는 것보다 과하게 잡는 게 낫다.

STOOL = re.compile(r"변(?!비)|대변|똥|응가|화장실|배변|휴지")

# ★ 색·피 단어는 **단어 단위로** 잡는다.
#   전에는 그냥 "피" 였는데 커'피' · '피'자 · '피'하다 · '피'클 · '피'망에 전부 걸렸다.
#   "커피 마시면 화장실을 자주 가요" 가 응급 안내로 튕겨나갔다.
#   커피와 피자는 이 앱이 가장 흔하게 받는 질문이다. 과잉 차단의 대가가 너무 크다.
ALARM_COLOR = re.compile(
    r"혈(?!당)"                       # 혈변·혈액 (혈당은 제외)
    r"|(^|[\s,.!?~])피[가를는]?([\s,.!?~]|$)"   # 홀로 선 '피'
    r"|피\s*(가|를)?\s*(섞|묻|나|비침)"
    r"|빨갛|빨간|빨개|붉"
    r"|까맣|까만|까매|검은|검게|시커|타르색"
)

RED_FLAGS = re.compile(
    r"혈변|흑색변|자장변"
    r"|(체중|몸무게|살)[^.!?\n]{0,8}(빠지|빠졌|빠져|줄었|줄고|감소)"
    r"|kg\s*(넘게\s*)?(줄|빠)"
    # '열이 나는 음식' 같은 관형형은 제외한다
    r"|열이\s*(나요|나고|난다|나서|계속|안\s*떨어)|고열|발열|미열이\s*계속"
    # '토마토 하고' 에 걸리지 않도록 앞에 '마' 가 오면 제외
    r"|(?<!마)토\s*(했|해요|하고|할\s*것)|구토|게워|울렁"
    r"|빈혈|어지러워서\s*쓰러|쓰러졌"
)

# 위기 신호 — 소화기 문제가 아니다. 별도 안내로 보낸다.
# IBS 환자군은 우울·불안 동반률이 높다. "죽고 싶다" 에 소화기내과를 안내하는 건
# 무시에 가깝고 사용자를 더 고립시킨다.
CRISIS = re.compile(
    r"죽고\s*싶|죽어\s*버리|자살|목숨을\s*끊|사라지고\s*싶"
    r"|살기\s*싫|사는\s*게[^.!?\n]{0,8}의미"
    r"|살\s*이유가\s*없|살아야\s*할\s*이유"
    r"|다\s*그만두고\s*싶|그만\s*살고\s*싶|자해"
)
CRISIS_REPLY = (
    "많이 힘드셨겠어요. 그 이야기는 제가 도와드릴 수 있는 범위를 넘어서요.\n\n"
    "지금 많이 힘드시다면 혼자 견디지 마시고 이야기 나눠보세요.\n"
    "· 자살예방 상담전화 109 (24시간)\n"
    "· 정신건강 상담전화 1577-0199\n\n"
    "가까운 분에게 지금 연락해보시는 것도 도움이 됩니다."
)


def is_red_flag(text: str) -> bool:
    if RED_FLAGS.search(text):
        return True
    # 배변 + 색·피 동시 출현
    return bool(STOOL.search(text) and ALARM_COLOR.search(text))


# ── 제한 확대 (원칙 ②) ─────────────────────
# "커피 끊을까요" 같은 단일 음식 질문은 걸리면 안 된다.
# 전면 제한을 말할 때만 잡는다.
RESTRICTION_INTENT = re.compile(
    r"(다|전부|모두|싹|아예|전면적?으로)\s*(끊|안\s*먹|빼|제외|피하)"
    r"|다\s*끊|굶|아무것도\s*안\s*먹"
    r"|더\s*(줄여|제한|빼)야"
    r"|안전하려면.*(끊|줄)"
)

KIND_SCHEMA = {
    "type": "object",
    "properties": {
        "kind": {"type": "string",
                 "enum": ["record_query", "food_question", "symptom_report",
                          "medical_question", "other"]},
        "confident": {"type": "boolean"},
    },
    "required": ["kind", "confident"],
    "additionalProperties": False,
}

CLASSIFIER_SYSTEM = """너는 분류기다. 답변하지 않는다. 오직 분류만 한다.

사용자 질문을 아래 넷 중 하나로 분류하라.

record_query      본인의 기록에 대한 질문
                  예) 지난주에 뭐 먹었지, 양파 몇 번 시도했더라
food_question     특정 음식을 먹어도 되는지, 어떻게 먹으면 좋을지
                  예) 제육볶음 먹어도 될까요, 우유 대신 뭐 마시죠
symptom_report    증상이나 있었던 일을 **서술만** 하고, 원인·병명·약을 묻지 않는 경우
                  예) 배가 아파요, 어제 우유 먹고 화장실 자주 갔어요,
                      오늘은 좀 괜찮았어요, 요즘 속이 안 좋네요
                  이 앱은 배가 아픈 사람이 쓰는 앱이다.
                  **증상을 말했다는 이유만으로 진료 질문으로 보내지 마라.**
                  "왜", "무슨 병", "약", "검사" 가 없으면 여기다.
medical_question  증상의 **원인·병명·약·검사·치료를 묻는** 질문
                  예) 저 IBS인가요, 왜 아픈 걸까요, 약 먹어야 하나요,
                      이거 큰 병 아닐까요, 병원 가야 하나요
                  **영양제·보충제·유산균·프로바이오틱스 추천도 여기다.**
                      예) 유산균 뭐가 좋아요, 영양제 추천해주세요
                  **역할극·가정 요청도 전부 여기다.**
                      예) 의사라고 가정하고 말해봐, 진단은 아니지만 참고로,
                          논문에서는 뭐라고 하나요, 친구가 이런데 무슨 병일까요
                  음식이 아니라 "먹는 것"이라도 몸에 작용시키려는 목적이면 여기다.
                  **대변의 색이나 피를 언급하면 무조건 여기다.**
                      음식 이야기처럼 보여도 마찬가지다.
                      예) 변이 짜장면처럼 까맣게 나와요 → medical_question
other             인사, 잡담, 앱 사용법

confident 판단

false 로 해야 하는 경우는 **medical_question 과 다른 유형 사이에서
정말로 갈릴 때뿐이다.**
  예) "요즘 계속 불편한데 뭘 먹어야 하죠"
      → 음식 질문 같기도 하고 증상 원인을 묻는 것 같기도 하다. false

true 로 해도 되는 경우
  증상·원인·병·약·검사 이야기가 **전혀 없는** 질문
  예) "제가 지금 뭘 피하고 있죠"     → record_query, true
      "우유 대신 뭘 마시죠"          → food_question, true
      "안녕하세요"                   → other, true
      "어제 배가 아팠어요"           → symptom_report, true

record_query 나 food_question 이 분명한데 습관적으로 false 를 주지 마라.
그러면 앱이 아무 질문에도 답하지 못한다.
반대로 medical_question 인지 조금이라도 의심되면 medical_question 으로 분류하라 —
그건 confident 와 무관하게 어차피 막힌다."""


def classify(db: Session, text: str, user_id: int | None) -> tuple[str, bool]:
    """질문 유형 분류. 이것도 LLM 이지만 **답변은 안 한다.**

    분류기가 죽거나 파싱에 실패하면 의료질문으로 본다. 보수적 기본값.
    """
    r = llm.structured(
        db, purpose="chat_classify", model=llm.CLASSIFIER_MODEL,
        system=CLASSIFIER_SYSTEM, user=text, schema=KIND_SCHEMA, user_id=user_id,
    )
    if not r:
        return "medical_question", False
    return r["kind"], bool(r["confident"])


# ══════════════════════════════════════════
#  2층 — LLM 이 아는 것을 제한한다
# ══════════════════════════════════════════

ANSWER_SYSTEM = """너는 MORU 라는 앱의 도우미다. 의료인이 아니다.

**아래 <기록> 에 있는 것만 근거로 말한다.**
기록에 없는 것은 "기록이 없어서 모르겠어요" 라고 답한다.
일반적인 의학 지식이나 영양 지식으로 추측해서 채우지 마라.

절대 하지 않는 것
- 병명을 말하지 않는다. 어떤 병일 수 있다는 암시도 하지 않는다
- 약, 영양제, 검사, 치료를 언급하지 않는다
- "이 음식이 원인입니다" 같은 단정을 하지 않는다.
  기록은 관찰이지 인과가 아니다
- 증상의 원인을 설명하지 않는다
- **점수·등급·연속 기록·"잘 지키셨어요" 같은 칭찬을 절대 하지 않는다.**
  음식을 피한 것을 성취로 다루면 안 된다. 물어봐도 답하지 않는다.
  이 앱은 먹을 수 있는 것을 늘리는 앱이지, 안 먹은 것을 칭찬하는 앱이 아니다

하는 것
- 기록에 있는 횟수와 사실만 말한다
- 같이 있었던 다른 요인(수면·스트레스 등)이 있으면 반드시 함께 말한다
- 음식을 어떻게 먹어볼지 제안한다 (양 줄이기, 재료 빼기, 대체하기)

말투는 부드러운 존댓말. 두세 문장으로 짧게."""

ANSWER_SCHEMA = {
    "type": "object",
    "properties": {
        "reply": {"type": "string"},
        "grounded": {"type": "boolean"},
    },
    "required": ["reply", "grounded"],
    "additionalProperties": False,
}


def build_context(db: Session, user: User) -> str:
    """<기록> 블록. 여기 없는 건 LLM 도 모른다."""
    items = db.query(MyTableItem).filter(MyTableItem.user_id == user.id).all()
    by = {}
    for i in items:
        by.setdefault(i.status, []).append(i.label + (f"({i.note})" if i.note else ""))

    chs = (db.query(Challenge)
           .filter(Challenge.user_id == user.id, Challenge.status == "done").all())

    lines = []
    # ★ 라벨을 사람 말 그대로 쓰면 LLM 이 시제를 오해한다.
    #   "다시 먹어볼 음식: 양파" 를 주면 "양파를 다시 먹어보셨다" 고 답한다.
    #   아직 안 해본 것인데 해봤다고 말하는 건 사실 오류다.
    NAMES = {"safe": "확인 끝났고 편하게 먹는 음식",
             "candidate": "확인해봤더니 반응이 있었던 음식",
             "to_try": "아직 확인 안 한 음식 (지금 피하는 중)",
             "avoiding": "사용자가 시도하지 않기로 한 음식"}
    for k, label in NAMES.items():
        if by.get(k):
            lines.append(f"- {label}: {', '.join(by[k])}")
    for c in chs:
        lines.append(f"- 확인 완료: {challenges.ingredient_name(db, c.ingredient_id)} "
                     f"결과 {c.result_grade}")
    # 최근 식사 — 이름과 날짜만. 여기 없는 음식을 LLM 이 말하면 안 된다.
    now = datetime.now(timezone.utc)
    meals = (db.query(Meal)
             .filter(Meal.user_id == user.id, Meal.eaten_at >= now - timedelta(days=7))
             .order_by(Meal.eaten_at.desc()).limit(10).all())
    if meals:
        eaten = ", ".join(
            f"{m.food_name}({m.eaten_at.astimezone(KST).strftime('%m/%d')})" for m in meals)
        lines.append(f"- 최근 일주일 실제로 먹은 것: {eaten}")

    # 관찰 — 말해도 되는 것만. patterns 가 근거 부족한 건 이미 걸러준다.
    # ★ 교란 요인을 반드시 함께 넣는다.
    #   전에는 관찰만 주고 시스템 프롬프트로 "다른 요인도 말해라" 라고만 했다.
    #   데이터를 안 주니 LLM 이 지킬 방법이 없었고, 실제로 통과한 답변에서
    #   교란 요인을 병기한 경우가 한 건도 없었다. 절대 원칙 ① 위반이다.
    def _observed(name: str, meals: int, hits: int, logs: list, unit: str) -> str:
        cos = patterns.cofactors(db, logs)
        tail = (" / 그날 함께 있었던 것: "
                + ", ".join(f"{c['label']} {c['count']}번" for c in cos)) if cos else ""
        return (f"- 관찰: {name}{unit} {meals}번 중 {hits}번 뒤에 불편함 기록 "
                f"(인과는 확인되지 않음){tail}")

    ing = [s for s in patterns.ingredient_stats(db, user.id) if s["speakable"]]
    for s in ing:
        lines.append(_observed(w(s["name"], "이"), s["meals"], s["hits"],
                               s["hit_logs"], " 든 식사"))

    # 재료를 못 짚을 때는 음식 단위로 말한다.
    #
    # E3(분석 화면)은 이미 그렇게 하고 있었다 — 김치찌개의 프럭탄이
    # 양파·마늘·김치로 3등분돼서 재료로는 아무도 기준을 못 넘을 때,
    # "김치찌개 6번 중 4번" 은 여전히 사실이라 화면에 띄운다.
    # 그런데 챗봇 컨텍스트에는 재료 관찰만 넣고 있었다.
    # 같은 사용자가 화면에서는 "6번 중 4번" 을 보고,
    # 챗봇에 물으면 그런 기록이 없다는 듯한 답을 받았다.
    # 한 데이터에 두 이야기가 나오면 둘 다 못 믿게 된다.
    if not ing:
        for f in patterns.food_stats(db, user.id):
            if f["speakable"]:
                lines.append(_observed(w(f["name"], "을"), f["meals"], f["hits"],
                                       f["hit_logs"], " 드신"))

    # 사용자가 남긴 상황 요인 전체 — "제 기록에 수면 정보 있나요" 에 없다고 답하던 것
    all_ctx = patterns.cofactors(db, [
        r.id for r in db.query(SymptomLog)
        .filter(SymptomLog.user_id == user.id,
                SymptomLog.onset_at >= now - timedelta(days=30))])
    if all_ctx:
        lines.append("- 사용자가 증상과 함께 남긴 상황: "
                     + ", ".join(f"{c['label']} {c['count']}번" for c in all_ctx))

    return "\n".join(lines) if lines else "(기록 없음)"


# ══════════════════════════════════════════
#  3층 — 출력을 검증한다
# ══════════════════════════════════════════

# 병명. 하나라도 나오면 버린다.
DISEASES = re.compile(
    r"과민성\s*(대장|장)|IBS|크론|궤양성\s*대장염|염증성\s*장질환|IBD"
    r"|대장암|위암|용종|셀리악|글루텐\s*불내증|유당불내증|유당\s*불내"
    r"|위염|장염|역류성|담석|췌장염|게실|치질|치열|SIBO|장누수"
)
# 약·처방·검사
MEDICAL_ACTS = re.compile(
    r"복용|처방|투약|정장제|지사제|제산제|항생제|프로바이오틱스|유산균제"
    r"|내시경|대장내시경|위내시경|CT|초음파|혈액검사|조직검사"
    r"|치료(?!법을 권하지)|처치|수술"
)
# 원인 단정
ASSERTIONS = re.compile(
    r"원인입니다|원인이에요|원인이야|때문입니다|때문이에요"
    r"|확실합니다|확실해요|틀림없|분명합니다"
    r"|진단|의심됩니다|의심돼요|가능성이 높습니다|~일 겁니다"
)

# 절대 원칙 ② — 제한을 보상하면 섭식장애 위험을 키운다.
# LLM 은 "100점", "며칠 연속 성공", "잘 지키셨어요" 를 자연스럽게 뱉는다.
# 앱의 다른 화면이 전부 피해 온 것을 챗봇이 되살리면 안 된다.
REWARD = re.compile(
    r"\d+\s*점|점수|만점|백점"
    r"|연속\s*(으로)?\s*(성공|달성|지키|피하|유지)"
    r"|스트릭|streak|기록\s*경신"
    r"|잘\s*(지키|참|버티|실천|해내)|훌륭|대단|칭찬|성공하셨"
    r"|목표\s*달성|완벽하게"
)

SYMPTOM_REPLY = (
    "말씀해주셔서 고마워요. 기록해두시면 나중에 어떤 상황에서 그랬는지 같이 볼 수 있어요.\n"
    "홈에서 '기록하기' 로 남겨두시면 좋겠습니다.\n\n"
    "증상이 평소와 다르거나 오래 간다면 진료를 받아보시는 게 좋습니다.")

MAX_LEN = 400


def violations(reply: str) -> list[str]:
    """금지 패턴. 걸리면 이유를 돌려준다 — 그걸 LLM 에 되먹여 고치게 한다."""
    bad = []
    if m := DISEASES.search(reply):
        bad.append(f"병명을 말했다: '{m.group()}'")
    if m := MEDICAL_ACTS.search(reply):
        bad.append(f"약·검사·치료를 언급했다: '{m.group()}'")
    if m := ASSERTIONS.search(reply):
        bad.append(f"원인을 단정했다: '{m.group()}'")
    if m := REWARD.search(reply):
        bad.append(f"제한을 보상했다(점수·연속·칭찬): '{m.group()}'")
    if len(reply) > MAX_LEN:
        bad.append(f"너무 길다 ({len(reply)}자, {MAX_LEN}자 이내)")
    return bad


# ══════════════════════════════════════════
#  묶기
# ══════════════════════════════════════════

def food_suggestions(db: Session, text: str) -> list[dict]:
    """사용자가 말한 음식이 마스터에 있으면 그 화면으로 가는 칩을 만든다.

    ★ 이 식별에 LLM 을 쓰지 않는다. 마스터 조회다.
      D1 "메뉴 검색" 이 H1 으로 들어오는 흐름에서, 여기서 나온 food_id 로
      프론트가 D2(기록) 나 H4(대체안) 로 넘어간다.
      LLM 이 지어낸 음식 이름으로 넘어가면 그다음 화면이 전부 빈다.
    """
    from services import ingredients as ing_svc

    food = ing_svc.find_food(db, text)
    if food is None:
        return []
    return [
        {"label": f"{food.name} 기록하기", "screen": "D2",
         "food_id": food.id, "food_name": food.name},
        {"label": "이렇게 먹어볼까요", "screen": "H4",
         "food_id": food.id, "food_name": food.name},
    ]


def answer(db: Session, user: User, text: str) -> dict:
    """H1 한 턴. 반환값이 그대로 API 응답이 된다."""

    # ── 1층-0. 위기 신호. 무엇보다 먼저 본다 ──
    if CRISIS.search(text):
        return _out(CRISIS_REPLY, blocked=True, reason="crisis", llm_called=False)

    # ── 1층-a. 레드플래그. 분류조차 하지 않는다 ──
    if is_red_flag(text):
        return _out(RED_FLAG_REPLY, blocked=True, reason="red_flag", llm_called=False)

    # ── 1층-a2. 제한 확대. 여기에 LLM 을 태우지 않는다 ──
    if RESTRICTION_INTENT.search(text):
        return _out(RESTRICTION_REPLY, blocked=False, reason="restriction_intent",
                    llm_called=False)

    # ── 1층-b. 유형 분류 ──
    kind, confident = classify(db, text, user.id)
    if kind == "symptom_report":
        # 원인을 묻지 않았으니 설명하지 않는다. 진료로도 보내지 않는다.
        # 배가 아프다는 말에 "병원 가세요" 라고 답하면 IBS 앱이 성립하지 않는다.
        # 진짜 위험 신호는 위에서 이미 걸러졌다.
        return _out(SYMPTOM_REPLY, blocked=False, reason="symptom_report",
                    llm_called=True)
    if kind == "medical_question":
        return _out(TO_HOSPITAL, blocked=True, reason="medical_question", llm_called=True)
    if not confident:
        # 애매하면 보수적으로. 답하지 않는다.
        return _out(TO_HOSPITAL, blocked=True, reason="low_confidence", llm_called=True)

    # ── 2층. 기록만 준다 ──
    ctx = build_context(db, user)
    prompt = f"<기록>\n{ctx}\n</기록>\n\n질문: {text}"

    # ── 3층. 검증 + 재시도 ──
    feedback = ""
    for attempt in range(MAX_RETRY):
        r = llm.structured(
            db, purpose="chat_answer", model=llm.ANSWER_MODEL,
            system=ANSWER_SYSTEM + feedback, user=prompt,
            schema=ANSWER_SCHEMA, user_id=user.id, temperature=0.3,
        )
        if not r:
            feedback = "\n\n[교정] 반드시 JSON 스키마를 지켜라."
            continue

        reply = r["reply"].strip()
        bad = violations(reply)
        if not bad:
            return _out(reply, blocked=False, reason=None,
                        llm_called=True, retry=attempt, kind=kind,
                        suggestions=food_suggestions(db, text))

        feedback = ("\n\n[교정] 방금 답변이 규칙을 어겼다: "
                    + "; ".join(bad) + ". 다시 써라.")

    # 2회 실패 → 폴백
    return _out(FALLBACK, blocked=True, reason="output_rejected",
                llm_called=True, retry=MAX_RETRY, fell_back=True)


def _out(reply: str, *, blocked: bool, reason: str | None, llm_called: bool,
         retry: int = 0, fell_back: bool = False, kind: str | None = None,
         suggestions: list[dict] | None = None) -> dict:
    return {
        "reply": reply,
        "blocked": blocked,
        "block_reason": reason,
        "_llm_called": llm_called,
        "_retry": retry,
        "_fell_back": fell_back,
        "_kind": kind,
        "suggestions": suggestions or [],
    }
