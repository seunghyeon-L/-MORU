import { ScreenPlaceholder } from '@/components/common/ScreenPlaceholder';

/**
 * 음식 사진 결과 화면.
 * 추정 결과는 사용자가 직접 확인하고 수정할 수 있어야 한다.
 */
export default function FoodResultScreen() {
  return (
    <ScreenPlaceholder
      title="음식 확인"
      description="사진에서 추정한 내용이에요. 다르면 직접 고쳐주세요."
      items={['메뉴 이름', '추정 재료', '섭취량', '조리법', '음식 기록하기']}
      links={[
        { label: '재료 자세히 보기', href: '/food/ingredient' },
        { label: '대체 음식 보기', href: '/food/alternative' },
        { label: 'AI에게 물어보기', href: '/food/chat' },
      ]}
    />
  );
}
