import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMoruData } from '@/hooks/useMoruData';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import * as api from '@/services/api';

/**
 * C 홈 (기본 화면).
 * 오늘의 상태 요약, 재도입 제안, 최근 인사이트를 한눈에 보여준다.
 */
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { reintroductionCandidates, analysis } = useMoruData();

  const [nickname, setNickname] = useState<string | undefined>();
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);

  useEffect(() => {
    api.getUserProfile().then((profile) => setNickname(profile.nickname));
  }, []);

  const candidate = reintroductionCandidates[0];
  const topPattern = analysis?.hasEnoughData ? analysis.ingredientPatterns[0] : undefined;

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <ThemedView
        type="onboardingBackground"
        style={[
          styles.container,
          { paddingTop: insets.top + Spacing.three, paddingBottom: insets.bottom + Spacing.six },
        ]}>
        <View style={styles.header}>
          <ThemedText type="label" themeColor="textMuted">
            MORU
          </ThemedText>
          <ThemedText type="h1" themeColor="textPrimary" style={styles.greeting}>
            {`안녕하세요, ${nickname ?? '회원'}님`}
          </ThemedText>
        </View>

        {candidate && !suggestionDismissed ? (
          <ThemedView type="surfaceCard" style={styles.card}>
            <ThemedView type="brandLight" style={styles.badge}>
              <ThemedText type="caption" themeColor="brandText">
                다시 먹어볼 음식
              </ThemedText>
            </ThemedView>
            <ThemedText type="h1" themeColor="textPrimary" style={styles.cardHeadline}>
              {`${candidate.foodName}, 다시 시도해볼 만해요`}
            </ThemedText>
            <ThemedText type="bodyS" themeColor="textSecondary" style={styles.cardBody}>
              실제로 시도한 사람의 71%가 그 음식을 되찾았어요.
            </ThemedText>
            <View style={styles.ctaRow}>
              <Pressable
                style={styles.ctaPressable}
                onPress={() => router.push('/reintroduction')}>
                <ThemedView type="brand" style={styles.ctaPrimary}>
                  <ThemedText type="label" themeColor="textOnBrand">
                    해볼래요
                  </ThemedText>
                </ThemedView>
              </Pressable>
              <Pressable style={styles.ctaPressable} onPress={() => setSuggestionDismissed(true)}>
                <ThemedView type="onboardingBackground" style={styles.ctaSecondary}>
                  <ThemedText type="label" themeColor="textMuted">
                    나중에
                  </ThemedText>
                </ThemedView>
              </Pressable>
            </View>
          </ThemedView>
        ) : null}

        {topPattern ? (
          <Pressable onPress={() => router.push('/analysis')}>
            <ThemedView type="surfaceCard" style={styles.card}>
              <View style={styles.insightTitleRow}>
                <View style={[styles.dot, { backgroundColor: theme.brand }]} />
                <ThemedText type="label" themeColor="textPrimary">
                  이번 주 정리해봤어요
                </ThemedText>
              </View>
              <ThemedText type="bodyS" themeColor="textSecondary" style={styles.cardBody}>
                {`${topPattern.ingredientName}가 들어간 식사 ${topPattern.discomfort.total}번 중 ${topPattern.discomfort.matched}번, 불편함이 기록됐어요.`}
              </ThemedText>
            </ThemedView>
          </Pressable>
        ) : null}

        <ThemedView type="surfaceCard" style={styles.card}>
          <ThemedText type="label" themeColor="textPrimary">
            이번 주는 일정이 여유롭네요
          </ThemedText>
          <ThemedText type="bodyS" themeColor="textSecondary" style={styles.cardBody}>
            무언가 새로 시도해보기 좋은 때예요.
          </ThemedText>
        </ThemedView>

        <View style={styles.flex} />

        <Pressable onPress={() => router.push('/food/camera')}>
          <ThemedView type="brand" style={styles.checkButton}>
            <ThemedText type="button" themeColor="textOnBrand">
              오늘 먹은 것 확인하기
            </ThemedText>
          </ThemedView>
        </Pressable>
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
    paddingHorizontal: Spacing.four,
  },
  header: {
    marginBottom: 22,
  },
  greeting: {
    fontSize: 19,
    lineHeight: 27,
    marginTop: 4,
  },
  card: {
    borderRadius: 15,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 12,
    shadowColor: '#3B332B',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  cardHeadline: {
    fontSize: 17,
    lineHeight: 24,
    marginTop: 12,
  },
  cardBody: {
    marginTop: 8,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  ctaPressable: {
    flex: 1,
  },
  ctaPrimary: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 11,
  },
  ctaSecondary: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 11,
  },
  insightTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  flex: {
    flex: 1,
    minHeight: 24,
  },
  checkButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 15,
  },
});
