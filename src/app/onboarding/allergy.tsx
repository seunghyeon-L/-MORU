import { ScreenPlaceholder } from '@/components/common/ScreenPlaceholder';
import { ALLERGY_OPTIONS } from '@/types/onboarding';

/** 알레르기 선택 (선택값은 useMoruData 의 onboarding 에 저장한다) */
export default function AllergyScreen() {
  return (
    <ScreenPlaceholder
      title="알레르기"
      description="알레르기가 있는 음식을 알려주세요."
      items={ALLERGY_OPTIONS.map((option) => option.label)}
      links={[{ label: '다음 → 피하고 있는 음식', href: '/onboarding/avoided-food' }]}
    />
  );
}
