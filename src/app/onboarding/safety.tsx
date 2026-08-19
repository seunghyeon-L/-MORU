import { ScreenPlaceholder } from '@/components/common/ScreenPlaceholder';
import { SAFETY_FLAG_OPTIONS } from '@/types/onboarding';

/**
 * 안전 스크리닝.
 *
 * 판정은 규칙 기반이며 AI를 사용하지 않는다.
 * 하나라도 해당하면 /onboarding/medical, 없으면 /onboarding/allergy 로 이동한다.
 * (needsMedicalReferral() 참고)
 */
export default function SafetyScreen() {
  return (
    <ScreenPlaceholder
      title="안전 확인"
      description="아래 중 해당하는 것이 있는지만 확인할게요. 진단을 하는 화면이 아니에요."
      items={SAFETY_FLAG_OPTIONS.map((option) => option.label)}
      links={[
        { label: '해당 항목 있음 → 의료기관 안내', href: '/onboarding/medical' },
        { label: '해당 항목 없음 → 알레르기', href: '/onboarding/allergy' },
      ]}
    />
  );
}
