-- ────────────────────────────────────────────
--  002 — 경고 신호를 spec-04 SF-01 에 맞춘다
--
--  v1 스키마에 지속 발열 · 반복 구토가 빠져 있었다.
--  spec-04 V1-211 의 목록:
--    혈변·흑색변 / 원인불명 체중감소 / 자다가 깰 정도의 야간 증상 /
--    지속 발열 / 반복 구토 / 빈혈 / 50세 이후 첫 발병
--
--  그리고 V1-213 예외 처리 — "이미 병원에서 확인함" 을 고르면
--  진입은 허용하되 기록은 남긴다.
-- ────────────────────────────────────────────

BEGIN;

ALTER TABLE safety_screenings
    ADD COLUMN IF NOT EXISTS has_fever          BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS has_vomiting       BOOLEAN NOT NULL DEFAULT false,
    -- V1-213 "이미 병원에서 확인했어요"
    ADD COLUMN IF NOT EXISTS cleared_by_doctor  BOOLEAN NOT NULL DEFAULT false,
    -- 어떤 항목이 걸렸는지. 나중에 왜 막았/풀었는지 따질 수 있어야 한다.
    ADD COLUMN IF NOT EXISTS flags              TEXT[] NOT NULL DEFAULT '{}',
    -- 어디서 걸렸나. 'onboarding' = SF-01, 'symptom_log' = SF-03 상시 감시
    ADD COLUMN IF NOT EXISTS trigger_source     TEXT NOT NULL DEFAULT 'onboarding';

-- 가족력은 spec-04 SF-01 목록에 없다.
-- 단독으로 진입을 막을 근거가 없어서 화면에서 뺀다.
ALTER TABLE safety_screenings DROP COLUMN IF EXISTS has_family_history;

-- SF-03 상시 감시. 온보딩을 통과한 뒤에도 차단될 수 있다.
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ;

COMMIT;
