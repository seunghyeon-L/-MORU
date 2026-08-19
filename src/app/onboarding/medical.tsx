import { ScreenPlaceholder } from '@/components/common/ScreenPlaceholder';

/**
 * 의료기관 상담 안내.
 *
 * 여기서 서비스 진입을 막되, "이미 병원에서 확인했어요"를 선택하면 온보딩을 이어갈 수 있다.
 * 질병명을 진단하는 문구는 사용하지 않는다.
 */
export default function MedicalScreen() {
  return (
    <ScreenPlaceholder
      title="의료기관 상담 안내"
      description="먼저 의료기관에서 확인해보시는 것을 권해드려요. MORU는 진단을 하지 않아요."
      items={['상담 안내', '서비스 진입 차단', '이미 병원에서 확인한 경우 계속 진행 가능']}
      links={[
        { label: '이미 병원에서 확인했어요 → 알레르기', href: '/onboarding/allergy' },
        { label: '시작 화면으로', href: '/', replace: true },
      ]}
    />
  );
}
