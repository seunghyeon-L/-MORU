/**
 * MORU 데이터 접근 계층.
 *
 * 현재는 백엔드가 없어 src/mock 의 임시 데이터를 반환한다.
 * 화면 코드는 mock 을 직접 import 하지 않고 항상 이 모듈만 사용한다.
 * 나중에 실제 API가 준비되면 각 함수 내부의 구현만 fetch 로 교체하면 된다.
 *
 * 모든 함수는 실제 네트워크 호출과 동일하게 Promise 를 반환한다.
 */

import { mockAnalysisResult } from '@/mock/analysis';
import {
  mockAlternatives,
  mockChatMessages,
  mockFoodItems,
  mockFoodRecords,
  mockMyTableFoods,
} from '@/mock/foods';
import { mockReintroductionCandidates, mockReintroductionPlan } from '@/mock/reintroduction';
import { mockSymptomRecords } from '@/mock/symptoms';
import { mockOnboardingData, mockUserProfile } from '@/mock/user';
import type { AnalysisResult } from '@/types/analysis';
import type {
  Alternative,
  ChatContext,
  ChatMessage,
  FoodItem,
  FoodRecord,
  Ingredient,
  MyTableFood,
} from '@/types/food';
import type { OnboardingData } from '@/types/onboarding';
import type { ReintroductionCandidate, ReintroductionPlan } from '@/types/reintroduction';
import type { SymptomRecord } from '@/types/symptom';
import type { UserProfile } from '@/types/user';

/** TODO: 백엔드 연결 시 실제 base URL 로 교체 */
export const API_BASE_URL = '';

/** mock 데이터를 Promise 로 감싸기 위한 헬퍼 */
function ok<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

/* ------------------------------------------------------------------ */
/* 사용자 / 온보딩                                                      */
/* ------------------------------------------------------------------ */

export function getUserProfile(): Promise<UserProfile> {
  return ok(mockUserProfile);
}

export function getOnboardingData(): Promise<OnboardingData> {
  return ok(mockOnboardingData);
}

export function saveOnboardingData(data: OnboardingData): Promise<OnboardingData> {
  // TODO: POST /onboarding
  return ok(data);
}

/* ------------------------------------------------------------------ */
/* 음식                                                                 */
/* ------------------------------------------------------------------ */

export function getFoodRecords(): Promise<FoodRecord[]> {
  return ok(mockFoodRecords);
}

export function createFoodRecord(record: FoodRecord): Promise<FoodRecord> {
  // TODO: POST /food-records
  return ok(record);
}

/** food/search — 메뉴 검색 */
export function searchFoodItems(keyword: string): Promise<FoodItem[]> {
  const trimmed = keyword.trim();
  if (!trimmed) return ok(mockFoodItems);
  return ok(mockFoodItems.filter((item) => item.name.includes(trimmed)));
}

/** food/camera → food/result — 사진에서 음식·재료 추정 */
export function recognizeFoodFromImage(_imageUri: string): Promise<FoodItem> {
  // TODO: POST /food-recognition (multipart)
  return ok(mockFoodItems[0]);
}

/** food/ingredient — 특정 음식의 재료 목록 */
export function getIngredients(foodItemId: string): Promise<Ingredient[]> {
  const item = mockFoodItems.find((food) => food.id === foodItemId);
  return ok(item?.ingredients ?? []);
}

/** food/alternative — 대체 메뉴 / 대체 재료 / 조리법 변경 제안 */
export function getAlternatives(_foodItemId: string): Promise<Alternative[]> {
  return ok(mockAlternatives);
}

/* ------------------------------------------------------------------ */
/* AI 채팅 (food/chat)                                                  */
/* ------------------------------------------------------------------ */

export function getChatHistory(): Promise<ChatMessage[]> {
  return ok(mockChatMessages);
}

/**
 * 지금은 고정된 mock 응답을 돌려준다.
 * context 는 온보딩 정보와 최근 기록을 담아 전달할 자리이며 아직 사용하지 않는다.
 */
export function sendChatMessage(text: string, _context?: ChatContext): Promise<ChatMessage> {
  // TODO: POST /chat
  return ok({
    id: `chat-mock-${text.length}`,
    role: 'assistant',
    text: '아직 준비 중인 기능이에요. 곧 기록을 함께 살펴보고 답변해드릴게요.',
    createdAt: '2026-08-18T10:00:00.000Z',
  });
}

/* ------------------------------------------------------------------ */
/* 증상                                                                 */
/* ------------------------------------------------------------------ */

export function getSymptomRecords(): Promise<SymptomRecord[]> {
  return ok(mockSymptomRecords);
}

export function createSymptomRecord(record: SymptomRecord): Promise<SymptomRecord> {
  // TODO: POST /symptom-records
  return ok(record);
}

/* ------------------------------------------------------------------ */
/* 분석                                                                 */
/* ------------------------------------------------------------------ */

export function getAnalysis(): Promise<AnalysisResult> {
  return ok(mockAnalysisResult);
}

/* ------------------------------------------------------------------ */
/* 나의 식탁                                                            */
/* ------------------------------------------------------------------ */

export function getMyTableFoods(): Promise<MyTableFood[]> {
  return ok(mockMyTableFoods);
}

/* ------------------------------------------------------------------ */
/* 재도입                                                               */
/* ------------------------------------------------------------------ */

export function getReintroductionCandidates(): Promise<ReintroductionCandidate[]> {
  return ok(mockReintroductionCandidates);
}

export function getReintroductionPlan(): Promise<ReintroductionPlan | null> {
  return ok(mockReintroductionPlan);
}

export function saveReintroductionPlan(plan: ReintroductionPlan): Promise<ReintroductionPlan> {
  // TODO: POST /reintroduction-plans
  return ok(plan);
}

/** 제안을 거절해도 어떤 불이익도 남기지 않는다 */
export function declineReintroductionCandidate(_candidateId: string): Promise<void> {
  return ok(undefined);
}
