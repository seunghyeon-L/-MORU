"""6축 계산·감쇠 곡선 검사.  DB 없이 돈다.

  python tests/test_fodmap.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
sys.stdout.reconfigure(encoding="utf-8")

from services.fodmap import AXES, CURVE, PORTION, phase_label, weight  # noqa: E402

fails = []


def check(cond, msg):
    print(("  OK   " if cond else "  실패 ") + msg)
    if not cond:
        fails.append(msg)


print("── 사다리꼴 모양")
for axis in AXES:
    t0, t1, t2, t3 = CURVE[axis]
    check(weight(axis, t0) == 0.0, f"{axis}: 시작 전({t0}h)은 0")
    check(weight(axis, t1) == 1.0, f"{axis}: 최대 구간 시작({t1}h)은 1")
    check(weight(axis, t2) == 1.0, f"{axis}: 최대 구간 끝({t2}h)은 1")
    check(weight(axis, t3) == 0.0, f"{axis}: 끝({t3}h)은 0")
    mid = (t0 + t1) / 2
    check(0 < weight(axis, mid) < 1, f"{axis}: 오르는 중({mid}h)은 0과 1 사이")

print("\n── 사각형 창이 아니어야 한다")
# 예전 설계는 7시간 59분이면 100%, 8시간 1분이면 0% 였다. 그런 몸은 없다.
a, b = weight("fructan", 7.9), weight("fructan", 8.1)
check(a == 1.0 and 0 < b < 1, f"프럭탄 8h 경계에서 급락하지 않는다 ({a} → {round(b,3)})")

print("\n── 축마다 시점이 달라야 한다")
# 락토스·과당은 소장에서 삼투압으로 바로, 프럭탄·GOS는 대장까지 가서 발효
check(weight("lactose", 2) > weight("fructan", 2), "2시간엔 락토스가 프럭탄보다 크다")
check(weight("fructan", 9) > weight("lactose", 9), "9시간엔 프럭탄이 락토스보다 크다")
check(weight("lactose", 9) == 0.0, "락토스는 9시간이면 끝났다")

print("\n── 먹은 양")
check(PORTION["half"] < PORTION["one"] < PORTION["one_and_half_plus"], "양이 순서대로다")
check(PORTION["one"] == 1.0, "한 그릇이 기준 1.0")

print("\n── E3 화면에 붙는 말")
for axis, h, want in [("fructan", 1, "아직 도착 전"), ("fructan", 6, "발효 시점"),
                      ("fructan", 20, "지났어요"), ("lactose", 2, "작용 시점"),
                      ("lactose", 0.2, "아직 도착 전")]:
    got = phase_label(axis, h)
    check(got == want, f"{axis} {h}h → {got}")

print("\n" + ("실패 %d건" % len(fails) if fails else "전부 통과"))
sys.exit(1 if fails else 0)
