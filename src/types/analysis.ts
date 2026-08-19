/**
 * 패턴 분석 도메인 타입 — GET /patterns 실제 API 요청/응답.
 *
 * 원칙:
 * - 특정 음식을 원인으로 단정하지 않는다.
 * - 근거가 얇으면 summary 가 null 로 온다 — 그 자체가 정상 상태다.
 * - 사용자를 점수로 평가하지 않는다.
 */

export type PatternsTimelineEntry = {
  time: string;
  meal: string;
  food: string;
  ago: string;
  phase: string;
};

export type PatternsCofactor = {
  label: string;
  count: number;
};

export type PatternsVerdictAction = {
  label: string;
  screen: string;
  ingredient_id: number;
};

export type PatternsVerdict = {
  title: string;
  body: string;
  action?: PatternsVerdictAction;
};

export type PatternsResponse = {
  headline: string;
  summary: string | null;
  timeline: PatternsTimelineEntry[];
  cofactors: PatternsCofactor[];
  verdict: PatternsVerdict | null;
};
