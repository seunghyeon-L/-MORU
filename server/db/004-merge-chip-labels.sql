-- ────────────────────────────────────────────
--  004 — B3 칩 라벨을 재료의 별칭으로 흡수
--
--  왜 필요한가
--    B3 온보딩 화면의 칩은 "우유·유제품", "밀·빵" 처럼 **묶음 이름**이다.
--    사용자에게 보여주기 좋은 말이지 재료 이름이 아니다.
--
--    내가 dev-fixtures.sql 에서 이 칩 라벨을 그대로 ingredients 에 넣어뒀는데,
--    B-1 시딩이 "우유", "밀" 을 제대로 넣으면서 둘이 따로 남았다.
--    칩 라벨 쪽에는 FODMAP 값이 없어서, 사용자가 "우유·유제품" 을 고르면
--    함량이 0 인 껍데기에 연결된다. 계산이 조용히 틀린다.
--
--  어떻게 고치나
--    ingredients.aliases 가 이미 이런 용도로 있다.
--    칩 라벨을 진짜 재료의 별칭으로 옮기고 껍데기 행을 지운다.
-- ────────────────────────────────────────────

BEGIN;

DO $$
DECLARE
    pair   TEXT[];
    dup_id BIGINT;
    real_id BIGINT;
BEGIN
    FOREACH pair SLICE 1 IN ARRAY ARRAY[
        ARRAY['우유·유제품', '우유'],
        ARRAY['밀·빵',       '밀'],
        ARRAY['빵·과자',     '빵'],
        ARRAY['사과·배',     '사과'],
        ARRAY['꿀·시럽',     '꿀'],
        ARRAY['콩류',        '콩']
    ] LOOP
        SELECT id INTO dup_id  FROM ingredients WHERE name = pair[1];
        SELECT id INTO real_id FROM ingredients WHERE name = pair[2];

        -- 둘 중 하나라도 없으면 건너뛴다
        CONTINUE WHEN dup_id IS NULL OR real_id IS NULL;

        -- 칩 라벨을 진짜 재료의 별칭으로
        UPDATE ingredients
           SET aliases = (SELECT ARRAY(SELECT DISTINCT unnest(aliases || pair[1])))
         WHERE id = real_id;

        -- 껍데기를 참조하던 곳을 진짜 재료로 옮긴다
        UPDATE my_table_items SET ingredient_id = real_id WHERE ingredient_id = dup_id;
        UPDATE challenges     SET ingredient_id = real_id WHERE ingredient_id = dup_id;
        UPDATE meal_ingredients SET ingredient_id = real_id WHERE ingredient_id = dup_id;

        DELETE FROM ingredients WHERE id = dup_id;
    END LOOP;
END $$;

-- 별칭으로도 빠르게 찾을 수 있게
CREATE INDEX IF NOT EXISTS ingredients_aliases_idx ON ingredients USING GIN (aliases);

COMMIT;
