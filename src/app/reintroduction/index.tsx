import { ScreenPlaceholder } from '@/components/common/ScreenPlaceholder';

/**
 * 재도입 제안 화면.
 * 제안일 뿐이며 거절해도 어떤 불이익도 없다. 자동으로 제한 범위를 넓히지 않는다.
 */
export default function ReintroductionScreen() {
  return (
    <ScreenPlaceholder
      title="다시 먹어볼까요?"
      description="한동안 드시지 않은 음식들이에요. 지금이 아니어도 괜찮아요."
      items={['오래 피하고 있는 음식', '다시 먹어볼 음식 제안', '나중에 하기 / 넘기기']}
      links={[{ label: '재도입 설정하기', href: '/reintroduction/setup' }]}
    />
  );
}
