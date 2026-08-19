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

/* ------------------------------------------------------------------ */
/* F1 도전 제안 — GET /challenges/suggestion (204 = 제안 없음)            */
/* ------------------------------------------------------------------ */

export type ChallengeSuggestionStep = {
  seq: number;
  title: string;
  detail: string;
};

export type ChallengeSuggestion = {
  ingredient_id: number;
  ingredient_name: string;
  title: string;
  reason: { title: string; body: string };
  steps: ChallengeSuggestionStep[];
  evidence: { figure: string; text: string };
};

/* ------------------------------------------------------------------ */
/* F2 도전 · 제한 설정                                                  */
/* GET /ingredients/{id}/contains (읽기 전용) · POST /challenges (확정)  */
/* ------------------------------------------------------------------ */

export type IngredientContains = {
  ingredient_name: string;
  contains: string[];
};

/** 서버가 허용하는 값은 3 또는 7 뿐이다 (elimination_days enum) */
export type EliminationDays = 3 | 7;

export type ChallengeCreateRequest = {
  ingredient_id: number;
  elimination_days: EliminationDays;
};

export type ChallengeCreateResponse = {
  challenge_id: number;
  status: string;
  eliminate_until: string;
};

/* ------------------------------------------------------------------ */
/* F3 표적 도전 진행 — GET /challenges/{id}                             */
/* ------------------------------------------------------------------ */

export type ChallengeAttemptStatus = 'done' | 'current' | 'upcoming';

/** 회차별 진행 요약 — 프론트에서 다시 계산하지 않고 label 을 그대로 쓴다 */
export type ChallengeAttemptSummary = {
  seq: number;
  status: ChallengeAttemptStatus;
  label: string;
};

export type ChallengeDetail = {
  challenge_id: number;
  ingredient_name: string;
  status: string;
  current_seq: number;
  instruction: string;
  note?: string;
  available_days: string[];
  excluded_note?: string;
  attempts: ChallengeAttemptSummary[];
  /** 생략하면 안 된다 — 도전 자체가 무섭다는 게 가장 큰 저항이었다 */
  reassurance: string;
};

/* ------------------------------------------------------------------ */
/* F3 시도 기록 — POST /challenges/{id}/attempts/{seq}                  */
/* ------------------------------------------------------------------ */

export type ChallengeAttemptResult = 'reaction' | 'no_reaction' | 'skipped';

export type ChallengeAttemptRequest = {
  result: ChallengeAttemptResult;
  tested_at?: string;
  scheduled_date?: string;
};

export type ChallengeAttemptResponse = {
  ok: boolean;
  next_seq: number | null;
  finished: boolean;
};

/* ------------------------------------------------------------------ */
/* F4 도전 결과 — GET /challenges/{id}/result · POST /challenges/{id}/save */
/* ------------------------------------------------------------------ */

export type ChallengeResultAttempt = {
  seq: number;
  date: string;
  label: string;
};

export type ChallengeResult = {
  ratio: string;
  headline: string;
  attempts: ChallengeResultAttempt[];
  /** 등급 문자열 — 숫자 점수가 아니다. 화면에서 점수/게이지로 바꾸지 않는다 */
  grade: string;
  grade_label: string;
  body?: string;
};

export type ChallengeSaveResponse = {
  ok: boolean;
  moved_to: string;
};
