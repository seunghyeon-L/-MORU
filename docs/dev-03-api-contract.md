# API 계약 v1

> **프론트가 볼 곳은 여기가 아니라 Swagger 입니다** → `https://1-201-117-54.sslip.io/docs`
> 이 문서는 그 Swagger 를 만들기 위한 백엔드 쪽 합의문입니다.

---

## 0. 공통

**Base URL** `https://1-201-117-54.sslip.io`

**인증** — 해커톤 범위에서는 로그인이 없습니다. 모든 요청에 헤더 하나만 붙입니다.

```
X-Device-Id: <앱이 최초 실행 시 생성해 기기에 저장한 UUID>
```

서버는 이 값으로 `users` 행을 찾거나 없으면 만듭니다. 프론트는 로그인 화면을 만들 필요가 없습니다.

**시각** — 전부 ISO8601 + 타임존 (`2026-08-19T12:30:00+09:00`). 서버는 UTC 로 저장하고 그대로 돌려줍니다.

**에러**

```json
{ "error": { "code": "INGREDIENT_NOT_FOUND", "message": "사용자에게 그대로 보여줘도 되는 한국어 문장" } }
```

`message` 는 **항상 그대로 화면에 띄워도 되는 문장**으로 보냅니다. 프론트가 에러 코드별 문구를 만들지 않게 하기 위해서입니다.

**금지 사항 (프론트 포함)**
서버 응답에 점수·게이지·연속기록 수치는 **없습니다.** 없는 걸 프론트가 만들어내지 않기로 합니다. (절대 원칙 ②)

---

## 1. 온보딩 · 안전  (A1, B1~B6)

### `POST /onboarding/safety` — B1 안전 확인

```json
// 요청
{
  "blood_in_stool": false, "weight_loss": false, "anemia": false,
  "night_symptoms": false, "family_history": false, "age_over_50": false
}
// 응답
{ "blocked": true,
  "title": "먼저 병원에 가보시는 게 좋겠어요",
  "body": "혈변은 앱으로 확인할 수 있는 범위를 넘어서요. 소화기내과 진료를 권해드려요." }
```

`blocked: true` 면 프론트는 **B1x 로 보내고 온보딩을 끝냅니다.** 문구는 서버가 줍니다.
※ 이 판정은 서버의 결정론 코드가 합니다. AI 안 씁니다. (절대 원칙 ④)

### `POST /onboarding/profile` — B2·B3·B4 한 번에

```json
// 요청
{
  "nickname": "은솔",
  "allergies": ["우유","견과류"],
  "celiac": "no",                            // yes | no | unknown
  "avoided_foods": ["우유·유제품","밀·빵","양파","마늘","커피","탄산음료","사과","콩류"],
  "baseline_symptoms": ["복통","복부팽만","가스"],
  "baseline_frequency": "weekly_few"         // rare|monthly_1_2|weekly_few|weekly_1_2|almost_daily|weekly_3plus
}
// 응답
{ "user_id": 1, "onboarded": true }
```

`avoided_foods` 는 그대로 **나의 식탁의 `avoiding` 구획**이 됩니다. G 화면 "피하던 음식 8가지"의 8이 이 배열 길이입니다.

### `GET /me`

```json
{ "user_id": 1, "nickname": "은솔", "onboarded": true, "blocked": false }
```

앱 부팅 시 첫 호출. `onboarded: false` 면 B1 로, `blocked: true` 면 B1x 로.

---

## 2. 홈  (C)

### `GET /home`

```json
{
  "greeting": "안녕하세요, 은솔님",
  "cards": [
    { "type": "challenge_suggestion",
      "title": "양파, 다시 시도해볼 만해요",
      "body": "실제로 시도한 사람의 71%가 그 음식을 되찾았어요.",
      "action": { "label": "시작할게요", "screen": "F1", "challenge_id": null, "ingredient_id": 12 },
      "dismiss": { "label": "나중에" } },

    { "type": "weekly_recap",
      "title": "이번 주 정리해봤어요",
      "body": "과당이 조금 높았어요. 71%가 매일 드시는 오렌지주스에서 왔습니다." },

    { "type": "schedule_note",
      "title": "이번 주는 일정이 여유롭네요",
      "body": "무언가 새로 시도해보기 좋은 때예요." }
  ]
}
```

**카드는 배열입니다. 개수도 순서도 서버가 정합니다.** 프론트는 `type` 별 렌더러만 만들고 반복해서 그립니다.
기록이 없는 신규 사용자는 `cards` 가 빈 배열일 수 있습니다 — **빈 화면 디자인이 필요합니다.**

---

## 3. 식사 기록  (D1~D4, H4)

### `POST /meals/identify` — D1 → D2 사이. AI 재료 식별

`multipart/form-data` 로 사진, 또는 JSON 으로 텍스트.

```json
// 요청 (텍스트)  { "text": "김치찌개" }
// 응답
{
  "food_id": 3,
  "food_name": "김치찌개",
  "has_broth": true,
  "ingredients": [
    { "id": 8,  "name": "김치",     "checked": true },
    { "id": 21, "name": "돼지고기", "checked": true },
    { "id": 12, "name": "양파",     "checked": true }
  ],
  "confidence": "high"          // high | low
}
```

`confidence: "low"` 면 프론트는 D2 상단에 "맞는 재료만 남겨주세요"를 더 강조합니다.
**서버는 마스터에 없는 재료를 지어내지 않습니다.** 못 찾으면 `ingredients: []` 로 오고, 사용자가 직접 추가합니다.

### `POST /meals` — D2 확정 → D4

```json
// 요청
{
  "food_id": 3, "food_name": "김치찌개",
  "eaten_at": "2026-08-19T12:30:00+09:00",
  "portion": "one",                    // half | one | one_and_half_plus
  "ate_broth": true,
  "method": "photo",                   // photo | text | search
  "ingredient_ids": [8, 21, 12, 15],
  "custom_ingredients": ["들깨가루"]     // 마스터에 없는 것. 이름만 저장
}
// 응답
{ "meal_id": 91, "has_insight": true }
```

`has_insight: false` 면 D3 를 건너뛰고 바로 D4(기록 완료)로 갑니다.

### `GET /meals/{id}/insight` — D3 참고 정보와 대체안

```json
{
  "food_name": "김치찌개",
  "note": "국물에 양파즙이 들어있을 수 있어요",
  "observation": {
    "title": "최근 기록을 보면",
    "body": "양파가 들어간 식사 4번 중 3번, 몇 시간 뒤 불편함이 기록됐어요.",
    "caveat": "다만 그중 2번은 수면이 5시간 이하였어요. 음식 때문이라고 단정하기는 일러요."
  },
  "suggestions": [
    { "rank": 1, "title": "소량부터 시도해보기",     "detail": "평소보다 조금만" },
    { "rank": 2, "title": "반 그릇만 드시기",       "detail": "국물은 조금, 건더기 위주로" },
    { "rank": 3, "title": "마늘 빼달라고 요청하기", "detail": "식당에서도 대부분 가능해요" },
    { "rank": 4, "title": "다른 메뉴 골라보기",     "detail": "맑은 국 · 된장찌개" }
  ]
}
```

**`caveat` 은 절대 생략하면 안 됩니다.** 관찰만 보여주고 교란 요인을 같이 안 보여주면 그게 "판정"이 됩니다. (절대 원칙 ①)
`caveat` 이 `null` 인 경우도 있고, 그때만 안 그립니다.

---

## 4. 증상 기록  (E0~E2)

### `POST /symptoms`

```json
// 요청 — E0·E1·E2 를 한 번에 보냅니다
{
  "details": [
    { "kind": "배가 빵빵함",     "level": "strong" },   // none | mild | strong
    { "kind": "쥐어짜는 통증",   "level": "mild" }
  ],
  "onset": "about_1h",              // just_now | about_1h | since_morning | since_yesterday
  "location": "lower",              // upper | lower | null
  "blood_in_stool": false,
  "contexts": ["short_sleep","high_stress"]
    // short_sleep | high_stress | overeating | alcohol | menstruation | none
}
// 응답
{ "symptom_log_id": 44,
  "red_flag": false,
  "followup_at": "2026-08-19T22:00:00+09:00" }
```

`red_flag: true` (혈변 체크) → 프론트는 **저장은 하되 즉시 B1x 병원 안내로 보냅니다.**
`followup_at` — 그때 "이제 좀 괜찮아지셨어요?" 푸시가 갑니다. 프론트는 알림 권한만 받아두면 됩니다.

### `PATCH /symptoms/{id}/resolve` — 후속 푸시를 눌렀을 때

```json
{ "resolved_at": "2026-08-19T22:10:00+09:00" }   →   { "ok": true }
```

**아플 때 기록하고 나을 때는 기록하지 않기 때문에** 2단계로 나눈 것입니다. 한 화면에서 다 묻지 않습니다.

---

## 5. 패턴  (E3)

### `GET /patterns`

```json
{
  "headline": "지금까지 기록을 모아봤어요",
  "summary": "양파가 들어간 식사 4번 중 3번, 몇 시간 뒤 불편함이 있었어요.",
  "timeline": [
    { "time": "12:30", "meal": "점심", "food": "김치찌개", "ago": "8시간 전", "phase": "발효 시점" },
    { "time": "19:40", "meal": "저녁", "food": "떡볶이",   "ago": "1시간 전", "phase": "아직 도착 전" }
  ],
  "cofactors": [
    { "label": "수면 5시간 이하", "count": 2 },
    { "label": "스트레스 높음",   "count": 1 }
  ],
  "verdict": {
    "title": "음식 때문인지는 아직 알 수 없어요",
    "body": "수면이 겹친 날이 많아서, 지금 단정하기는 일러요. 정확히 알아보고 싶으시면 도와드릴게요.",
    "action": { "label": "확인해보기", "screen": "F1", "ingredient_id": 12 }
  }
}
```

`verdict.title` 은 **항상 유보형입니다.** "양파가 원인입니다" 같은 문장은 서버가 절대 만들지 않습니다.
기록이 적으면 `summary: null`, `timeline: []` 이 옵니다 — 빈 상태 처리 필요.

---

## 6. 도전  (F1~F4)

### `GET /challenges/suggestion` — F1

```json
{
  "ingredient_id": 12, "ingredient_name": "양파",
  "title": "양파, 다시 시도해볼까요?",
  "reason": { "title": "왜 제안하냐면",
              "body": "양파가 든 식사 4번 중 3번 불편하셨는데, 그중 2번은 수면 부족이 겹쳐 있었어요. 지금으로는 확실하지 않아요." },
  "steps": [
    { "seq": 1, "title": "며칠간 양파만 빼두기",   "detail": "다른 음식은 평소대로 드셔도 돼요" },
    { "seq": 2, "title": "편한 날 하루, 평소만큼", "detail": "연속으로 안 해도 괜찮아요" },
    { "seq": 3, "title": "이걸 세 번 반복",        "detail": "한 번으론 알 수 없거든요" }
  ],
  "evidence": { "figure": "71%", "text": "실제로 시도한 사람이 그 음식을 되찾았어요" }
}
```

제안할 게 없으면 `204 No Content`. 알레르기·셀리악 항목은 **절대 제안에 나오지 않습니다.**

### `POST /challenges` — F2 제한 설정 확정

```json
// 요청  { "ingredient_id": 12, "elimination_days": 3 }     // 3 | 7
// 응답
{ "challenge_id": 7,
  "status": "eliminating",
  "eliminate_until": "2026-08-22",
  "contains": ["김치찌개","제육볶음","카레","샌드위치","샐러드"] }
```

`contains` 가 F2 하단 "이런 음식에 양파가 들어있어요".

### `GET /challenges/{id}` — F3 진행

```json
{
  "challenge_id": 7, "ingredient_name": "양파",
  "status": "testing",
  "current_seq": 2,
  "instruction": "이번 주 아무 날 하루, 양파를 평소만큼 드셔보세요",
  "note": "연속으로 하지 않아도 돼요. 편한 날 하루면 됩니다.",
  "available_days": ["2026-08-20","2026-08-21","2026-08-24"],
  "excluded_note": "일정이 있는 날은 빼뒀어요.",
  "attempts": [
    { "seq": 1, "status": "done",     "label": "불편함이 있었어요" },
    { "seq": 2, "status": "current",  "label": "이번 주" },
    { "seq": 3, "status": "upcoming", "label": "다음 주" }
  ],
  "reassurance": "증상이 나더라도 장에 손상이 가지는 않아요. 편하게 시도해보세요."
}
```

`available_days` 는 서버가 `busy_days` 를 빼고 계산합니다. 프론트는 준 날짜만 활성화합니다.

### `POST /challenges/{id}/attempts/{seq}`

```json
// 요청  { "result": "reaction", "tested_at": "2026-08-20T19:00:00+09:00" }
//        result: reaction | no_reaction | skipped
// 응답  { "ok": true, "next_seq": 3, "finished": false }
```

`finished: true` 면 F4 로 이동합니다.

### `GET /challenges/{id}/result` — F4

```json
{
  "ratio": "2/3",
  "headline": "양파, 세 번 중 두 번 반응이 있었어요",
  "attempts": [
    { "seq": 1, "date": "8월 1일",  "label": "불편함 있었어요" },
    { "seq": 2, "date": "8월 5일",  "label": "괜찮았어요" },
    { "seq": 3, "date": "8월 16일", "label": "불편함 있었어요" }
  ],
  "grade": "reduce_amount",          // tolerated | reduce_amount | recheck_later
  "grade_label": "확정은 아니에요",
  "body": "\"확인된 후보\"로 저장할게요. 시간이 지나면 달라질 수 있어서, 나중에 더 적은 양으로 다시 해볼 수 있어요."
}
```

**`grade` 는 등급 문자열입니다. 허용량을 g 숫자로 주지 않습니다.** 재현성이 낮아서(ICC 0.70, 1년에 29% 역전) 숫자로 보여주면 거짓 확신을 줍니다. (절대 원칙 ③)

### `POST /challenges/{id}/save` — "나의 식탁에 저장하기"

```json
{ "ok": true, "moved_to": "candidate" }
```

---

## 7. 나의 식탁  (G)

### `GET /mytable`

```json
{
  "headline": "처음보다 6가지를 되찾았어요",
  "sub": "피하던 음식 8가지 중 6가지를 다시 드실 수 있게 됐어요.",
  "sections": [
    { "status": "safe", "title": "안심하고 먹는 음식",
      "items": [ { "id": 1, "label": "우유" }, { "id": 2, "label": "밀빵" } ] },
    { "status": "candidate", "title": "확인된 후보",
      "items": [ { "id": 5, "label": "양파", "note": "3번 중 2번 반응", "hint": "양을 줄여보세요" } ] },
    { "status": "to_try", "title": "다시 먹어볼 음식",
      "items": [ { "id": 6, "label": "마늘", "note": "아직 확인 전",
                   "action": { "label": "확인해보기", "screen": "F1", "ingredient_id": 13 } } ] }
  ],
  "saved_recommendations": [
    { "kind": "recipe", "ref_id": 3, "title": "속 편한 녹차라떼" }
  ]
}
```

**`headline` 의 "6가지"는 서버가 셉니다.** 이건 원칙 ② 의 "점수"가 아니라 되찾은 개수라 괜찮습니다 — 제한이 아니라 확장을 세기 때문입니다. 프론트는 이 수치를 **게이지나 진행 바로 그리지 않습니다.** 문장으로만 씁니다.

---

## 8. AI · 대체안  (H1~H5)

### `POST /chat/messages` — H1

```json
// 요청  { "session_id": null, "text": "제육볶음 먹어도 될까요?" }
// 응답
{ "session_id": 4,
  "reply": "지난 기록에서 제육볶음은 3번 중 1번 불편함이 있었어요. 마늘을 빼고 드셔보시는 건 어떨까요?",
  "blocked": false,
  "suggestions": [ { "label": "대체안 보기", "screen": "H4", "food_id": 9 } ] }
```

의료 질문이 오면:

```json
{ "session_id": 4,
  "reply": "그건 제가 답할 수 있는 범위를 넘어서요. 소화기내과에서 진료받아보시길 권해드려요.",
  "blocked": true, "block_reason": "medical_question", "suggestions": [] }
```

**`blocked: true` 일 때 프론트는 답변을 그대로 띄우고 후속 입력을 막지 않습니다.** 서버가 알아서 계속 막습니다.
LLM 은 사용자 기록과 계산 결과만 압니다. 일반 의학 지식으로는 답하지 않습니다. (dev-01 §9 3층 하네스)

### `GET /foods/{food_id}/alternatives` — H4

```json
{
  "food_name": "제육볶음",
  "ingredients": ["돼지고기","양파","마늘","고추장","설탕","참기름"],
  "options": [
    { "kind": "portion",  "title": "양 조절",       "detail": "1/2인 또는 고기 양을 줄여보세요." },
    { "kind": "omit",     "title": "빼서 먹기",     "detail": "마늘, 양파(양념)를 빼거나 줄여보세요." },
    { "kind": "substitute","title": "대체 성분 제안","detail": "더 편안할 수 있는 재료로 바꿔보세요.", "screen": "H3" },
    { "kind": "menu",     "title": "대체 메뉴 제안", "detail": "비슷한 맛의 다른 메뉴를 찾아드릴게요.", "screen": "H5" }
  ]
}
```

### `GET /foods/{food_id}/menu-alternatives` — H5

```json
{ "headline": "제육볶음 대신 이런 메뉴는 어떠세요?",
  "items": [ { "name": "간장 돼지고기 덮밥", "why": "양념 자극이 적어요." },
             { "name": "두부 간장 덮밥",     "why": "식물성 단백질로 편안하게." } ],
  "has_more": true }
```

### `GET /substitutions?ingredient_ids=12,15` — H3

```json
{ "intro": "이렇게 바꿔보세요",
  "groups": [
    { "ingredient": "우유", "replacement": "락토프리 우유", "alt": "또는 오트우유, 아몬드우유" },
    { "ingredient": "설탕", "replacement": "알룰로스, 스테비아", "alt": "또는 꿀 소량" }
  ],
  "tips": [
    { "seq": 1, "title": "양을 줄여서 시작하기", "detail": "소량으로 먼저 시도해보세요." },
    { "seq": 2, "title": "공복은 피하기",       "detail": "식사 후 또는 간식과 함께 드세요." }
  ] }
```

### `GET /recipes/{id}` — H2

```json
{ "title": "속 편한 녹차라떼 레시피", "servings": "1잔 기준",
  "items": [ { "name": "우유 (또는 락토프리 우유)", "amount": "150ml", "optional": false },
             { "name": "알룰로스", "amount": "1 tsp", "optional": true } ],
  "tip": "..." }
```

### `POST /saved` — 추천 저장

```json
{ "kind": "recipe", "ref_id": 3 }   →   { "ok": true }
```

---

## 9. 프론트가 지금 알아야 할 것

1. **헤더 `X-Device-Id` 하나만 붙이면 됩니다.** 로그인 화면 없음
2. **모든 문구는 서버가 줍니다.** 화면에 하드코딩된 한국어 문장은 최소로 — 문구가 자주 바뀝니다
3. **빈 상태를 반드시 그려야 합니다.** `/home` 의 `cards: []`, `/patterns` 의 `summary: null`, `/challenges/suggestion` 의 `204`
4. **`caveat`·`reassurance` 필드는 있으면 무조건 그립니다.** 안전 장치라 생략하면 안 됩니다
5. **점수·게이지·진행 바 금지.** 서버가 수치를 주는 곳(`ratio: "2/3"`, "6가지")도 문장으로만 씁니다

---

## 10. 확정 필요

- **E0** 강도 체크가 E1 의 증상별 강도와 중복인지. 피그마 텍스트가 아직 "값 1~9" 플레이스홀더라 판단 불가 → 프론트 확인 요청
- H4 의 `food_id` — 사용자가 직접 입력한 음식은 마스터에 없어 `food_id` 가 없습니다. 그 경우 H4/H5 를 어떻게 할지 (재료 기반으로만 대체안을 줄지)
