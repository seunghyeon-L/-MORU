"""B-1 마스터 데이터 시딩 — 재료 · FODMAP · 음식 · 기본 레시피

담당: 협업자 (B-1) — 앱 전체의 뿌리. 가장 먼저 채운다.

실행:
    (venv 활성화 + db-tunnel.bat 켜둔 상태에서)
    python db/seed_master.py

성질:
    - 재실행해도 안전하다 (ON CONFLICT). 기존 값은 최신 값으로 갱신된다.
    - DROP/TRUNCATE 하지 않는다. 공유 DB 라 순수 추가/갱신만 한다.

FODMAP 수치에 대하여:
    단위는 g / 100g. 값이 없으면 행을 만들지 않는다 (0 과 미상은 다르다 — 스키마 주석).
    프로토타입용 문헌 기반 근사치다. 정밀값은 Monash FODMAP 앱이 유료로만 공개해
    공개 출처로 확정할 수 없다. source 컬럼에 근거를 정직하게 남긴다.
    ★ 양파·마늘은 한국인 프럭탄 섭취의 큰 몫이라 상대 크기(마늘 >> 양파)를 반드시 지킨다.
    운영 전에는 Monash 앱 수치로 검증할 것.
"""

import os

import psycopg2
from dotenv import load_dotenv
from psycopg2.extras import execute_values

load_dotenv()


# ─────────────────────────────────────────────
#  재료 마스터
#  (name, [aliases], category, {axis: (grams_per_100g, source)})
#  FODMAP 6축: fructan / gos / lactose / fructose / sorbitol / mannitol
#  값이 의미 있는(>0) 재료만 fodmap 을 채운다. 나머지는 저 FODMAP 로 본다.
# ─────────────────────────────────────────────

INGREDIENTS = [
    # ── 채소 (프럭탄 주요 공급원) ──
    ("양파",   ["양파즙", "다진양파"],       "채소", {"fructan": (2.5, "Biesiekierski2011(추정)")}),
    ("마늘",   ["다진마늘", "마늘즙"],        "채소", {"fructan": (12.5, "Biesiekierski2011(추정)")}),
    ("대파",   ["파", "쪽파", "실파"],        "채소", {"fructan": (1.5, "추정")}),
    ("부추",   ["정구지"],                    "채소", {"fructan": (1.5, "추정")}),
    ("양배추", ["양배추채"],                  "채소", {"sorbitol": (0.2, "추정")}),
    ("배추",   ["알배추", "얼갈이"],          "채소", {}),
    ("브로콜리", [],                          "채소", {"fructan": (0.4, "추정"), "mannitol": (0.6, "추정")}),
    ("콜리플라워", ["컬리플라워"],            "채소", {"mannitol": (2.5, "Monash(추정)")}),
    ("버섯",   ["표고", "느타리", "팽이버섯", "양송이"], "채소", {"mannitol": (1.5, "Monash(추정)")}),
    ("애호박", ["호박"],                      "채소", {}),
    ("오이",   [],                            "채소", {}),
    ("당근",   [],                            "채소", {}),
    ("감자",   [],                            "채소", {}),
    ("고구마", [],                            "채소", {"mannitol": (0.3, "추정")}),
    ("토마토", ["방울토마토"],                "채소", {"fructose": (0.3, "추정")}),
    ("가지",   [],                            "채소", {}),
    ("시금치", [],                            "채소", {}),
    ("상추",   ["양상추", "로메인"],          "채소", {}),
    ("깻잎",   [],                            "채소", {}),
    ("고추",   ["청양고추", "풋고추"],        "채소", {}),
    ("파프리카", ["피망", "벨페퍼"],          "채소", {}),
    ("무",     ["무우", "알타리"],            "채소", {}),
    ("콩나물", [],                            "채소", {}),
    ("숙주",   ["숙주나물"],                  "채소", {}),
    ("아스파라거스", [],                      "채소", {"fructan": (2.0, "추정"), "fructose": (1.0, "추정")}),

    # ── 과일 ──
    ("사과",   [],                            "과일", {"fructose": (0.5, "Monash(추정)"), "sorbitol": (0.5, "Monash(추정)")}),
    ("배",     ["배즙"],                      "과일", {"fructose": (1.0, "Monash(추정)"), "sorbitol": (1.6, "Monash(추정)")}),
    ("수박",   [],                            "과일", {"fructan": (0.3, "추정"), "fructose": (0.5, "추정"), "mannitol": (0.4, "추정")}),
    ("포도",   [],                            "과일", {}),
    ("바나나", [],                            "과일", {"fructan": (0.3, "추정")}),
    ("딸기",   [],                            "과일", {}),
    ("복숭아", [],                            "과일", {"sorbitol": (0.9, "Monash(추정)")}),
    ("자두",   [],                            "과일", {"sorbitol": (1.4, "Monash(추정)")}),
    ("감",     ["단감", "홍시"],              "과일", {"fructan": (0.4, "추정")}),
    ("참외",   [],                            "과일", {}),
    ("오렌지", [],                            "과일", {}),
    ("귤",     ["감귤", "밀감"],              "과일", {}),
    ("망고",   [],                            "과일", {"fructose": (2.9, "Monash(추정)")}),

    # ── 곡물 ──
    ("밀",     ["밀가루", "면", "국수"],      "곡물", {"fructan": (1.4, "Biesiekierski2011(추정)")}),
    ("빵",     ["식빵", "바게트"],            "곡물", {"fructan": (0.9, "추정")}),
    ("보리",   ["보리밥"],                    "곡물", {"fructan": (2.2, "추정"), "gos": (0.5, "추정")}),
    ("쌀",     ["밥", "쌀밥"],                "곡물", {}),
    ("라면",   ["라면사리"],                  "곡물", {"fructan": (1.0, "추정")}),

    # ── 유제품 ──
    ("우유",   ["생우유", "흰우유"],          "유제품", {"lactose": (5.0, "표준성분표")}),
    ("요거트", ["요구르트"],                  "유제품", {"lactose": (4.0, "추정")}),
    ("아이스크림", [],                        "유제품", {"lactose": (5.0, "추정")}),
    ("치즈",   ["체다", "모짜렐라"],          "유제품", {"lactose": (0.5, "추정")}),
    ("버터",   [],                            "유제품", {}),

    # ── 콩 · 견과 (GOS 주요 공급원) ──
    ("콩",     ["대두", "메주콩"],            "콩류", {"gos": (1.7, "Biesiekierski2011(추정)")}),
    ("두부",   ["순두부"],                    "콩류", {}),
    ("두유",   [],                            "콩류", {"gos": (1.0, "추정")}),
    ("강낭콩", [],                            "콩류", {"gos": (1.6, "추정"), "fructan": (0.4, "추정")}),
    ("병아리콩", ["칙피"],                    "콩류", {"gos": (1.2, "추정")}),
    ("렌틸콩", ["렌틸"],                      "콩류", {"gos": (1.0, "추정")}),
    ("아몬드", [],                            "견과", {"gos": (1.0, "추정")}),
    ("땅콩",   [],                            "견과", {}),

    # ── 단백질 (저 FODMAP) ──
    ("돼지고기", ["삼겹살", "목살", "제육"],  "육류", {}),
    ("소고기", ["쇠고기", "한우"],            "육류", {}),
    ("닭고기", ["닭", "닭가슴살"],            "육류", {}),
    ("계란",   ["달걀", "에그"],              "육류", {}),
    ("생선",   ["고등어", "갈치", "연어"],    "수산", {}),
    ("새우",   [],                            "수산", {}),
    ("오징어", [],                            "수산", {}),

    # ── 양념 ──
    ("고춧가루", ["고추가루"],                "양념", {}),
    ("간장",   [],                            "양념", {}),
    ("된장",   [],                            "양념", {"gos": (0.5, "추정")}),
    ("고추장", [],                            "양념", {"fructan": (0.5, "추정")}),
    ("설탕",   [],                            "양념", {}),
    ("꿀",     [],                            "양념", {"fructose": (8.0, "Monash(추정)")}),
    ("참기름", ["들기름"],                    "양념", {}),
    ("김치",   ["배추김치", "묵은지"],        "반찬", {"fructan": (0.8, "추정")}),
]


# ─────────────────────────────────────────────
#  음식(요리) 마스터
#  (name, typical_grams, has_broth)
# ─────────────────────────────────────────────

FOODS = [
    ("김치찌개",   450, True),
    ("된장찌개",   400, True),
    ("순두부찌개", 400, True),
    ("부대찌개",   500, True),
    ("제육볶음",   300, False),
    ("불고기",     300, False),
    ("비빔밥",     500, False),
    ("김밥",       230, False),
    ("라면",       550, True),
    ("떡볶이",     350, False),
    ("볶음밥",     400, False),
    ("삼겹살",     250, False),
    ("닭갈비",     350, False),
    ("갈비탕",     600, True),
    ("미역국",     400, True),
    ("김치볶음밥", 400, False),
    ("계란말이",   150, False),
    ("파스타",     350, False),
    ("피자",       300, False),
    ("샐러드",     200, False),
]


# ─────────────────────────────────────────────
#  기본 레시피  food_ingredients
#  음식 -> [(재료명, 1인분 grams, in_broth)]
#  D2 에서 미리 체크된 상태로 보여줄 재료들.
#  국물 요리는 국물에 녹아드는 재료를 in_broth=True 로 표시한다.
# ─────────────────────────────────────────────

RECIPES = {
    "김치찌개":   [("김치", 120, False), ("돼지고기", 80, False), ("양파", 40, True),
                   ("대파", 15, True), ("마늘", 8, True), ("두부", 80, False), ("고춧가루", 5, True)],
    "된장찌개":   [("된장", 30, True), ("애호박", 50, False), ("양파", 40, True),
                   ("두부", 80, False), ("마늘", 6, True), ("대파", 15, True), ("버섯", 30, False)],
    "순두부찌개": [("두부", 200, False), ("양파", 30, True), ("마늘", 6, True),
                   ("고춧가루", 6, True), ("계란", 50, False), ("대파", 10, True)],
    "제육볶음":   [("돼지고기", 180, False), ("양파", 60, False), ("대파", 20, False),
                   ("마늘", 10, False), ("고추장", 30, False), ("고춧가루", 8, False)],
    "불고기":     [("소고기", 180, False), ("양파", 60, False), ("대파", 20, False),
                   ("마늘", 10, False), ("간장", 25, False), ("설탕", 10, False)],
    "비빔밥":     [("쌀", 210, False), ("시금치", 40, False), ("당근", 30, False),
                   ("콩나물", 40, False), ("계란", 50, False), ("고추장", 25, False)],
    "김밥":       [("쌀", 150, False), ("계란", 40, False), ("당근", 25, False),
                   ("시금치", 25, False), ("단무지", 20, False)],
    "라면":       [("라면", 120, False), ("대파", 15, True), ("계란", 50, False), ("김치", 40, False)],
    "떡볶이":     [("떡", 200, False), ("고추장", 30, False), ("고춧가루", 8, False),
                   ("양파", 40, False), ("대파", 15, False), ("어묵", 60, False)],
    "볶음밥":     [("쌀", 210, False), ("양파", 40, False), ("당근", 30, False),
                   ("계란", 50, False), ("대파", 15, False)],
    "삼겹살":     [("돼지고기", 200, False), ("마늘", 10, False), ("상추", 30, False)],
    "닭갈비":     [("닭고기", 200, False), ("양배추", 80, False), ("고구마", 50, False),
                   ("양파", 50, False), ("고추장", 30, False), ("마늘", 10, False)],
    "갈비탕":     [("소고기", 150, False), ("무", 60, True), ("대파", 20, True), ("마늘", 8, True)],
    "미역국":     [("미역", 20, True), ("소고기", 50, True), ("마늘", 6, True), ("간장", 10, True)],
    "김치볶음밥": [("쌀", 210, False), ("김치", 100, False), ("양파", 40, False),
                   ("대파", 15, False), ("계란", 50, False)],
    "계란말이":   [("계란", 120, False), ("대파", 10, False), ("당근", 15, False)],
    "파스타":     [("밀", 120, False), ("마늘", 10, False), ("양파", 40, False), ("버섯", 40, False)],
    "피자":       [("밀", 150, False), ("치즈", 80, False), ("토마토", 50, False), ("양파", 30, False)],
    "샐러드":     [("상추", 60, False), ("토마토", 50, False), ("오이", 40, False), ("파프리카", 30, False)],
}

# 레시피에 등장하지만 재료 마스터엔 아직 없는 것들 (이름만 있는 부재료).
# 계산 대상은 아니지만 D2 체크리스트에 뜨도록 최소 등록한다.
EXTRA_INGREDIENTS = [
    ("단무지", [], "반찬", {}),
    ("떡",     ["가래떡", "떡볶이떡"], "곡물", {}),
    ("어묵",   ["오뎅"], "수산", {}),
    ("미역",   [], "해조", {}),
]


def connect():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("DB_NAME", "moru"),
        user=os.getenv("DB_USER", "moru"),
        password=os.getenv("DB_PASSWORD"),
    )


def seed_ingredients(cur, rows):
    """ingredients + ingredient_fodmap upsert. name -> id 맵을 돌려준다."""
    execute_values(
        cur,
        """
        INSERT INTO ingredients (name, aliases, category)
        VALUES %s
        ON CONFLICT (name) DO UPDATE
          SET aliases = EXCLUDED.aliases,
              category = EXCLUDED.category
        """,
        [(name, aliases, category) for (name, aliases, category, _) in rows],
    )

    cur.execute("SELECT id, name FROM ingredients")
    name_to_id = {name: iid for (iid, name) in cur.fetchall()}

    fodmap_values = []
    for (name, _aliases, _cat, fodmap) in rows:
        iid = name_to_id[name]
        for axis, (grams, source) in fodmap.items():
            fodmap_values.append((iid, axis, grams, source))

    if fodmap_values:
        execute_values(
            cur,
            """
            INSERT INTO ingredient_fodmap (ingredient_id, axis, grams_per_100g, source)
            VALUES %s
            ON CONFLICT (ingredient_id, axis) DO UPDATE
              SET grams_per_100g = EXCLUDED.grams_per_100g,
                  source = EXCLUDED.source
            """,
            fodmap_values,
        )
    return name_to_id


def seed_foods(cur, rows):
    execute_values(
        cur,
        """
        INSERT INTO foods (name, typical_grams, has_broth)
        VALUES %s
        ON CONFLICT (name) DO UPDATE
          SET typical_grams = EXCLUDED.typical_grams,
              has_broth = EXCLUDED.has_broth
        """,
        rows,
    )
    cur.execute("SELECT id, name FROM foods")
    return {name: fid for (fid, name) in cur.fetchall()}


def seed_food_ingredients(cur, recipes, food_ids, ing_ids):
    values = []
    skipped = []
    for food_name, items in recipes.items():
        fid = food_ids[food_name]
        for (ing_name, grams, in_broth) in items:
            iid = ing_ids.get(ing_name)
            if iid is None:
                skipped.append((food_name, ing_name))
                continue
            values.append((fid, iid, grams, in_broth))

    if values:
        execute_values(
            cur,
            """
            INSERT INTO food_ingredients (food_id, ingredient_id, grams, in_broth)
            VALUES %s
            ON CONFLICT (food_id, ingredient_id) DO UPDATE
              SET grams = EXCLUDED.grams,
                  in_broth = EXCLUDED.in_broth
            """,
            values,
        )
    return len(values), skipped


def main():
    if not os.getenv("DB_PASSWORD"):
        raise SystemExit(
            "DB_PASSWORD 가 비어 있습니다. server/.env 를 확인하고 db-tunnel.bat 를 켜세요."
        )

    all_ingredients = INGREDIENTS + EXTRA_INGREDIENTS

    conn = connect()
    try:
        with conn:
            with conn.cursor() as cur:
                ing_ids = seed_ingredients(cur, all_ingredients)
                food_ids = seed_foods(cur, FOODS)
                n_links, skipped = seed_food_ingredients(cur, RECIPES, food_ids, ing_ids)

                cur.execute("SELECT count(*) FROM ingredients")
                n_ing = cur.fetchone()[0]
                cur.execute("SELECT count(*) FROM ingredient_fodmap")
                n_fod = cur.fetchone()[0]
                cur.execute("SELECT count(*) FROM foods")
                n_food = cur.fetchone()[0]
    finally:
        conn.close()

    print("── 시딩 완료 ──")
    print(f"  재료(ingredients)          : {n_ing}")
    print(f"  FODMAP 값(ingredient_fodmap): {n_fod}")
    print(f"  음식(foods)                : {n_food}")
    print(f"  레시피 연결(food_ingredients): {n_links}")
    if skipped:
        print("  ⚠ 마스터에 없어 건너뛴 레시피 재료:")
        for (f, i) in skipped:
            print(f"     - {f} / {i}")


if __name__ == "__main__":
    main()
