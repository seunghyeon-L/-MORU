import { ScreenPlaceholder } from '@/components/common/ScreenPlaceholder';

/** 음식에 포함된 재료와 재료별 참고 정보 */
export default function FoodIngredientScreen() {
  return (
    <ScreenPlaceholder
      title="재료"
      description="이 음식에 들어간 재료들이에요."
      items={['재료 목록', '재료별 참고 정보', '내 기록에서 함께 나타난 상황']}
      links={[{ label: '대체 재료 보기', href: '/food/alternative' }]}
    />
  );
}
