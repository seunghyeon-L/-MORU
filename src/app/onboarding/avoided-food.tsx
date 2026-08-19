import { ScreenPlaceholder } from '@/components/common/ScreenPlaceholder';
import { AVOIDED_FOOD_OPTIONS, AVOIDED_REASON_OPTIONS } from '@/types/onboarding';

/** 현재 피하고 있는 음식과 그 이유 선택 */
export default function AvoidedFoodScreen() {
  return (
    <ScreenPlaceholder
      title="피하고 있는 음식"
      description="지금 피하고 있는 음식이 있다면 알려주세요. 앞으로 다시 시도해볼 후보가 돼요."
      items={[
        ...AVOIDED_FOOD_OPTIONS.map((option) => option.label),
        '— 피하는 이유 —',
        ...AVOIDED_REASON_OPTIONS.map((option) => option.label),
      ]}
      links={[{ label: '다음 → 평소 증상', href: '/onboarding/symptoms' }]}
    />
  );
}
