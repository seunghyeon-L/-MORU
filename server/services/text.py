"""한국어 조사 처리.

"마늘을(를)" 같은 게 화면에 나가면 안 된다.
문구를 전부 서버가 만들기로 했으니 이건 서버 몫이다.
"""

PAIRS = {
    "을": ("을", "를"),
    "이": ("이", "가"),
    "은": ("은", "는"),
    "과": ("과", "와"),
    "으로": ("으로", "로"),
}


def has_final(word: str) -> bool | None:
    """마지막 글자에 받침이 있는가. 한글이 아니면 None."""
    if not word:
        return None
    ch = word[-1]
    if not ("가" <= ch <= "힣"):
        return None
    return (ord(ch) - 0xAC00) % 28 != 0


def josa(word: str, kind: str = "을") -> str:
    """받침에 맞는 조사를 고른다.

    '로/으로' 만 예외다 — ㄹ 받침은 '로' 를 쓴다 ('마늘로', '마늘으로' 가 아니라).
    """
    with_final, without = PAIRS[kind]
    f = has_final(word)
    if f is None:                 # 영어·숫자로 끝나면 받침 있는 쪽이 무난하다
        return with_final
    if kind == "으로" and f and (ord(word[-1]) - 0xAC00) % 28 == 8:  # ㄹ
        return without
    return with_final if f else without


def w(word: str, kind: str = "을") -> str:
    """'마늘을' 처럼 붙여서 돌려준다."""
    return f"{word}{josa(word, kind)}"
