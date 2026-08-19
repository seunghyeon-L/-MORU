import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FoodInputSheet } from '@/components/food/FoodInputSheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import * as api from '@/services/api';
import type { HomeCard, HomeResponse } from '@/types/home';

/**
 * C 홈 (기본 화면).
 * GET /home 의 cards 배열을 type 별로 그대로 렌더링한다. cards: [] 는 신규 사용자의 정상 상태다.
 */
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [home, setHome] = useState<HomeResponse | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [snoozingId, setSnoozingId] = useState<number | null>(null);
  const [foodSheetVisible, setFoodSheetVisible] = useState(false);

  useEffect(() => {
    api
      .getHomeCards()
      .then(setHome)
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[Home] GET /home failed:', err);
        setLoadError(true);
      });
  }, []);

  /** "나중에" — 서버에 snooze 를 저장하고 홈을 다시 불러온다. 프론트에서 카드만 숨기지 않는다 */
  const handleSnooze = async (ingredientId: number) => {
    setSnoozingId(ingredientId);
    try {
      await api.snoozeSuggestion(ingredientId);
      const refreshed = await api.getHomeCards();
      setHome(refreshed);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[Home] snooze failed:', err);
    } finally {
      setSnoozingId(null);
    }
  };

  const renderCard = (card: HomeCard, index: number) => {
    switch (card.type) {
      case 'challenge_progress':
        return (
          <ThemedView key={index} type="surfaceCard" style={styles.card}>
            <ThemedText type="h1" themeColor="textPrimary" style={styles.cardHeadline}>
              {card.title}
            </ThemedText>
            <ThemedText type="bodyS" themeColor="textSecondary" style={styles.cardBody}>
              {card.body}
            </ThemedText>
            <Pressable
              style={styles.ctaPressable}
              onPress={() =>
                router.push({
                  pathname: '/reintroduction/progress',
                  params: { challenge_id: String(card.action.challenge_id) },
                })
              }>
              <ThemedView type="brand" style={styles.ctaPrimary}>
                <ThemedText type="label" themeColor="textOnBrand">
                  {card.action.label}
                </ThemedText>
              </ThemedView>
            </Pressable>
          </ThemedView>
        );

      case 'challenge_suggestion':
        return (
          <ThemedView key={index} type="surfaceCard" style={styles.card}>
            <ThemedView type="brandLight" style={styles.badge}>
              <ThemedText type="caption" themeColor="brandText">
                다시 먹어볼 음식
              </ThemedText>
            </ThemedView>
            <ThemedText type="h1" themeColor="textPrimary" style={styles.cardHeadline}>
              {card.title}
            </ThemedText>
            <ThemedText type="bodyS" themeColor="textSecondary" style={styles.cardBody}>
              {card.body}
            </ThemedText>
            <View style={styles.ctaRow}>
              <Pressable style={styles.ctaPressable} onPress={() => router.push('/reintroduction')}>
                <ThemedView type="brand" style={styles.ctaPrimary}>
                  <ThemedText type="label" themeColor="textOnBrand">
                    {card.action.label}
                  </ThemedText>
                </ThemedView>
              </Pressable>
              <Pressable
                style={styles.ctaPressable}
                disabled={snoozingId === card.action.ingredient_id}
                onPress={() => handleSnooze(card.action.ingredient_id)}>
                <ThemedView type="onboardingBackground" style={styles.ctaSecondary}>
                  <ThemedText type="label" themeColor="textMuted">
                    {card.dismiss.label}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            </View>
          </ThemedView>
        );

      case 'schedule_note':
      case 'weekly_recap':
        return (
          <ThemedView key={index} type="surfaceCard" style={styles.card}>
            <ThemedText type="label" themeColor="textPrimary">
              {card.title}
            </ThemedText>
            <ThemedText type="bodyS" themeColor="textSecondary" style={styles.cardBody}>
              {card.body}
            </ThemedText>
          </ThemedView>
        );

      default:
        return null;
    }
  };

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
            {home?.greeting ?? ''}
          </ThemedText>
        </View>

        {home && home.cards.length > 0 ? (
          home.cards.map(renderCard)
        ) : home && home.cards.length === 0 ? (
          <ThemedView type="surfaceCard" style={styles.card}>
            <ThemedText type="label" themeColor="textPrimary">
              아직 보여드릴 카드가 없어요
            </ThemedText>
            <ThemedText type="bodyS" themeColor="textSecondary" style={styles.cardBody}>
              기록이 쌓이면 여기에 보여드릴게요.
            </ThemedText>
          </ThemedView>
        ) : loadError ? (
          <ThemedText type="bodyS" themeColor="textSecondary" style={styles.errorText}>
            홈 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </ThemedText>
        ) : null}

        <View style={styles.flex} />

        <Pressable onPress={() => setFoodSheetVisible(true)}>
          <ThemedView type="brand" style={styles.checkButton}>
            <ThemedText type="button" themeColor="textOnBrand">
              오늘 먹은 것 확인하기
            </ThemedText>
          </ThemedView>
        </Pressable>
      </ThemedView>

      <FoodInputSheet visible={foodSheetVisible} onClose={() => setFoodSheetVisible(false)} />
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
  },
  ctaPressable: {
    flex: 1,
    marginTop: 16,
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
  errorText: {
    marginBottom: 12,
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
