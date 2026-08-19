import { Chip } from '@/components/common/Chip';
import type { Ingredient } from '@/types/food';

export type IngredientChipProps = {
  ingredient: Ingredient;
  selected?: boolean;
  onPress?: () => void;
};

/** 음식에 포함된 재료 하나를 나타내는 칩 */
export function IngredientChip({ ingredient, selected, onPress }: IngredientChipProps) {
  return <Chip label={ingredient.name} selected={selected} onPress={onPress} />;
}
