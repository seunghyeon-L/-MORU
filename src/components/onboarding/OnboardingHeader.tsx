import { ThemedText } from '@/components/themed-text';

export const ONBOARDING_TOTAL_STEPS = 4;

export type OnboardingHeaderProps = {
  /** 1부터 시작 (safety=1, allergy=2, avoided-food=3, symptoms=4) */
  step: number;
};

/**
 * 온보딩 플로우 공용 헤더.
 * Figma B1~B4는 뒤로가기·진행바 없이 "N / 4" 캡션 텍스트만 사용한다.
 */
export function OnboardingHeader({ step }: OnboardingHeaderProps) {
  return (
    <ThemedText type="caption" themeColor="textMuted">
      {`${step} / ${ONBOARDING_TOTAL_STEPS}`}
    </ThemedText>
  );
}
