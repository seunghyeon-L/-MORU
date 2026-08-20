import { StyleSheet, View } from 'react-native';

import { BackButton } from '@/components/common/BackButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export type ProgressHeaderProps = {
  /** 현재 단계 (1부터 시작) */
  step: number;
  /** 전체 단계 수 */
  totalSteps: number;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
};

/**
 * 온보딩·재도입처럼 여러 단계로 나뉜 플로우의 상단 헤더.
 * 진행 표시는 단순 비율이며 사용자를 평가하는 점수가 아니다.
 */
export function ProgressHeader({
  step,
  totalSteps,
  title,
  showBackButton = true,
  onBack,
}: ProgressHeaderProps) {
  const ratio = totalSteps > 0 ? Math.min(Math.max(step / totalSteps, 0), 1) : 0;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.row}>
        {showBackButton ? <BackButton onPress={onBack} /> : null}
        {title ? <ThemedText type="smallBold">{title}</ThemedText> : null}
      </View>

      <ThemedView type="backgroundElement" style={styles.track}>
        <ThemedView
          type="backgroundSelected"
          style={[styles.fill, { width: `${ratio * 100}%` }]}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    height: Spacing.one,
    borderRadius: Spacing.half,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
