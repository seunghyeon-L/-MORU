import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export type ExpansionCardProps = {
  /** GET /mytable 의 headline — 서버가 완성한 문장을 그대로 표시한다 */
  headline: string;
  /** GET /mytable 의 sub */
  sub: string;
};

/**
 * 식탁 범위가 얼마나 넓어졌는지 보여주는 카드.
 * 목표 달성률이나 점수가 아니라 서버가 준 문장을 그대로 담담하게 보여준다.
 */
export function ExpansionCard({ headline, sub }: ExpansionCardProps) {
  return (
    <ThemedView type="brand" style={styles.container}>
      <ThemedText type="label" themeColor="textOnBrand" style={styles.headline}>
        {headline}
      </ThemedText>
      <ThemedText type="bodyS" themeColor="textOnBrand" style={styles.body}>
        {sub}
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
