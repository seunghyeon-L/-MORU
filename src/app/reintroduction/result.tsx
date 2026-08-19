import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomButton } from '@/components/common/BottomButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMoruData } from '@/hooks/useMoruData';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

type AttemptOutcome = 'uncomfortable' | 'okay';

/** 3회 시도가 끝난 뒤의 결과 기록 (mock) */
const ATTEMPT_HISTORY: { date: string; result: AttemptOutcome }[] = [
  { date: '8월 1일', result: 'uncomfortable' },
  { date: '8월 5일', result: 'okay' },
  { date: '8월 16일', result: 'uncomfortable' },
];

const OUTCOME_LABEL: Record<AttemptOutcome, string> = {
  uncomfortable: '불편함 있었어요',
  okay: '괜찮았어요',
};

/**
 * F4 도전 · 결과.
 * 3회 시도 결과를 "확인된 후보"로만 저장한다. 허용/금지로 단정하지 않는다.
 */
export default function ReintroductionResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { analysis } = useMoruData();

  const topPattern = analysis?.hasEnoughData ? analysis.ingredientPatterns[0] : undefined;
  const ingredientName = topPattern?.ingredientName ?? '이 음식';

  const matched = ATTEMPT_HISTORY.filter((attempt) => attempt.result === 'uncomfortable').length;
  const total = ATTEMPT_HISTORY.length;

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <ThemedView
        type="onboardingBackground"
        style={[
          styles.container,
          { paddingTop: insets.top + Spacing.five, paddingBottom: insets.bottom + Spacing.three },
        ]}>
        <View style={styles.content}>
          <View style={styles.ringWrap}>
            <View style={[styles.ring, { borderColor: theme.brand }]}>
              <ThemedText type="label" themeColor="textPrimary">
                {`${matched}/${total}`}
              </ThemedText>
            </View>
          </View>

          <ThemedText type="h1" themeColor="textPrimary" style={styles.title}>
            {`${ingredientName}, 세 번 중\n${matched}번 반응이 있었어요`}
          </ThemedText>

          <ThemedView type="surfaceCard" style={[styles.card, { borderColor: theme.borderSubtle }]}>
            {ATTEMPT_HISTORY.map((attempt, index) => (
              <View key={attempt.date} style={styles.historyRow}>
                <ThemedView
                  style={[
                    styles.historyDot,
                    { backgroundColor: attempt.result === 'uncomfortable' ? theme.coral : theme.brand },
                  ]}
                />
                <View style={styles.historyTexts}>
                  <ThemedText type="caption" themeColor="textMuted">
                    {`${index + 1}번째 · ${attempt.date}`}
                  </ThemedText>
                  <ThemedText type="label" themeColor="textPrimary">
                    {OUTCOME_LABEL[attempt.result]}
                  </ThemedText>
                </View>
              </View>
            ))}
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.conclusionCard}>
            <ThemedText type="label" themeColor="textPrimary">
              확정은 아니에요
            </ThemedText>
            <ThemedText type="caption" themeColor="textMuted">
              {'"확인된 후보"로 저장할게요. 시간이 지나면 달라질 수 있어서,\n나중에 더 적은 양으로 다시 해볼 수 있어요.'}
            </ThemedText>
          </ThemedView>
        </View>

        <BottomButton
          label="나의 식탁에 저장하기"
          onPress={() => router.replace('/(tabs)/table')}
          secondary={{
            label: '양을 줄여서 다시 해볼래요',
            variant: 'secondary',
            onPress: () => router.replace('/reintroduction/setup'),
          }}
        />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  ringWrap: {
    alignItems: 'center',
  },
  ring: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    lineHeight: 30,
    textAlign: 'center',
  },
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
    gap: Spacing.two,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  historyTexts: {
    flex: 1,
    gap: 2,
  },
  conclusionCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: 4,
  },
});
