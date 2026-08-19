import { ScreenPlaceholder } from '@/components/common/ScreenPlaceholder';

/**
 * 음식 사진 촬영 화면.
 * 지금은 화면 구조만 잡고, 실제 카메라 API 연결은 나중에 한다.
 */
export default function FoodCameraScreen() {
  return (
    <ScreenPlaceholder
      title="음식 사진"
      description="음식 사진을 찍으면 메뉴와 재료를 함께 확인해볼 수 있어요."
      items={['카메라 프리뷰 영역', '촬영 버튼', '앨범에서 선택', '실제 카메라 연결은 추후 작업']}
      links={[
        { label: '촬영 결과 보기', href: '/food/result' },
        { label: '검색으로 입력하기', href: '/food/search' },
      ]}
    />
  );
}
