/**
 * 증상 기록 도메인 타입.
 *
 * 평상시에는 OverallState 만 기록하고,
 * '불편해요'를 선택했을 때만 SymptomDetail 을 추가로 기록한다.
 */

import type { Option } from './onboarding';

/* ------------------------------------------------------------------ */
/* 현재 상태 (symptom/index)                                            */
/* ------------------------------------------------------------------ */

export const OVERALL_STATE_OPTIONS = [
  { id: 'good', label: '좋아요' },
  { id: 'okay', label: '괜찮아요' },
  { id: 'uncomfortable', label: '불편해요' },
] as const satisfies readonly Option<string>[];

export type OverallState = (typeof OVERALL_STATE_OPTIONS)[number]['id'];

/* ------------------------------------------------------------------ */
/* 증상 종류 (symptom/detail, onboarding/symptoms)                      */
/* ------------------------------------------------------------------ */

export const SYMPTOM_TYPE_OPTIONS = [
  { id: 'abdominal-pain', label: '복통' },
  { id: 'bloating', label: '복부팽만' },
  { id: 'gas', label: '가스' },
  { id: 'diarrhea', label: '설사' },
  { id: 'constipation', label: '변비' },
  { id: 'urgency', label: '배변 급박감' },
  { id: 'cramp', label: '복부 경련' },
  { id: 'etc', label: '기타' },
] as const satisfies readonly Option<string>[];

export type SymptomType = (typeof SYMPTOM_TYPE_OPTIONS)[number]['id'];

/* ------------------------------------------------------------------ */
/* 불편함 정도 (symptom/severity)                                       */
/* ------------------------------------------------------------------ */

/** 1 ~ 9 */
export type Severity = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const SEVERITY_VALUES: readonly Severity[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/* ------------------------------------------------------------------ */
/* 항목별 불편함 정도 / 시점 / 부위 (symptom/detail)                     */
/* ------------------------------------------------------------------ */

export const SYMPTOM_INTENSITY_OPTIONS = [
  { id: 'none', label: '없음' },
  { id: 'mild', label: '조금' },
  { id: 'severe', label: '많이' },
] as const satisfies readonly Option<string>[];

export type SymptomIntensity = (typeof SYMPTOM_INTENSITY_OPTIONS)[number]['id'];

/** symptom/detail 1단계에서 항목별 강도를 묻는 증상 3가지 (Figma 문구 기준) */
export const SYMPTOM_CHECK_ITEMS = [
  { id: 'bloating', label: '배가 빵빵함' },
  { id: 'cramp', label: '쥐어짜는 통증' },
  { id: 'urgency', label: '급하게 화장실' },
] as const satisfies readonly Option<SymptomType>[];

export const ONSET_OPTIONS = [
  { id: 'just-now', label: '방금' },
  { id: 'hour-ago', label: '1시간쯤 전' },
  { id: 'morning', label: '오전부터' },
  { id: 'yesterday', label: '어제부터' },
] as const satisfies readonly Option<string>[];

export type Onset = (typeof ONSET_OPTIONS)[number]['id'];

export const DISCOMFORT_LOCATION_OPTIONS = [
  { id: 'upper', label: '윗배 (명치 쪽)' },
  { id: 'lower', label: '아랫배' },
] as const satisfies readonly Option<string>[];

export type DiscomfortLocation = (typeof DISCOMFORT_LOCATION_OPTIONS)[number]['id'];

/* ------------------------------------------------------------------ */
/* 교란 변수 / 오늘 평소와 다른 점 (symptom/detail)                      */
/* ------------------------------------------------------------------ */

export const CONTEXT_FACTOR_OPTIONS = [
  { id: 'poor-sleep', label: '잠을 적게 잤어요' },
  { id: 'stress', label: '스트레스를 많이 받았어요' },
  { id: 'alcohol', label: '술을 마셨어요' },
  { id: 'large-meal', label: '평소보다 많이 먹었어요' },
  { id: 'irregular-meal', label: '식사 시간이 불규칙했어요' },
  { id: 'menstruation', label: '월경 기간이에요' },
  { id: 'busy-schedule', label: '중요한 일정이 있었어요' },
  { id: 'etc', label: '기타' },
  { id: 'none-change', label: '특별한 변화는 없어요' },
] as const satisfies readonly Option<string>[];

export type ContextFactor = (typeof CONTEXT_FACTOR_OPTIONS)[number]['id'];

/* ------------------------------------------------------------------ */
/* 증상 기록                                                            */
/* ------------------------------------------------------------------ */

export type SymptomRecord = {
  id: string;
  /** ISO 8601 문자열 — 기록한 시각 */
  recordedAt: string;
  state: OverallState;
  /** state 가 'uncomfortable' 일 때만 채워진다 */
  detail?: SymptomDetail;
};

export type SymptomDetail = {
  symptoms: SymptomType[];
  symptomEtcText?: string;
  /** 항목별(배 빵빵함/쥐어짜는 통증/급하게 화장실) 없음·조금·많이 강도 */
  symptomIntensities?: Partial<Record<SymptomType, SymptomIntensity>>;
  /** ISO 8601 문자열 — 증상이 나타난 시각 */
  occurredAt: string;
  /** 언제부터 그러셨는지 (사용자가 고른 상대적 시점) */
  onset?: Onset;
  /** 어디가 불편한지 */
  location?: DiscomfortLocation;
  /** 변에 피가 섞여 있었는지 — 위험 신호이므로 별도로 표시한다 */
  hasBloodInStool?: boolean;
  severity: Severity;
  /** 오늘 평소와 다른 점 */
  contextFactors: ContextFactor[];
  contextEtcText?: string;
  memo?: string;
};
