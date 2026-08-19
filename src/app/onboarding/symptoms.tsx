import { ScreenPlaceholder } from '@/components/common/ScreenPlaceholder';
import { SYMPTOM_FREQUENCY_OPTIONS } from '@/types/onboarding';
import { SYMPTOM_TYPE_OPTIONS } from '@/types/symptom';

/** 평소 경험하는 증상과 빈도 선택. 완료하면 탭 화면으로 이동한다. */
export default function OnboardingSymptomsScreen() {
  return (
    <ScreenPlaceholder
      title="평소 증상"
      description="평소에 자주 경험하는 것이 있다면 알려주세요."
      items={[
        ...SYMPTOM_TYPE_OPTIONS.map((option) => option.label),
        '— 증상 빈도 —',
        ...SYMPTOM_FREQUENCY_OPTIONS.map((option) => option.label),
      ]}
      links={[{ label: '완료 → 홈', href: '/(tabs)', replace: true }]}
    />
  );
}
