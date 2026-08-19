# DB 스키마 · 백엔드 2인 분담

> 실제 DDL: [`server/db/schema.sql`](../server/db/schema.sql) — 서버 DB에 **적용 완료** (27개 테이블)

---

## 1. 프론트 피그마 대조 결과

프론트 파일 `gnqxEQZbTM2Ykwcelx9LC7` 은 내 디자인 파일의 **복사본 + 확장**이었다.
A1~G 화면 이름·구조가 `spec-04-function-list.md` 와 동일하다. 따라서 **spec-04 는 여전히 유효**하고, 아래만 신규다.

| 신규 화면 | 내용 | spec-04 에 있었나 |
|---|---|---|
| **E0 증상 기록 · 강도 체크** | E1 앞단, 강도 먼저 묻는 단계 | ✗ 신규 |
| **H1 AI와 대화하기** | 챗봇 | dev-01 §9 하네스로만 존재 |
| **H2 대체 레시피** | 재료·분량·TIP | ✗ 신규 |
| **H3 성분 대체 방법** | 우유→락토프리 등 치환표 | ✗ 신규 |
| **H4 음식 기반 대체안** | 양 조절 / 빼기 / 성분 대체 / 메뉴 대체 4갈래 | D3 일부와 중복 |
| **H5 대체 메뉴 제안** | 제육볶음 → 간장덮밥 등 | ✗ 신규 |

→ H 계열 5화면이 통째로 늘었다. 이게 이번 스키마에서 `substitutions` / `recipes` / `menu_alternatives` / `chat_*` 로 들어갔다.

---

## 2. 스키마 설계에서 지킨 것

절대 원칙 4개가 컬럼 수준에 박혀 있다.

| 원칙 | 스키마에 어떻게 반영했나 |
|---|---|
| ① 판정하지 않는다 | `is_trigger`, `is_dangerous` 같은 단정 컬럼 없음. 관찰 횟수만 센다 |
| ② 점수·스트릭 금지 | `total_score`, `streak_days` 없음. 증상은 사용자가 고른 3단계(`symptom_level`) 그대로 |
| ③ 역치는 등급으로 | `challenges.result_grade` 는 `tolerated / reduce_amount / recheck_later` 텍스트. 허용량 g 확정 저장 안 함 |
| ④ 판정은 결정론 코드 | LLM 원문은 `ai_calls` 로만. 판정 컬럼(`safety_screenings.blocked`, `meal_fodmap.grams`)은 코드 계산값만 |

추가로:
- **데이터 규칙 8** — `my_table_items.source_challenge_id`. 상태는 도전 결과로만 바뀐다. 캐주얼 관찰로는 못 바꾼다
- **RC-03 2단계 기록** — `symptom_logs.resolved_at` 은 NULL 허용. 후속 푸시로 나중에 채운다
- **PR-02c 일정 회피** — `busy_days` 테이블. F3 "일정이 있는 날은 빼뒀어요"
- **전량 로깅** — `ai_calls`, `chat_messages.blocked_reason/retry_count/fell_back`

---

## 3. 백엔드 2인 분담

프론트가 화면을 이미 구현 중이므로, **API 계약을 먼저 못 박고 두 사람이 각자 채우는** 방식으로 간다.

### 가르는 기준

정답이 **데이터에 있는 일** ↔ 정답을 **내가 정해야 하는 일**.

도메인 판단(어떤 패턴을 언제 말할지, 도전을 어떻게 판정할지, 챗봇을 어디서 막을지)은 문서에만 근거가 있고 틀리면 안전 문제가 된다. 그건 내가 한다.

### 협업자 (B) — 데이터와 CRUD

| # | 일 | 테이블 | 화면 |
|---|---|---|---|
| B-1 | **재료·FODMAP 마스터 시딩** ★최우선 | `ingredients`, `ingredient_fodmap`, `foods`, `food_ingredients` | 전부의 뿌리 |
| B-2 | 온보딩 API | `users`, `user_allergies`, `baseline_symptoms` | B2~B6 |
| B-3 | 식사 기록 CRUD | `meals`, `meal_ingredients` | D1·D2·D4 |
| B-4 | 사진→재료 식별 API | `ai_calls` | D1 사진 입력 |
| B-5 | 증상 기록 CRUD | `symptom_logs`, `symptom_details`, `symptom_contexts` | E0~E2 |
| B-6 | 대체안 마스터 + 조회 API | `substitutions`, `recipes`, `recipe_items`, `menu_alternatives`, `saved_recommendations` | H2·H3·H5 |
| B-7 | 나의 식탁 **조회** API | `my_table_items` (읽기만) | G |

**B-1 을 첫날에 끝내야 한다.** 이게 없으면 내가 계산 로직을 못 짠다.
범위는 크게 잡지 말 것 — 한국인 상위 재료 60~80종이면 프로토타입에 충분하다.
양파·마늘이 한국인 프럭탄 섭취의 약 70%(Na & Sohn 2023)라 이 둘은 반드시 정확해야 한다.

B-4(사진→재료)는 AI지만 **판정이 아니라 입력**이라 넘겨도 된다(원칙 ④). 단 조건:
Pydantic 구조화 출력 + instructor 재시도, 출력은 `ingredients.aliases` 에 매칭되는 것만 통과.
**모르는 재료를 지어내면 버린다.**

### 나 (A) — 판정과 안전

| # | 일 | 테이블 | 화면 |
|---|---|---|---|
| A-1 | 스키마·마이그레이션·공통 세팅 | 전부 | — |
| A-2 | 레드플래그 차단 로직 | `safety_screenings` | B1 / B1x |
| A-3 | 6축 섭취량 계산 + 감쇠 곡선 | `meal_fodmap` | 내부 |
| A-4 | 패턴 분석 + 교란 요인 병기 문구 | 읽기 전용 | E3 |
| A-5 | 도전 상태머신 + 2-of-3 판정 | `challenges`, `challenge_attempts`, `busy_days` | F1~F4 |
| A-6 | 나의 식탁 **상태 전이** | `my_table_items` (쓰기) | G |
| A-7 | 챗봇 3층 하네스 | `chat_*`, `ai_calls` | H1 |
| A-8 | 홈 조립 + 알림 스케줄 | `notifications` | C |

### 충돌 안 나게 하는 규칙

- `my_table_items` 는 **B가 읽고 A가 쓴다.** 협업자는 UPDATE 하지 않는다
- **DB는 서버 하나를 공유한다.** `DROP`/`TRUNCATE` 는 하기 전에 반드시 팀 채팅에 먼저 말한다
- 스키마 변경은 A만. 필요하면 요청한다 (`schema.sql` 은 A가 단독 관리)
- 파일도 겹치지 않게: `routes/foods.py`·`routes/symptoms.py`·`routes/subs.py` = B / `services/` 전부 = A

---

## 4. 다음 순서

1. API 계약 확정 → 프론트에 전달 (엔드포인트·요청/응답 JSON)
2. B-1 마스터 시딩 (협업자, 최우선)
3. A-1 SQLAlchemy 모델 + FastAPI 골격
4. 온보딩 → 식사기록 → 증상기록 순으로 세로로 뚫기 (한 흐름씩 끝까지)
5. 그 다음 도전(F), 챗봇(H1)

---

## 5. 미결

- `foods` 마스터를 어디까지 채울지 — 사용자가 직접 입력한 음식은 `food_id NULL` 로 두고 있다. 재료만 있으면 계산은 되지만, H5 대체 메뉴는 `food_id` 가 있어야 뜬다
- E0 강도 체크와 E1 증상별 강도가 중복인지 — 프론트 E0 텍스트가 아직 플레이스홀더("값 1"~"값 9")라 확정 못 함. 프론트에 확인 필요
- 로그인 없이 `device_id` 로 가는 중. 기기 바꾸면 데이터가 날아간다 (해커톤 범위에서는 수용)
