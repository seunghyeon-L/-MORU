/**
 * 음식 재도입 도메인 타입.
 *
 * 재도입은 제안일 뿐이며 사용자가 거절해도 어떤 불이익도 없다.
 * 시스템이 자동으로 제한 범위를 넓히지 않는다.
 */

export type ReintroductionStatus =
  | 'suggested'
  | 'declined'
  | 'preparing'
  | 'in-progress'
  | 'completed';

/** 오래 피하고 있어 다시 시도해볼 수 있는 음식 */
export type ReintroductionCandidate = {
  id: string;
  foodName: string;
  /** 마지막으로 먹은 날 (ISO 8601) */
  lastEatenAt?: string;
  /** 피하고 있는 기간 (일) */
  avoidedDays?: number;
  /** 제안형·중립적 어조의 안내 문구 */
  suggestionText?: string;
};

export type ReintroductionPlan = {
  id: string;
  candidate: ReintroductionCandidate;
  /** 준비 기간 (일) */
  preparationDays: number;
  /** ISO 8601 문자열 */
  startDate: string;
  endDate: string;
  status: ReintroductionStatus;
  /** 소량으로 시도하기 위한 메모 */
  portionNote?: string;
  /** 시도 후 기록한 음식/증상 기록 id */
  linkedFoodRecordIds: string[];
  linkedSymptomRecordIds: string[];
};
