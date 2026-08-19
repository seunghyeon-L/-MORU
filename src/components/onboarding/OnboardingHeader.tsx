import { ProgressHeader } from '@/components/common/ProgressHeader';

export const ONBOARDING_TOTAL_STEPS = 4;

export type OnboardingHeaderProps = {
  /** 1부터 시작 (safety=1, allergy=2, avoided-food=3, symptoms=4) */
  step: number;
  title?: string;
  onBack?: () => void;
};

/** 온보딩 플로우 공용 헤더 */
export function OnboardingHeader({ step, title, onBack }: OnboardingHeaderProps) {
  return (
    <ProgressHeader
      step={step}
      totalSteps={ONBOARDING_TOTAL_STEPS}
      title={title}
      onBack={onBack}
    />
  );
}
