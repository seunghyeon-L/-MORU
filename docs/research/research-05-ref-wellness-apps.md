# 레퍼런스 조사 A — Ate · Clue · Cara Care

조사일: 2026-08-16 / 대상: MORU(IBS 식이 관리 웰니스 앱) 디자인 레퍼런스

## 이 문서의 증거 등급 표기

- **[검증]** — 실제 앱스토어 스크린샷 이미지를 직접 열어 육안 확인했거나, 공식 스토어 설명문/공식 규제 문서 원문에서 그대로 인용
- **[출처]** — 기사·리뷰·지원문서 등 2차 출처 기반
- **[확인 실패]** — 찾지 못함. 추측으로 채우지 않음

**컬러 hex 관련 중요 고지**: 아래 hex 값은 각 앱의 **공식 앱스토어 스크린샷 이미지를 실제로 내려받아 픽셀 색상을 추출**한 값입니다(JPEG 압축 이미지 기준이라 ±1~2 오차 가능). 각 사의 공식 브랜드 가이드에 명시된 값이 아니므로 "관찰된 값"으로 취급하세요. 공식 브랜드 토큰 문서는 세 앱 모두 **확인 실패**.

---

## 1. Ate Food Diary (현재 명칭: AteMate)

> ⚠️ **가장 중요한 전제 — 이 앱은 이미 MORU가 피하려는 방향으로 변질됐습니다.**
> 사용자가 참조한 "칼로리 없는 사진 기록 앱 Ate"는 **과거 버전**입니다. 현재 App Store 등록명은 **"AteMate Food Journal: AI Coach"**(개발사 Piqniq Inc., 4.8 / 10K ratings)이고, AI 코치 + 선택적 칼로리·매크로 + **"AteMate Health Score"라는 점수 게이지**가 추가됐습니다 [검증 — 스토어 스크린샷 5번에서 `AteMate Health Score / High • 7.8` 가로 게이지 바 직접 확인].
> 따라서 **훔칠 것은 2019~2022년 Ate의 구조와 카피, 피할 것은 2025~2026 AteMate의 스코어·AI 코치 레이어**로 나눠서 봐야 합니다.

### 화면 구조

**홈 = 그리드가 아니라 "세로 타임라인"** [검증 — 스토어 스크린샷 2번]

```
┌─────────────────────────────┐
│ (상단) 날짜 헤더             │
├─────────────────────────────┤
│ [사진 카드]      11:20 AM   │  ← 사진은 좌측, 시각은 우측
│                             │
│        ↕ 6h                 │  ← 식사 사이 "간격 시간"을 회색 소자로 표시
│ [사진 카드]      6:45 PM    │     (= 자동 단식 트래커 겸용)
│                  💬 ●       │  ← 코멘트/리플렉션 유무 뱃지
│        ↕ 25m                │
│ [❤️ 아이콘만]     7:10 PM    │  ← 사진 없는 로그(물/운동/기분)도 같은 타임라인에
│        ↕ 1h 20m             │
│ [사진 카드]      8:05 PM    │
├─────────────────────────────┤
│ (하단) 탭바                  │
└─────────────────────────────┘
```

핵심: **하루 = 사진들이 시간순으로 흐르는 한 줄**. 캘린더 그리드도, 인스타 격자도 아님. 사진 사이 여백에 "6h", "1h 20m" 같은 **경과 시간**이 들어가서 "리듬"이 보임. 음식·기분·수면·수분·운동이 **모두 같은 타임라인 하나**에 섞여 들어감(공식 스토어 문구: "Food, mood, hydration, movement, and sleep, all in one place") [검증].

**입력 흐름 = 3탭** [검증 — 스토어 스크린샷 2번 문구 "Log a meal in 3 taps."]

1. 잠금화면 위젯/카메라 → **사진 촬영** (시간·날짜 자동)
2. (자동) 음식 인식 → 이름·재료 자동 태깅
3. **끝.** 그 뒤 리플렉션은 전부 선택.

**상세(Detail) 화면 = 사진 풀블리드 + 하단 시트** [검증 — 스토어 스크린샷 4번]

```
┌─────────────────────────────┐
│  ✕        Details           │
│                             │
│   [음식 사진 전체 화면]      │  ← 우측 세로로 🗑 / ☆ / ↗ / ↑(path 토글로 추정)
│                             │
│   👤 Julie                  │
├─────────────────────────────┤
│  Why did you eat?           │  ← 시트가 사진 위로 올라옴
│  (Hungry) (Stressed) (It was time)
│  (Bored) (Cravings) (Social)
│  (Tired) (❤️ the taste) (Why not?)
├─────────────────────────────┤
│  Southwest Taco Platter     │
│  Chicken, Flour tortilla,…  │  ← 음식 이름·재료는 리플렉션 "아래"
└─────────────────────────────┘
```

**주목**: 리플렉션 질문이 **위**, 영양 정보가 **아래**. 즉 "인식 먼저, 숫자 나중" 순서를 레이아웃으로 강제 [검증 + 출처: atemate.com 블로그가 "mindful reflection questions are positioned at the top with nutritional analysis moved underneath"라고 명시].

**인사이트 화면 = 도넛 차트 2개** [검증 — 스토어 스크린샷 5번]
- "WHY DID YOU EAT?" 도넛 (Hungry 38% / Tired / Why not? / Cravings)
- "HOW DID IT MAKE YOU FEEL?" 도넛 (Satisfied / Happy / Unsatisfied / Nostalgic / Stuffed)
- 그 아래 ⚠️ AteMate Health Score 게이지, Daily Macronutrient Breakdown

즉 **인사이트도 "무엇을 먹었나"가 아니라 "왜 먹었나 / 어떻게 느꼈나"의 분포**로 보여줌. 이게 MORU가 훔칠 핵심 구조.

**AI 챗 화면** [검증 — 스토어 스크린샷 3번]: 상단 `✳ Chat`, 인사말 "Evening Julie 😄 / What should we look at?" + "I've got your last 7 days of meals, sleep, and steps loaded." 아래 카드형 프리셋 질문 4개(CHECK-IN / MOVEMENT / SLEEP / LAST MEAL), 하단 입력창 "Ask a question…".

### 실제 UI 문구 (원문 + 해석)

| # | 원문 | 출처 등급 | 한국어 해석 |
|---|---|---|---|
| 1 | **"Why did you eat?"** → 칩: `Hungry` `Stressed` `It was time` `Bored` `Cravings` `Social` `Tired` `❤️ the taste` `Why not?` | [검증 — 스크린샷 4] | "왜 먹었어요?" — **"왜 이걸 먹었냐"가 아니라 "왜 먹었냐"**. 음식이 아니라 상황을 물음. `Why not?`(그냥, 왜 안 돼?)라는 선택지를 넣어 "이유 없이 먹어도 된다"를 명시적으로 허용 |
| 2 | **"How did it make you feel?"** → `Satisfied` `Happy` `Unsatisfied` `Nostalgic` `Stuffed` | [검증 — 스크린샷 5] | "그거 먹고 어땠어요?" — Good/Bad가 아니라 **감정 어휘**. `Nostalgic`(그립다) 같은 비-건강 축의 단어가 섞여 있음 |
| 3 | **"on path" / "off path"** | [출처 — App Store 사용자 리뷰 다수가 원문으로 인용: "I love, love, love the on and off path option", "no judgment or punishment associated with an off-path meal"] | "경로 위 / 경로 밖". **good/bad, healthy/unhealthy, cheat 대신 "길"이라는 중립 은유.** 길에서 벗어나도 길은 계속 있음 |
| 4 | **"Awareness, not restriction."** | [검증 — 스크린샷 4 헤드라인] | "제한이 아니라 알아차림." MORU 톤 원칙과 거의 동일한 문장 |
| 5 | **"No rules. No guilt. No starting over."** | [검증 — 공식 스토어 설명문] | "규칙 없음. 죄책감 없음. 처음부터 다시 없음." 세 번째 문장이 **스트릭 부정**과 정확히 같은 취지 (끊겨도 리셋 아님) |
| 6 | **"Log a meal in 3 taps. No typing. No searching. Just a photo."** | [검증 — 스크린샷 2] | 최소 입력을 **숫자로 약속**함(3탭) |
| 7 | **"Calories and macros are available if you want them. They are optional learning tools, not daily targets."** | [검증 — 공식 스토어 설명문] | 숫자를 **목표가 아니라 학습 도구**로 재정의. 숫자를 완전히 없애지 않고 "역할"을 바꾼 사례 |
| 8 | **"It will not give medical advice."** | [검증 — 공식 스토어 설명문, AI 코치 소개 문단] | 판정 회피 고지를 기능 설명 안에 인라인으로 넣음 |

> ⚠️ youate.net 이라는 사이트에 "Am I actually hungry, or just bored?" 등 더 부드러운 프롬프트 문구가 있으나, 이 사이트는 **공식 도메인(atemate.com / youate.com)이 아닌 제3자 소개 사이트로 보임**. 해당 문구들의 앱 내 실재 여부는 **확인 실패** — 인용하지 마세요.

### 컬러·타이포

**컬러** [검증 — 공식 App Store 스크린샷 5장 픽셀 추출]

| 역할 | hex | 비고 |
|---|---|---|
| 프라이머리 오렌지 | `#F08708` | 가장 지배적인 브랜드 색. 헤드라인 블록·CTA·로고 |
| 세컨더리 앰버 | `#FABA3F` | 서브 헤드라인 블록, 구분선 |
| 배경 웜그레이/크림 | `#E5E0DA` | **MORU의 크림 `#F8F3EA`와 같은 계열**(약간 더 회색기) |
| 카드/시트 | `#FFFFFF` |  |
| 선택 상태 칩 | `#0D9AF6` (블루) | "Hungry", "Social" 선택 시 |
| 리플렉션 도넛 | 퍼플/핑크/민트/라임 파스텔 다색 | 의미 없는 카테고리 구분용 다색 팔레트 |

**타이포** [검증 — 스크린샷 육안]
- 마케팅 헤드라인: **굵은 하이컨트라스트 세리프/슬랩** ("Find your Healthy.", "Awareness, not restriction.") — 손글씨 아닌 **출판물 느낌**. 폰트명 확인 실패
- 앱 내부 UI: 일반 산세리프(SF Pro 계열로 보임), 질문은 **볼드 16~17pt**, 칩은 레귤러
- 대문자 마이크로 레이블(`CHECK-IN`, `MOVEMENT`, `WHY DID YOU EAT?`) — 자간 넓힌 소문자 대비

### 리뷰에서 "부담 없다"는 평가의 근거 (원문)

App Store 리뷰 원문 [검증]:

- *"There's no judgment or punishment associated with an off-path meal, so you're able to track progress towards a healthier diet pattern without losing the ability to enjoy a meal that doesn't fit perfectly into that pattern."*
  → **"벌이 없다"**가 부담 없음의 1순위 근거. 벗어난 기록도 그냥 기록으로 남음
- *"The journal entries are more about the circumstances and feelings associated with a meal than with the meal's ingredients—no counting almonds or weighing slices of bread!"*
  → **기록의 대상이 '음식'이 아니라 '상황과 감정'** 이라서 부담이 없음
- *"After a few days of using one of these apps in the interest of 'eating healthy,' I would start to obsess and restrict... By contrast, Ate is a total game-changer."*
  → 섭식장애 이력자가 **강박 촉발 여부**를 기준으로 평가
- *"First time I've made it past 3 months without starting over."* (공식 인용)
  → **"처음부터 다시 시작하지 않음"**이 만족의 핵심 지표. 스트릭이 아니라 "리셋 없음"
- *"It's so simple to use, you snap a pic of your meal, and has a lot of different ways to reflect on your meal (why did you eat, how did it taste, where did you eat, how did you feel afterwards)."*
  → 입력이 사진 1장이라 진입 장벽이 없음

**반대 근거(주의)**: 같은 리뷰에서 *"I keep 'on track' ... really keeps me motivated to continue my streak"* 라는 표현이 나옴. 즉 **on/off path는 사용자가 자발적으로 스트릭화한다.** MORU가 이 은유를 빌릴 때 **연속 카운트를 절대 노출하지 말아야** 하는 근거.

### 훔칠 것

1. **"왜 먹었나 / 어떻게 느꼈나"를 묻고, 음식 이름은 그 아래 둔다.** MORU도 "이 음식이 문제였나"가 아니라 "그때 어땠나"를 먼저 물으면 판정 프레임이 원천적으로 안 생김
2. **세로 타임라인 + 사이 간격 시간 표기.** 그리드는 "모아 보기(수집·완성)" 심리를 자극하지만 타임라인은 "흐름"만 보여줌. 빈 날이 있어도 구멍처럼 안 보임
3. **`Why not?` 같은 "이유 없음" 선택지.** 모든 선택지가 이유를 요구하면 그 자체가 심문이 됨. 탈출구 칩을 하나 넣을 것
4. **3탭 약속을 카피로 명시.** "3탭이면 끝" 같은 정량 약속이 최소 입력 원칙을 사용자에게 전달하는 가장 빠른 방법
5. **"No starting over"** — 기록이 끊겨도 리셋 없다는 걸 **문장으로** 말해줌

### 피할 것

1. **⚠️ AteMate Health Score (7.8 / High) 게이지** — MORU의 "점수·게이지 금지" 원칙 정면 위반. Ate조차 2026년에 이걸 도입했다는 게 경고 신호
2. **on/off path 이분법 그 자체.** 판정을 부드럽게 포장했을 뿐 여전히 이진 판정이고, 사용자가 스스로 스트릭으로 변환함. MORU는 "관찰된 것 / 아직 모르는 것" 같은 **비이진 축**으로 가야 함
3. **선택적 칼로리·매크로 노출.** "옵션이니까 괜찮다"는 논리는 IBS·섭식장애 취약군에서 안전하지 않음
4. **AI 코치가 "왜 오후마다 무너지나?" 같은 인과 질문에 답하는 구조.** MORU 원칙상 인과 단정 금지 — 상관 제시까지만
5. **오렌지 `#F08708` 같은 고채도 자극색을 프라이머리로.** MORU 세이지 `#7E9F6E`가 지향하는 진정 효과와 반대 방향

### 스크린샷 링크

- App Store (현재 AteMate): https://apps.apple.com/us/app/ate-food-journal-easy-visual/id1164976477
- Google Play: https://play.google.com/store/apps/details?id=com.youate.android
- 직접 확인한 스크린샷 이미지 원본(고해상):
  - 히어로: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/0b/ab/8f/0bab8f29-e69a-7c18-9be6-b89857d1a236/iPhone1.jpg/600x1300bb.webp
  - **타임라인 구조**: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/9a/93/58/9a9358d6-d2d5-b87d-1090-9a8e70558b51/iPhone2.jpg/600x1300bb.webp
  - AI 챗: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/8f/b6/1f/8fb61fd4-2644-42b1-24ce-608e4f7c111d/iPhone3.jpg/600x1300bb.webp
  - **"Why did you eat?" 칩 UI**: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/b5/bb/3b/b5bb3b4b-8307-541c-7cc1-7ebf0d9fd4b0/iPhone4.jpg/600x1300bb.webp
  - **도넛 인사이트 + Health Score(피할 것)**: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/4b/8c/46/4b8c4698-cc8c-4586-2043-286d1b2e1881/iPhone5.jpg/600x1300bb.webp
- 리뷰 기사(구버전 Ate 설명): https://tubblog.co.uk/resources/ate-mindful-food-journaling/
- Mobbin 등록 여부: **확인 실패**

---

## 2. Clue (월경 추적 앱)

개발사 BioWink GmbH (베를린) · App Store 4.8 / 401K ratings · **"MEDICAL DEVICE" 배지 표시됨** [검증 — App Store 상단 메타 영역에 `MEDICAL DEVICE / See Details` 항목 존재]

### 화면 구조

**하단 탭 5개** [검증 — 스크린샷 5의 탭바]: `Cycle` / `Calendar` / **`+ Track`(중앙 원형 강조)** / `Analysis` / `Content`

**① Cycle View — 원형 링** [검증 — 스크린샷 1]

```
┌─────────────────────────────┐
│      (원형 링 카드)          │
│   ╭───────────────╮         │
│  ╱  ●●● 붉은 호(생리)  ╲    │  ← 링 = 한 사이클 전체
│ │ (Day 28)             │    │  ← 현재 날짜 마커가 링 위에 떠 있음
│ │                      │    │
│ │  Wednesday, 24 Sep   │    │  ← 링 "안쪽"에 오늘 날짜
│ │  2 days until your   │    │  ← 그리고 한 문장짜리 상태
│ │  next period         │    │
│ │  About your PMS  ⌄   │    │  ← 더보기 = 아코디언
│  ╲   ▂▂ 청록 호(황체기) ╱   │
│   ╰───────────────╯         │
└─────────────────────────────┘
```

링 둘레가 사이클 전체, 흰 마커가 오늘. 붉은 호(생리), 청록 호(예측 구간), 점 dot(기록된 증상)이 링 위에 얹힘. **숫자 게이지가 아니라 "위치"로 표현** — 진행률·달성률 뉘앙스가 없는 게 핵심.

**② Calendar View — 월 그리드 + 범례** [검증 — 스크린샷 3, 5]

```
 M  T  W  T  F  S  S
 ▮  ▮                        ← 날짜칸 위 작은 막대 = 기록된 증상
[1][2] 3  4  5  6  7         ← 채워진 pill 형태 배경
 8 [•9]10 11 12 13 14        ← 파란 점 = 배란
…
┌─ 범례 ────────────────────┐
│ ▮ Tracked cramps  ▬ Tracked period │
│ ▮ Predicted cramps ▬ Predicted period │
│ ◉ Ovulation                │
└───────────────────────────┘
```

**★ 가장 훔칠 만한 지점**: 범례가 `Tracked`(기록됨)와 `Predicted`(예측됨)를 **네 항목으로 분리**해서 색·채도로 구분함. 진한 색 = 실제 기록, 연한 색 = 예측. **"이건 네가 적은 것 / 이건 우리가 추정한 것"을 시각적으로 분리**하는 것이 Clue 중립성의 실무적 핵심.

**③ Track(입력) — 카테고리 리스트 → 태그 선택** [검증 — 스크린샷 2]

```
┌─────────────────────────────┐
│ What's most important       │
│ for you to track?           │
│ You can select multiple categories │
├─────────────────────────────┤
│ (🔴💧) Period flow          │  ← 원형 컬러 아이콘 + 라벨, 행 전체가 탭 영역
│ (🟠🙂) My feelings          │
│ (🔵⚡) Cramps and pain       │
│ (🟢)  Sex life              │
│ (🟠☁) PMS                   │
└─────────────────────────────┘
```

카테고리마다 **고유 색 원 + 픽토그램**. 카테고리를 켜고 끌 수 있어(사용자가 안 쓰는 항목 숨김) 입력 화면이 개인마다 짧아짐. 총 200+ 증상/경험 옵션, 100+ 트래킹 옵션 [출처 — 공식 스토어 설명 및 helloclue 리뷰]. 카테고리 예: Pain, Sex life, Exercise, Feelings(과거엔 Emotions), Spotting, PMS, Leisure [출처 — helloclue 리디자인 공지].

**④ Analysis — 증상별 예측 전환 + 호르몬 곡선** [검증 — 스크린샷 3, 4]

- 상단에 증상 아이콘 탭 행: `Cramps` `Headache` `Migraine` `Lower b…` + 라벨 **"Switch for different predictions:"**
- 그 아래 카드: `Day 7 of cycle, July 8` / **"Cramps are likely today"**
- 호르몬 화면: FSH/LH/PG/E2 4색 곡선, 배경을 Follicular(핑크) / Luteal(민트)로 영역 구분, 그 위에 "Ovulation" 마커. 아래 **"Common Experiences"** 불릿 리스트

### 실제 UI 문구 (원문 + 해석) — 예측을 단정하지 않는 방식

| # | 원문 | 출처 등급 | 한국어 해석 / 왜 중요한가 |
|---|---|---|---|
| 1 | **"Cramps are likely today"** | [검증 — 스크린샷 3 카드 내 텍스트] | "오늘 생리통이 **있을 가능성이 있어요**". `will`도 `is`도 아닌 **`are likely`**. MORU 번역 시 "~일 수 있어요 / ~한 날이 많았어요" 계열 |
| 2 | **"Switch for different predictions:"** | [검증 — 스크린샷 3] | 예측을 **복수형·전환 가능한 여러 개**로 제시. 단일 정답처럼 보이지 않게 함 |
| 3 | **"2 days until your next period"** | [검증 — 스크린샷 1] | 명사구로만 진술. "너는 ~해야 한다" 같은 지시·평가 동사가 없음 |
| 4 | **"Ovulation predicted"** (달력 툴팁: `Today, May 27 · Ovulation predicted`) | [검증 — 스크린샷 5] | **"predicted"라는 단어를 UI 표면에 그대로 노출.** 숨기지 않음 |
| 5 | 범례: **"Tracked period" / "Predicted period" / "Tracked cramps" / "Predicted cramps"** | [검증 — 스크린샷 3] | 데이터 출처를 UI 문자열 수준에서 분리. **관찰 vs 추정의 경계를 사용자에게 넘김** |
| 6 | **"It's your late follicular phase"** | [검증 — 스크린샷 4] | 상태 서술만. "좋다/나쁘다"가 없음 |
| 7 | **"Common Experiences"** → *"If no pregnancy occurs, the fall in PG and E2 **can lead to** premenstrual symptoms (PMS)"*, *"Mood **may feel** more sensitive"* | [검증 — 스크린샷 4] | **"can lead to" / "may feel"** — 인과 아닌 가능성. 그리고 제목이 "Your symptoms"가 아니라 **"Common Experiences"(흔한 경험)** = 남들도 그렇다는 정상화 프레이밍 |
| 8 | 스토어 고지: **"Note: Clue should not be used as a contraceptive. ... The app does not substitute professional medical advice, diagnosis, or treatment. Your healthcare provider can give you advice on your specific needs and situation."** | [검증 — App Store 설명문 원문] | 면책을 **부정문 + 대안 제시**로 마무리. "우리는 못 한다"에서 끝내지 않고 "이건 의료진이 해줄 수 있다"로 넘김 |
| 9 | **"Sex is called 'sex,' not 'the baby dance.' Menstrual bleeding is called 'bleeding,' not 'Aunt Flo.'"** | [출처 — helloclue.com 공식 아티클 "The science of your cycle: evidence-based app design"] | **완곡어법 금지 원칙의 원문.** 부끄러운 걸 귀엽게 돌려 말하지 않는 것이 오히려 중립적이라는 논리 |

### 컬러·타이포

**컬러** [검증 — 공식 App Store 스크린샷 5장 픽셀 추출]

| 역할 | hex | 비고 |
|---|---|---|
| 브랜드 레드 | `#E03335` | 헤드라인·생리 표시·CTA. Clue의 시그니처 |
| 딥 레드(그라데이션 끝) | `#8C1318` | 마케팅 배경 그라데이션 하단 |
| 배경 오프화이트 | `#FEFDF9` | **완전한 흰색이 아닌 아주 옅은 크림.** MORU 크림 `#F8F3EA`와 같은 발상 |
| 보조 배경 웜그레이 | `#FAF6F3` / `#F8F7F5` | 카드 뒤 배경 |
| 티얼(황체기/배란 호) | `#01859E` | 링의 청록 호 |
| 블루바이올렛(예측·증상 칩) | `#4B74C3` | Cramps/Headache 아이콘 배경, 예측 pill |
| 민트(Luteal 영역) | `#D9F2EE` | 호르몬 차트 배경 |
| 블러시(Follicular 영역) | `#F9DCE1` | 호르몬 차트 배경 |

**의미 있는 관찰**: Clue는 **레드를 "생리(실제 기록)"에, 블루/티얼을 "예측·추정"에** 배정한 것으로 보임 [검증 — 달력 범례에서 tracked=빨강 계열, predicted cramps=파랑 계열]. MORU도 **"기록"과 "추정"에 서로 다른 색 계열**을 배정하면 같은 효과를 얻을 수 있음.

**타이포** [검증 — 스크린샷 육안, 폰트명은 확인 실패]
- 마케팅 헤드라인: 지오메트릭 그로테스크 + **강조어 1개만 이탤릭 세리프** ("Get *smarter* every cycle") — 대비로 인간미
- 앱 내부: 산세리프. **날짜는 볼드, 요일/부가정보는 레귤러**로 같은 줄 안에서 위계 ("**Wednesday**, 24 Sep")
- 예측 문구는 **키워드만 컬러**("**Cramps are** likely today"에서 "Cramps are"만 레드) — 문장 전체를 경고색으로 칠하지 않음
- 로고: 씨앗/꽃 형태의 기하학적 라인 심볼 + 라이트 웨이트 워드마크

### "왜 중립적 톤으로 유명한가"의 구체적 근거

1. **완곡어법 명시적 금지** [출처 — helloclue.com 공식 아티클]: *"Sex is called 'sex,' not 'the baby dance.' Menstrual bleeding is called 'bleeding,' not 'Aunt Flo.'"* 같은 아티클에 설계 3원칙도 명시 — user happiness(생리를 어색한 게 아니라 **평범한 것**으로 느끼게), rapid data entry, accurate insights
2. **젠더 중립 설계** [출처 — helloclue.com LGBTQIA+ 아티클]: 앱을 가능한 한 젠더 중립적으로 설계했고, 젠더드 언어에 대한 피드백을 상시 받음. 논바이너리 사용자 인터뷰에서 "다른 앱은 생리를 미워하게 만들었지만 Clue는 가장 편했다"는 증언
3. **핑크·나비·꽃 클리셰 거부** [출처 — Creative Review 인터뷰, Ida Tin & 시니어 아트디렉터 Marta Pucci]: Tin은 당시 다른 앱들이 *"mostly just calendars"*였고, 자신은 *"a more mature product that could really help you understand the science behind it"*를 원했다고 진술. **"cycle view" 아이디어**도 이 인터뷰에서 직접 언급 — *"you would instantly and intuitively know where you are on this monthly journey"* (기사 후반은 유료 구간, 전문 **확인 실패**)
4. **콘텐츠 검수 파이프라인** [출처 — helloclue 아티클 + Alconost 로컬라이제이션 사례]: 텍스트를 전문 번역 → **의학 배경 전문가 검수** → **사용자 커뮤니티 검수**의 3단계로 거침. "과학 논문보다 이해하기 쉽고 위키백과보다 짧게"가 기준
5. **광고·데이터 판매 없음** [출처 — Creative Review, 공식 사이트]: 광고를 받지 않고 no-sell 데이터 정책. 공식 카피: *"We have never, and will never, sell your health data or share it with any authority"*
6. **예측 불확실성을 지원문서에서 선제 설명** [출처 — support.helloclue.com]: "Why aren't my cycle predictions accurate?", "What if an atypical cycle is making my Clue predictions inaccurate?" 같은 **"안 맞을 수 있다"를 제목으로 단 도움말 문서**를 운영. 예측은 최근 12사이클 기반이며 스트레스·수면·시차·약물로 흔들릴 수 있다고 명시

### 훔칠 것

1. **★ `Tracked` vs `Predicted` 시각적·문자적 분리.** MORU 캘린더/리포트에서 "기록한 것"과 "우리가 추정한 것"을 색 채도 + 범례 라벨로 분리. 이거 하나로 "판정하지 않음"의 절반이 해결됨
2. **`are likely` / `can lead to` / `may feel` 3종 어미 세트.** MORU 한국어 대응: "~한 날이 많았어요", "~와 함께 나타난 적이 있어요", "~일 수 있어요". `~때문이에요` `~를 피하세요`는 전면 금지
3. **"Common Experiences"(흔한 경험) 라는 섹션명.** "당신의 증상"이 아니라 "흔한 경험"으로 부르면 개인 책임 프레임이 사라지고 정상화됨
4. **원형 링 = 위치 표현.** 진행률 바나 점수 게이지와 달리 원형 링은 "얼마나 달성했나"를 함의하지 않음. MORU가 "요즘 상태"를 시각화한다면 게이지 대신 **위치/분포 은유**
5. **면책을 "대신 이걸 하세요"로 닫기.** "진단이 아닙니다"에서 끝내지 말고 "구체적인 건 담당 의료진이 알려줄 수 있어요"까지
6. **카테고리 온/오프.** 사용자가 안 쓰는 트래킹 항목을 숨겨서 입력 화면이 개인마다 짧아지게

### 피할 것

1. **200+ 트래킹 옵션.** Clue는 "다 기록하고 싶은 사람"을 위한 앱이라 옵션이 폭발함. MORU 최소 입력 원칙과 정면 충돌 — 초기엔 5~7개로 시작
2. **하단 5탭 + Content 탭.** 콘텐츠 소비 유도는 매일 열게 만드는 장치. MORU는 "증상 있을 때만" 열려야 하므로 상시 소비 탭은 위험
3. **레드를 프라이머리로.** 경고·긴급 연상. MORU의 세이지/크림 조합이 훨씬 안전
4. **프리미엄 팝업 빈도.** App Store 리뷰에 *"It can be annoying how often you get pop-ups about going premium"* 라는 불만이 반복 등장 [검증 — 리뷰 원문]
5. **호르몬 곡선 같은 고밀도 차트.** Clue는 "과학적"이 브랜드지만 MORU는 "병원 느낌 제거"가 원칙 — 임상 차트 룩은 반대 방향

### 스크린샷 링크

- App Store: https://apps.apple.com/us/app/clue-period-cycle-tracker/id657189652
- Google Play: https://play.google.com/store/apps/details?id=com.clue.android
- 직접 확인한 스크린샷 원본:
  - **원형 Cycle View**: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/f5/61/88/f5618898-fd65-4689-7d56-7a73517071c0/1__U00284_U0029.jpg/600x1300bb.webp
  - **트래킹 카테고리 리스트**: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/09/1c/c7/091cc76d-3774-3bd0-db8e-01680533c246/2.jpg/600x1300bb.webp
  - **★ Tracked/Predicted 범례 + "Cramps are likely today"**: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/cd/79/65/cd7965d1-d103-c848-fd13-edec6892f966/3.jpg/600x1300bb.webp
  - 호르몬 곡선 + Common Experiences: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/54/55/7e/54557ebc-9b0d-aff6-64cf-46b8c34209be/4__U00281_U0029.jpg/600x1300bb.webp
  - 캘린더 + "Ovulation predicted" 툴팁: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/67/06/34/6706348b-c872-27e6-ea25-e7b62ce05d43/5.jpg/600x1300bb.webp
- 디자인 인터뷰(부분 유료): https://www.creativereview.co.uk/design-clue-inclusive-period-tracking-app/
- 톤 원칙 공식 아티클: https://helloclue.com/articles/about-clue/science-your-cycle-evidence-based-app-design
- 리디자인 공지(트래킹 카테고리 상세): https://helloclue.com/articles/how-to-use-clue/clue-period-tracking-relaunched-and-newly-designed
- 예측 불확실성 지원문서: https://support.helloclue.com/hc/en-us/articles/215935423-Why-aren-t-my-cycle-predictions-accurate
- 연구용 스크린샷(ResearchGate): https://www.researchgate.net/figure/Clue-app-screenshot-Sample-screenshots-of-the-Clue-app-Users-can-track-daily-symptoms_fig1_341647447

---

## 3. Cara Care

> **중요 — Cara Care는 앱이 2개입니다.** 이걸 섞으면 안 됩니다.
>
> | | **A. Cara Care (국제판 트래커)** | **B. Cara Care für Reizdarm (독일 DiGA)** |
> |---|---|---|
> | App Store ID | 1133687886 | 1526811241 (플랫폼 앱 "Cara Care") |
> | 성격 | 무료 증상·식단 트래커 | **처방받아 쓰는 클래스 I 의료기기 / DiGA** |
> | 컬러 | **틸 `#00B4A8`** | **그린 `#1FA856` + 딥 인디고 `#150B2D`** |
> | 톤 | 웰니스 | 의료 + 웰니스 하이브리드 |
> | 가격 | 무료 + IAP | 처방 시 €248 / 90일, 법정보험 100% 부담 |
>
> MORU가 참고할 건 주로 **A의 기록 UI**와 **B의 고지 노출 방식**입니다.

### 화면 구성

#### A. 국제판 (틸) [검증 — App Store 스크린샷 5장 + Google Play 스크린샷 5장]

**온보딩** (스크린샷 1)
```
← ▬ ─ ─ ─ ─ ─          ← 상단 좌측 back + 점선 스텝 인디케이터
Which symptoms are
you suffering from?    ← 큰 세리프 아닌 라이트 산세리프 질문
┌──────┐ ┌──────┐
│ (선 아이콘) │ │ (선 아이콘) │   ← 2열 그리드, 흰 카드 + 틸 라인 아이콘
│ Bloating │ │Stomach pain│
└──────┘ └──────┘
┌──────┐ ┌──────┐
│Heatburn│ │Constipation│
└──────┘ └──────┘
        …
[      Weiter      ]   ← 하단 고정 풀폭 CTA (독일어 잔존 = 로컬라이즈 미완)
```
증상 아이콘이 **의학 일러스트가 아니라 추상 라인 픽토그램**(배 모양, 번개, 불꽃+하트, 물방울, 소용돌이). 장기 그림을 직접 그리지 않아 병원 느낌을 낮춤.

**기록/홈 = "Daily Overview" 세로 카드 타임라인** (스크린샷 3)
```
┌─────────────────────────────┐
│ (틸 헤더) Daily Overview     │
├─────────────────────────────┤
│ 🕐 07:12                ✎   │  ← 회색 시각 헤더 바 + 우측 연필(수정)
│  🌙 I slept more than 8 hours.
│  🙂 I'm feeling really good
│  ⚡ I don't have any stomach pain
├─────────────────────────────┤
│ 🕐 08:04  Food          ✎   │
│  🍽 Oat & rice flake porridge with fruit
│  [        음식 사진        ]  ← 카드 폭 전체 사진
│  (Rice)(Strawberries)(Raspberries)
│  (Rice flakes)(Oats)(Rice syrup)…  ← 틸 pill 태그로 재료 나열
├─────────────────────────────┤
│ 🕐 12:30  Medications    ✎  │
│  💊 Peppermint oil    1 Capsule
├─────────────────────────────┤
│ 🎚  🍴   ( + )   📈   🎓     │  ← 하단 5탭, 중앙 틸 FAB
└─────────────────────────────┘
```
**★ 주목할 문장 형태**: 기록이 데이터 값이 아니라 **1인칭 완성 문장**으로 표시됨 — *"I slept more than 8 hours."*, *"I'm feeling really good"*, *"I don't have any stomach pain"*. 차트가 아니라 **일기 문장**처럼 읽힘. 병원 느낌 제거에 매우 효과적.

**입력 시트** (Google Play 스크린샷 1)
```
Cancel      Just now ⌄      Save all   ← 상단 3분할. 시각은 중앙에서 변경 가능
        🕐
   WHAT DID YOU HAVE?
   ADD DISH  [Bulgur with bell pepper]  ← 인라인 텍스트 입력 + 밑줄
   ┌ 🥗 Bulgur with bell pepper ┐
   │ + Add ingredients (Bulgur ✕)(Bell pepper ✕)
   │ (Tomato ✕)(Onion ✕)(Cucumber ✕)
   └ ADD TO FAVOURITES ─────────┘
   RELATED
   🍅 Tomato        ⊕
   🥒 Cucumber      ⊕
   🥚 Egg           ⊕
─────────────────────────────
 (🍴)(🦠)(💩)(🎈)(✎)…            ← 하단 카테고리 아이콘 행 = 시트 안에서 전환
```
**핵심 인터랙션**: 하단 아이콘 행으로 **시트를 닫지 않고 음식→변→통증→기분 사이를 전환**하고, 마지막에 **"Save all"로 한 번에 저장**. 즉 **여러 종류를 한 세션에서 입력**하는 구조.

**리포트 = "Overviews"** (스크린샷 4, Google Play 5)
```
        Overviews            ↗   ← 우상단 공유/내보내기
 [ Day ][ Week ][ Month ]        ← 세그먼트 컨트롤
 ‹  06/10/2019 - 06/16/2019  ›
 SYMPTOM SCORE
   ·   ·  ●(빨강) ·  ·  ·        ← 요일 x 심각도 산점도 (틸 배경 위 컬러 점)
   ●(노랑) ·  ·  ·  ●(노랑)
   ·  ●(흰) ·  ●(흰) ·
  Mon Tue Wed Thu Fri Sat Sun
┌─────────────────────────────┐
│ Tummy pain            [HIGH]│  ← 축 라벨을 숫자가 아니라 말로
│  ●─●   ╷╷●─●─●              │
│                    [NO PAIN]│  ← 하단 축 = "NO PAIN"
└─────────────────────────────┘
 (증상 아이콘 행 — 선택된 것만 채워짐)
```
**★ 축 라벨이 숫자가 아니라 `HIGH` / `NO PAIN`.** 0~10 척도를 표면에 노출하지 않음. MORU가 훔칠 만함.

#### B. 독일 DiGA판 (그린/인디고) [검증 — 독일 App Store 스크린샷 5장]

**홈** (스크린샷 1)
```
┌─────────────────────────────┐
│ (그린 헤더)          👤 💬   │
│ Guten Tag                    │  ← 인사말 소문자 작게
│ André                        │  ← 이름 큰 세리프
│ ────────────────             │
│ DU BIST IN WOCHE 1 VON 12    │  ← 전 강조: "12주 중 1주차"
│ DEIN NÄCHSTER SCHRITT:       │  ← "너의 다음 단계:"
│ [사진][Dein personalisierter │
│       Therapieplan Gefühle…] │
├─────────────────────────────┤
│ Zuletzt aktualisiert: 23.11.2023  ← "마지막 업데이트" 날짜 명시
│ ESSEN AN DEN BESTEN 3 TAGEN  │  ← "가장 좋았던 3일에 먹은 것"
│  Kaffe / koffein         3 mal
│  Milch (Kuhmilch)        3 mal
│   Kuhmilcheiweiß, Laktoserich
│  Joghurt (mit Früchten)  3 mal
│   ⚠ Bei Allergien oder Unverträglichkeiten
│     beachten Sie bitte die Zutatenliste:
│     hoher Fruktosegehalt, Histamin…
├─────────────────────────────┤
│ home  📈  (+)  Recipes  Programs │
└─────────────────────────────┘
```
**★★ MORU 핵심 참고점 2가지**:
1. 인사이트 제목이 **"나쁜 음식"이 아니라 `ESSEN AN DEN BESTEN 3 TAGEN`(가장 좋았던 3일에 먹은 음식)**. **부정이 아니라 긍정 방향으로만 상관을 제시** — "이건 위험" 대신 "괜찮았던 날엔 이런 걸 먹었다". 이게 판정 회피의 가장 실용적인 트릭
2. 각 음식 아래에 **"알레르기/불내증이 있으면 성분표를 확인하세요"라는 한 줄 인라인 고지** + 성분 키워드(고과당, 히스타민). 즉 **정보 옆에 즉시 붙는 마이크로 면책**

**프로그램** (스크린샷 4)
```
Care Care für              [Tool Kit]
Reizdarm
▬▬▬▬▬▬▬▬▬─────
DU BIST IN WOCHE  1 | 12          ⋯
┌─────────────────────────────┐
│ ○ Vorbereitung           ⌃  │  ← 좌측 세로 타임라인(원+선)
│   0|2 MODULE ABGESCHLOSSEN  │
│ ○ Basiswissen: Willkommen ⌃ │
│   Erfahre, wie Cara Care …  │
│   [🖼] ARTIKEL | 7 MIN.     │  ← 소요 시간 명시
│       10 Fakten über Cara Care
│   [🖼] ARTIKEL | 6 MIN.
│       Deine Funktionen in der App
│ ❶ Fragebogen: Gesundheits-… ⌃│
│   [🖼 파랑] FRAGEBOGEN | 45 MIN.
│       Gesundheits-Fragebogen │
└─────────────────────────────┘
```
좌측 세로 타임라인 + 아코디언, 모든 항목에 **소요 시간(7 MIN / 45 MIN) 사전 고지**.

**최면/명상 진입 전 안전 문구** (스크린샷 5)
```
   Emotionen wahrnehmen
   durch Meditation
   Stelle sicher, dass du dich in einer
   sicheren Umgebung befindest, in der
   du dich auf die Übung fokussieren kannst
   Musik auswählen:
   [UNBESCHWERTES LEBEN][LAGERFEUER]
   [BERGSPITZE][ACHTSAMER GEIST]
   [HIMMLISCHER GARTEN]
              ( → )
```
= "안전한 환경에 있는지 확인하세요"라는 **행위 직전 안전 고지**를 본문 서브카피로.

### IBS 증상 입력 UI / 브리스톨 척도

- **변(stool) 트래킹 카테고리는 확실히 존재** [검증 — 하단 아이콘 행에 변 형태 픽토그램 2종(단단한 형태 / 무른 형태+물방울)이 별도 아이콘으로 존재. 공식 설명문 "Poop Tracker: Log different types of poop to notice patterns"]
- **다만 "브리스톨 척도 7단계를 어떤 UI로 그렸는지"는 확인 실패.** 공개 스크린샷에 해당 화면이 포함되어 있지 않고, 실제 앱 설치 없이는 확인 불가. **추측으로 채우지 않겠습니다.** 필요하면 실기기 설치 후 확인 권장
- 확인된 것: 변 관련 아이콘이 **사진이나 사실적 일러스트가 아니라 추상 라인 픽토그램**이라는 점. MORU가 브리스톨 척도를 그릴 때 참고 가능한 방향 (사실적 묘사 회피)
- 증상 강도는 **선(line) 그래프 + `HIGH`/`NO PAIN` 텍스트 축**으로 표현 [검증]

### 톤앤매너 — 의료적인가 웰니스적인가

**답: 층이 나뉘어 있음.**

| 층 | 톤 | 근거 |
|---|---|---|
| 앱 스토어 카테고리 | **Medical** (Health & Fitness 아님) | [검증 — App Store 카테고리 표기] |
| 마케팅 카피 | **웰니스** — *"Make peace with your gut"*, *"Cara Care takes the mystery out of your digestion"* | [검증] |
| 일러스트레이션 | **강한 웰니스** — 무중력으로 떠다니는 사람, 파스텔 블롭, 손그림 곡선. 임상 이미지 전무 | [검증 — Google Play 스크린샷] |
| 기록 표시 | **웰니스** — 1인칭 일기 문장 | [검증] |
| 프로그램/규제 화면 | **의료적** — 주차, 모듈, 45분 설문지, CE 마크 | [검증] |
| 규제 문서 | **완전히 의료적** — ICD-10 코드, 금기증 | [검증] |

즉 **"겉은 웰니스, 규제 필수 지점만 의료"** 라는 이중 레이어. MORU가 참고할 정확한 모델.

### ★ DiGA 승인 앱의 면책·고지 노출 방식 (중요)

**규제 원문** [검증 — cara.care/zweckbestimmung 가 리다이렉트하는 공식 PDF "Cara Care für Reizdarm: Intended Use | v-03", 2021-05-19 원문 전문 추출]

> **"Cara Care für Reizdarm ist eine interaktive softwarebasierte medizinische Anwendung für die Eigenanwendung durch Patienten zur digitalen Behandlung des Reizdarmsyndroms (ICD-10-GM: K58, K58.1, K58.2, K58.3, K58.8). Die Anwendung dient zur Symptomreduktion funktioneller Beschwerden."**
>
> **"Cara Care für Reizdarm ist geeignet für Patienten zwischen 18 und 70 Jahren und darf nicht angewendet werden, wenn eine Schwangerschaft vorliegt. Für die Anwendung von Cara Care für Reizdarm ist eine ärztliche Diagnose- und Indikationsstellung zwingend erforderlich. Cara Care für Reizdarm ersetzt keine ärztliche Behandlung."**
>
> 영문 병기(같은 문서):
> **"Cara Care for IBS is an interactive software-based medical application for self-administered use by patients for the digital treatment of irritable bowel syndrome... The use of Cara Care for IBS requires a medical diagnosis and indication. Cara Care does not replace medical treatment by a physician."**
>
> **Kontraindikationen / Contraindications: `Schwangerschaft` (임신) · `Personen unter 18` (18세 미만) · `Personen über 70` (70세 초과)**

**노출 채널별 배치** [검증 — 독일 App Store 설명문 원문]

1. **앱스토어 설명문 상단**: *"Cara Care ist eine Softwareplattform für die folgenden Medizinprodukte der Klasse 1"* — **"클래스 1 의료기기"를 첫 문단에 선언**
2. **3개 문서 링크를 설명문 본문에 나란히 노출** (숨기지 않음):
   - `Zweckbestimmung`(사용목적): https://cara.care/zweckbestimmung
   - `Gebrauchsanweisung`(사용설명서): https://cara.care/de/gebrauchsanweisung
   - `Leistungsbeschreibung`(성능설명): https://cara.care/leistungsbeschreibung
3. **`Folgende Gegenanzeigen bestehen für die Anwendung von Cara Care für Reizdarm:` + 불릿 3개** — 금기증을 스토어 설명 안에 그대로
4. **`SICHERHEIT` 라는 전용 섹션**: *"Bei einigen Erkrankungen oder Symptomen wird von einer Nutzung von Cara Care für Reizdarm abgeraten. Vor der Nutzung von Cara Care solltest du dich darüber informieren."* (일부 질환·증상에서는 사용을 권하지 않음. 사용 전에 확인할 것)
5. **`WICHTIG:` 로 시작하는 접근 조건 안내** — 프리셰알트코드(처방 코드)가 필요하다는 점을 대문자 라벨로
6. **스크린샷 안에 CE 마크 배지 자체를 그려 넣음** [검증 — 독일 스토어 스크린샷 1의 좌하단, 다크그린 원형 배지에 `CE` 문자 + 방사선 효과]. 즉 **고지를 "숨기는 것"이 아니라 "신뢰 배지로 전환"**
7. **화면 내 마이크로 고지**: 음식 인사이트 옆 *"Bei Allergien oder Unverträglichkeiten beachten Sie bitte die Zutatenliste"*, 최면 시작 전 *"Stelle sicher, dass du dich in einer sicheren Umgebung befindest"* — **긴 약관이 아니라 해당 행위 바로 옆의 한 줄**
8. **`Höchster Datenschutz` — "Konform mit den Anforderungen des Medizinproduktgesetzes, der DSGVO und des BDSG"** [검증 — 스크린샷 3]. 규제 준수를 **불안 요소가 아니라 세일즈 포인트**로 배치

**요약된 패턴**: `첫 문단에 지위 선언` → `문서 3종 링크 상시 노출` → `금기증 불릿` → `SICHERHEIT 전용 섹션` → `행위 직전 한 줄 마이크로 고지` → `CE/규제를 신뢰 배지로 시각화`.

### 컬러·타이포

**A. 국제판** [검증 — App Store 스크린샷 픽셀 추출]

| 역할 | hex |
|---|---|
| 프라이머리 틸 | `#00B4A8` |
| 배경 | `#FFFFFF` / `#F3F7F8` / `#F3F3F3` |
| 텍스트 | 딥 네이비/인디고 (스크린샷상 진한 남보라 계열, 정확 값 확인 실패) |
| 아주 옅은 민트 | `#E5F2EB` |

**B. 독일 DiGA판** [검증 — 독일 App Store 스크린샷 픽셀 추출]

| 역할 | hex |
|---|---|
| 프라이머리 그린 | `#1FA856` |
| 텍스트/딥 인디고(거의 검정) | `#150B2D` |
| 세컨더리 스카이 | `#52C0D9` |
| 아주 옅은 민트 배경 | `#F1FAF5` |
| 일러스트 파스텔 | 핑크 `#F4BED6` · 라벤더 `#E9DDEB` · 옐로 `#FFF8CC` · 페일블루 `#DDF1F8` |
| 배경 | `#FFFFFF` 지배적 (스크린샷 픽셀 기준 40~73%) |

**타이포** [검증 — 육안, 폰트명 확인 실패]
- **독일판 마케팅 헤드라인은 세리프**("Deine digitale **Reizdarm-Therapie**", "Ganzheitlicher Ansatz") — 그리고 **강조어만 그린**으로 2색 처리. 세리프 + 다량의 여백이 "병원"이 아니라 "책/에디토리얼" 느낌을 만듦
- 앱 내부 화면 이름도 세리프("Vorbereitung", "Emotionen wahrnehmen durch Meditation")
- **대문자 + 넓은 자간 마이크로 라벨**을 구조 표지로 적극 사용: `DU BIST IN WOCHE 1 VON 12`, `ARTIKEL | 7 MIN.`, `ESSEN AN DEN BESTEN 3 TAGEN`, `SYMPTOM SCORE`
- 국제판은 반대로 **라이트 웨이트 산세리프 질문문**("Which symptoms are you suffering from?")

### 훔칠 것

1. **★ "가장 좋았던 3일에 먹은 것" 프레이밍.** 부정(위험 음식) 대신 **긍정(괜찮았던 날의 음식)만** 제시. MORU의 "판정하지 않는다"를 데이터 화면에서 실현하는 가장 구체적인 방법
2. **★ 1인칭 문장 기록 표시.** *"I don't have any stomach pain"* 처럼 로그를 **일기 문장**으로 렌더링. 값·차트보다 훨씬 덜 임상적. MORU 대응: "오늘은 배가 편했어요", "8시간 넘게 잤어요"
3. **숫자 없는 축 라벨.** `HIGH` / `NO PAIN` 처럼 척도 끝점만 말로. 0~10 숫자를 UI에 노출하지 않기
4. **행위 직전 한 줄 마이크로 고지.** 긴 면책 페이지 대신, 리포트 옆·기록 옆에 붙는 한 문장
5. **추상 라인 픽토그램으로 신체 표현.** 장기 사실 묘사 대신 배·번개·물방울 같은 추상 기호 → 병원 느낌 제거
6. **소요 시간 사전 고지**(`7 MIN.`) — 사용자가 지금 열지 말지 스스로 결정하게 함. 강요 없는 참여
7. **시트 안에서 카테고리 전환 + "Save all" 일괄 저장.** 증상 있는 날 여러 항목을 한 번에 넣을 때 마찰 최소

### 피할 것

1. **`DU BIST IN WOCHE 1 VON 12` + 진행 바 + `0|2 MODULE ABGESCHLOSSEN`** — 12주 프로그램 진척도는 **사실상 스트릭/달성률**. MORU 원칙 정면 위반. 리뷰에도 이 부담이 드러남: *"Nichts für Menschen mit wenig Zeit"*(시간 없는 사람에겐 무리), 4주차 만에 이탈
2. **`SYMPTOM SCORE` 라는 명칭과 산점도.** "점수"라는 단어 자체가 금지 대상
3. **45분짜리 의학 설문지를 온보딩 초반에 배치.** 최소 입력 원칙과 충돌
4. **온보딩 첫 질문이 "Which symptoms are you suffering from?"** — `suffering`(고통받는)이라는 강한 단어 + 증상 체크리스트로 시작. MORU라면 "요즘 어떤 게 신경 쓰이나요?" 정도의 완화 필요
5. **틸 `#00B4A8` 같은 채도 높은 의료 청록.** 정확히 "병원 앱" 색. MORU 세이지 방향이 옳음
6. **트래킹 항목 폭발**(변·스트레스·수면·운동·피부·생리·약물·통증…). 리뷰에서도 *"Nichts für Menschen mit wenig Zeit"* 이탈 사유

### 스크린샷 링크

- App Store 국제판: https://apps.apple.com/us/app/cara-care-ibs-fodmap-tracker/id1133687886
- **App Store 독일 DiGA판(고지 문구 원문 포함)**: https://apps.apple.com/de/app/cara-care/id1526811241
- Google Play 국제판: https://play.google.com/store/apps/details?id=com.gohidoc.cara
- Google Play EU판: https://play.google.com/store/apps/details?id=com.gohidoc.caraeu
- 직접 확인한 스크린샷 원본:
  - 온보딩(증상 선택 그리드): https://is1-ssl.mzstatic.com/image/thumb/Purple113/v4/e7/a1/b4/e7a1b482-a379-fea1-7537-b77589ee3623/pr_source.jpg/600x1300bb.webp
  - **Daily Overview(1인칭 문장 기록)**: https://is1-ssl.mzstatic.com/image/thumb/Purple113/v4/60/b3/3f/60b33f7a-a285-ef04-f843-23200c74ce77/pr_source.jpg/600x1300bb.webp
  - Overviews(HIGH/NO PAIN 축): https://is1-ssl.mzstatic.com/image/thumb/Purple113/v4/78/5d/8e/785d8efb-15e9-8fee-f6fc-2213530635cc/pr_source.jpg/600x1300bb.webp
  - 영양사 채팅: https://is1-ssl.mzstatic.com/image/thumb/Purple113/v4/f3/47/df/f347df37-1af2-4c94-b50f-2db166fbdc5d/pr_source.jpg/600x1300bb.webp
  - **독일 DiGA 홈 + CE 배지 + "가장 좋았던 3일"**: https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/d5/ba/7d/d5ba7d7e-f7d2-61df-d952-5f6a23ff2d97/5.8_inch-1.png/600x1300bb.webp
  - 독일 DiGA 프로그램(주차 진행): https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/77/34/fd/7734fd63-9e78-9152-4aca-8b5aac672f47/5.8_inch-4.png/600x1300bb.webp
  - 독일 DiGA 최면(안전 고지): https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/a6/5e/62/a65e62cb-fd4c-cea9-b428-e6f3e0b19785/5.8_inch-5.png/600x1300bb.webp
  - Google Play 입력 시트("WHAT DID YOU HAVE?"): https://play-lh.googleusercontent.com/DJ0VpRYM1Itf5gf8SE-Y06EuH8LtGjfpVg_hT70qWQ_5Bm9fR0Rq3AKxwL02Qi_MlCklBrqQ19o5s_ZcfnvO2Q=w1052-h592-rw
- **공식 사용목적(면책 원문 PDF)**: https://assets.ctfassets.net/pmt5vquvp72j/3Ha8OMTVvphZkQwPKZZ6BU/a104b9ed598cb8de7df755a3918292bb/Cara_Care_fu__r_Reizdarm__Intended_Use___v-03.pdf
- BfArM DiGA 등록: https://diga.bfarm.de/de/verzeichnis/01346 (직접 파싱 실패 — 구브라우저 차단. 브라우저로 직접 열면 확인 가능)
- 공식 사이트: https://cara.care/en

---

## 종합 — MORU 화면별 대응표

| MORU 화면 | 참고할 앱 | 무엇을 |
|---|---|---|
| **홈 / 오늘** | **Ate** (구조) + **Cara Care 국제판** (문장) | 그리드 아님. **세로 타임라인 1줄**에 식사 사진·증상·기분을 시간순으로. 항목 사이에 경과 시간("4시간 뒤") 표시. 각 로그는 값이 아니라 **1인칭 문장**으로 렌더 — "오늘은 배가 편했어요". 빈 날에 빨간 표시·경고 금지 |
| **기록 입력(사진)** | **Ate** | 사진 촬영 = 로그 완료. **3탭 약속을 온보딩 카피에 명시.** 시각·날짜 자동. 음식 이름/재료는 나중에 추가 가능하고 안 넣어도 완결 |
| **기록 입력(증상)** | **Cara Care** (시트 구조) + **Clue** (카테고리 온/오프) | 하단 카테고리 아이콘 행으로 시트 안에서 전환 + **"모두 저장"** 일괄 저장. **사용자가 안 쓰는 카테고리를 끌 수 있게** 해서 개인마다 입력 화면이 짧아지게. 초기 카테고리는 5~7개까지만 |
| **리플렉션 프롬프트** | **Ate** | "왜 먹었나요?" 칩 세트 + **"그냥"(= `Why not?`) 탈출구 칩 필수.** 전부 선택 사항이고 건너뛰기에 페널티 없음. "그때 어땠나요?"는 좋다/나쁘다가 아니라 **감정 어휘 칩** |
| **브리스톨 척도 입력** | **Cara Care** (부분) | 사실적 묘사 대신 **추상 라인 픽토그램**. 단, Cara Care의 실제 브리스톨 UI는 **확인 실패** — 별도 확인 필요. `HIGH`/`NO PAIN` 식으로 **숫자 대신 끝점만 말로** 라벨링하는 방식은 채택 권장 |
| **패턴 / 리포트** | **★ Clue** (Tracked/Predicted 분리) + **★ Cara Care 독일판** (긍정 프레이밍) | ① 색 채도로 **"기록한 것" vs "추정한 것"** 분리하고 범례에 그 단어를 명시 ② 제목을 **"편했던 날에 함께 있던 것"** 으로 — 부정("위험 음식") 방향은 만들지 않음 ③ 축 라벨은 숫자 금지, `편함`~`불편함` 끝점만 ④ 도넛/분포는 되지만 **점수·게이지·진행 바는 금지** |
| **패턴 문구(마이크로카피)** | **★ Clue** | `are likely` / `can lead to` / `may feel` 3종 어미. 한국어: **"~한 날이 많았어요" / "~와 함께 나타난 적이 있어요" / "~일 수 있어요".** 섹션명은 "당신의 증상"이 아니라 **"흔한 경험"**(Common Experiences) 계열 |
| **온보딩** | **Cara Care**(레이아웃) / **Clue**(질문 태도) | 2열 카드 그리드 + 점선 스텝 인디케이터 + 하단 고정 CTA는 좋음. 단 **"어떤 증상으로 고통받고 있나요?"(suffering) 같은 강한 어휘는 피하고** Clue의 "무엇을 기록하는 게 가장 중요한가요? / 여러 개 선택 가능"처럼 **사용자가 고르는 프레임**으로 |
| **면책·고지** | **★ Cara Care 독일 DiGA판** + **Clue**(문장 형태) | 배치는 Cara Care: `첫 화면 지위 선언` → `문서 링크 상시 노출` → `행위 직전 한 줄 마이크로 고지`(리포트 옆, 음식 옆). 문장 형태는 Clue: **"진단이 아닙니다"로 끝내지 말고 "구체적인 건 담당 의료진이 알려줄 수 있어요"까지.** 규제/개인정보 준수는 불안 요소가 아니라 **신뢰 배지로 시각화** |
| **컬러 시스템 검증** | 세 앱 모두 | 세 앱 모두 **순백(#FFF) 대신 살짝 따뜻한 오프화이트**를 배경으로 씀(Clue `#FEFDF9`, Ate `#E5E0DA`, Cara DE `#F1FAF5`). MORU 크림 `#F8F3EA`는 이 계열 안에서 타당. **다만 프라이머리를 Ate 오렌지·Clue 레드·Cara 틸처럼 고채도로 두는 건 셋 다 자극적** — MORU 세이지 `#7E9F6E`는 차별점이자 강점 |
| **타이포 방향** | **Cara Care 독일판** + **Ate** | 마케팅/화면 제목에 **세리프**, 본문에 산세리프. 강조어 1개만 브랜드 컬러로. **대문자+넓은 자간 마이크로 라벨**을 구조 표지로. "아늑한 부엌·카페" 톤에는 임상 산세리프보다 **에디토리얼 세리프**가 맞음 |

---

## 확인 실패 목록 (추측으로 채우지 않은 항목)

- 세 앱 모두 **공식 브랜드 가이드의 hex 토큰** — 본 문서 hex는 스크린샷 픽셀 추출값
- 세 앱 모두 **정확한 폰트 이름**
- **Cara Care의 브리스톨 척도 입력 화면 UI** — 변 트래킹 존재는 확인, 7단계 표현 방식은 미확인
- **Clue의 인앱 온보딩 전문·설정 화면** — 스토어 스크린샷 범위 밖
- **Creative Review 인터뷰 전문** — 유료 구간
- **Ate 구버전(2019~2022)의 인앱 원문 카피 전문** — `on path`/`off path`는 리뷰 인용으로 확인, 나머지 버튼 라벨은 미확인
- **youate.net 게재 리플렉션 프롬프트 원문**(예: "Am I actually hungry, or just bored?") — 비공식 도메인으로 판단, 앱 내 실재 여부 미확인
- **Mobbin 등 UI 패턴 아카이브의 세 앱 등록 여부**
- **BfArM DiGA 등록 페이지 본문** — 브라우저 호환성 차단으로 파싱 실패 (단, 동일 내용의 공식 Intended Use PDF는 원문 확보)
