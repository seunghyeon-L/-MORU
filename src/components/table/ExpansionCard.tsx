import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export type ExpansionCardProps = {
  /** 현재 식탁에 올라와 있는 음식 수 */
  currentCount: number;
  /** 비교 시점의 음식 수 (예: 한 달 전) */
  previousCount: number;
  /** 비교 시점 설명 */
  periodLabel?: string;
};

/**
 * 식탁 범위가 얼마나 넓어졌는지 보여주는 카드.
 * 목표 달성률이나 점수가 아니라 변화한 개수만 담담하게 보여준다.
 */
export function ExpansionCard({
  currentCount,
  previousCount,
  periodLabel = '지난달',
}: ExpansionCardProps) {
  const diff = currentCount - previousCount;

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <ThemedText type="smallBold">나의 식탁</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {`지금 식탁에는 ${currentCount}가지 음식이 있어요.`}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {diff > 0
          ? `${periodLabel}보다 ${diff}가지 늘었어요.`
          : `${periodLabel}과 비슷하게 유지되고 있어요.`}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.half,
  },
});
