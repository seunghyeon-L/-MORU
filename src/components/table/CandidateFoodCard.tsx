import { SelectionCard } from '@/components/common/SelectionCard';
import type { MyTableFood } from '@/types/food';

export type CandidateFoodCardProps = {
  food: MyTableFood;
  onPress?: () => void;
};

/**
 * "다시 먹어볼 음식" 카드.
 * 권유가 아니라 선택지를 보여주는 용도이며, 넘어가도 아무 불이익이 없다.
 */
export function CandidateFoodCard({ food, onPress }: CandidateFoodCardProps) {
  return (
    <SelectionCard
      title={food.name}
      description={
        food.lastEatenAt
          ? `마지막으로 드신 기록은 ${food.lastEatenAt} 이에요.`
          : '아직 기록이 없는 음식이에요.'
      }
      onPress={onPress}
    />
  );
}
