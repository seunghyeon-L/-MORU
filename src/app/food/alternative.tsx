import { ScreenPlaceholder } from '@/components/common/ScreenPlaceholder';

/** 대체 음식 화면 — 금지가 아니라 선택지를 제안한다 */
export default function FoodAlternativeScreen() {
  return (
    <ScreenPlaceholder
      title="이런 방법도 있어요"
      description="먹고 싶은 음식을 포기하지 않고 시도해볼 수 있는 방법들이에요."
      items={['대체 메뉴', '대체 재료', '조리법 바꾸기', '양 줄여 먹기']}
      links={[{ label: '재료 자세히 보기', href: '/food/ingredient' }]}
    />
  );
}
