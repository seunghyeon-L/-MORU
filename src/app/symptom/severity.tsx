import { ScreenPlaceholder } from '@/components/common/ScreenPlaceholder';

/** 불편함 정도 1~9 선택 (SeveritySelector 사용 예정) */
export default function SymptomSeverityScreen() {
  return (
    <ScreenPlaceholder
      title="어느 정도로 불편하세요?"
      description="1부터 9까지 중에 지금 느낌과 가장 가까운 곳을 골라주세요."
      items={['1 ~ 9 선택', '조금 불편해요 ↔ 많이 불편해요']}
      links={[{ label: '다음 → 자세히 기록', href: '/symptom/detail' }]}
    />
  );
}
