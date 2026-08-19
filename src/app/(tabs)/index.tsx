import { ScreenPlaceholder } from '@/components/common/ScreenPlaceholder';

/** MORU 홈 탭 */
export default function HomeScreen() {
  return (
    <ScreenPlaceholder
      title="홈"
      description="오늘의 상태와 최근 기록을 한눈에 볼 수 있는 화면이에요."
      items={['오늘의 상태', '음식 확인 진입', '최근 기록', '재도입 제안']}
      links={[
        { label: '음식 확인 (촬영)', href: '/food/camera' },
        { label: '메뉴 검색', href: '/food/search' },
        { label: '패턴 분석', href: '/analysis' },
        { label: '재도입 제안', href: '/reintroduction' },
      ]}
    />
  );
}
