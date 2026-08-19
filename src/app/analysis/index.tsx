import { ScreenPlaceholder } from '@/components/common/ScreenPlaceholder';

/**
 * 패턴 분석 화면.
 *
 * 원칙:
 * 1. 특정 음식을 범인으로 단정하지 않는다.
 * 2. 1회 사례로 결론을 내리지 않는다.
 * 3. 반복 횟수와 관찰된 패턴 중심으로 보여준다.
 * 4. "4번 중 3번" 같은 기술통계 형태를 사용한다.
 * 5. 점수로 사용자를 평가하지 않는다.
 *
 * 데이터가 부족하면(AnalysisResult.hasEnoughData === false) 확정적인 패턴을 보여주지 않는다.
 */
export default function AnalysisScreen() {
  return (
    <ScreenPlaceholder
      title="최근 기록 살펴보기"
      description="지금까지 남긴 기록에서 함께 나타난 것들을 모아 봤어요."
      items={[
        '음식 기록',
        '증상 기록',
        '증상 시각 기준 과거 음식 패턴',
        '반복적으로 함께 나타난 재료',
        '수면 / 컨디션 / 식사량 등 함께 기록된 상황',
      ]}
      links={[{ label: '다시 먹어볼 음식 보기', href: '/reintroduction' }]}
    />
  );
}
