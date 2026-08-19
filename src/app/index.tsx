import { ScreenPlaceholder } from '@/components/common/ScreenPlaceholder';

/**
 * MORU 시작 화면.
 * 서비스 소개와 "의료 서비스가 아니라는 안내"를 보여주고 온보딩으로 넘어간다.
 */
export default function StartScreen() {
  return (
    <ScreenPlaceholder
      title="MORU"
      description="음식에 대한 불안을 줄이고 나의 식탁을 다시 넓혀가는 웰니스 서비스예요."
      items={[
        '서비스 소개',
        'MORU는 질병을 진단하거나 치료하는 의료 서비스가 아니에요.',
        '시작하기 버튼',
      ]}
      links={[{ label: '시작하기', href: '/onboarding/safety' }]}
    />
  );
}
