/**
 * 음식 기록 도메인 타입.
 */

import type { Option } from './onboarding';

/* ------------------------------------------------------------------ */
/* 입력 방식 / 섭취량 / 조리법                                          */
/* ------------------------------------------------------------------ */

export type FoodInputMethod = 'photo' | 'search' | 'manual';

export const PORTION_OPTIONS = [
  { id: 'small', label: '조금' },
  { id: 'normal', label: '보통' },
  { id: 'large', label: '많이' },
] as const satisfies readonly Option<string>[];

export type Portion = (typeof PORTION_OPTIONS)[number]['id'];

export const COOKING_METHOD_OPTIONS = [
  { id: 'raw', label: '생것' },
  { id: 'boiled', label: '삶음 / 국물' },
  { id: 'steamed', label: '찜' },
  { id: 'stir-fried', label: '볶음' },
  { id: 'fried', label: '튀김' },
  { id: 'grilled', label: '구이' },
  { id: 'etc', label: '기타' },
] as const satisfies readonly Option<string>[];

export type CookingMethod = (typeof COOKING_METHOD_OPTIONS)[number]['id'];

/* ------------------------------------------------------------------ */
/* 재료 / 음식                                                          */
/* ------------------------------------------------------------------ */

export type Ingredient = {
  id: string;
  name: string;
  /** food/ingredient 화면에서 보여줄 참고 정보 */
  note?: string;
};

export type FoodItem = {
  id: string;
  name: string;
  /** 사진에서 추정했거나 사용자가 수정한 재료 */
  ingredients: Ingredient[];
  imageUri?: string;
  /** 사진 추정 결과를 사용자가 확인했는지 여부 */
  confirmedByUser?: boolean;
};

/* ------------------------------------------------------------------ */
/* 음식 기록                                                            */
/* ------------------------------------------------------------------ */

export type FoodRecord = {
  id: string;
  food: FoodItem;
  /** ISO 8601 문자열 */
  eatenAt: string;
  inputMethod: FoodInputMethod;
  portion: Portion;
  cookingMethod?: CookingMethod;
  memo?: string;
};

/* ------------------------------------------------------------------ */
/* 대체 제안 (food/alternative)                                         */
/* ------------------------------------------------------------------ */

export type AlternativeKind = 'menu' | 'ingredient' | 'method';

export type Alternative = {
  id: string;
  kind: AlternativeKind;
  title: string;
  /** 제안형·중립적 어조로 작성한다 */
  description: string;
};

/* ------------------------------------------------------------------ */
/* AI 채팅 (food/chat)                                                  */
/* ------------------------------------------------------------------ */

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: string;
};

/**
 * 채팅 요청 시 함께 전달할 사용자 컨텍스트.
 * 지금은 사용하지 않고 향후 API 연결 시 채워 넣는다.
 */
export type ChatContext = {
  allergies: string[];
  avoidedFoods: string[];
  recentFoodRecordIds: string[];
  recentSymptomRecordIds: string[];
};

/* ------------------------------------------------------------------ */
/* 나의 식탁 ((tabs)/table)                                             */
/* ------------------------------------------------------------------ */

/** 점수가 아니라 상태와 관찰 횟수로만 표현한다 */
export type MyTableStatus = 'safe' | 'candidate';

export type MyTableFood = {
  id: string;
  name: string;
  status: MyTableStatus;
  /** 마지막으로 먹은 날 (ISO 8601) */
  lastEatenAt?: string;
  /** 불편함 없이 먹은 횟수 — 기술통계용 */
  comfortableCount: number;
  /** 전체 섭취 횟수 */
  totalCount: number;
};
