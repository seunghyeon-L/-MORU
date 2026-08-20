import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomButton } from '@/components/common/BottomButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import * as api from '@/services/api';
import type { ChallengeResult } from '@/types/reintroduction';

/**
 * F4 도전 · 결과.
 * GET /challenges/{id}/result 를 그대로 표시한다.
 * 서버가 등급(grade)만 주므로 점수/게이지로 바꾸지 않고 문장 그대로 쓴다.
 */
export default function ReintroductionResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { challenge_id } = useLocalSearchParams<{ challenge_id?: string }>();
  const challengeId = Number(challenge_id);

  const [result, setResult] = useState<ChallengeResult | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (!challengeId) return;
    api
      .getChallengeResult(challengeId)
      .then(setResult)
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[F4] GET /challenges/{id}/result failed:', err);
        setLoadError(true);
      });
  }, [challengeId]);

  const handleSave = async () => {
    if (saving || !challengeId) return;
    setSaveError(false);
    setSaving(true);
    try {
      await api.saveChallenge(challengeId);
      router.replace('/(tabs)/table');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[F4] POST save failed:', err);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  if (!result) {
    return (
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <ThemedView
          type="onboardingBackground"
          style={[
            styles.container,
            { paddingTop: insets.top + Spacing.five, paddingBottom: insets.bottom + Spacing.three },
          ]}>
          <View style={styles.content}>
            {loadError ? (
              <ThemedText type="bodyS" themeColor="textSecondary" style={styles.errorText}>
                결과를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
              </ThemedText>
            ) : null}
          </View>
        </ThemedView>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <ThemedView
        type="onboardingBackground"
        style={[
          styles.container,
          { paddingTop: insets.top + Spacing.five, paddingBottom: insets.bottom + Spacing.three },
        ]}>
        <View style={styles.content}>
          <ThemedText type="caption" themeColor="textMuted" style={styles.ratioText}>
            {result.ratio}
          </ThemedText>

          <ThemedText type="h1" themeColor="textPrimary" style={styles.title}>
            {result.headline}
          </ThemedText>

          <ThemedView type="surfaceCard" style={[styles.card, { borderColor: theme.borderSubtle }]}>
            {result.attempts.map((attempt) => (
              <View key={attempt.seq} style={styles.historyRow}>
                <ThemedView type="brand" style={styles.historyDot} />
                <View style={styles.historyTexts}>
                  <ThemedText type="caption" themeColor="textMuted">
                    {`${attempt.seq}번째 · ${attempt.date}`}
                  </ThemedText>
                  <ThemedText type="label" themeColor="textPrimary">
                    {attempt.label}
                  </ThemedText>
                </View>
              </View>
            ))}
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.conclusionCard}>
            <ThemedText type="label" themeColor="textPrimary">
              {result.grade_label}
            </ThemedText>
            {result.body ? (
              <ThemedText type="caption" themeColor="textMuted">
                {result.body}
              </ThemedText>
            ) : null}
          </ThemedView>

          {saveError ? (
            <ThemedText type="bodyS" themeColor="textSecondary" style={styles.errorText}>
              저장에 실패했어요. 잠시 후 다시 시도해주세요.
            </ThemedText>
          ) : null}
        </View>

        {/*
          기다리는 쪽은 저장 버튼 하나다 (api.saveChallenge).
          보조 버튼은 화면만 옮기므로 loading 을 주면 일하지 않는 버튼이 도는 것처럼 보인다.
          저장 중에 빠져나가지 못하게 disabled 만 준다.
        */}
        <BottomButton
          label="나의 식탁에 저장하기"
          disabled={saving}
          loading={saving}
          onPress={handleSave}
          secondary={{
            label: '양을 줄여서 다시 해볼래요',
            variant: 'secondary',
            disabled: saving,
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
  ratioText: {
    textAlign: 'center',
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
  errorText: {
    textAlign: 'center',
  },
});
