import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { MORUButton } from '@/components/common/MORUButton';
import { SearchIcon } from '@/components/common/icons';
import { AlternativeCard } from '@/components/food/AlternativeCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import * as api from '@/services/api';
import type { MealInsightResponse } from '@/types/food';

type ForwardParams = {
  meal_id?: string;
  food_id?: string;
  food_name?: string;
  eaten_at?: string;
  portion?: string;
  ingredients?: string;
};

/**
 * D3 음식 확인 · 참고 정보와 대체안.
 * GET /meals/{meal_id}/insight 응답만 사용한다(D2에서 전달받은 meal_id 기준).
 * observation 이 null 이면 카드를 그리지 않고, caveat 는 안전장치이므로 항상 표시한다.
 * suggestions 는 서버가 준 배열/rank 순서를 그대로 쓴다 — 프론트에서 순위를 다시 계산하지 않는다.
 *
 * food_id 는 D2 → D3 → D4 로만 유실 없이 전달해두고 이 화면에서는 아직 쓰지 않는다.
 * H4(GET /foods/{food_id}/alternatives)로 들어가는 명확한 CTA가 이 화면에 없어
 * H4/H5 연결은 보류 상태다(BLOCKED) — 진입 UX가 결정되면 이 food_id를 그대로 쓰면 된다.
 */
export default function FoodIngredientScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { meal_id, food_id, food_name, eaten_at, portion, ingredients } =
    useLocalSearchParams<ForwardParams>();

  const mealId = Number(meal_id);
  const hasValidMealId = meal_id !== undefined && Number.isFinite(mealId);

  const [insight, setInsight] = useState<MealInsightResponse | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [selectedRank, setSelectedRank] = useState<number | null>(null);

  useEffect(() => {
    if (!hasValidMealId) return;
    api
      .getMealInsight(mealId)
      .then(setInsight)
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[D3] GET /meals/{meal_id}/insight failed:', err);
        setLoadError(true);
      });
  }, [hasValidMealId, mealId]);

  /**
   * D4 로 넘어간다.
   *
   * 전에는 "그냥 먹을래요" 와 "기록하기" 가 **완전히 같은 함수**를 불렀고,
   * 사용자가 고른 방법(selectedRank)은 아무 데도 쓰이지 않고 버려졌다.
   * 고를 수 있게 해놓고 결과가 같으면 고른 행동 자체가 거짓말이 된다.
   *
   * 방법은 서버에 저장할 자리가 없다(POST /meals 에 해당 필드가 없다).
   * 그래서 D4 화면까지만 들고 가서 "이렇게 드시기로 했어요" 로 보여준다.
   */
  const finish = (plan?: string) =>
    router.push({
      pathname: '/food/complete',
      params: { meal_id, food_id, food_name, eaten_at, portion, ingredients, plan },
    });

  const selectedPlan = insight?.suggestions.find((s) => s.rank === selectedRank)?.title;

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <ThemedView
        type="onboardingBackground"
        style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing.four }]}>
        <View style={styles.headerRow}>
          <BackButton />
          <ThemedText type="label" themeColor="textPrimary">
            {insight?.food_name ?? food_name ?? ''}
          </ThemedText>
        </View>

        {!hasValidMealId ? (
          <ThemedText type="bodyS" themeColor="textSecondary" style={styles.errorText}>
            불러올 기록 정보가 없어요.
          </ThemedText>
        ) : loadError ? (
          <ThemedText type="bodyS" themeColor="textSecondary" style={styles.errorText}>
            참고 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </ThemedText>
        ) : insight ? (
          <>
            <ThemedView type="surfaceCard" style={styles.hintBar}>
              <SearchIcon size={18} color={theme.textMuted} />
              <ThemedText type="bodyS" themeColor="textSecondary" style={styles.hintText}>
                {insight.note}
              </ThemedText>
            </ThemedView>

            {insight.observation ? (
              <ThemedView type="surfaceCard" style={styles.patternCard}>
                <ThemedText type="caption" themeColor="textMuted">
                  {insight.observation.title}
                </ThemedText>
                <ThemedText type="label" themeColor="textPrimary" style={styles.patternHeadline}>
                  {insight.observation.body}
                </ThemedText>

                <ThemedView type="onboardingBackground" style={styles.caveatBox}>
                  <ThemedText type="caption" themeColor="textMuted">
                    {insight.observation.caveat}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            ) : null}

            <ThemedText type="label" themeColor="textPrimary" style={styles.sectionLabel}>
              이렇게 하면 드실 수 있어요
            </ThemedText>

            <View style={styles.alternativeList}>
              {insight.suggestions.map((suggestion) => (
                <AlternativeCard
                  key={suggestion.rank}
                  alternative={{
                    id: String(suggestion.rank),
                    kind: 'method',
                    title: suggestion.title,
                    description: suggestion.detail,
                  }}
                  index={suggestion.rank}
                  selected={selectedRank === suggestion.rank}
                  onPress={() => setSelectedRank(suggestion.rank)}
                />
              ))}
            </View>
          </>
        ) : null}

        <View style={styles.flex} />

        <View style={styles.ctaRow}>
          <View style={styles.ctaPressable}>
            <MORUButton label="그냥 먹을래요" variant="secondary" onPress={() => finish()} />
          </View>
          <View style={styles.ctaPressable}>
            <MORUButton
              label={selectedPlan ? '이 방법으로 할게요' : '기록하기'}
              variant="primary"
              onPress={() => finish(selectedPlan)}
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
    paddingHorizontal: Spacing.four,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  errorText: {
    marginTop: Spacing.three,
  },
  hintBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginTop: Spacing.three,
  },
  hintText: {
    flex: 1,
  },
  patternCard: {
    borderRadius: 16,
    padding: 18,
    marginTop: Spacing.three,
    gap: 8,
  },
  patternHeadline: {
    lineHeight: 22,
  },
  caveatBox: {
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
  },
  sectionLabel: {
    marginTop: 28,
    marginBottom: 10,
  },
  alternativeList: {
    gap: 10,
  },
  flex: {
    flex: 1,
    minHeight: 24,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  ctaPressable: {
    flex: 1,
  },
});
