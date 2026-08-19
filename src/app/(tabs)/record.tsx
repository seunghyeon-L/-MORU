import { ScreenPlaceholder } from '@/components/common/ScreenPlaceholder';

/** 기록 탭 — 음식 기록 / 증상 기록 / AI에게 물어보기 진입점 */
export default function RecordScreen() {
  return (
    <ScreenPlaceholder
      title="기록"
      description="오늘 먹은 음식과 몸의 반응을 간단하게 남겨보세요."
      items={['음식 기록', '증상 기록', 'AI에게 물어보기']}
      links={[
        { label: '음식 기록 (사진)', href: '/food/camera' },
        { label: '음식 기록 (검색)', href: '/food/search' },
        { label: '증상 기록', href: '/symptom' },
        { label: 'AI에게 물어보기', href: '/food/chat' },
      ]}
    />
  );
}
