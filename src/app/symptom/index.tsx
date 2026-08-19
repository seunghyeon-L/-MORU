import { ScreenPlaceholder } from '@/components/common/ScreenPlaceholder';
import { OVERALL_STATE_OPTIONS } from '@/types/symptom';

/**
 * 현재 상태 기록 (평상시 기록).
 * '불편해요'를 선택했을 때만 severity → detail 로 이어진다.
 */
export default function SymptomScreen() {
  return (
    <ScreenPlaceholder
      title="지금 어떠세요?"
      description="가볍게 지금 상태만 남겨주세요."
      items={OVERALL_STATE_OPTIONS.map((option) => option.label)}
      links={[
        { label: '불편해요 → 불편함 정도', href: '/symptom/severity' },
        { label: '좋아요 / 괜찮아요 → 기록 완료', href: '/(tabs)/record', replace: true },
      ]}
    />
  );
}
