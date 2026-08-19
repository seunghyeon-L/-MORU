/**
 * 화면 개발용 임시 증상 데이터.
 *
 * Figma 시나리오:
 * - 양파가 포함된 식사 4회 (mock/foods.ts)
 * - 그중 불편함 기록 3회
 * - 그중 수면 부족이 함께 기록된 경우 2회
 */

import type { SymptomRecord } from '@/types/symptom';

export const mockSymptomRecords: SymptomRecord[] = [
  // food-record-1 이후 — 불편함 (수면 부족 동반)
  {
    id: 'symptom-record-1',
    recordedAt: '2026-08-05T15:00:00.000Z',
    state: 'uncomfortable',
    detail: {
      symptoms: ['bloating', 'gas'],
      occurredAt: '2026-08-05T14:20:00.000Z',
      severity: 5,
      contextFactors: ['poor-sleep'],
    },
  },
  // food-record-2 이후 — 불편함 (수면 부족 + 과식 동반)
  {
    id: 'symptom-record-2',
    recordedAt: '2026-08-09T21:30:00.000Z',
    state: 'uncomfortable',
    detail: {
      symptoms: ['abdominal-pain', 'bloating'],
      occurredAt: '2026-08-09T21:00:00.000Z',
      severity: 7,
      contextFactors: ['poor-sleep', 'large-meal'],
    },
  },
  // food-record-3 이후 — 괜찮음
  {
    id: 'symptom-record-3',
    recordedAt: '2026-08-13T15:00:00.000Z',
    state: 'okay',
  },
  // food-record-4 이후 — 불편함 (교란 변수 없음)
  {
    id: 'symptom-record-4',
    recordedAt: '2026-08-17T20:30:00.000Z',
    state: 'uncomfortable',
    detail: {
      symptoms: ['gas'],
      occurredAt: '2026-08-17T20:10:00.000Z',
      severity: 3,
      contextFactors: [],
    },
  },
  // 평상시 기록
  {
    id: 'symptom-record-5',
    recordedAt: '2026-08-18T21:00:00.000Z',
    state: 'good',
  },
];
