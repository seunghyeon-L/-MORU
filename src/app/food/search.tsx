import { ScreenPlaceholder } from '@/components/common/ScreenPlaceholder';

/** 메뉴 검색 화면 */
export default function FoodSearchScreen() {
  return (
    <ScreenPlaceholder
      title="메뉴 검색"
      description="먹은 음식이나 먹으려는 음식을 검색해보세요."
      items={['검색 입력창', '검색 결과 목록', '직접 입력', 'AI에게 음식에 대해 물어보기']}
      links={[
        { label: '검색 결과 선택 → 음식 확인', href: '/food/result' },
        { label: 'AI에게 물어보기', href: '/food/chat' },
      ]}
    />
  );
}
