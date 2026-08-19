/**
 * 화면 개발용 임시 분석 데이터.
 *
 * "4번 중 3번" 같은 기술통계 형태만 담는다.
 * 원인 단정, 점수, 위험도 같은 필드는 두지 않는다.
 */

import type { AnalysisResult } from '@/types/analysis';

export const mockAnalysisResult: AnalysisResult = {
  periodStart: '2026-08-01T00:00:00.000Z',
  periodEnd: '2026-08-18T23:59:59.000Z',
  foodRecordCount: 4,
  symptomRecordCount: 5,
  hasEnoughData: true,
  ingredientPatterns: [
    {
      ingredientId: 'onion',
      ingredientName: '양파',
      // 양파가 포함된 식사 4번 중 3번 불편함이 기록됨
      discomfort: { total: 4, matched: 3 },
      coOccurringFactors: [
        {
          factor: 'poor-sleep',
          label: '수면이 부족했어요',
          // 불편함이 기록된 3번 중 2번은 수면 부족이 함께 기록됨
          occurrence: { total: 3, matched: 2 },
        },
        {
          factor: 'large-meal',
          label: '평소보다 많이 먹었어요',
          occurrence: { total: 3, matched: 1 },
        },
      ],
    },
    {
      ingredientId: 'milk',
      ingredientName: '우유',
      discomfort: { total: 2, matched: 1 },
      coOccurringFactors: [
        {
          factor: 'large-meal',
          label: '평소보다 많이 먹었어요',
          occurrence: { total: 1, matched: 1 },
        },
      ],
    },
  ],
  symptomFoodWindows: [
    {
      symptomRecordId: 'symptom-record-1',
      symptomOccurredAt: '2026-08-05T14:20:00.000Z',
      lookbackHours: 6,
      foodRecordIds: ['food-record-1'],
    },
    {
      symptomRecordId: 'symptom-record-2',
      symptomOccurredAt: '2026-08-09T21:00:00.000Z',
      lookbackHours: 6,
      foodRecordIds: ['food-record-2'],
    },
    {
      symptomRecordId: 'symptom-record-4',
      symptomOccurredAt: '2026-08-17T20:10:00.000Z',
      lookbackHours: 6,
      foodRecordIds: ['food-record-4'],
    },
  ],
};
