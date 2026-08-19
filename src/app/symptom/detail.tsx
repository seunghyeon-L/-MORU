import { ScreenPlaceholder } from '@/components/common/ScreenPlaceholder';
import { CONTEXT_FACTOR_OPTIONS, SYMPTOM_TYPE_OPTIONS } from '@/types/symptom';

/**
 * 증상 상세 기록.
 * 모든 항목을 매번 입력하게 하지 않고 필요한 경우에만 추가로 묻는다.
 */
export default function SymptomDetailScreen() {
  return (
    <ScreenPlaceholder
      title="조금 더 알려주세요"
      description="기억나는 것만 남겨도 괜찮아요."
      items={[
        '— 증상 종류 —',
        ...SYMPTOM_TYPE_OPTIONS.map((option) => option.label),
        '— 증상 발현 시각 / 증상 강도 —',
        '— 오늘 평소와 다른 점 —',
        ...CONTEXT_FACTOR_OPTIONS.map((option) => option.label),
      ]}
      links={[{ label: '기록 완료 → 기록 탭', href: '/(tabs)/record', replace: true }]}
    />
  );
}
