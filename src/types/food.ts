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
/* D1~D4 실제 API 요청/응답                                              */
/* POST /meals/identify(-photo) · POST /meals · GET /meals/{id}/insight  */
/* ------------------------------------------------------------------ */

export type MealIdentifyIngredient = {
  id: number;
  name: string;
  /** 서버가 미리 선택해준 상태 — D2 초기 선택값으로 그대로 사용한다 */
  checked: boolean;
};

export type MealIdentifyResponse = {
  /** 마스터에 없는(직접 입력) 음식이면 null — 그래도 ingredients 는 온다 */
  food_id: number | null;
  food_name: string;
  has_broth: boolean;
  ingredients: MealIdentifyIngredient[];
  confidence: string;
};

export type MealApiPortion = 'half' | 'one' | 'one_and_half_plus';
export type MealApiMethod = 'photo' | 'text' | 'search';

export type MealCreateRequest = {
  food_id?: number | null;
  food_name: string;
  eaten_at: string;
  portion: MealApiPortion;
  ate_broth?: boolean | null;
  method: MealApiMethod;
  ingredient_ids?: number[];
  custom_ingredients?: string[];
};

export type MealCreateResponse = {
  meal_id: number;
  has_insight: boolean;
};

export type MealObservation = {
  title: string;
  body: string;
  /** 안전장치용 문구 — 절대 생략하지 않는다 */
  caveat: string;
};

export type MealSuggestion = {
  rank: number;
  title: string;
  detail: string;
};

export type MealInsightResponse = {
  food_name: string;
  note: string;
  /** 근거가 얇으면 null — 그때는 카드를 그리지 않는다 */
  observation: MealObservation | null;
  suggestions: MealSuggestion[];
};

/* ------------------------------------------------------------------ */
/* 대체 제안 카드 공용 타입 (D3/H3/H4 에서 AlternativeCard 컴포넌트가 쓴다) */
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
/* H4 음식 기반 대체안 — GET /foods/{food_id}/alternatives 실제 API       */
/* ingredient_ids 가 빈 배열이면 substitute 옵션을 화면에 표시하지 않는다.  */
/* ------------------------------------------------------------------ */

export type FoodAlternativeOption =
  | { kind: 'portion'; title: string; detail: string }
  | { kind: 'omit'; title: string; detail: string }
  | { kind: 'substitute'; title: string; detail: string; screen: string; ingredient_ids: number[] }
  | { kind: 'menu'; title: string; detail: string; screen: string; food_id: number };

export type FoodAlternativesResponse = {
  food_name: string;
  ingredients: string[];
  options: FoodAlternativeOption[];
};

/* ------------------------------------------------------------------ */
/* H3 성분 대체 방법 — GET /substitutions 실제 API                       */
/* ------------------------------------------------------------------ */

export type SubstitutionGroup = {
  ingredient: string;
  replacement: string;
  alt?: string;
};

export type SubstitutionTip = {
  seq: number;
  title: string;
  detail: string;
};

export type SubstitutionRecipeLink = {
  recipe_id: number;
  title: string;
  screen: string;
};

export type SubstitutionsResponse = {
  intro: string;
  groups: SubstitutionGroup[];
  tips: SubstitutionTip[];
  recipes: SubstitutionRecipeLink[];
};

/* ------------------------------------------------------------------ */
/* 대체 레시피 (food/alternative/recipe — H2) — GET /recipes/{recipe_id} */
/* ------------------------------------------------------------------ */

export type RecipeItem = {
  name: string;
  amount: string;
  optional: boolean;
};

export type RecipeDetail = {
  title: string;
  servings: string;
  items: RecipeItem[];
  tip?: string;
};

/* ------------------------------------------------------------------ */
/* 대체 메뉴 제안 (food/alternative/menu — H5)                          */
/* GET /foods/{food_id}/menu-alternatives 실제 API                     */
/* ------------------------------------------------------------------ */

export type MenuAlternativeItem = {
  name: string;
  why: string;
  /**
   * 기록용이 아니다 — H5 에서 H4 로 다시 들어갈 수 있을 때만 쓴다.
   * null 이면 H4 진입 버튼을 숨긴다.
   */
  food_id?: number | null;
};

export type MenuAlternativesResponse = {
  headline: string;
  items: MenuAlternativeItem[];
  has_more: boolean;
};

/* ------------------------------------------------------------------ */
/* 추천 저장 — POST /saved (G '저장한 추천'에 쌓인다)                      */
/* ------------------------------------------------------------------ */

export type SaveRecommendationRequest = {
  kind: SavedRecommendationKind;
  ref_id: number;
};

export type SaveRecommendationResponse = {
  ok: boolean;
};

/* ------------------------------------------------------------------ */
/* AI 채팅 (food/chat)                                                  */
/* ------------------------------------------------------------------ */

export type ChatRole = 'user' | 'assistant';

/** 화면에 그릴 말풍선 하나 — id/createdAt은 서버가 안 주므로 화면에서 로컬로 채운다 */
export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: string;
};

/* ------------------------------------------------------------------ */
/* H1 AI 채팅 — POST /chat/messages 실제 API 요청/응답                    */
/* GET으로 대화 이력을 불러오는 엔드포인트는 계약에 없다(화면 진입 시 항상 빈 대화로 시작) */
/* ------------------------------------------------------------------ */

export type ChatSendRequest = {
  session_id?: number | null;
  text: string;
};

/**
 * screen 은 확인된 값만 실제로 처리한다("D2", "H4").
 * blocked 가 true 면 suggestions 는 오지 않는다.
 */
export type ChatSuggestion = {
  label: string;
  screen: string;
  food_id?: number;
  food_name?: string;
};

export type ChatSendResponse = {
  session_id: number;
  reply: string;
  blocked: boolean;
  suggestions: ChatSuggestion[];
};

/* ------------------------------------------------------------------ */
/* G 나의 식탁 — GET /mytable 실제 API 요청/응답                          */
/* ------------------------------------------------------------------ */

/** 'to_try' = 아직 재도입을 시작하지 않은, 다시 먹어볼 음식 (서버 값 그대로) */
export type MyTableSectionStatus = 'safe' | 'candidate' | 'to_try';

export type MyTableItemAction = {
  label: string;
  screen: string;
  ingredient_id: number;
};

export type MyTableItem = {
  id: number;
  label: string;
  /** candidate/to_try 에서만 온다. 이미 서버가 "N번 중 M번 반응" 형태로 완성해서 준다 */
  note?: string;
  /** candidate 에서만 온다 */
  hint?: string;
  /** to_try 에서만 온다 — F1 진입 버튼 문구/대상 재료 */
  action?: MyTableItemAction;
};

export type MyTableSection = {
  status: MyTableSectionStatus;
  title: string;
  items: MyTableItem[];
};

export type SavedRecommendationKind = 'recipe' | 'substitution' | 'menu';

export type SavedRecommendation = {
  kind: SavedRecommendationKind;
  ref_id: number;
  title: string;
  /** "H2"|"H3"|"H5" — 이 값 기준으로 진입 화면을 정한다(kind 로 재추론하지 않는다) */
  screen: string;
};

export type MyTableResponse = {
  headline: string;
  sub: string;
  sections: MyTableSection[];
  saved_recommendations: SavedRecommendation[];
};
