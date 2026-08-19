import { ScreenPlaceholder } from '@/components/common/ScreenPlaceholder';

/**
 * 나의 식탁 탭.
 * 점수 기반 UI는 사용하지 않고 상태와 관찰 횟수만 보여준다.
 */
export default function TableScreen() {
  return (
    <ScreenPlaceholder
      title="나의 식탁"
      description="지금 내 식탁에 올라와 있는 음식들을 모아 봤어요."
      items={['안심하고 먹은 음식', '다시 먹어볼 음식', '식탁 범위 확대 표시']}
      links={[{ label: '다시 먹어볼 음식 보기', href: '/reintroduction' }]}
    />
  );
}
