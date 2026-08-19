/**
 * 화면 개발용 임시 재도입 데이터.
 *
 * 후보는 어디까지나 제안이며, 거절해도 불이익이 없다.
 */

import type { ReintroductionCandidate, ReintroductionPlan } from '@/types/reintroduction';

export const mockReintroductionCandidates: ReintroductionCandidate[] = [
  {
    id: 'reintro-yogurt',
    foodName: '요거트',
    lastEatenAt: '2026-05-02T09:00:00.000Z',
    avoidedDays: 108,
    suggestionText: '한동안 드시지 않은 음식이에요. 컨디션이 괜찮은 날 소량으로 시도해볼 수 있어요.',
  },
  {
    id: 'reintro-bread',
    foodName: '식빵',
    lastEatenAt: '2026-04-20T08:00:00.000Z',
    avoidedDays: 120,
    suggestionText: '예전에는 편하게 드셨던 기록이 있어요. 다시 한 번 살펴볼까요?',
  },
  {
    id: 'reintro-onion',
    foodName: '양파 (충분히 익힌 것)',
    lastEatenAt: '2026-08-17T18:40:00.000Z',
    avoidedDays: 0,
    suggestionText: '조리 방법을 바꾸면 어떤지 확인해볼 수 있어요.',
  },
];

export const mockReintroductionPlan: ReintroductionPlan = {
  id: 'reintro-plan-1',
  candidate: mockReintroductionCandidates[0],
  preparationDays: 3,
  startDate: '2026-08-22T00:00:00.000Z',
  endDate: '2026-08-29T00:00:00.000Z',
  status: 'preparing',
  portionNote: '작은 숟가락으로 두 스푼 정도부터 시작해보기',
  linkedFoodRecordIds: [],
  linkedSymptomRecordIds: [],
};
