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
      {/* 예전에는 opacity 0.92 를 걸어 한 톤 낮췄는데, 안드로이드는 글자에도 알파를
          그리기 연산마다 곱해서 brand 배경과 섞인 결과색이 되고 대비가 6.12:1 → 5.24:1 로 떨어진다.
          두 줄의 위계는 글자 크기(17 → 13.5)로 이미 충분해서 알파를 걷어냈다. */}
      <ThemedText type="bodyS" themeColor="textOnBrand">
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
});
