-- ════════════════════════════════════════════════════════════
--  MORU DB 스키마 v1
--  PostgreSQL 14+
--
--  근거: 프론트 피그마 gnqxEQZbTM2Ykwcelx9LC7 의 화면 A1~H5
--        + docs/spec-04-function-list.md
--
--  설계 원칙 (docs/README.md 절대 원칙 4개)
--   ① 판정하지 않는다   → 어떤 테이블에도 is_trigger / is_dangerous 같은
--                        단정 컬럼을 두지 않는다. 관찰 횟수만 센다.
--   ② 점수·스트릭 금지  → total_score, streak_days 같은 컬럼 금지.
--                        증상 강도는 사용자가 고른 3단계 그대로만 저장.
--   ③ 역치는 등급으로   → challenges.result_grade 는 텍스트 등급.
--                        허용량을 g 숫자로 확정 저장하지 않는다.
--   ④ 판정은 결정론 코드 → LLM 출력은 ai_calls 에 원문 로깅하고,
--                        판정 결과 컬럼에는 코드 계산값만 들어간다.
-- ════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────
-- ENUM
-- ─────────────────────────────────────────────
CREATE TYPE fodmap_axis        AS ENUM ('fructan','gos','lactose','fructose','sorbitol','mannitol');
CREATE TYPE portion_size       AS ENUM ('half','one','one_and_half_plus');   -- D2 반 / 한 그릇 / 한 그릇 반 이상
CREATE TYPE symptom_level      AS ENUM ('none','mild','strong');             -- E1 없음 / 조금 / 많이
CREATE TYPE symptom_onset      AS ENUM ('just_now','about_1h','since_morning','since_yesterday');
CREATE TYPE symptom_location   AS ENUM ('upper','lower');                    -- E1 윗배 / 아랫배
CREATE TYPE table_status       AS ENUM ('safe','candidate','to_try','avoiding');  -- G 나의 식탁 4구획
CREATE TYPE challenge_status   AS ENUM ('proposed','eliminating','testing','done','abandoned');
CREATE TYPE attempt_result     AS ENUM ('pending','reaction','no_reaction','skipped');
CREATE TYPE chat_role          AS ENUM ('user','assistant');
CREATE TYPE input_method       AS ENUM ('photo','text','search');            -- D1 입력 방식


-- ═══════════════════════════════════════════
--  1. 사용자 · 온보딩   (화면 A1, B1~B6)
-- ═══════════════════════════════════════════

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    device_id       TEXT UNIQUE NOT NULL,       -- 해커톤: 로그인 없이 기기 식별
    nickname        TEXT,                       -- C 홈 "안녕하세요, 은솔님"
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    onboarded_at    TIMESTAMPTZ                 -- B6 완료 시각. NULL 이면 온보딩 미완료
);

-- B1 안전 확인. 레드플래그가 하나라도 있으면 B1x(차단 화면)로 보낸다.
-- ※ 판정은 코드가 한다. AI 절대 금지 (원칙 ④)
CREATE TABLE safety_screenings (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    has_blood_in_stool  BOOLEAN NOT NULL DEFAULT false,
    has_weight_loss     BOOLEAN NOT NULL DEFAULT false,
    has_anemia          BOOLEAN NOT NULL DEFAULT false,
    has_night_symptoms  BOOLEAN NOT NULL DEFAULT false,
    has_family_history  BOOLEAN NOT NULL DEFAULT false,
    age_over_50         BOOLEAN NOT NULL DEFAULT false,
    blocked             BOOLEAN NOT NULL,       -- 코드가 계산해 넣는다
    screened_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON safety_screenings (user_id, screened_at DESC);

-- B2 알레르기 + 셀리악
-- 알레르기 항목은 "양과 무관하게 제외" — 도전 제안에서 영구 배제된다.
CREATE TABLE user_allergies (
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label           TEXT   NOT NULL,            -- '우유','계란','땅콩',... '기타'는 자유 입력
    PRIMARY KEY (user_id, label)
);

ALTER TABLE users ADD COLUMN celiac TEXT
    CHECK (celiac IN ('yes','no','unknown'));   -- B2. 'yes' 면 밀 영구 제외

-- B4 초기 증상 문진. "나중에 얼마나 나아졌는지" 비교 기준선.
CREATE TABLE baseline_symptoms (
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label           TEXT   NOT NULL,            -- '복통','복부팽만','가스','설사','변비',...
    PRIMARY KEY (user_id, label)
);
ALTER TABLE users ADD COLUMN baseline_frequency TEXT
    CHECK (baseline_frequency IN ('rare','monthly_1_2','weekly_few','weekly_1_2','almost_daily','weekly_3plus'));


-- ═══════════════════════════════════════════
--  2. 마스터 데이터   (재료 · FODMAP · 음식)
--     ★ 이 두 테이블이 앱 전체의 뿌리다. 가장 먼저 채워야 한다.
-- ═══════════════════════════════════════════

CREATE TABLE ingredients (
    id              BIGSERIAL PRIMARY KEY,
    name            TEXT UNIQUE NOT NULL,       -- '양파','마늘','우유','밀'
    aliases         TEXT[] NOT NULL DEFAULT '{}',  -- AI 재료 식별 결과를 여기에 매칭
    category        TEXT                        -- '채소','유제품','곡물'
);

-- 6축 함량. 단위는 g / 100g.
-- 값이 없으면 행을 만들지 않는다. 0 과 미상은 다르다.
CREATE TABLE ingredient_fodmap (
    ingredient_id   BIGINT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    axis            fodmap_axis NOT NULL,
    grams_per_100g  NUMERIC(6,3) NOT NULL CHECK (grams_per_100g >= 0),
    source          TEXT,                       -- 'Monash','Na&Sohn2023','추정'
    PRIMARY KEY (ingredient_id, axis)
);

-- 음식(요리) 마스터. '김치찌개' 같은 것.
CREATE TABLE foods (
    id              BIGSERIAL PRIMARY KEY,
    name            TEXT UNIQUE NOT NULL,
    typical_grams   NUMERIC(7,2),               -- 1인분 기준 중량
    has_broth       BOOLEAN NOT NULL DEFAULT false
);

-- 기본 레시피. D2 에서 사용자에게 미리 체크된 상태로 보여줄 재료들.
CREATE TABLE food_ingredients (
    food_id         BIGINT NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
    ingredient_id   BIGINT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    grams           NUMERIC(7,2),               -- 1인분당
    in_broth        BOOLEAN NOT NULL DEFAULT false,  -- D2 "국물도 드셨나요?" 와 연동
    PRIMARY KEY (food_id, ingredient_id)
);


-- ═══════════════════════════════════════════
--  3. 식사 기록   (화면 D1~D4, H4)
-- ═══════════════════════════════════════════

CREATE TABLE meals (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food_id         BIGINT REFERENCES foods(id),  -- 마스터에 없으면 NULL
    food_name       TEXT NOT NULL,                -- 사용자에게 보이는 이름
    eaten_at        TIMESTAMPTZ NOT NULL,
    portion         portion_size NOT NULL,
    ate_broth       BOOLEAN,                      -- 국물 요리가 아니면 NULL
    method          input_method NOT NULL,
    photo_path      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON meals (user_id, eaten_at DESC);

-- D2 에서 사용자가 최종 확정한 재료. AI 가 뽑은 것과 다를 수 있다.
CREATE TABLE meal_ingredients (
    meal_id         BIGINT NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    ingredient_id   BIGINT NOT NULL REFERENCES ingredients(id),
    added_by_user   BOOLEAN NOT NULL DEFAULT false,  -- '+ 직접 추가'
    PRIMARY KEY (meal_id, ingredient_id)
);

-- 결정론 코드가 계산한 식사 1건의 6축 섭취 추정량.
-- LLM 은 재료 목록까지만 관여하고, 이 숫자는 코드가 만든다. (원칙 ④)
CREATE TABLE meal_fodmap (
    meal_id         BIGINT NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    axis            fodmap_axis NOT NULL,
    grams           NUMERIC(7,3) NOT NULL,
    PRIMARY KEY (meal_id, axis)
);


-- ═══════════════════════════════════════════
--  4. 증상 기록   (화면 E0~E2)
-- ═══════════════════════════════════════════

CREATE TABLE symptom_logs (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    logged_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    onset           symptom_onset NOT NULL,       -- E1 "언제부터 그러셨어요?"
    onset_at        TIMESTAMPTZ NOT NULL,         -- onset 을 코드가 실제 시각으로 환산
    location        symptom_location,             -- E1 윗배 / 아랫배
    resolved_at     TIMESTAMPTZ,                  -- RC-03 2단계: 후속 푸시로 나중에 채운다
    blood_in_stool  BOOLEAN NOT NULL DEFAULT false  -- true 면 즉시 B1x 병원 안내
);
CREATE INDEX ON symptom_logs (user_id, onset_at DESC);

-- 증상 종류별 강도. E1 은 여러 개를 동시에 고를 수 있다.
CREATE TABLE symptom_details (
    symptom_log_id  BIGINT NOT NULL REFERENCES symptom_logs(id) ON DELETE CASCADE,
    kind            TEXT   NOT NULL,              -- '배가 빵빵함','쥐어짜는 통증','급하게 화장실'
    level           symptom_level NOT NULL,
    PRIMARY KEY (symptom_log_id, kind)
);

-- E2 교란 요인. 이게 있어야 E3 에서 "음식 때문인지 그날 상황 때문인지" 를 말할 수 있다.
CREATE TABLE symptom_contexts (
    symptom_log_id  BIGINT NOT NULL REFERENCES symptom_logs(id) ON DELETE CASCADE,
    factor          TEXT NOT NULL,                -- 'short_sleep','high_stress','overeating',
                                                  -- 'alcohol','menstruation','none'
    PRIMARY KEY (symptom_log_id, factor)
);


-- ═══════════════════════════════════════════
--  5. 도전   (화면 F1~F4)
--     분산 반복 단회 도전 + 2-of-3 재현 판정
-- ═══════════════════════════════════════════

CREATE TABLE challenges (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ingredient_id       BIGINT NOT NULL REFERENCES ingredients(id),
    status              challenge_status NOT NULL DEFAULT 'proposed',
    reason_text         TEXT,                     -- F1 "왜 제안하냐면" — 코드가 생성한 문장
    elimination_days    SMALLINT CHECK (elimination_days IN (3,7)),  -- F2
    eliminate_start     DATE,
    testing_start       DATE,
    -- ★ 원칙 ③: 허용량을 g 로 확정하지 않는다. 등급 텍스트만.
    result_grade        TEXT CHECK (result_grade IN
                          ('tolerated','reduce_amount','recheck_later')),
    finished_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON challenges (user_id, status);

-- 3회 시도. 연속일 필요 없다 (분산 반복).
CREATE TABLE challenge_attempts (
    id              BIGSERIAL PRIMARY KEY,
    challenge_id    BIGINT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    seq             SMALLINT NOT NULL CHECK (seq BETWEEN 1 AND 3),
    scheduled_date  DATE,                         -- F3 "이번 주 가능한 날"
    tested_at       TIMESTAMPTZ,
    result          attempt_result NOT NULL DEFAULT 'pending',
    meal_id         BIGINT REFERENCES meals(id),  -- 그날 먹은 기록과 연결
    symptom_log_id  BIGINT REFERENCES symptom_logs(id),
    UNIQUE (challenge_id, seq)
);

-- F3 "일정이 있는 날은 빼뒀어요" — PR-02c 일정 회피 배치
CREATE TABLE busy_days (
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day             DATE   NOT NULL,
    PRIMARY KEY (user_id, day)
);


-- ═══════════════════════════════════════════
--  6. 나의 식탁   (화면 G)
--     B3 "피하는 음식" 이 여기 avoiding 으로 들어와 시작한다.
-- ═══════════════════════════════════════════

CREATE TABLE my_table_items (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ingredient_id   BIGINT REFERENCES ingredients(id),
    label           TEXT NOT NULL,                -- 마스터에 없는 '매운 음식' 같은 것도 담는다
    status          table_status NOT NULL,
    note            TEXT,                         -- G "3번 중 2번 반응" / "양을 줄여보세요"
    -- ★ 상태는 도전 결과로만 바뀐다. 캐주얼 관찰은 제안 우선순위에만. (데이터 규칙 8)
    source_challenge_id BIGINT REFERENCES challenges(id),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, label)
);
CREATE INDEX ON my_table_items (user_id, status);


-- ═══════════════════════════════════════════
--  7. AI 대화 · 대체안   (화면 H1~H5)
-- ═══════════════════════════════════════════

CREATE TABLE chat_sessions (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE chat_messages (
    id              BIGSERIAL PRIMARY KEY,
    session_id      BIGINT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role            chat_role NOT NULL,
    content         TEXT NOT NULL,
    -- 3층 하네스 흔적 (dev-01 §9). 사후 감사를 위해 전부 남긴다.
    blocked_reason  TEXT,                         -- 1층에서 막혔으면 이유
    llm_called      BOOLEAN NOT NULL DEFAULT false,
    retry_count     SMALLINT NOT NULL DEFAULT 0,  -- 3층 출력 검증 재시도
    fell_back       BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON chat_messages (session_id, created_at);

-- H3 성분 대체 마스터
CREATE TABLE substitutions (
    id              BIGSERIAL PRIMARY KEY,
    ingredient_id   BIGINT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    replacement     TEXT NOT NULL,                -- '락토프리 우유'
    alt_text        TEXT,                         -- '또는 오트우유, 아몬드우유'
    rank            SMALLINT NOT NULL DEFAULT 1
);

-- H2 대체 레시피
CREATE TABLE recipes (
    id              BIGSERIAL PRIMARY KEY,
    title           TEXT NOT NULL,
    servings        TEXT,                         -- '1잔 기준'
    tip             TEXT
);
CREATE TABLE recipe_items (
    recipe_id       BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    seq             SMALLINT NOT NULL,
    name            TEXT NOT NULL,                -- '우유 (또는 락토프리 우유)'
    amount          TEXT,                         -- '150ml'
    optional        BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (recipe_id, seq)
);

-- H5 대체 메뉴
CREATE TABLE menu_alternatives (
    id              BIGSERIAL PRIMARY KEY,
    food_id         BIGINT NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
    alt_name        TEXT NOT NULL,                -- '간장 돼지고기 덮밥'
    why             TEXT,                         -- '양념 자극이 적어요.'
    rank            SMALLINT NOT NULL DEFAULT 1
);

-- G "저장한 추천"
CREATE TABLE saved_recommendations (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind            TEXT NOT NULL CHECK (kind IN ('recipe','substitution','menu')),
    ref_id          BIGINT NOT NULL,
    saved_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ═══════════════════════════════════════════
--  8. 운영 · 감사
-- ═══════════════════════════════════════════

-- 모든 LLM 호출 원문. 하네스가 왜 통과/차단했는지 나중에 따질 수 있어야 한다.
CREATE TABLE ai_calls (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
    purpose         TEXT NOT NULL,                -- 'identify_ingredients','chat','substitute'
    model           TEXT NOT NULL,
    prompt          JSONB NOT NULL,
    raw_response    TEXT,
    parsed_ok       BOOLEAN,
    latency_ms      INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON ai_calls (created_at DESC);

-- AN-02 등 앱이 먼저 말을 거는 알림
CREATE TABLE notifications (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind            TEXT NOT NULL,                -- 'symptom_followup','challenge_reminder','weekly_recap'
    payload         JSONB NOT NULL DEFAULT '{}',
    send_at         TIMESTAMPTZ NOT NULL,
    sent_at         TIMESTAMPTZ,
    opened_at       TIMESTAMPTZ
);
CREATE INDEX ON notifications (send_at) WHERE sent_at IS NULL;

COMMIT;
