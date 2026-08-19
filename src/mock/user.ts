/**
 * 화면 개발용 임시 사용자 데이터.
 * 백엔드 연결 전까지만 사용하며, 화면에서 직접 import 하지 말고
 * services/api.ts 를 통해 접근한다.
 */

import type { OnboardingData } from '@/types/onboarding';
import type { UserProfile } from '@/types/user';

export const mockUserProfile: UserProfile = {
  id: 'user-1',
  nickname: '모루',
  createdAt: '2026-07-01T09:00:00.000Z',
  onboardingCompleted: true,
  medicalReferralShown: false,
};

export const mockOnboardingData: OnboardingData = {
  safetyFlags: [],
  medicalCheckConfirmed: false,
  allergies: ['milk'],
  avoidedFoods: ['onion', 'dairy', 'spicy'],
  avoidedReasons: ['discomfort', 'worried'],
  usualSymptoms: ['bloating', 'abdominal-pain', 'gas'],
  symptomFrequency: 'weekly',
  completed: true,
};
