import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { MORUButton } from '@/components/common/MORUButton';
import { SproutIcon } from '@/components/common/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMoruData } from '@/hooks/useMoruData';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

const STEPS = [
  { title: '며칠간 {ingredient}만 빼두기', description: '다른 음식은 평소대로 드셔도 돼요' },
  { title: '편한 날 하루, 평소만큼', description: '연속으로 안 해도 괜찮아요' },
  { title: '이걸 세 번 반복', description: '한 번으론 알 수 없거든요' },
];

/**
 * F1 도전(재도입) 제안 · 상세.
 * 제안일 뿐이며 거절해도 어떤 불이익도 없다.
 */
export default function ReintroductionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { analysis } = useMoruData();

  const topPattern = analysis?.hasEnoughData ? analysis.ingredientPatterns[0] : undefined;
  const ingredientName = topPattern?.ingredientName ?? '이 음식';
  const topFactor = topPattern?.coOccurringFactors[0];

  const reasonText = topPattern
    ? `${ingredientName}가 든 식사 ${topPattern.discomfort.total}번 중 ${topPattern.discomfort.matched}번 불편하셨는데,${
        topFactor
          ? `\n그중 ${topFactor.occurrence.matched}번은 ${topFactor.label}이 겹쳐 있었어요.`
          : ''
      }\n지금으로는 확실하지 않아요.`
    : '아직 반복해서 관찰된 패턴이 없어요.';

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <ThemedView
        type="onboardingBackground"
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing.three },
        ]}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <BackButton />
            <ThemedText type="smallBold">다시 먹어보기</ThemedText>
          </View>

          <View style={styles.iconWrap}>
            <ThemedView type="brandSoft" style={styles.iconCircle}>
              <SproutIcon size={32} color={theme.brandText} />
            </ThemedView>
          </View>

          <ThemedText type="h1" themeColor="textPrimary" style={styles.title}>
            {`${ingredientName}, 다시\n시도해볼까요?`}
          </ThemedText>

          <ThemedView
            type="surfaceCard"
            style={[styles.reasonCard, { borderColor: theme.borderSubtle }]}>
            <ThemedText type="caption" themeColor="textMuted">
              왜 제안하나면
            </ThemedText>
            <ThemedText type="bodyS" themeColor="textPrimary">
              {reasonText}
            </ThemedText>
          </ThemedView>

          <ThemedText type="label" themeColor="textPrimary" style={styles.sectionLabel}>
            이렇게 진행해요
          </ThemedText>

          <View style={styles.stepList}>
            {STEPS.map((step, index) => (
              <ThemedView key={step.title} type="surfaceCard" style={styles.stepCard}>
                <ThemedView type="brandSoft" style={styles.stepNumber}>
                  <ThemedText type="label" themeColor="brandText">
                    {index + 1}
                  </ThemedText>
                </ThemedView>
                <View style={styles.stepTexts}>
                  <ThemedText type="label" themeColor="textPrimary">
                    {step.title.replace('{ingredient}', ingredientName)}
                  </ThemedText>
                  <ThemedText type="caption" themeColor="textMuted">
                    {step.description}
                  </ThemedText>
                </View>
              </ThemedView>
            ))}
          </View>

          <ThemedView type="brandSoft" style={styles.statCard}>
            <ThemedText type="h1" themeColor="brandText" style={styles.statNumber}>
              71%
            </ThemedText>
            <ThemedText type="caption" themeColor="textMuted">
              실제로 시도한 사람이 그 음식을 되찾았어요
            </ThemedText>
          </ThemedView>
        </View>

        <View
          style={[
            styles.footerRow,
            { paddingBottom: insets.bottom + Spacing.three, paddingHorizontal: Spacing.four },
          ]}>
          <View style={styles.footerButton}>
            <MORUButton
              label="나중에"
              variant="secondary"
              onPress={() => router.replace('/(tabs)')}
            />
          </View>
          <View style={styles.footerButton}>
            <MORUButton
              label="시작할게요"
              onPress={() => router.push('/reintroduction/setup')}
            />
          </View>
        </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  iconWrap: {
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
  },
  reasonCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
    gap: Spacing.one,
  },
  sectionLabel: {
    marginTop: Spacing.one,
  },
  stepList: {
    gap: Spacing.two,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    shadowColor: '#3B332B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTexts: {
    flex: 1,
    gap: 2,
  },
  statCard: {
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: 4,
  },
  statNumber: {
    fontSize: 30,
    lineHeight: 36,
  },
  footerRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingTop: Spacing.three,
  },
  footerButton: {
    flex: 1,
  },
});
