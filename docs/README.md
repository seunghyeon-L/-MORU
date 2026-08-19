# MORU — 문서 지도

> IBS(과민성 장증후군) 식이 관리 앱 · 해커톤 프로젝트 · 개발 기간 2주
> 최종 정리: 2026-08-19

---

# ⭐ 어디부터 읽나

| 물어보는 것 | 읽을 것 |
|---|---|
| **설계 원칙 · 번복 이력** | `spec-02-design-updates.md` ⭐ **충돌 시 이게 우선** |
| 기능 명세 (서술형) | `spec-03-feature-spec.md` |
| 기능 정의서 (표·화면 단위) | `spec-04-function-list.md` |
| 디자인 · 피그마 · 컬러 | `design-01-figma-and-system.md` |
| 개발 · 서버 · API 키 | `dev-01-stack-and-infra.md` |
| DB 스키마 · 백엔드 분담 | `dev-02-db-and-workshare.md` |
| **API 계약** (프론트가 볼 것) | `dev-03-api-contract.md` |
| **챗봇 안전 테스트** | `dev-04-safety-test.md` |
| **개발하며 신경 쓴 것** (인사이트) | `insights-02-engineering.md` |
| **교수님 자문 원문** | `expert-02-professor-feedback.md` |
| 교수님께 물어볼 질문 | `expert-01-questions.md` |
| **설문 원본 61명** | `data/survey-raw-2026-08.md` ⚠️ 재수집 불가 |
| 근거 문헌 | `research-01-*.md` + `research/` 5건 |
| 비즈니스 · 브랜드 | `business-01-model.md`, `brand-01-identity.md` |

---

# 절대 어기면 안 되는 원칙 4개

전 문서에 걸쳐 반복되는 것. **이걸 어기면 제품이 무너진다.**

```
1. 판정하지 않는다
   "위험 / 유발 / 트리거" 단정 금지. 관찰된 패턴만 제시하고 교란 요인을 병기

2. 점수 · 게이지 · 연속기록(스트릭) 금지
   제한을 보상하면 섭식장애 위험. "SYMPTOM SCORE" 같은 명칭도 금지

3. 개인 역치는 숫자가 아니라 등급으로
   재현성 ICC 0.70 / 개인 간 CV 65~80% / 1년에 29% 저절로 역전
   (락토스만 "우유 200mL 정도" 같은 실물 기준 표현 예외)

4. AI는 입력·출력에만. 판정은 결정론적 코드
   경고 신호 판정에 AI 사용 절대 금지 (환각이 사람을 다치게 함)
```

---

# 파일 목록

## 설계
| 파일 | 내용 |
|---|---|
| `spec-02-design-updates.md` | ⭐ 위키 이후 확정·**번복**된 결정. 사각형 창 폐기, 데이터 규칙 8, 거짓음성 7층 방어, L1~L4 신뢰도 |
| `spec-03-feature-spec.md` | 기능 명세 v3.1. 두 갈래 여정, 상향식(FODMAP gentle), 2-of-3 재현, 신뢰 유지 설계 |
| `spec-04-function-list.md` | 기능 정의서. 91행 표 · 노출 방식(진입/인라인/자동/카드/푸시) · 푸시 6종 정책 |
| `insights-01-app-design.md` | 초기 설계 인사이트. 핵심 명제 6개 |

## 디자인·개발
| 파일 | 내용 |
|---|---|
| `design-01-figma-and-system.md` | 피그마 2개 URL · 컬러 25개 hex · 타이포 11스타일 · 화면 19개 노드ID · 일러스트 제작법 |
| `dev-01-stack-and-infra.md` | Flutter + 가비아 VPS + OpenAI. 서버 세팅 체크리스트 · 함정 3개 · 예상 엔드포인트 |
| `brand-01-identity.md` | 브랜드 브리프 ⚠️ 서비스명이 "이만큼"으로 되어 있음 (현재는 MORU) |
| `business-01-model.md` | BM ⚠️ §4는 폐기된 안. 최신은 spec-02 §11 |

## 근거·조사
| 파일 | 내용 |
|---|---|
| `research-01-ibs-perception-evidence.md` | 주관 지표 의존의 정당성. 바로스탯·FDA PRO |
| `research/research-02-stress-threshold.md` | 스트레스 → 역치 효과 크기. **계수 0.90 근거** |
| `research/research-03-reintro-protocol.md` | 재도입 프로토콜 원문. **71% 통과율 · NHS 용량표** |
| `research/research-04-dose-threshold.md` | 용량-반응. **역치를 숫자로 주면 안 되는 근거** · 한국인 데이터 |
| `research/research-05-ref-wellness-apps.md` | Ate · Clue · Cara Care 디자인 분석 |
| `research/research-06-ref-korean-typo.md` | 토스 · 파스타 · Finch · Bearable. **TDS 타이포 토큰** |

## 자문·조사
| 파일 | 내용 |
|---|---|
| `expert-01-questions.md` | 의대 5문항 + 알고리즘 6문항. 각각 "이미 확인한 것 / 못 채운 것" 포함 |
| `expert-02-professor-feedback.md` | **간호학과·약학과 교수님 자문 원문.** 두 분 의견이 갈린 지점 포함 |
| `data/survey-raw-2026-08.md` | ⚠️ **설문 원본 61명. 재수집 불가** |
| `survey-01-user-research.md` | 설문 설계안 |
| `survey-01-questionnaire.md` | 설문 문항 (55문항 판) |
| `survey-02-form-operations.md` | 구글폼 운영·분석 계획 |
| `survey_form.gs` | 구글폼 자동 생성 Apps Script |

## 기타
| 경로 | 내용 |
|---|---|
| `한국 IBS 계절변동 연구 (번역본).pdf` | Hong et al. 2026 한국어 번역 |
| `../assets/refshots/` | 레퍼런스 앱 스크린샷 42장 (24MB) |
| `../server/` | 백엔드 스캐폴딩. `check-openai.mjs` |

---

# 현재 상태 요약

## 확정된 것

**제품**
- 두 갈래 여정: 기본 경로(통제 없는 관찰) / 선택 경로(표적 도전)
- **전면 제거기를 기본 경로에서 제외** — 최대 이탈 구간이라
- 상향식(FODMAP gentle) 채택 — 흔한 방아쇠 1~2개만 제한
- 분산 반복 단회 도전 + **2-of-3 재현** 판정
- 화면 19개 · 프로토타입 23개 연결 완료

**디자인**
- 세이지 그린 `#7E9F6E` / 크림 `#F8F3EA` / 텍스트 `#3A342C`
- Noto Sans KR
- 파스텔 플랫 일러스트 5종 제작 (4개 화면 배치)

**개발**
- Flutter + 가비아 VPS + OpenAI
- Firebase 사용 불가 (계정 한도)
- OpenAI API 연결 확인 완료 ✅

## 미결 (우선순위 순)

| # | 항목 | 어디에 |
|---|---|---|
| 1 | **가비아 상품 확인** (VPS인가 웹호스팅인가) | dev-01 §4.1 |
| 2 | 백엔드 언어 확정 (Node vs Python) | dev-01 §0 |
| 3 | **서비스명 MORU vs 이만큼** 불일치 | design-01 §1.1 |
| 4 | 본문 행간 170% → 150%? | design-01 §2.2 |
| 5 | 조리 계열 하한값 수치 | spec-03 §11 |
| 6 | 레드플래그 리스트 1차 출처 | expert-01 A-2 |
| 7 | 순서형 등급 합산의 통계적 정당성 | expert-01 B |
| 8 | Monash 데이터 라이선스 | spec-02 §12 |
| 9 | 의료기기 규제 경계 (식약처) | spec-02 §12 |
| 10 | 팀 역할 분담 · 2주 일정 | — |

## 다음에 할 일

```
1. 가비아 서버 생성 (Ubuntu 22.04 / 루트 100GB 단일 / SSH 키페어)
2. SSH 접속 → OS·메모리·디스크 확인
3. 1일차 세팅 체크리스트 (dev-01 §5)
4. API 엔드포인트 설계
5. 팀 회의 — 기능 확정 (spec-04 부록 C의 "최소 데모 경로 11개"부터)
```
