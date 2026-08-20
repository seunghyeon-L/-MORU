import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { BottomButton } from '@/components/common/BottomButton';
import { Chip } from '@/components/common/Chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import * as api from '@/services/api';
import type { PatternsResponse } from '@/types/analysis';

/**
 * E3 개인화 패턴 분석.
 * GET /patterns 를 그대로 표시한다. summary 가 null 이면 아직 근거가 부족하다는 뜻이며 정상 상태다.
 */
export default function AnalysisScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [patterns, setPatterns] = useState<PatternsResponse | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    api
      .getPatterns()
      .then(setPatterns)
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[E3] GET /patterns failed:', err);
        setLoadError(true);
      });
  }, []);

  const verdict = patterns?.verdict;

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
            <ThemedText type="smallBold">오늘의 기록</ThemedText>
          </View>

          {patterns ? (
            <ThemedText type="h1" themeColor="textPrimary" style={styles.title}>
              {patterns.headline}
            </ThemedText>
          ) : null}

          {patterns?.summary ? (
            <>
              <ThemedView type="surfaceCard" style={styles.card}>
                <ThemedText type="bodyM" themeColor="textPrimary">
                  {patterns.summary}
                </ThemedText>

                {patterns.timeline.length > 0 ? (
                  <View style={styles.timeline}>
                    {patterns.timeline.map((entry, index) => (
                      <View key={index} style={styles.timelineRow}>
                        <ThemedView type="brand" style={styles.timelineDot} />
                        <View style={styles.timelineTexts}>
                          <ThemedText type="label" themeColor="textPrimary">
                            {`${entry.time} ${entry.meal} · ${entry.food}`}
                          </ThemedText>
                          <ThemedText type="caption" themeColor="textMuted">
                            {`${entry.ago} · ${entry.phase}`}
                          </ThemedText>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null}

                {patterns.cofactors.length > 0 ? (
                  <View style={styles.factorSection}>
                    <ThemedText type="caption" themeColor="textMuted">
                      그날 함께 있었던 것
                    </ThemedText>
                    <View style={styles.factorRow}>
                      {patterns.cofactors.map((factor) => (
                        <Chip key={factor.label} label={`${factor.label} · ${factor.count}번`} />
                      ))}
                    </View>
                  </View>
                ) : null}
              </ThemedView>

              {verdict ? (
                <ThemedView type="backgroundElement" style={styles.conclusionCard}>
                  <ThemedText type="label" themeColor="textPrimary">
                    {verdict.title}
                  </ThemedText>
                  <ThemedText type="caption" themeColor="textMuted">
                    {verdict.body}
                  </ThemedText>
                </ThemedView>
              ) : null}
            </>
          ) : loadError ? (
            <ThemedText type="bodyS" themeColor="textSecondary" style={styles.errorText}>
              패턴 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
            </ThemedText>
          ) : patterns ? (
            <ThemedView type="surfaceCard" style={styles.card}>
              <ThemedText type="bodyM" themeColor="textSecondary">
                아직 패턴을 보여드릴 만큼 기록이 쌓이지 않았어요. 기록이 조금 더 모이면 함께
                살펴볼게요.
              </ThemedText>
            </ThemedView>
          ) : null}
        </View>

        <BottomButton
          label={verdict?.action ? verdict.action.label : '홈으로'}
          onPress={() => (verdict?.action ? router.push('/reintroduction') : router.replace('/(tabs)'))}
          secondary={
            verdict?.action
              ? { label: '홈으로', variant: 'ghost', onPress: () => router.replace('/(tabs)') }
              : undefined
          }
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    marginTop: Spacing.one,
  },
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.three,
    shadowColor: '#3B332B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 1,
  },
  timeline: {
    gap: Spacing.two,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  timelineTexts: {
    flex: 1,
    gap: 2,
  },
  factorSection: {
    gap: Spacing.two,
    paddingTop: Spacing.one,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  factorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  conclusionCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  errorText: {
    marginTop: Spacing.one,
  },
});
