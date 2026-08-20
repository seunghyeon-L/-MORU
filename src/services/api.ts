/**
 * MORU 데이터 접근 계층.
 *
 * 백엔드 API 계약이 확정된 함수는 apiRequest() 로 실제 네트워크를 호출하고,
 * 화면 코드는 서버를 직접 부르지 않고 항상 이 모듈만 사용한다.
 * 계약이 새로 확정되면 각 함수 내부의 구현만 apiRequest 호출로 교체하면 된다.
 *
 * 모든 함수는 Promise 를 반환한다.
 */

import type { PatternsResponse } from '@/types/analysis';
import type {
  ChatSendRequest,
  ChatSendResponse,
  FoodAlternativesResponse,
  FoodRecord,
  MealCreateRequest,
  MealCreateResponse,
  MealIdentifyResponse,
  MealInsightResponse,
  MenuAlternativesResponse,
  MyTableResponse,
  RecipeDetail,
  SaveRecommendationRequest,
  SaveRecommendationResponse,
  SubstitutionsResponse,
} from '@/types/food';
import type { HomeResponse, SnoozeResponse } from '@/types/home';
import type { RecordsResponse } from '@/types/record';
import type { ProfileRequest, ProfileResponse } from '@/types/onboarding';
import type {
  ChallengeAttemptRequest,
  ChallengeAttemptResponse,
  ChallengeCreateRequest,
  ChallengeCreateResponse,
  ChallengeDetail,
  ChallengeResult,
  ChallengeSaveResponse,
  ChallengeSuggestion,
  IngredientContains,
} from '@/types/reintroduction';
import type { SymptomLogRequest, SymptomLogResponse } from '@/types/symptom';
import type { MeResponse } from '@/types/user';

import { apiRequest } from './apiClient';

/** 공통 API client(apiClient.ts)의 base URL을 그대로 노출한다 — 중복 정의하지 않는다 */
export { API_BASE_URL } from './apiClient';

/* ------------------------------------------------------------------ */
/* 사용자 / 온보딩                                                      */
/* ------------------------------------------------------------------ */

/** B2·B3·B4 저장. nickname 은 선택값이라 보내지 않는다 — payload 는 호출부(useMoruData)에서 만든다 */
export function saveOnboardingData(payload: ProfileRequest): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>('/onboarding/profile', { method: 'POST', body: payload });
}

/** 앱 부팅 시 최초 1회 호출. onboarded/blocked 상태를 확인한다 */
export function getMe(): Promise<MeResponse> {
  return apiRequest<MeResponse>('/me');
}

/* ------------------------------------------------------------------ */
/* 음식                                                                 */
/* ------------------------------------------------------------------ */

/**
 * 기록 메인이 쓰는 목록. GET /records
 *
 * 문구(summary·detail)는 서버가 만들어 보낸다.
 * "반 그릇 · 국물까지" 같은 문장을 화면마다 조립하면 표기가 갈린다.
 */
export function getRecords(days = 14): Promise<RecordsResponse> {
  return apiRequest<RecordsResponse>(`/records?days=${days}`);
}

/** D1 텍스트 입력(메뉴 검색/직접 입력) → 재료 식별 */
export function identifyMealFromText(text: string): Promise<MealIdentifyResponse> {
  return apiRequest<MealIdentifyResponse>('/meals/identify', { method: 'POST', body: { text } });
}

/** D1 사진 촬영 → 재료 식별 (multipart) */
export function identifyMealFromPhoto(photoUri: string): Promise<MealIdentifyResponse> {
  const form = new FormData();
  form.append('photo', {
    uri: photoUri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);
  return apiRequest<MealIdentifyResponse>('/meals/identify-photo', { method: 'POST', body: form });
}

/** D2 확인 버튼을 눌렀을 때만 호출한다. 응답의 has_insight 로 D3 표시 여부를 결정한다 */
export function createMeal(payload: MealCreateRequest): Promise<MealCreateResponse> {
  return apiRequest<MealCreateResponse>('/meals', { method: 'POST', body: payload });
}

/** D3 참고 정보와 대체안. observation 이 null 이면 카드를 그리지 않는다 */
export function getMealInsight(mealId: number): Promise<MealInsightResponse> {
  return apiRequest<MealInsightResponse>(`/meals/${mealId}/insight`);
}

/** H4 — food_id 는 D1 identify 응답 또는 H1 suggestion 에서만 받는다(프론트에서 생성하지 않는다) */
export function getFoodAlternatives(foodId: number): Promise<FoodAlternativesResponse> {
  return apiRequest<FoodAlternativesResponse>(`/foods/${foodId}/alternatives`);
}

/** H5 — food_id 는 H4 응답(options[kind="menu"].food_id)에서 그대로 받는다 */
export function getMenuAlternatives(foodId: number): Promise<MenuAlternativesResponse> {
  return apiRequest<MenuAlternativesResponse>(`/foods/${foodId}/menu-alternatives`);
}

/** H3 — ingredient_ids 는 H4 응답(options[kind="substitute"].ingredient_ids)에서 그대로 받는다 */
export function getSubstitutions(ingredientIds: number[]): Promise<SubstitutionsResponse> {
  return apiRequest<SubstitutionsResponse>(`/substitutions?ingredient_ids=${ingredientIds.join(',')}`);
}

/** H2 — recipe_id 는 H3 응답(recipes[].recipe_id) 또는 G 의 saved_recommendations(ref_id)에서 받는다 */
export function getRecipe(recipeId: number): Promise<RecipeDetail> {
  return apiRequest<RecipeDetail>(`/recipes/${recipeId}`);
}

/** G "저장한 추천"에 쌓인다. H2 "레시피 저장" 버튼에서만 호출한다 */
export function saveRecommendation(payload: SaveRecommendationRequest): Promise<SaveRecommendationResponse> {
  return apiRequest<SaveRecommendationResponse>('/saved', { method: 'POST', body: payload });
}

/* ------------------------------------------------------------------ */
/* H1 AI 채팅 (food/chat)                                               */
/* 대화 이력을 불러오는 엔드포인트는 계약에 없다 — 화면은 항상 빈 대화로 시작한다 */
/* ------------------------------------------------------------------ */

/** 사용자가 전송을 누를 때만 호출한다. session_id 를 실어 보내면 같은 대화로 이어진다 */
export function sendChatMessage(payload: ChatSendRequest): Promise<ChatSendResponse> {
  return apiRequest<ChatSendResponse>('/chat/messages', { method: 'POST', body: payload });
}

/* ------------------------------------------------------------------ */
/* 증상                                                                 */
/* ------------------------------------------------------------------ */



/** E0·E1·E2 를 한 번에 저장한다. red_flag 가 true 면 notice 를 symptom/medical.tsx 로 전달한다 */
export function logSymptom(payload: SymptomLogRequest): Promise<SymptomLogResponse> {
  return apiRequest<SymptomLogResponse>('/symptoms', { method: 'POST', body: payload });
}

/* ------------------------------------------------------------------ */
/* 분석                                                                 */
/* ------------------------------------------------------------------ */

/** E3 개인화 패턴 분석. summary 가 null 이면 아직 근거가 부족하다는 뜻이며 정상 상태다 */
export function getPatterns(): Promise<PatternsResponse> {
  return apiRequest<PatternsResponse>('/patterns');
}

/* ------------------------------------------------------------------ */
/* 홈                                                                   */
/* ------------------------------------------------------------------ */

/** C 홈 — cards: [] 도 정상 상태(신규 사용자)다 */
export function getHomeCards(): Promise<HomeResponse> {
  return apiRequest<HomeResponse>('/home');
}

/** challenge_suggestion 카드의 "나중에" — 호출 후 반드시 getHomeCards() 를 다시 불러야 한다 */
export function snoozeSuggestion(ingredientId: number): Promise<SnoozeResponse> {
  return apiRequest<SnoozeResponse>('/home/cards/suggestion/snooze', {
    method: 'POST',
    body: { ingredient_id: ingredientId },
  });
}

/* ------------------------------------------------------------------ */
/* 재도입 (도전)                                                        */
/* ------------------------------------------------------------------ */

/** F1 도전 제안 — 제안할 게 없으면 204(undefined) */
export function getChallengeSuggestion(): Promise<ChallengeSuggestion | undefined> {
  return apiRequest<ChallengeSuggestion | undefined>('/challenges/suggestion');
}

/** F2 화면 진입 시 읽기 전용으로 호출한다. 도전을 만들지 않는다 */
export function getIngredientContains(ingredientId: number): Promise<IngredientContains> {
  return apiRequest<IngredientContains>(`/ingredients/${ingredientId}/contains`);
}

/** F2 확정 버튼을 눌렀을 때만 호출한다 */
export function createChallenge(payload: ChallengeCreateRequest): Promise<ChallengeCreateResponse> {
  return apiRequest<ChallengeCreateResponse>('/challenges', { method: 'POST', body: payload });
}

/** F3 진행 상태. available_days 는 busy_days 를 이미 뺀 결과다 */
export function getChallengeDetail(challengeId: number): Promise<ChallengeDetail> {
  return apiRequest<ChallengeDetail>(`/challenges/${challengeId}`);
}

/** F3 — 시도 결과를 확정할 때만 호출한다. seq 는 서버가 알려준 current_seq 를 그대로 쓴다 */
export function recordChallengeAttempt(
  challengeId: number,
  seq: number,
  payload: ChallengeAttemptRequest,
): Promise<ChallengeAttemptResponse> {
  return apiRequest<ChallengeAttemptResponse>(`/challenges/${challengeId}/attempts/${seq}`, {
    method: 'POST',
    body: payload,
  });
}

/** F4 — 2-of-3 판정. 숫자 점수가 아니라 grade 문자열로 온다 */
export function getChallengeResult(challengeId: number): Promise<ChallengeResult> {
  return apiRequest<ChallengeResult>(`/challenges/${challengeId}/result`);
}

/** F4 "나의 식탁에 저장하기" 버튼에서만 호출한다 */
export function saveChallenge(challengeId: number): Promise<ChallengeSaveResponse> {
  return apiRequest<ChallengeSaveResponse>(`/challenges/${challengeId}/save`, { method: 'POST' });
}

/* ------------------------------------------------------------------ */
/* G 나의 식탁                                                          */
/* ------------------------------------------------------------------ */

/** F4 저장(POST /challenges/{id}/save) 직후를 포함해 화면 진입 때마다 새로 불러야 한다 — 캐시하지 않는다 */
export function getMyTable(): Promise<MyTableResponse> {
  return apiRequest<MyTableResponse>('/mytable');
}
