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
/* 교란 변수 / 오늘 평소와 다른 점 (symptom/detail)                      */
/* ------------------------------------------------------------------ */

export const CONTEXT_FACTOR_OPTIONS = [
  { id: 'poor-sleep', label: '수면이 부족했어요' },
  { id: 'stress', label: '스트레스가 많았어요' },
  { id: 'alcohol', label: '술을 마셨어요' },
  { id: 'large-meal', label: '평소보다 많이 먹었어요' },
  { id: 'irregular-meal', label: '식사 시간이 불규칙했어요' },
  { id: 'menstruation', label: '월경 주기와 겹쳤어요' },
  { id: 'busy-schedule', label: '중요한 일정이 있었어요' },
  { id: 'etc', label: '기타' },
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
  /** ISO 8601 문자열 — 증상이 나타난 시각 */
  occurredAt: string;
  severity: Severity;
  /** 오늘 평소와 다른 점 */
  contextFactors: ContextFactor[];
  contextEtcText?: string;
  memo?: string;
};
