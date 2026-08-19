import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import type { Ingredient } from '@/types/food';

export type IngredientChipProps = {
  ingredient: Ingredient;
  selected?: boolean;
  onPress?: () => void;
};

/**
 * 음식에 포함된 재료 하나를 나타내는 칩.
 * Figma D2 "재료 확인" 화면 기준 — 선택 시 체크 표시 + 연한 배경으로 구분한다.
 */
export function IngredientChip({ ingredient, selected = false, onPress }: IngredientChipProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => pressed && styles.dimmed}>
      <ThemedView
        type={selected ? 'brandSoft' : 'surfaceCard'}
        style={[styles.chip, { borderColor: selected ? theme.brand : theme.borderSubtle }]}>
        {selected ? (
          <ThemedText type="label" themeColor="brandText">
            {'✓ '}
          </ThemedText>
        ) : null}
        <ThemedText type="label" themeColor={selected ? 'brandText' : 'textSecondary'}>
          {ingredient.name}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 999,
    borderWidth: 1,
  },
  dimmed: {
    opacity: 0.6,
  },
});
