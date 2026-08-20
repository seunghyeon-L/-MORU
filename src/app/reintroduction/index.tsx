import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { BottomButton } from '@/components/common/BottomButton';
import { MORUButton } from '@/components/common/MORUButton';
import { SproutIcon } from '@/components/common/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import * as api from '@/services/api';
import type { ChallengeSuggestion } from '@/types/reintroduction';

/**
 * F1 도전(재도입) 제안 · 상세.
 * GET /challenges/suggestion 을 그대로 표시한다. 204(제안 없음)도 정상 상태다.
 * 제안일 뿐이며 거절해도 어떤 불이익도 없다.
 */
export default function ReintroductionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  /** undefined = 로딩 중, null = 제안 없음(204), 값 있음 = 제안 도착 */
  const [suggestion, setSuggestion] = useState<ChallengeSuggestion | null | undefined>(undefined);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    api
      .getChallengeSuggestion()
      .then((result) => setSuggestion(result ?? null))
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[F1] GET /challenges/suggestion failed:', err);
        setLoadError(true);
      });
  }, []);

  if (loadError || suggestion === null) {
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
            <View style={styles.flex} />
            <ThemedText type="bodyM" themeColor="textSecondary" style={styles.emptyText}>
              {loadError
                ? '제안 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.'
                : '지금은 다시 제안할 도전이 없어요.'}
            </ThemedText>
            <View style={styles.flex} />
          </View>
          <BottomButton label="홈으로" onPress={() => router.replace('/(tabs)')} />
        </ThemedView>
      </ScrollView>
    );
  }

  if (!suggestion) {
    return null;
  }

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
            {suggestion.title}
          </ThemedText>

          <ThemedView
            type="surfaceCard"
            style={[styles.reasonCard, { borderColor: theme.borderSubtle }]}>
            <ThemedText type="caption" themeColor="textMuted">
              {suggestion.reason.title}
            </ThemedText>
            <ThemedText type="bodyS" themeColor="textPrimary">
              {suggestion.reason.body}
            </ThemedText>
          </ThemedView>

          <ThemedText type="label" themeColor="textPrimary" style={styles.sectionLabel}>
            이렇게 진행해요
          </ThemedText>

          <View style={styles.stepList}>
            {suggestion.steps.map((step) => (
              <ThemedView key={step.seq} type="surfaceCard" style={styles.stepCard}>
                <ThemedView type="brandSoft" style={styles.stepNumber}>
                  <ThemedText type="label" themeColor="brandText">
                    {step.seq}
                  </ThemedText>
                </ThemedView>
                <View style={styles.stepTexts}>
                  <ThemedText type="label" themeColor="textPrimary">
                    {step.title.replace('{name}', suggestion.ingredient_name)}
                  </ThemedText>
                  <ThemedText type="caption" themeColor="textMuted">
                    {step.detail}
                  </ThemedText>
                </View>
              </ThemedView>
            ))}
          </View>

          <ThemedView type="brandSoft" style={styles.statCard}>
            <ThemedText type="h1" themeColor="brandText" style={styles.statNumber}>
              {suggestion.evidence.figure}
            </ThemedText>
            <ThemedText type="caption" themeColor="textMuted">
              {suggestion.evidence.text}
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
              onPress={() =>
                router.push({
                  pathname: '/reintroduction/setup',
                  params: {
                    ingredient_id: String(suggestion.ingredient_id),
                    ingredient_name: suggestion.ingredient_name,
                  },
                })
              }
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
  flex: {
    flex: 1,
    minHeight: 16,
  },
  emptyText: {
    textAlign: 'center',
  },
});
