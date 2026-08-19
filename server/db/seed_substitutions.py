"""B-6 마스터 데이터 시딩 — 성분 대체 · 대체 레시피 · 대체 메뉴

담당: 협업자 (B-6)

실행:
    (venv 활성화 + db-tunnel.bat 켜둔 상태에서)
    python db/seed_substitutions.py

재실행해도 안전하다 — 이미 데이터가 있는 재료/음식은 건너뛴다.
db/seed_master.py (B-1) 가 먼저 돌아 ingredients/foods 가 채워져 있어야 한다.
"""

import os

import psycopg2
from dotenv import load_dotenv

load_dotenv()


# ingredient_name -> [(replacement, alt_text, rank)]
SUBSTITUTIONS = {
    "우유":   [("락토프리 우유", "또는 오트우유, 아몬드우유", 1)],
    "요거트": [("락토프리 요거트", "또는 코코넛 요거트", 1)],
    "밀":     [("쌀가루", "또는 글루텐프리 면", 1)],
    "설탕":   [("알룰로스", "또는 스테비아, 꿀 소량", 1)],
    "양파":   [("양파향 오일", "볶을 때 향만 내고 건더기는 건져내기", 1)],
    "마늘":   [("마늘향 오일", "다진 마늘 대신 마늘기름 한 방울", 1)],
    "콩":     [("두부", "또는 흰강낭콩 소량", 1)],
    "꿀":     [("메이플시럽 소량", "또는 알룰로스", 1)],
}

# (title, servings, tip, [(item_name, amount, optional)])
RECIPES = [
    (
        "속 편한 녹차라떼 레시피", "1잔 기준",
        "우유를 데울 때 끓이지 마세요. 60도 정도가 가장 부드러워요.",
        [
            ("우유 (또는 락토프리 우유)", "150ml", False),
            ("녹차가루", "1/2 tsp", False),
            ("알룰로스", "1 tsp", True),
            ("바닐라 익스트랙", "2~3방울", True),
        ],
    ),
    (
        "속 편한 마늘 향 볶음 오일", "요리 1회분",
        "마늘을 오래 볶으면 향만 남고 건더기는 걸러내기 쉬워요.",
        [
            ("식용유", "2 큰술", False),
            ("마늘", "3쪽 (통으로)", False),
        ],
    ),
]

# food_name -> [(alt_name, why, rank)]
MENU_ALTERNATIVES = {
    "제육볶음": [
        ("간장 돼지고기 덮밥", "양념 자극이 적어요.", 1),
        ("두부 간장 덮밥", "식물성 단백질로 편안하게.", 2),
        ("오징어 숙주볶음", "매운 양념 없이 깔끔해요.", 3),
    ],
    "김치찌개": [
        ("맑은 순두부탕", "자극적인 양념 없이 담백해요.", 1),
        ("된장찌개", "매운 기 없이 구수해요.", 2),
    ],
    "라면": [
        ("칼국수", "맵지 않고 부드러워요.", 1),
        ("우동", "자극이 적은 국물이에요.", 2),
    ],
    "떡볶이": [
        ("간장떡볶이", "고춧가루·고추장 없이 매운 자극이 적어요.", 1),
    ],
}


def connect():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("DB_NAME", "moru"),
        user=os.getenv("DB_USER", "moru"),
        password=os.getenv("DB_PASSWORD"),
    )


def seed_substitutions(cur):
    cur.execute("SELECT id, name FROM ingredients")
    name_to_id = {name: iid for (iid, name) in cur.fetchall()}

    added = 0
    for ing_name, rows in SUBSTITUTIONS.items():
        iid = name_to_id.get(ing_name)
        if iid is None:
            print(f"  ⚠ 재료 마스터에 없어 건너뜀: {ing_name}")
            continue
        cur.execute("SELECT count(*) FROM substitutions WHERE ingredient_id=%s", (iid,))
        if cur.fetchone()[0] > 0:
            continue
        for (replacement, alt_text, rank) in rows:
            cur.execute(
                """INSERT INTO substitutions (ingredient_id, replacement, alt_text, rank)
                   VALUES (%s, %s, %s, %s)""",
                (iid, replacement, alt_text, rank),
            )
            added += 1
    return added


def seed_recipes(cur):
    added = 0
    for (title, servings, tip, items) in RECIPES:
        cur.execute("SELECT id FROM recipes WHERE title=%s", (title,))
        row = cur.fetchone()
        if row is not None:
            continue
        cur.execute(
            "INSERT INTO recipes (title, servings, tip) VALUES (%s, %s, %s) RETURNING id",
            (title, servings, tip),
        )
        rid = cur.fetchone()[0]
        for seq, (name, amount, optional) in enumerate(items, start=1):
            cur.execute(
                """INSERT INTO recipe_items (recipe_id, seq, name, amount, optional)
                   VALUES (%s, %s, %s, %s, %s)""",
                (rid, seq, name, amount, optional),
            )
        added += 1
    return added


def seed_menu_alternatives(cur):
    cur.execute("SELECT id, name FROM foods")
    name_to_id = {name: fid for (fid, name) in cur.fetchall()}

    added = 0
    for food_name, rows in MENU_ALTERNATIVES.items():
        fid = name_to_id.get(food_name)
        if fid is None:
            print(f"  ⚠ 음식 마스터에 없어 건너뜀: {food_name}")
            continue
        cur.execute("SELECT count(*) FROM menu_alternatives WHERE food_id=%s", (fid,))
        if cur.fetchone()[0] > 0:
            continue
        for (alt_name, why, rank) in rows:
            cur.execute(
                """INSERT INTO menu_alternatives (food_id, alt_name, why, rank)
                   VALUES (%s, %s, %s, %s)""",
                (fid, alt_name, why, rank),
            )
            added += 1
    return added


def main():
    if not os.getenv("DB_PASSWORD"):
        raise SystemExit("DB_PASSWORD 가 비어 있습니다. server/.env 를 확인하세요.")

    conn = connect()
    try:
        with conn:
            with conn.cursor() as cur:
                n_sub = seed_substitutions(cur)
                n_recipe = seed_recipes(cur)
                n_menu = seed_menu_alternatives(cur)
    finally:
        conn.close()

    print("── B-6 시딩 완료 ──")
    print(f"  성분 대체(substitutions)      : +{n_sub}")
    print(f"  레시피(recipes)               : +{n_recipe}")
    print(f"  대체 메뉴(menu_alternatives)  : +{n_menu}")


if __name__ == "__main__":
    main()
