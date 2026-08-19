import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { IngredientPattern } from '@/types/analysis';

export type PatternCardProps = {
  pattern: IngredientPattern;
};

/**
 * 관찰된 패턴을 기술통계로만 보여주는 카드.
 *
 * - 원인을 단정하지 않는다.
 * - "4번 중 3번" 형태로만 표현하고 점수를 쓰지 않는다.
 */
export function PatternCard({ pattern }: PatternCardProps) {
  const { discomfort, coOccurringFactors, ingredientName } = pattern;

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <ThemedText type="smallBold">{ingredientName}</ThemedText>

      <ThemedText type="small" themeColor="textSecondary">
        {`${ingredientName}이(가) 포함된 식사 ${discomfort.total}번 중 ${discomfort.matched}번 불편함이 기록됐어요.`}
      </ThemedText>

      {coOccurringFactors.map((factor) => (
        <ThemedText key={factor.factor} type="small" themeColor="textSecondary">
          {`같은 기간 ${factor.occurrence.total}번 중 ${factor.occurrence.matched}번은 '${factor.label}' 기록도 함께 있었어요.`}
        </ThemedText>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
});
