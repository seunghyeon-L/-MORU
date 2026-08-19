import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export type ExpansionCardProps = {
  /** 다시 편하게 드실 수 있게 된 음식 수 */
  reclaimedCount: number;
  /** 원래 피하던 음식 전체 수 */
  avoidedCount: number;
};

/**
 * 식탁 범위가 얼마나 넓어졌는지 보여주는 카드.
 * 목표 달성률이나 점수가 아니라 변화한 개수만 담담하게 보여준다.
 */
export function ExpansionCard({ reclaimedCount, avoidedCount }: ExpansionCardProps) {
  return (
    <ThemedView type="brand" style={styles.container}>
      <ThemedText type="label" themeColor="textOnBrand" style={styles.headline}>
        {`처음보다 ${reclaimedCount}가지를 되찾았어요`}
      </ThemedText>
      <ThemedText type="bodyS" themeColor="textOnBrand" style={styles.body}>
        {`피하던 음식 ${avoidedCount}가지 중 ${reclaimedCount}가지를\n다시 드실 수 있게 됐어요.`}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: 6,
  },
  headline: {
    fontSize: 17,
    lineHeight: 24,
  },
  body: {
    opacity: 0.92,
  },
});
