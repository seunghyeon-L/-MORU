# 저포드맵 재도입기 프로토콜 — 원문 조사

조사일: 2026-08-15
목적: IBS 식이 관리 앱 명세서에 인용할 재도입기(reintroduction / challenge phase) 프로토콜의 원문 수준 확인

---

## 0. 가장 중요한 전제 — 표준 프로토콜은 존재하지 않는다

본 조사의 최상위 결론입니다. 아래 6개 통설을 검증하기 전에 반드시 전제되어야 합니다.

> **Pelletier K, Villarreal M, Klar R, et al. "Fermentable Oligosaccharides, Disaccharides, Monosaccharides, and Polyols Reintroduction in Clinical Practice: Surveying the Gaps and Opportunities." _Gastro Hep Advances_. 2026. DOI: 10.1016/j.gastha.2026.100908**

등록영양사(RD) 대상 설문 결과 (확인 수준: **보도자료 경유 — 원문 미확인**):

- "considerable heterogeneity in dosing strategies" / "**no standardized protocols**"
- 증상이 없을 때 3일 내 증량: **80%**
- 2개월 내 전 과정 완료: **63%**
- FODMAP 그룹당 식품 1개만 시험: **63%** (2개 이상 시험: 약 37%)
- 표준 시작 용량 + 1일 1회 증량 방식: **70% 이상**
- 증상 발생 시 대기 기간을 중증도에 따라 개별 조정: **62% 이상**
- 재도입 순서를 환자와 함께 결정: **73%**
- 개별 상담을 통해 재도입 진행: **98%**

즉 임상 현장에서도 프로토콜이 통일되어 있지 않으며, 아래의 "표준"은 **주요 출처들의 수렴 지점**을 의미할 뿐입니다.

---

## 1. 통설 6개 검증 결과

### 요약표

| # | 통설 | 판정 |
|---|---|---|
| 1 | 한 번에 한 FODMAP 하위그룹만 시험 | ✅ **확인됨** (단, 프럭탄 4분할 → 총 9~11개 챌린지) |
| 2 | 3일간 용량을 계단식으로 증량 | ⚠️ **출처마다 다름** — 증량 방식이 두 계열로 갈림 |
| 3 | 챌린지 중 배경 식단은 저포드맵 유지 | ✅ **확인됨** (통설보다 오히려 더 엄격) |
| 4 | 챌린지 사이 2~3일 세척 | ⚠️ **출처마다 다름** (2일 / 2~3일 / 3일 / 개별화) |
| 5 | 저울 안 쓰고 가정 계량 단위 사용 | ❌ **틀림** — 원문들은 g/mL을 병기함 |
| 6 | 결과는 범주형 판정 | ✅ **확인됨** (3단계이며, 표현 방식에 주의 필요) |

---

### ① 한 번에 한 FODMAP 하위그룹만 시험 — ✅ 확인됨

**판정: 확인됨. 단, "6개 그룹"이라는 통상적 이해는 틀렸습니다.**

프럭탄은 하나의 그룹으로 시험하지 않고 **여러 개의 독립 챌린지로 분할**됩니다.

**근거 1 — Monash 공식 (확인 수준: 원문 판독)**
Monash 재도입 업데이트 블로그의 Table 3 이미지를 직접 내려받아 판독한 결과, 단일 FODMAP 카테고리는 **9개**입니다:

1. Lactose
2. Sorbitol
3. Mannitol
4. Fructose
5. GOS
6. **Fructan – grain foods**
7. **Fructan – vegetable and fruit**
8. **Fructan – garlic**
9. **Fructan – onion**

여기에 **조합 카테고리 2개**가 추가됩니다:
10. **Fructose + Sorbitol**
11. **Fructan + GOS**

출처: https://monashfodmap.com/blog/reintroduction-update/
(표 이미지 직접 URL: `https://fodmap-publicsite-us-east-2.s3.amazonaws.com/production/media/images/Reintro_Table_3_lrg.original.png`)

**근거 2 — King's College London 챌린지북 (확인 수준: PDF 원문 판독)**

> "For foods containing fructans you will need to challenge with **each food you want to reintroduce**. This is because the way the gut handles this FODMAP differs from one food to another."

> "There are two different types of polyols (sorbitol and mannitol). Therefore, there are **two separate challenges** for polyols, one for sorbitol and one for mannitol."

> "For foods containing sorbitol, mannitol, GOS, fructose and lactose, you can use **one challenge food** to test your response to all foods high in that particular FODMAP. For example, honey is a food high in fructose. If you get symptoms in response to honey, you are likely to get symptoms to other foods high in fructose."

출처: `Reintroducing FODMAPs` (SAMPLE Challenge book, DEC14 V3)
https://www.kcl.ac.uk/slcps/assets/fodmap/SAMPLEChallenge-book-DEC14V3.pdf
발행: Department of Gastroenterology & Department of Nutrition & Dietetics, Guy's and St Thomas' NHS Foundation Trust / Diabetes & Nutritional Sciences Division, King's College London, London UK. © December 2014. Monash University 감사 표기 있음.

**근거 3 — Gloucestershire NHS (확인 수준: PDF 원문 판독)**

> "People experience different symptoms for various fructan sources so a challenge is recommended for each one."

> "The way the gut copes with fructans and polyols varies from one food to another, so introduce foods that contain fructans, and polyols one at a time."

**→ 앱 설계 함의: 챌린지 단위를 6개가 아니라 9~11개로 잡아야 합니다.**

---

### ② 3일간 용량을 계단식으로 증량 — ⚠️ 출처마다 다름

**판정: "3일 계단식"은 맞으나, 증량 방식이 근본적으로 다른 두 계열로 갈립니다.**

#### 계열 A — Monash (신호등 등급 기반)

(확인 수준: 원문 판독)

> "Complete each challenge over a **3 day period**"
> - Day 1: "moderate (**amber**) serve"
> - Day 2: "high (**red**) serving"
> - Day 3: "**higher red** serve or your usual serving"

출처: https://www.monashfodmap.com/blog/practical-tips-fodmap-reintroduction/

즉 절대 배수가 아니라 **앱 내 색상 등급**에 묶여 있습니다. 자체 FODMAP 함량 DB가 없으면 구현 불가능합니다.

#### 계열 B — KCL / NHS (배수 기반)

(확인 수준: PDF·웹페이지 원문 판독)

**Day 1 = 지정 분량 → Day 2 = 2배 → Day 3 = 3배**

Gloucestershire NHS 원문:

> "If you do not have symptoms in 24 hours after eating the challenge food, **DOUBLE** the portion si[ze] of the same food the following day."
> "If you do not have symptoms in 24 hours after eating the double portion of the challenge food, **TRIPLE** the portion si[ze] of the same food the following day."

Cambridge University Hospitals NHS 원문:

> "Each food should be challenged over **3 days** in increasing portion sizes: **Day 1** - eat the challenge food in the portion size suggested; **Day 2** – (if day 1 tolerated) **double** the portion of day 1; **Day 3** - (if day 2 tolerated) **triple** the portion of day 1."

Lomer 2023 (학술 리뷰) 원문:

> "day 1 containing approximately 4 g lactose (i.e. 125 ml), and amounts on day 2 and day 3 being **double (250 ml) and triple (375 ml)** the amount for day 1, respectively"

#### 계열 C — 격일 스케줄 변형

일부 출처는 프럭탄·GOS에 대해 하루씩 띄운 Day 1 / Day 3 / Day 5 스케줄을 권고합니다. 근거는 증상 발현 시간이 "around 4 hours – 24 hours"로 느리다는 점입니다.
(확인 수준: 2차 출처 — A Little Bit Yummy, FODMAP Friendly. Tuck & Barrett 계열 논지)

#### 계열 D — 연구용 고정 고용량

Van den Houte 2024 (아래 §2-6 참조): 증량 없이 고정 고용량을 7일간.

**⚠️ Lomer 2023이 이 분기 자체를 명시적으로 인정합니다:**

> "different protocols for FODMAP reintroduction are available in different countries with **constant amounts of challenge foods across the 3 challenge days or 4 d to challenge** and **differing durations for washout** in between challenges depending on whether symptoms occur during the challenge."

---

### ③ 챌린지 중 배경 식단은 저포드맵 유지 — ✅ 확인됨

**판정: 확인됨. 만장일치이며, 통설보다 오히려 더 엄격한 규칙이 존재합니다.**

**Monash** (원문 판독):
> "Remain on your Step 1 low FODMAP diet while completing each challenge."
> "Each FODMAP subgroup should be reintroduced separately while your **background diet remains low in FODMAPs**"

**Cambridge University Hospitals NHS** (원문 판독):
> "One type of fermentable carbohydrate is reintroduced or 'challenged' at a time whilst remaining on a low FODMAP diet, ensuring the **only difference in FODMAP intake comes from the challenge food**."
> "it is important to **remove the food you have just challenged** before starting the next challenge to ensure your diet remains low FODMAP"

**Gloucestershire NHS** (원문 판독) — 추가 통제 조건:
> "Avoid eating out during the 3 challenge days as it is more difficult to be sure your diet is low in other FODMAPs."
> "Keep other possible symptom triggers (such as caffeine or alcohol) to a minimum"
> "Use the same food for each of the 3 challenge days"

**⭐ 통설보다 더 엄격한 규칙 — 통과 식품도 즉시 복귀 금지**

KCL 챌린지북 (원문 판독):
> "If you don't get symptoms all the foods above high in fructose should be tolerated well. **Include only after all the food challenges are complete.**"

Gloucestershire NHS (원문 판독):
> "If you do NOT get symptoms after a food challenge: **Only introduce this back to your diet once you have completed all your challenges.**"

즉 챌린지를 통과한 식품이라도 **전체 재도입기가 끝날 때까지 식단에 복귀시키지 않습니다.** Monash 자료에서는 이 규칙을 명시적으로 찾지 못했습니다.

---

### ④ 챌린지 사이 2~3일 세척 — ⚠️ 출처마다 다름

**판정: 2~3일이 다수설이나 통일되어 있지 않습니다.**

| 출처 | 세척기간 (원문) | 확인 수준 |
|---|---|---|
| **Monash** | "Take a **2-3 day break** between challenges, or until symptoms settle" | 원문 판독 |
| **Monash (3 phases)** | "have a break of **a few days** between reintroduction of foods to avoid any crossover effects" | 원문 판독 |
| **Gloucestershire NHS** | "**Wait 3 days** with minimal/no symptoms" → "Commence next challenge" | PDF 원문 판독 |
| **Gloucestershire NHS (사전조건)** | "Ensure you have **minimal symptoms for at least three days** before each food challenge" | PDF 원문 판독 |
| **Cambridge Univ Hospitals NHS** | "Wait until symptoms have settled (**for most people this is 3 days**) before challenging a different food" | 웹 원문 판독 |
| **FODMAP Friendly** | "A washout is the **2-3 day window** after a challenge" | 웹 원문 판독 |
| **Van den Houte 2024 (연구)** | "**2-day** washout period" | ACG 요약 경유 |
| **Dimidi 2023 (앱)** | "A **three-day** washout period followed if symptoms appeared" | PMC 원문 |
| **Pelletier 2026 (RD 실무)** | "**Over 62%** tailored the waiting period based on individual severity" | 보도자료 경유 |
| **Lomer 2023** | "**differing durations** for washout in between challenges depending on whether symptoms occur" | 웹 원문 판독 |

#### IBS 아형별 차등 권고 — 🔍 찾지 못함

**IBS-C / IBS-D 아형에 따라 세척기간이나 챌린지 간격을 다르게 하라는 권고를 어떤 1차 출처에서도 찾지 못했습니다.**

- 아형별로 FODMAP 반응이 다를 수 있다는 언급은 문헌에 존재합니다.
- 그러나 Van den Houte 2024는 표본 크기 한계로 아형별 개별 FODMAP 효과를 규명하지 못했다고 명시적으로 한계를 기술했습니다.
- Monash, KCL, NHS 환자자료 어디에도 아형별 프로토콜 분기가 없습니다.

**→ 앱에서 아형별 분기를 넣는다면 그것은 근거 없는 자체 판단이 됩니다.**

---

### ⑤ 저울이 아니라 가정 계량 단위 사용 — ❌ 틀림

**판정: 틀렸습니다. 원문 자료들은 가정 계량 단위와 g/mL을 병기합니다.**

**근거 1 — Monash 앱 (확인 수준: 2차 출처)**
> "The Monash app displays serving sizes **both in volumetric amounts (cups, tablespoons, etc.) and weights (in grams)**."

예시: eggplant는 "2 ½ cups **or 182 grams**"에서 amber, "3 ½ cups **or 260 grams**"에서 red.
출처: foodisgood.com (2차 출처. Monash 앱 자체는 열지 못함)

**근거 2 — Gloucestershire NHS (확인 수준: PDF 원문 판독)**
프럭탄 기타 과일·채소는 **순수 g으로만** 지정됩니다:
> "If you wish to challenge other high fructan fruit or vegetables, use a **40g portion on day 1, 80g on day 2 and 120g on day 3**."

락토스: "**125ml** semi-skimmed milk or **125g** natural yogurt"

**근거 3 — Cambridge University Hospitals NHS (확인 수준: 웹 원문 판독)**
- Mannitol: "**100g** sweet potato OR **25g** celery OR **60g** cauliflower"
- GOS: "**40g** butter beans OR **80g** chickpeas"
- Lactose: "**125ml** cow's milk OR **125g** natural yoghurt"

**근거 4 — Monash 앱 유래 용량 (2차 출처)**
"wheat pasta ½ cup (**80g**)", "Greek yogurt 3 tbsp (**62g**)" 등 전 항목이 가정 단위 + g 병기.

**정확한 서술:** 계량이 실질적으로 어려운 항목(빵 쪽 수, 마늘 쪽, 버섯 개수, 셀러리 대)만 가정 단위 단독이고, **나머지는 g/mL이 병기되거나 g 단독**입니다.

**→ 앱 설계 함의: 저울 사용을 강제하지는 말되, g을 병기하는 것이 원문에 충실합니다.**

---

### ⑥ 결과는 g 역치가 아니라 범주형 판정 — ✅ 확인됨

**판정: 확인됨. 3단계 범주형입니다. 단, 표현 방식에 주의가 필요합니다.**

**Monash의 3단계 판정 (확인 수준: 원문 판독)**

출처: https://www.monashfodmap.com/blog/interpreting-reintroduction-challenges/

| 반응 | 원문 | 해석 |
|---|---|---|
| 무증상 | "you can eat this FODMAP **freely** in your personalised FODMAP diet moving forward" | 내성 있음 |
| 경증~중등도 | "you may want to stick to just the **green (low FODMAP) and amber (moderate FODMAP)** Food Guide servings of this FODMAP" | 부분 내성 |
| 중증 | "you may want to **limit both the amber and red** serving sizes of foods containing this FODMAP. Try sticking to just a low FODMAP serving size if possible" | 내성 없음 |

**⚠️ 중요한 뉘앙스:** Monash의 판정 출력은 "내성 있음/없음"이라는 라벨이 아니라 **"어느 색상 등급의 serving까지 먹어도 되는가"**입니다. 순수 이분법도 아니고 연속적 g 역치도 아닌, **serving 등급 단위의 순서형(ordinal) 판정**입니다.

**Gloucestershire NHS의 우아한 변형 — 중단 시점이 곧 판정 (확인 수준: PDF 원문 판독)**

> Day 2에서 중단: "this shows you can **tolerate small amounts** of the FODMAP group of foods"
> Day 3에서 중단: "this tells you that you can manage a **moderate portion** of this group of FODMAP foods, but **not an unlimited amount**"
> Day 3 완주: "we can safely assume you **do not react** to this group of FODMAP foods, and you can apply the results of this test to the other foods containing the same type of FODMAP (except for the FRUCTAN group which need to be tested separately)"

**→ 앱 설계 함의: 별도 판정 로직 없이 "몇 일차에서 중단했는가"만으로 3단계 판정이 자동 도출됩니다.**

---

## 2. 그룹별 시험 식품과 1·2·3일차 권장 용량 ⭐

### 2-1. Gloucestershire Hospitals NHS Foundation Trust (2020)

**확인 수준: PDF 원문 직접 판독** (분수 글리프가 텍스트 레이어에서 깨져 페이지를 이미지로 렌더링하여 육안 판독함)

문서: "Re-challenging after the low FODMAP approach", October 2020
URL: https://www.gloshospitals.nhs.uk/media/documents/FODMAP_reintroduction_information_oct_20.pdf

**증량 규칙: Day 1 = 지정량 / Day 2 = 2배 / Day 3 = 3배**

| FODMAP 그룹 | Day 1 용량 (원문 그대로) |
|---|---|
| **Fructan – Wheat** | "1 slice of bread or 1 Weetabix or 5 Tablespoons cooked pasta" |
| **Fructan – Onion** | "½ tablespoon of cooked onion in a low FODMAP meal or salad or ½ leek in a low FODMAP meal" |
| **Fructan – Garlic** | "¼ clove of raw or cooked garlic in a low FODMAP meal" |
| **Fructan – 기타 과일·채소** | **"use a 40g portion on day 1, 80g on day 2 and 120g on day 3"** |
| **GOS** | "2 tablespoons of beans or pulses (e.g. chickpeas, broad beans, soy bean, butter beans, lentils, baked beans, kidney beans) or 10 pistachio / cashew nuts" |
| **Fructose** | "½ mango or 1 teaspoon of honey" |
| **Lactose** | "125ml semi-skimmed milk or 125g natural yogurt" |
| **Sorbitol** | "3 tablespoons broccoli or ¼ avocado" |
| **Mannitol** | "2 tablespoons cauliflower or 1 stick of celery or 3 tablespoons of sweet potato" |

---

### 2-2. Cambridge University Hospitals NHS Foundation Trust

**확인 수준: 웹페이지 원문 판독**

문서: "Reintroducing fermentable carbohydrates"
URL: https://www.cuh.nhs.uk/patient-information/reintroducing-fermentable-carbohydrates/

**증량 규칙: Day 1 = 지정량 / Day 2 = 2배 / Day 3 = 3배**
**총 소요기간: "The total reintroduction process will usually take up to 6-10 weeks."**

| FODMAP 그룹 | Day 1 용량 (원문 그대로) |
|---|---|
| **Fructose** | "¼ mango OR 1 teaspoon honey" |
| **Lactose** | "125ml cow's milk OR 125g natural yoghurt" |
| **Polyols (Sorbitol)** | "¼ avocado OR ½ corn on the cob" |
| **Polyols (Mannitol)** | "100g sweet potato OR 25g celery OR 60g cauliflower" |
| **GOS** | "40g butter beans OR 80g chickpeas" |
| **Fructans (Wheat Bread)** | "1 slice wholemeal/white bread" |
| **Fructans (Wheat Pasta)** | "5 tablespoons cooked pasta" |
| **Fructans (Wheat Cereal)** | "1 Weetabix OR 1 tablespoon Bran flakes" |
| **Fructans (Onion)** | "1 tablespoon cooked onion" |
| **Fructans (Garlic)** | "¼ clove raw or cooked" |
| **Fructans (Leeks)** | "½ leek" |

---

### 2-3. Monash 앱 현행 용량 — ⚠️ 2차 출처 경유

**확인 수준: 식품 목록은 Monash 공식 표 이미지 직접 판독으로 1차 확인. 그러나 용량 숫자는 2차 출처 경유.**

**⚠️ 중대한 주의사항:** Monash는 재도입 용량을 웹에 공개하지 않고 **앱 내부(Diary 영역)에만** 둡니다. 공식 블로그의 표는 이미지로만 제공됩니다. 저는 그 이미지를 직접 내려받아 **식품 목록은 1차 출처로 확인**했으나, **용량 숫자는 앱을 열 수 없어 2차 출처를 경유**했습니다.

2차 출처: Karlijn's Kitchen "FODMAP reintroduction phase: a complete guide" (https://www.karlijnskitchen.com/en/reintroduction-phase/). 저자가 Monash 앱(2025년 5월 기준)을 출처로 명시.

**명세서에 넣기 전 Monash 앱에서 직접 재확인이 반드시 필요합니다.**

| FODMAP 그룹 | Day 1 | Day 2 | Day 3 |
|---|---|---|---|
| **Lactose** (우유) | ¼컵 (60ml) | ½컵 (130ml) | 1컵 (250ml) |
| **Lactose** (그릭요거트) | 3큰술 (62g) | ⅓컵 (100g) | ½컵 (125g) |
| **Fructose** (오렌지주스, 생과즙) | ½컵 (100ml) | ⅔컵 (150ml) | ¾컵 (200ml) |
| **Fructose** (망고) | 2작은술 (9g) | 1.5큰술 (20g) | 2큰술 (30g) |
| **Fructose** (아스파라거스) | 4대 (57g) | 6대 (85g) | 7대 (100g) |
| **Sorbitol** (생살구) | 2개 (70g) | 3개 (102g) | 3.5개 (125g) |
| **Sorbitol** (생체리) | 4개 (28g) | 5개 (35g) | 6개 (42g) |
| **Sorbitol** (냉동체리) | 2개 (13g) | 2.5개 (16g) | 3개 (19g) |
| **Mannitol** (포토벨로버섯) | ⅓개 (14g) | 2개 (75g) | 3개 (112g) |
| **Mannitol** (셀러리) | 2대 (75g) | 2.5대 (95g) | 3대 (112g) |
| **Mannitol** (사워크라우트) | ¼컵 (35g) | ½컵 (75g) | ¾컵 (100g) |
| **GOS** (실켄두부) | ¼컵 (46g) | ½컵 (90g) | ¾컵 (130g) |
| **GOS** (팥 통조림) | 4큰술 (50g) | 5큰술 (65g) | 6큰술 (80g) |
| **GOS** (핀토빈 통조림) | 4큰술 (65g) | 5큰술 (80g) | 6큰술 (100g) |
| **Fructan – 곡물** (밀 파스타) | ½컵 (80g) | ⅔컵 (100g) | ¾컵 (120g) |
| **Fructan – 곡물** (쿠스쿠스) | ½컵 (75g) | ⅔컵 (100g) | 1컵 (120g) |
| **Fructan – 곡물** (퍼프페이스트리) | ⅓장 (62g) | ½장 (72g) | ⅔장 (120g) |
| **Fructan – 과일채소** (잘 익은 바나나) | ½개 (47g) | ¾개 (72g) | 1개 (95g) |
| **Fructan – 과일채소** (리크 흰 부분) | 2큰술 (15g) | ⅓컵 (30g) | ½컵 (45g) |
| **Fructan – 양파** (다진 양파) | 1큰술 (13g) | 1.5큰술 (17g) | 2큰술 (22g) |
| **Fructan – 마늘** | ⅓쪽 | ⅔쪽 | 1쪽 |

**참고 — 또 다른 2차 출처의 용량 (A Little Bit Yummy)**
(확인 수준: 웹 원문 판독. Monash 앱 기반이라 명시하나 위 표와 일부 불일치 — 앱 업데이트 시점 차이로 추정)

| 그룹 | 시험 식품 | 용량 제안 |
|---|---|---|
| Lactose | Cow's Milk | "¼ cup, ½ cup, 1 cup" |
| Excess Fructose | Orange juice, freshly squeezed | "½ cup, ¾ cup, 1 cup" |
| Sorbitol | Fresh Apricot | "2 medium, 3 medium, 4 medium" |
| Mannitol | Portobello Mushroom | "⅓ of a mushroom, 1 mushroom, 2 mushroom" |
| GOS | Adzuki Beans (canned) | "4 tbsp, 6 tbsp, 8 tbsp" |
| Fructan – garlic | Fresh garlic clove | "¼ clove, ½ clove, 1 clove" |
| Fructan – onion | White or red onion | "1 tbsp, 2 tbsp, ¼ cup" |
| Fructan – fruit & veg | Banana, common (ripe) | "½ medium, ¾ medium, 1 medium" |

---

### 2-4. ⭐ 경고 — "식빵 ½쪽 → 1쪽 → 2쪽"은 현행 Monash 기준이 아님

**확인 수준: Monash 공식 표 이미지 직접 판독**

Monash는 **빵을 프럭탄 표준 시험식품에서 제외**했습니다. 원문:

> "**White wheat bread can vary greatly between countries so it may not be appropriate for just fructan reintroduction.** We suggest undertaking a reintroduction challenge using bread locally available to you."

> "**Wholegrain wheat bread** can vary greatly between countries so it may not be appropriate for just fructan reintroduction."

- 백밀빵(Bread, wheat white) → **밀 파스타 / 쿠스쿠스 / 퍼프페이스트리**로 교체
- 통밀빵(Bread, wheat, wholegrain) → 프럭탄 단독이 아니라 **"Fructan + GOS" 조합 카테고리**로 이동

**반면 영국 NHS 자료(Gloucestershire 2020, Cambridge University Hospitals)는 여전히 빵 1쪽을 씁니다.** 출처 계열에 따라 갈리는 지점입니다.

#### Monash 재검사로 부적격 판정된 기존 시험 식품 (오래된 자료를 그대로 쓰면 안 되는 이유)

**확인 수준: Monash 공식 표 이미지 직접 판독. 아래는 모두 원문 인용.**

| 기존 식품 | 기존 분류 | 부적격 사유 (원문) |
|---|---|---|
| **Avocado** | Sorbitol | "Avocado contains a different polyol called '**perseitol**'. It can still be reintroduced to test your tolerance, however, the results are **not necessarily applicable to sorbitol-containing foods**" |
| **Blackberries** | Sorbitol | "Blackberries were found to contain **fructose**" |
| **Peach, yellow** | Sorbitol | "Yellow peach contains sorbitol but **primarily fructose and trace amounts of fructan** so may not be appropriate for sorbitol" |
| **Honey** | Fructose | "Honey was found to contain **high amounts of fructans** alongside the fructose, making it **not as appropriate** for fructose reintroduction" |
| **Sugar snap peas** | Fructose | "Sugar snap peas were found to contain **fructans**" |
| **Button Mushroom** | Mannitol | "Button mushrooms contain **fructans in larger serves**, whereas portobello mushrooms contain just mannitol" |
| **Cauliflower** | Mannitol | "Cauliflower and Orange Sweet Potato were found to contain **fructans**" |
| **Sweet Potato** | Mannitol | (동일) |
| **Almonds** | GOS | "almonds, canned chickpeas/garbanzo beans and green peas contain **trace amounts of fructans**, making them not as appropriate for just GOS reintroduction" |
| **Canned chickpeas** | GOS | (동일) |
| **Green peas** | GOS | (동일) |
| **Custard / Ricotta** | Lactose | "did not contain **enough lactose** in serving sizes that would be easily consumed in 1 sitting" |
| **Beetroot / Brussels sprouts** | Fructan-veg | "did not contain **enough fructans** in a serving size that would be easily consumed in 1 sitting" |
| **Grapefruit / Raisins** | Fructan-veg | "were found to contain **fructose**" |
| **Pearl barley** | Fructan+GOS | "Pearl barley contained **much more fructan than GOS**" |
| **Cherries** | Fructose+Sorbitol | "Cherries were found to contain **sorbitol**" |

**⚠️ 즉 Gloucestershire NHS(2020)와 CUH NHS 자료는 아보카도·꿀·콜리플라워·고구마·셀러리를 여전히 쓰고 있어, Monash 최신 재검사 결과를 반영하지 않았습니다.**

---

### 2-5. 가정 계량 단위 ↔ FODMAP g 환산 — 🔍 거의 찾지 못함

**공개된 환산표는 찾지 못했습니다.**

**유일하게 확보한 1차 수치 (확인 수준: 오픈액세스 웹 원문 판독):**

> "day 1 containing **approximately 4 g lactose (i.e. 125 ml)**, and amounts on day 2 and day 3 being double (250 ml) and triple (375 ml) the amount for day 1, respectively"

출처: Lomer MCE. "The low FODMAP diet in clinical practice: where are we and what are the long-term considerations?" _Proceedings of the Nutrition Society_. 2023;83(1):17-27. doi:10.1017/S0029665123003579. **Open Access (CC-BY)**

**→ 우유 125ml ≈ 락토스 4g. 이것이 유일하게 원문에서 확인된 환산치입니다.**

**다른 그룹(프럭탄·GOS·과당·소르비톨·만니톨)의 가정 단위 ↔ g 환산치는 어떤 출처에서도 찾지 못했습니다.**

#### 관련: Monash 컷오프 기준 — ⚠️ 원문 대조 실패, 인용 금지

Varney J, Barrett J, Scarlata K, Catsos P, Gibson PR, Muir JG. "FODMAPs: food composition, defining cutoff values and international application." _Journal of Gastroenterology and Hepatology_. 2017;32:53-61. doi:10.1111/jgh.13698

- **유료 장벽(HTTP 402)으로 전문 확인 실패.**
- Monash 연구 포털의 초록에도 수치가 없음(초록만 확인).
- 검색 스니펫 수준에서 "올리고당 < 0.30 g/serve (곡물·콩류·견과·종실), < 0.20 g/serve (채소·과일·기타)", "락토스 1 g 이하면 low FODMAP"이 보였으나 **원문 대조 실패**.

**→ 이 수치는 명세서에 인용하지 마십시오.**

#### 참고: 밀빵 g 환산 (2차 출처, 밀빵의 g이지 프럭탄의 g이 아님)

통밀빵 프럭탄 챌린지: "1 slice (26 g), 1 1/2 slices (39 g), 2 slices (52 g)" — Day 1/2/3
(확인 수준: 검색 결과 요약 경유. **이는 빵의 무게이지 프럭탄 함량이 아닙니다.**)

---

### 2-6. 연구용 순수 FODMAP 용량 (임상 프로토콜과 별개)

**Van den Houte K, Colomier E, Routhiaux K, et al. "Efficacy and findings of a blinded randomized reintroduction phase for the low FODMAP diet in irritable bowel syndrome." _Gastroenterology_. 2024;167:333-42.**

확인 수준: **ACG EBGI 요약 페이지 경유** (원문은 유료). https://gi.org/journals-publications/ebgi/schoenfeld_nov2024/

설계: 벨기에 Leuven University Hospital 단일기관, 9주 이중맹검 무작위 교차시험. 제거기 6주 선행. **7종의 FODMAP 분말**을 물에 타서 **식사와 함께 1일 3회, 7일간** 복용 후 **2일 washout**.

| FODMAP | 1일 용량 |
|---|---|
| Fructans | 20 g |
| Fructose | 60 g |
| β-Galacto-Oligosaccharides (GOS) | 12 g |
| Lactose | 60 g |
| Mannitol | 15 g |
| Sorbitol | 15 g |
| Glucose (대조/위약) | 30 g |

**결과 (⭐ 앱 설계에 매우 중요):**
- 제거기 후 IBS-SSS 유의 개선, **응답자 80%**
- 증상 유발 빈도: **프럭탄 56%, 만니톨 54%**, GOS 35%, 락토스 28%, 과당 27%, 소르비톨 23%, **포도당(위약) 26%**
- "Symptom recurrence was triggered in 85% of the FODMAP powders, by an average of **2.5 ± 2 FODMAPs per patient**"
- 결론: "A blinded reintroduction revealed a personalized pattern of symptom recurrence, with fructans and mannitol as the most prevalent, and allows the **most objective** identification of individual FODMAP triggers."

**⚠️ 위약(포도당) 26%는 노시보 효과의 크기를 보여줍니다. 비맹검 자가 챌린지의 위양성률을 시사합니다.**

---

## 3. 세척 기간 · 중단 규칙 · 전체 소요 기간

### 3-1. 세척 기간

§1-④ 표 참조. 요약: **2~3일이 다수설, NHS 계열은 3일. 아형별 차등 권고는 찾지 못함.**

### 3-2. 증상 발생 시 중단 규칙

**출처마다 "즉시 불내성 확정"이 아니라 "중단 + 나중에 재시험"으로 수렴합니다.**

**Monash** (확인 수준: 검색 결과 요약 + 블로그 원문 판독):
- "If you experience unpleasant symptoms after the first or second day of a challenge, you should **stop**."
- "if you experience acute symptoms at any time, **stop the tests and avoid this food for the time being**, and you can **retest later** to see if your tolerance has changed"
- "you may want to **retest this FODMAP again in the future**... as tolerances can change over time"
- Monash는 "repeating challenges of poorly tolerated foods and FODMAPs over time to see whether your tolerance changes"를 권고

**KCL 챌린지북** (확인 수준: PDF 원문 판독):
> "If you get symptoms **avoid all foods high in fructose completely**. You can **re-challenge again in much smaller amounts at a later date** if you want to."

**Gloucestershire NHS** (확인 수준: PDF 원문 판독):
> "If you get symptoms after a food challenge: Avoid the food for now, but consider **re-challenging again with a smaller amount at a later date**."
> "If you do have symptoms you are not willing to tolerate, then **stop there and consider re-testing at another time**."

주목: "**symptoms you are not willing to tolerate**" — 중단 기준을 **환자의 주관적 수용 가능성**에 맡깁니다.

**Cambridge University Hospitals NHS** (확인 수준: 웹 원문 판독):
- 경증: 다음날 더 큰 용량으로 진행 가능
- 중등도~중증: "**Stop eating it. Do not challenge that food in a larger portion size.** Wait until symptoms have settled (for most people this is 3 days) before challenging a different food."

**FODMAP Friendly** (확인 수준: 웹 원문 판독):
> "If a certain challenge causes a sharp increase in IBS symptoms, it's advised to **stop challenging that specific FODMAP subgroup**."

**Gloucestershire NHS의 안심 문구** (원문):
> "Remember, even if you do experience symptoms **you will not cause any damage to your gut**."

### 3-3. 전체 소요 기간

| 출처 | 총 재도입기 기간 | 확인 수준 |
|---|---|---|
| **Monash** | "around **6-8 weeks** to complete" | 원문 판독 |
| **Cambridge Univ Hospitals NHS** | "usually take up to **6-10 weeks**" | 원문 판독 |
| **Pelletier 2026 (RD 실무)** | "63% completed the process within **two months**" | 보도자료 경유 |
| **Van den Houte 2024 (연구)** | 9주 (7종 × 7일 + 2일 washout) | ACG 요약 경유 |
| **KCL 챌린지북** | 명시 없음 | 원문 판독 (샘플) |
| **Gloucestershire NHS** | 명시 없음 | 원문 판독 |

**참고 — 제한기(1단계) 기간**

| 출처 | 제한기 |
|---|---|
| Monash | "2-6 weeks" |
| BSG 2021 | "lasts between **4 and 6 weeks**" |
| ACG 2021 | "responders... can be identified in **2–6 weeks**" |
| Lomer 2023 | "often followed for **4–8 weeks**"; "symptom control within **2–4 weeks**" |
| 2025 Seoul Consensus | "lasts between **3 and 6 weeks**" |

---

## 4. 전문가 감독 필요 여부 ⭐

### 결론

**"영양사 감독 없이 환자 혼자 해도 된다"고 명시한 가이드라인은 없습니다.**
**그러나 ACG와 2025 서울 컨센서스가 "영양사가 없으면 고품질 교육자료로 대체하라"는 명시적 예외를 두고 있으며, 이것이 앱의 근거가 됩니다.**

---

### 4-1. BSG (영국) — 가장 강경

**Vasant DH, et al. "British Society of Gastroenterology guidelines on the management of irritable bowel syndrome." _Gut_. 2021;70(7):1214-1240. doi:10.1136/gutjnl-2021-324598**

확인 수준: **PDF 원문 직접 판독**

> "A diet low in fermentable oligosaccharides, disaccharides and monosaccharides and polyols, as a second-line dietary therapy, is an effective treatment for global symptoms and abdominal pain in IBS, but **its implementation should be supervised by a trained dietitian** and fermentable oligosaccharides, disaccharides and monosaccharides and polyols should be reintroduced according to tolerance (**recommendation: weak, quality of evidence very low**)."

같은 문서의 근거 공백 인정:
> "RCTs have focused **solely on the initial 'elimination' phase** of the low FODMAP diet, which lasts between 4 and 6 weeks, **not the subsequent reintroduction and long-term 'personalisation' phase**. The effect of FODMAP reintroduction to tolerance on IBS symptoms is therefore **unclear**"

---

### 4-2. ACG (미국) — ⭐ 앱 설계에 가장 중요한 문단

**Lacy BE, Pimentel M, Brenner DM, et al. "ACG Clinical Guideline: Management of Irritable Bowel Syndrome." _American Journal of Gastroenterology_. 2021;116(1):17-44.**

확인 수준: **PDF 원문 직접 판독**

권고문 #10:
> "We recommend a limited trial of a low FODMAP diet in patients with IBS to improve global IBS symptoms. **Conditional recommendation; very low quality of evidence.**"

3단계 구조 서술:
> "It is critically important for providers using the low FODMAP diet to **properly instruct their patients on all 3 phases of the plan** (the first stage is substitution of foods with low FODMAP choices; the second stage is a **gradual reintroduction** of foods into the diet while assessing symptoms; the third stage is personalization of the diet to avoid foods that trigger symptoms)."

> "In the second phase, responders should undergo a **gradual reintroduction of foods containing individual FODMAPs** to determine their sensitivities."

**⭐ 핵심 문단 (전문 인용):**
> "In summary, this guideline committee believes that the complexity of the low FODMAP diet, combined with the potential for nutritional deficiencies, and the time and resources required to provide proper counseling on the 3 phases of the plan, **requires the services of a properly trained GI dietician. This, however, is not evidence-based but certainly warrants future study. If a trained GI dietician is not available or if a patient cannot afford to see a dietician, it is important for providers to distribute high-quality teaching materials which can allow an IBS patient to implement the diet in a medically responsible manner.**"

**→ 두 가지가 결정적입니다: ① 영양사 필수 주장이 "not evidence-based"라고 스스로 인정 ② 대체 수단으로 "high-quality teaching materials"를 명시적으로 승인.**

---

### 4-3. 2025 Seoul Consensus (한국 현행 가이드라인)

**Choi Y, et al. "2025 Seoul Consensus on Clinical Practice Guidelines for Irritable Bowel Syndrome." _J Neurogastroenterol Motil_. 2025 Apr 30;31(2):133-169. doi:10.5056/jnm25007**

확인 수준: **PMC 본문 확인**

> "Since most studies have involved dieticians, **their participation is encouraged. If dietitians are unavailable, high-quality teaching materials should be used.**"

**→ ACG와 동일한 구조의 예외 조항. 한국 가이드라인이 앱/교육자료 경로를 명시적으로 승인한 셈입니다.**

---

### 4-4. Monash

확인 수준: **웹 원문 판독**

> "A FODMAP diet should be followed **under the guidance of a dietitian** who has specialty skills in managing IBS and using a FODMAP diet."

재도입 단계:
> "best completed **under the guidance of a dietitian**, who will advise you on when to reintroduce; which foods to reintroduce with (e.g. mango to test your tolerance to excess fructose); the amount of the reintroduction food to have, and the order"

단, Monash 자체 앱에 재도입 기능을 내장하고 있으며:
> "the foods and doses suggested in the reintroduction setting of the app are **a guide, not a rule book**"

**주의:** Monash는 자사 앱으로 재도입 용량을 제공하면서도 문서상으로는 영양사 감독을 권고하는, 다소 이중적인 위치입니다.

---

### 4-5. KCL 계열의 현실 인식

**Lomer 2023** (확인 수준: 오픈액세스 웹 원문 판독):
> "The optimal delivery of low FODMAP education is **dietitian-led**"
> "patients are provided with structured information on FODMAP reintroduction and personalisation **which is rarely considered without the support of a dietitian**"

**→ 영양사가 없으면 환자들이 재도입을 아예 시도하지 않는다는 관찰. 앱의 존재 이유이기도 합니다.**

**KCL 챌린지북 배포 방식** (확인 수준: PDF 원문 판독):
> "**Registered dietitians** can order further copies of this publication from: www.kcl.ac.uk/fodmaps"

**→ 환자 직접 배포가 아니라 등록영양사를 통한 배포 구조.**

---

### 4-6. ⭐ 앱 전달의 실증 선례 — 가장 중요한 근거

**Dimidi E, Belogianni K, Whelan K, Lomer MCE. "Gut Symptoms during FODMAP Restriction and Symptom Response to Food Challenges during FODMAP Reintroduction: A Real-World Evaluation in 21,462 Participants Using a Mobile Application." _Nutrients_. 2023;15(12):2683. doi:10.3390/nu15122683**

확인 수준: **PMC 본문 확인** (PMC10305236)

- **KCL 연구진(Whelan, Lomer 본인)이 직접 수행·발표**
- 앱: **FODMAP by FoodMaestro**
- 총 사용자 **21,462명**
- 그중 **2,053명이 32종 식품에 대해 8,760건의 챌린지를 완료**
- **앱이 사용한 프로토콜: Day 1 = 사전 정의된 tolerance threshold, Day 2 = 2배, Day 3 = 3배. 매일 증상 설문. 증상 발생 시 3일 washout.**
  → **KCL/NHS 계열과 정확히 동일**
- 저자 결론: 앱은 "lack of dietitians who have the expertise to deliver the low FODMAP diet"에 대한 대안 전달 수단이며, 앱이 "educate people on the low FODMAP diet and improve symptoms"할 수 있음을 입증

**증상 유발 빈도 (실사용 데이터):**

| 식품 | 증상 유발 비율 |
|---|---|
| Wheat bread | 474/1,146 (**41%**) |
| Wheat pasta | 222/548 (**41%**) |
| Milk | 274/687 (**40%**) |
| Onion | 359/918 (**39%**) |
| Garlic | 245/699 (**35%**) |

---

### 4-7. 실제 임상 서비스에서의 통과율 ⭐

**Foulkes R, Shah P, Twomey A, Dami L, Jones D, Lomer MCE. "A service evaluation of FODMAP restriction, FODMAP reintroduction and long-term follow-up in the dietary management of irritable bowel syndrome." _J Hum Nutr Diet_. 2025;38:e13393. doi:10.1111/jhn.13393**

확인 수준: **PMC 본문 확인** (PMC11589392)

- "all FODMAP advice was provided by **dietitians experienced** in educating on the LFD as part of routine clinical practice"
- 재도입/개인화 순응도: **138/180 (77%)**
- 챌린지 정보 보유: **169/184 (92%)**
- **"1361 challenges took place, with 965 (71%) challenges being tolerated"**
- 식품별 통과율: **wheat bread 74%**, garlic 62%, **onion 57%**

**→ 재도입 챌린지의 71%는 통과합니다. 대부분의 환자가 대부분의 음식을 되찾습니다. 온보딩 메시지로 매우 강력합니다.**

---

## 5. 출처별 프로토콜 차이

| 항목 | **Monash** (호주) | **KCL / Guy's & St Thomas'** (영국) | **NHS 트러스트** (Glos·CUH) | **연구 프로토콜** (Van den Houte 2024) |
|---|---|---|---|---|
| 증량 방식 | amber → red → higher red (신호등 등급) | Day 1만 지정, Day 2·3은 **영양사가 개별 기입** (샘플 기준 공란) | **1배 → 2배 → 3배** | 증량 없음, 고정 고용량 |
| 챌린지 길이 | 3일 | 3일 | 3일 | **7일** |
| 세척기간 | 2~3일 또는 증상 진정까지 | 명시 없음 (샘플 기준) | **3일** | **2일** |
| 프럭탄 취급 | **4개 분할** (곡물/채소과일/양파/마늘) | **재도입할 식품마다 각각** | 밀·양파·마늘·리크 각각 | 단일 (분말) |
| 빵 사용 여부 | ✗ **제외** (국가별 편차) | ○ 사용 | ○ 사용 | 해당 없음 |
| 총 기간 | **6~8주** | 명시 못 찾음 | **6~10주** (CUH) | 9주 |
| 통과 식품 즉시 복귀 | 언급 없음 | ✗ **전체 완료 후** | ✗ **전체 완료 후** | 해당 없음 |
| 증상 시 규칙 | 중단, 나중에 재시험 | 해당 FODMAP **전면 회피**, 나중에 훨씬 적은 양으로 재시험 | 중단 → **중단 시점이 곧 부분내성 판정** | 해당 없음 |
| 결과 표현 | green/amber/red serving 등급 | 이분 + 재시험 | 3단계 (중단 일차 기반) | 증상 유발 여부 |
| 용량 공개 | ✗ **앱 내부에만** | 샘플 PDF는 Day 1만 | ○ **완전 공개** | ○ 공개 |
| 영양사 감독 | 권고 | 등록영양사 통한 배포 | "should be used alongside advice from your dietitian" | 연구진 관리 |

### 5-1. 결정적 차이 3가지

1. **프럭탄 분할 방식**: Monash는 4개 고정 카테고리, KCL은 "재도입하고 싶은 식품마다 각각"(개수 무제한). KCL 방식이 더 철저하지만 환자 부담이 훨씬 큽니다.

2. **용량 결정 주체**: NHS 자료는 Day 1 용량을 문서에 못박고 배수로 자동 증량 → **앱으로 그대로 옮길 수 있음**. Monash는 앱 등급에 의존 → **자체 FODMAP DB 필요**. KCL 샘플은 Day 2·3을 공란으로 두어 영양사가 개별 결정 → **앱으로 옮길 수 없음**.

3. **통과 식품 복귀 시점**: KCL/NHS는 전체 완료까지 보류, Monash는 명시 없음. 전자가 결과 해석의 타당성 면에서 우수합니다.

---

## 6. 한국어 자료 현황

### 결론: **한국 가이드라인에는 재도입 프로토콜이 존재하지 않습니다.**

---

### 6-1. 2017 개정판 — 재도입 언급 자체가 없음

**정혜경. "2017 과민성장증후군의 임상진료지침 개정안 소개." _Korean J Gastroenterol_. 2018;72(5):252-257. doi:10.4166/kjg.2018.72.5.252**
(영문 원본: Song KH, Jung HK, Kim HJ, et al. "Clinical practice guidelines for irritable bowel syndrome in Korea, 2017 revised edition." _J Neurogastroenterol Motil_. 2018;24:197-215.)

확인 수준: **한국어 PDF 전문을 직접 텍스트 추출하여 기계적 검색**

PDF URL: https://synapse.koreamed.org/upload/synapsedata/pdfdata/0028kjg/kjg-72-252.pdf

**키워드 등장 횟수 (기계 검색 결과):**

| 키워드 | 등장 횟수 |
|---|---|
| **재도입** | **0회** |
| **영양사** | **0회** |
| **단계** | **0회** |
| **식이요법** | **0회** |
| **임상영양** | **0회** |
| FODMAP | 13회 (전부 제한 식이 맥락) |

**유일한 FODMAP 권고문 (원문 그대로):**
> "fermentable oligosaccharides, disaccharides, monosaccharides, and polyols (FODMAP) **제한 식이**는 과민성장증후군 증상 조절에 효과적이다."
> - 권고수준: **약함**
> - 증거수준: **낮음**
> - 전문가 의견: 전적으로 동의함(5.0%), 대체로 동의함(67.5%), 일부 동의함(25.0%), 대체로 동의하지 않음(2.5%), 전적으로 동의하지 않음(0%), 모르겠음(0%)

본문의 한계 인정:
> "FODMAP 제한 식이의 부작용은 보고되지 않았으나, 이 연구들의 **시행 기간이 4주 이하로 상대적으로 짧아**, 장기간의 FODMAP 제한 식이가 어떠한 영향을 끼칠지에 대한 후속 연구가 필요하다."

**영문 원본(J Neurogastroenterol Motil 2018;24:197-215)도 확인:**
확인 수준: 웹 본문 확인
- 권고문: "A low-fermentable oligosaccharides, disaccharides, monosaccharides, and polyols diet, which restricts dietary short-chain carbohydrates, is effective in reducing the symptoms of irritable bowel syndrome." (Grade of recommendation: 2, Level of evidence: C)
- **"reintroduction" 미등장 / "rechallenge" 미등장 / "three phases" 미등장 / "dietitian" 미등장**

**참고 — 2017 지침 Table 2에 등재된 한국 특유 고FODMAP 식품:**
소스류 올리고당 항목에 **kimchi, doenjang, gochujang, ssamjang, dumpling** 명시.

---

### 6-2. 2025 Seoul Consensus — 3단계를 처음 언급, 그러나 프로토콜은 없음

**Choi Y, et al. "2025 Seoul Consensus on Clinical Practice Guidelines for Irritable Bowel Syndrome." _J Neurogastroenterol Motil_. 2025 Apr 30;31(2):133-169. doi:10.5056/jnm25007**

확인 수준: **PMC 본문 확인** (PMC11986658)

**Statement 8:**
> "A low FODMAP diet is effective in improving the overall symptoms of IBS."
> - Level of evidence: **Low**
> - Strength of recommendation: **Weak**

**3단계 구조를 처음으로 명시:**
> "The low FODMAP diet comprises 3 phases. The initial 'elimination' phase is followed by a '**reintroduction**' phase and a subsequent long-term '**personalization**' phase."

**그러나 근거 공백을 명시:**
> "The aforementioned 14 RCTs focused **solely on the initial 'elimination' phase** of the low FODMAP diet, which lasts between 3 and 6 weeks, and **not the subsequent reintroduction and long-term 'personalization' phase**. The effects of FODMAP reintroduction on IBS symptoms and long-term effects of a low FODMAP diet **have not been sufficiently reported**."

**영양사 관련:**
> "Since most studies have involved dieticians, their participation is encouraged. **If dietitians are unavailable, high-quality teaching materials should be used.**"

**→ 구체적 재도입 프로토콜·시험 식품·용량·기간은 전혀 제시하지 않습니다.**

---

### 6-3. 국내 병원 환자교육 자료

확인 수준: **검색 스니펫 수준 (본문 직접 판독 실패)**

검색한 자료:
- 삼성서울병원 「저 포드맵 식사, 민감한 나의 장을 부탁해~」 (알기쉬운 영양소)
  URL: http://www.samsunghospital.com/home/healthInfo/content/contenView.do?CONT_SRC_ID=32421&CONT_SRC=HOMEPAGE&CONT_ID=4188&CONT_CLS_CD=001021003005
  → **리다이렉트 루프로 본문 직접 판독 실패**
- 성가롤로병원 건강정보 (고포드맵 식품 관련)
- EndoTODAY 이준행 「저포드맵 식사. 과민성장증후군」 (http://endotoday.com/endotoday/ibs.html)

**관찰:** 검색된 국내 자료는 대부분 **고FODMAP/저FODMAP 식품 목록과 제한기 설명**에 그칩니다. 3단계 구조를 개념적으로 소개하는 일부 상업/블로그성 한국어 자료(유유제약 블로그 등)가 있으나, **구체적 시험 식품과 1·2·3일차 용량을 제시한 한국어 자료는 찾지 못했습니다.**

### 6-4. fodmap.kr

**검색으로 접근 가능한 재도입 안내를 찾지 못했습니다.** (확인 수준: 검색만 수행, 사이트 직접 확인 실패)

---

### 6-5. 종합 — 한국 자료 상태

| 항목 | 상태 |
|---|---|
| 한국 가이드라인의 재도입 프로토콜 | ❌ **존재하지 않음** (2025 컨센서스도 3단계 언급만) |
| 한국어 재도입 용량표 | ❌ **찾지 못함** |
| 국내 병원 재도입 환자교육 자료 | ❌ **찾지 못함** (제한기 자료만 확인) |
| 한식(김치·된장·고추장) 챌린지 용량 | ❌ **세계 어느 자료에도 없음** |
| 한국 가이드라인의 앱/교육자료 승인 | ✅ **2025 서울 컨센서스가 명시적으로 승인** |

**→ 이것은 공백이자 기회입니다. 국내에 한국어 재도입 프로토콜이 사실상 없으며, 한식 기반 시험 식품에 대한 지침은 어디에도 없습니다.**

---

## 7. 우리 앱 설계 함의

### 7-1. 임상 프로토콜을 그대로 옮겨도 되는 부분

#### ① 3일 챌린지 + 1배/2배/3배 증량 — **최우선 채택 권장**

- 근거: KCL·Gloucestershire NHS·Cambridge University Hospitals NHS·Lomer 2023·**Dimidi 2023(앱 실증 선례)** 모두 동일
- **Monash의 amber/red 방식보다 앱 구현에 결정적으로 유리**합니다. 자체 FODMAP 함량 DB 없이 "Day 1 분량 × 2, × 3"만 표시하면 됩니다.
- Dimidi 2023에서 이미 2,053명이 이 방식으로 앱 상에서 8,760건을 완료한 실증이 있습니다.

#### ② 배경 저포드맵 유지 + 통과 식품도 전체 완료까지 보류

- 근거: KCL, Gloucestershire NHS, CUH NHS 원문 일치
- 규칙이 단순하고 결과 해석의 타당성을 지키는 핵심입니다.

#### ③ 3단계 범주 판정 — Gloucestershire 방식 채택 권장

**중단한 날짜가 곧 판정**이므로 별도 판정 로직이 불필요합니다:

| 중단 시점 | 판정 |
|---|---|
| Day 1에서 증상 | 소량도 불내성 |
| Day 2에서 중단 | "can tolerate **small amounts**" |
| Day 3에서 중단 | "can manage a **moderate portion**... but not an unlimited amount" |
| Day 3 완주 | "**do not react** to this group" |

#### ④ 챌린지 단위 9~11개 (프럭탄 4분할, 폴리올 2분할)

- 근거: Monash 공식 표(직접 판독), KCL, NHS 일치

#### ⑤ 가정 단위 + g/mL 병기

- 통설 ⑤와 달리 원문들이 실제로 이렇게 합니다.
- 저울 사용을 **강제하지 말되 g을 표시**하는 것이 원문에 충실합니다.

#### ⑥ 세척 3일 기본값

- Monash 2~3일과 NHS 3일의 교집합에서 보수적으로 3일 선택
- "또는 증상이 가라앉을 때까지"를 병기

#### ⑦ 재시험(re-challenge)을 1급 기능으로

- Monash: "repeating challenges of poorly tolerated foods and FODMAPs over time to see whether your tolerance changes"
- KCL: "You can re-challenge again in much smaller amounts at a later date"
- Gloucestershire NHS: "consider re-challenging again with a smaller amount at a later date"
- **모든 주요 출처가 재시험을 권고합니다.**

---

### 7-2. 환자 부담 때문에 완화해야 할 부분

#### ① 총 6~10주는 너무 깁니다 → "우선 챌린지" 모드

- 앱에서 완주율이 무너질 지점입니다.
- **완화안:** 전체 9~11개가 아니라 사용자가 의심하는 **3~4개만 먼저** 고르게 합니다.
- **근거 있는 완화입니다:**
  - Monash: "there is **no particular rule to the order** of FODMAPs to reintroduce!"
  - Pelletier 2026: RD의 **73%가 순서를 환자와 함께 결정**
- 유발 빈도 데이터로 추천 순서를 제시할 수 있습니다 (아래 §7-3 ②)

#### ② "증상이 3일간 최소일 때만 시작" 게이트는 완화 필요

- 엄격히 적용하면 중증 환자는 영원히 시작하지 못합니다.
- **완화안:** 하드 블록 대신 **경고 + 사용자 판단**으로.
- 원문도 "symptoms you are **not willing to tolerate**"처럼 주관적 수용 가능성에 맡기는 표현을 씁니다.

#### ③ 격일 스케줄은 기본값으로 넣지 말 것

- 프럭탄·GOS 격일 스케줄은 기간을 거의 2배로 늘립니다.
- **완화안:** "지난 챌린지에서 증상이 늦게 나타났다"고 응답한 사용자에게만 **옵션으로** 제안.

#### ④ KCL의 "재도입할 식품마다 각각 챌린지"는 채택하지 말 것

- 개수 무제한이라 앱에서 감당 불가능합니다.
- **Monash의 4개 고정 프럭탄 카테고리를 채택**하는 것이 현실적입니다.

---

### 7-3. 반드시 설계에 반영해야 할 위험과 기회

#### ① ⚠️ 노시보 효과가 매우 큽니다

- **Van den Houte 2024 이중맹검: 포도당 위약이 26%에서 증상 유발** (실제 FODMAP은 23~56%)
- 비맹검 자가 챌린지는 **구조적으로 위양성이 많이 나옵니다.**
- **설계 반영:**
  - "불내성 확정" 같은 단정적 문구 금지
  - 재시험 기능을 1급 기능으로
  - 결과 화면에 "이번 결과는 잠정적이며 시간이 지나면 달라질 수 있습니다" 취지의 문구

#### ② 가장 흔한 유발원 데이터로 챌린지 순서 추천 가능

**Van den Houte 2024 (이중맹검, 순수 FODMAP):**
프럭탄 56% > 만니톨 54% > GOS 35% > 락토스 28% > 과당 27% > 포도당(위약) 26% > 소르비톨 23%

**Dimidi 2023 (앱 실사용, 식품 기반):**
밀빵 41% ≈ 밀파스타 41% > 우유 40% > 양파 39% > 마늘 35%

**→ 기대치 설정과 챌린지 순서 추천에 사용 가능. 단, 이 두 데이터셋은 측정 방식이 달라 직접 비교는 부적절합니다.**

#### ③ ✅ "71%의 챌린지는 통과합니다"를 온보딩에 넣을 것

- Foulkes/Lomer 2025: **1,361건 중 965건(71%) 통과**
- 식품별: wheat bread 74%, garlic 62%, onion 57%
- **대부분의 환자는 대부분의 음식을 되찾습니다.** 재도입 착수 동기를 크게 올릴 수 있는 실증 수치입니다.

#### ④ ⚠️ 오래된 NHS 용량표를 그대로 쓰지 말 것

Monash 재검사에서 단독 시험 부적격 판정을 받은 식품 (§2-4 표 참조):
아보카도(perseitol), 꿀(프럭탄 혼입), 콜리플라워·고구마(프럭탄 혼입), 양송이(프럭탄), 아몬드·병아리콩·완두(프럭탄 혼입), 블랙베리(과당), 커스터드·리코타(락토스 부족)

**→ 가장 방어 가능한 조합: Monash 최신 식품 목록 + NHS의 배수 증량 방식 + NHS의 Day 1 절대 용량(단, 부적격 식품 제외)**

#### ⑤ 면책·포지셔닝 문구는 가이드라인 원문을 직접 인용할 것

앱의 정확한 임상적 위치는 다음과 같습니다:

> ACG 2021: "If a trained GI dietician is not available or if a patient cannot afford to see a dietician, it is important for providers to distribute **high-quality teaching materials** which can allow an IBS patient to implement the diet in a medically responsible manner."

> 2025 Seoul Consensus: "Since most studies have involved dieticians, their participation is encouraged. **If dietitians are unavailable, high-quality teaching materials should be used.**"

**→ 앱을 "영양사 대체재"가 아니라 "high-quality teaching material"로 포지셔닝하는 것이 근거에 부합하며, 한국 가이드라인의 명시적 승인을 받은 위치입니다.**

#### ⑥ ⚠️ 한국 특유의 공백 — 발효 장류

- 김치·된장·고추장·마늘은 2017 한국 가이드라인 Table 2가 직접 고FODMAP으로 지목했습니다.
- **그러나 이들에 대한 챌린지 용량은 세계 어느 자료에도 없습니다.**
- 마늘·양파 챌린지 용량은 서구 자료를 그대로 쓸 수 있습니다.
- **발효 장류는 자체 판단이 필요하며, 근거 없이 숫자를 만들면 안 됩니다.**
- **권장:** 초기 버전에서는 장류를 챌린지 대상에서 제외하고 "혼합 FODMAP(mixed FODMAP)"으로 분류. 개인화기에서 개별 관찰 대상으로만 다룸.

#### ⑦ 아형별 분기를 넣지 말 것

- IBS-C/IBS-D별 세척기간·프로토콜 차등 권고는 **어떤 1차 출처에서도 찾지 못했습니다.**
- 앱에서 아형별 분기를 넣는다면 그것은 **근거 없는 자체 판단**이 됩니다.

---

## 8. 확인 수준 요약 — 명세서 인용 전 반드시 확인

### 8-1. 전문/원문 직접 판독 (신뢰도 최상)

| 문서 | 방법 |
|---|---|
| KCL 챌린지북 샘플 PDF | pdftotext 추출 |
| Gloucestershire NHS PDF | pdftotext + **페이지 이미지 렌더링 후 육안 판독** (분수 글리프 확인) |
| BSG 2021 가이드라인 PDF | pdftotext 추출 + 키워드 검색 |
| ACG 2021 가이드라인 PDF | pdftotext 추출 + 키워드 검색 |
| 한국 2017 가이드라인 PDF (한국어) | pdftotext 추출 + **기계적 키워드 카운트** |
| Monash 재도입 업데이트 공식 Table 3 | **이미지 직접 다운로드 후 4분할 판독** |
| Cambridge University Hospitals 웹페이지 | 웹 본문 |
| Monash 블로그 5편 | 웹 본문 |

### 8-2. 본문 확인 (웹페이지/PMC 경유)

- 2025 Seoul Consensus (PMC11986658)
- Lomer 2023 _Proc Nutr Soc_ (오픈액세스)
- Dimidi 2023 _Nutrients_ (PMC10305236)
- Foulkes/Lomer 2025 _JHND_ (PMC11589392)
- 한국 2017 가이드라인 영문판 (JNM)
- FODMAP Friendly 챌린지 페이지
- A Little Bit Yummy 재도입 페이지
- Karlijn's Kitchen 재도입 페이지

### 8-3. ⚠️ 초록/요약/스니펫만 — 명세서 인용 전 재확인 필요

| 문서 | 상태 |
|---|---|
| **Tuck & Barrett 2017** _J Gastroenterol Hepatol_ | 유료 장벽(HTTP 402), 요약만 |
| **Whelan K, et al. 2018** _JHND_ 31(2):239-255 | **유료 장벽, 원문 대조 실패.** 동일 KCL 그룹의 오픈액세스 Lomer 2023으로 대체함 |
| **Varney et al. 2017** 컷오프 수치 | **유료 장벽. 명세서 인용 금지** |
| **Van den Houte 2024** _Gastroenterology_ | 원문 유료. ACG EBGI 요약 페이지 경유 |
| **Pelletier 2026** _Gastro Hep Advances_ | 보도자료(news-medical.net) 경유 |
| **Monash 앱 용량 숫자** | **앱 내부에만 존재. 2차 출처 경유 — 앱에서 직접 재확인 필요** |
| 삼성서울병원 페이지 | 리다이렉트 루프로 본문 판독 실패 |

### 8-4. 🔍 찾지 못함

1. **가정 계량 단위 → FODMAP g 환산표 전반**
   (유일한 예외: 우유 125ml ≈ 락토스 4g — Lomer 2023)
2. **IBS 아형(IBS-C/D)별 세척기간 또는 프로토콜 차등 권고**
3. **한국어 재도입 용량표** (국내 병원·학회·fodmap.kr 전부)
4. **KCL 챌린지북의 Day 2·Day 3 지정 용량**
   (샘플 PDF는 Day 1만 제시하고 나머지는 영양사가 개별 기입하는 공란 구조)
5. **한식 발효 장류(김치·된장·고추장)의 챌린지 용량** — 세계 어느 자료에도 없음
6. **KCL 챌린지북 전체 판본** (공개된 것은 3페이지 샘플뿐. 등록영양사만 주문 가능)

---

## 9. 전체 출처 목록

### 가이드라인

1. Vasant DH, et al. British Society of Gastroenterology guidelines on the management of irritable bowel syndrome. _Gut_. 2021;70(7):1214-1240. doi:10.1136/gutjnl-2021-324598
2. Lacy BE, Pimentel M, Brenner DM, et al. ACG Clinical Guideline: Management of Irritable Bowel Syndrome. _Am J Gastroenterol_. 2021;116(1):17-44.
3. Choi Y, et al. 2025 Seoul Consensus on Clinical Practice Guidelines for Irritable Bowel Syndrome. _J Neurogastroenterol Motil_. 2025;31(2):133-169. doi:10.5056/jnm25007
4. Song KH, Jung HK, Kim HJ, et al. Clinical practice guidelines for irritable bowel syndrome in Korea, 2017 revised edition. _J Neurogastroenterol Motil_. 2018;24:197-215.
5. 정혜경. 2017 과민성장증후군의 임상진료지침 개정안 소개. _Korean J Gastroenterol_. 2018;72(5):252-257.

### 학술 논문

6. Lomer MCE. The low FODMAP diet in clinical practice: where are we and what are the long-term considerations? _Proc Nutr Soc_. 2023;83(1):17-27. doi:10.1017/S0029665123003579 **[Open Access]**
7. Dimidi E, Belogianni K, Whelan K, Lomer MCE. Gut Symptoms during FODMAP Restriction and Symptom Response to Food Challenges during FODMAP Reintroduction: A Real-World Evaluation in 21,462 Participants Using a Mobile Application. _Nutrients_. 2023;15(12):2683. doi:10.3390/nu15122683 **[Open Access]**
8. Foulkes R, Shah P, Twomey A, Dami L, Jones D, Lomer MCE. A service evaluation of FODMAP restriction, FODMAP reintroduction and long-term follow-up in the dietary management of irritable bowel syndrome. _J Hum Nutr Diet_. 2025;38:e13393. doi:10.1111/jhn.13393
9. Van den Houte K, Colomier E, Routhiaux K, et al. Efficacy and findings of a blinded randomized reintroduction phase for the low FODMAP diet in irritable bowel syndrome. _Gastroenterology_. 2024;167:333-42.
10. Pelletier K, Villarreal M, Klar R, et al. FODMAP Reintroduction in Clinical Practice: Surveying the Gaps and Opportunities. _Gastro Hep Advances_. 2026. doi:10.1016/j.gastha.2026.100908
11. Whelan K, Martin LD, Staudacher HM, Lomer MCE. The low FODMAP diet in the management of irritable bowel syndrome: an evidence-based review of FODMAP restriction, reintroduction and personalisation in clinical practice. _J Hum Nutr Diet_. 2018;31(2):239-255. **[유료 — 미확인]**
12. Tuck C, Barrett J. Re-challenging FODMAPs: the low FODMAP diet phase two. _J Gastroenterol Hepatol_. 2017;32(S1):11-15. doi:10.1111/jgh.13687 **[유료 — 미확인]**
13. Varney J, Barrett J, Scarlata K, Catsos P, Gibson PR, Muir JG. FODMAPs: food composition, defining cutoff values and international application. _J Gastroenterol Hepatol_. 2017;32:53-61. doi:10.1111/jgh.13698 **[유료 — 미확인]**

### 환자교육 자료

14. Reintroducing FODMAPs (SAMPLE Challenge book, DEC14 V3). Guy's and St Thomas' NHS Foundation Trust & King's College London, Dec 2014. https://www.kcl.ac.uk/slcps/assets/fodmap/SAMPLEChallenge-book-DEC14V3.pdf
15. Re-challenging after the low FODMAP approach. Gloucestershire Hospitals NHS Foundation Trust, Oct 2020. https://www.gloshospitals.nhs.uk/media/documents/FODMAP_reintroduction_information_oct_20.pdf
16. Reintroducing fermentable carbohydrates. Cambridge University Hospitals NHS Foundation Trust. https://www.cuh.nhs.uk/patient-information/reintroducing-fermentable-carbohydrates/

### Monash 공식

17. The 3 phases of the low FODMAP diet. https://www.monashfodmap.com/blog/3-phases-low-fodmap-diet/
18. Practical tips for FODMAP Reintroduction. https://www.monashfodmap.com/blog/practical-tips-fodmap-reintroduction/
19. Order of FODMAP reintroduction. https://www.monashfodmap.com/blog/order-of-fodmap-reintroduction/
20. Interpreting Reintroduction Challenges. https://www.monashfodmap.com/blog/interpreting-reintroduction-challenges/
21. Reintroduction Update (Table 3 이미지 포함). https://monashfodmap.com/blog/reintroduction-update/
22. Reintroduction using the diary function. https://www.monashfodmap.com/blog/reintroduction-using-diary-function/
23. Starting the Low FODMAP Diet. https://www.monashfodmap.com/ibs-central/i-have-ibs/starting-the-low-fodmap-diet/

### 2차 출처 (용량 확인 경유)

24. Karlijn's Kitchen. FODMAP reintroduction phase: a complete guide. https://www.karlijnskitchen.com/en/reintroduction-phase/ (Monash 앱 2025-05 기준 명시)
25. A Little Bit Yummy. How does the FODMAP Reintroduction Phase work? https://alittlebityummy.com/blog/testing-fodmaps-how-does-the-reintroduction-phase-work/
26. FODMAP Friendly. Low FODMAP Challenge Phase. https://fodmapfriendly.com/blog-posts/low-fodmap-challenge-phase-fodmap-friendly/
27. ACG EBGI. Reintroducing Foods After Completing Restrictive Low FODMAP Diet (Nov 2024). https://gi.org/journals-publications/ebgi/schoenfeld_nov2024/

---

_본 문서는 추측으로 만들어낸 수치를 포함하지 않습니다. 확인하지 못한 항목은 모두 "찾지 못함" 또는 "미확인"으로 명시했습니다._
