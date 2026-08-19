import { SelectionCard } from '@/components/common/SelectionCard';
import type { MyTableFood } from '@/types/food';

export type SafeFoodCardProps = {
  food: MyTableFood;
  onPress?: () => void;
};

/**
 * "안심하고 먹은 음식" 카드.
 * 점수 대신 "n번 중 m번" 형태의 관찰 횟수만 보여준다.
 */
export function SafeFoodCard({ food, onPress }: SafeFoodCardProps) {
  return (
    <SelectionCard
      title={food.name}
      description={`${food.totalCount}번 중 ${food.comfortableCount}번은 편하게 드셨어요.`}
      onPress={onPress}
    />
  );
}
