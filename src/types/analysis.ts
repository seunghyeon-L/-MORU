/**
 * 패턴 분석 도메인 타입.
 *
 * 원칙:
 * - 특정 음식을 원인으로 단정하지 않는다.
 * - 1회 사례로 결론을 내리지 않는다.
 * - "4번 중 3번" 같은 기술통계 형태만 사용한다.
 * - 사용자를 점수로 평가하지 않는다. (score 필드를 두지 않는다)
 */

import type { ContextFactor } from './symptom';

/** "4번 중 3번" 형태를 그대로 표현하기 위한 값 */
export type Occurrence = {
  /** 관찰된 전체 횟수 */
  total: number;
  /** 그중 해당한 횟수 */
  matched: number;
};

/** 함께 관찰된 교란 변수 */
export type CoOccurringFactor = {
  factor: ContextFactor;
  label: string;
  occurrence: Occurrence;
};

/** 반복적으로 함께 나타난 재료 */
export type IngredientPattern = {
  ingredientId: string;
  ingredientName: string;
  /** 해당 재료가 포함된 식사 중 불편함이 기록된 횟수 */
  discomfort: Occurrence;
  /** 같은 기간에 함께 관찰된 상황들 */
  coOccurringFactors: CoOccurringFactor[];
};

/** 증상 시각 기준으로 되돌아본 음식 기록 */
export type SymptomFoodWindow = {
  symptomRecordId: string;
  symptomOccurredAt: string;
  /** 증상 발생 전 조회 구간 (시간) */
  lookbackHours: number;
  foodRecordIds: string[];
};

export type AnalysisResult = {
  /** ISO 8601 문자열 */
  periodStart: string;
  periodEnd: string;
  foodRecordCount: number;
  symptomRecordCount: number;
  /**
   * 데이터가 충분하지 않으면 false.
   * false 인 경우 화면에서 확정적인 패턴을 보여주지 않는다.
   */
  hasEnoughData: boolean;
  ingredientPatterns: IngredientPattern[];
  symptomFoodWindows: SymptomFoodWindow[];
};
