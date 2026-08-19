import { ScreenPlaceholder } from '@/components/common/ScreenPlaceholder';

/** 재도입 설정 — 음식, 준비 기간, 종료 시점을 사용자가 직접 정한다 */
export default function ReintroductionSetupScreen() {
  return (
    <ScreenPlaceholder
      title="재도입 준비"
      description="컨디션이 안정적인 날 소량으로 시도해볼 수 있게 준비해요."
      items={['재도입할 음식', '준비 기간', '종료 시점', '후보 음식', '재도입 설정 저장']}
      links={[{ label: '설정 완료 → 홈', href: '/(tabs)', replace: true }]}
    />
  );
}
