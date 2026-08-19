import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { FoodRecord } from '@/types/food';

export type FoodCardProps = {
  record: FoodRecord;
  onPress?: () => void;
  /** 재료 칩까지 함께 보여줄지 여부 */
  showIngredients?: boolean;
};

/** 음식 기록 하나를 요약해서 보여주는 카드 */
export function FoodCard({ record, onPress, showIngredients = false }: FoodCardProps) {
  const body = (
    <ThemedView type="backgroundElement" style={styles.container}>
      <ThemedText type="smallBold">{record.food.name}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {record.eatenAt}
      </ThemedText>
      {showIngredients ? (
        <ThemedText type="small" themeColor="textSecondary">
          {record.food.ingredients.map((ingredient) => ingredient.name).join(', ')}
        </ThemedText>
      ) : null}
    </ThemedView>
  );

  if (!onPress) return body;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.half,
  },
  pressed: {
    opacity: 0.7,
  },
});
