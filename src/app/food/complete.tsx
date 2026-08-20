import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomButton } from '@/components/common/BottomButton';
import { SproutIcon } from '@/components/common/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

type ForwardParams = {
  food_name?: string;
  eaten_at?: string;
  portion?: string;
  ingredients?: string;
  /** D3 에서 고른 방법. 서버에 저장하지 않고 이 화면에서만 보여준다 */
  plan?: string;
};

/** D2 와 동일한 로컬 라벨 매핑 — 화면마다 로컬로 둔다(공용 PORTION_OPTIONS 라벨과 다른 Figma 문구) */
const PORTION_LABELS: Record<string, string> = {
  small: '반',
  normal: '한 그릇',
  large: '한 그릇 반 이상',
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function formatEatenAt(iso?: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  return `${date.getMonth() + 1}월 ${date.getDate()}일 / ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * D4 기록 완료.
 * POST /meals 확정(D2) 이후 D2/D3 에서 전달받은 route params 로 요약을 그린다.
 * 서버가 주지 않은 문구를 새로 만들지 않는다 — 안내 문구(불편함이 생기면...)는
 * API 응답 필드가 아니라 이 화면 고정 카피다.
 */
export default function FoodCompleteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { food_name, eaten_at, portion, ingredients, plan } = useLocalSearchParams<ForwardParams>();

  const portionLabel = portion ? PORTION_LABELS[portion] : undefined;
  const foodSummary = [food_name, portionLabel].filter(Boolean).join(' · ');
  const timeSummary = formatEatenAt(eaten_at);
  const ingredientsSummary = ingredients
    ? ingredients
        .split(',')
        .filter(Boolean)
        .join(' · ')
    : '';

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <ThemedView
        type="onboardingBackground"
        style={[styles.container, { paddingTop: insets.top + Spacing.six }]}>
        <View style={styles.heroWrap}>
          <View style={[styles.dot, styles.dotLeft, { backgroundColor: theme.brandLighter }]} />
          <View style={[styles.dot, styles.dotRight, { backgroundColor: theme.coralLight }]} />
          <ThemedView type="surfaceCard" style={styles.heroCircle}>
            <SproutIcon size={54} color={theme.brand} />
          </ThemedView>
          <ThemedView
            type="brand"
            style={[styles.checkBadge, { borderColor: theme.onboardingBackground }]}>
            <ThemedText type="label" themeColor="textOnBrand">
              {'✓'}
            </ThemedText>
          </ThemedView>
        </View>

        <ThemedText type="h1" themeColor="textPrimary" style={styles.headline}>
          기록했어요
        </ThemedText>

        <ThemedView type="surfaceCard" style={styles.summaryCard}>
          {foodSummary ? (
            <View style={styles.summaryRow}>
              <ThemedText type="caption" themeColor="textMuted">
                음식
              </ThemedText>
              <ThemedText type="label" themeColor="textPrimary">
                {foodSummary}
              </ThemedText>
            </View>
          ) : null}
          {timeSummary ? (
            <View style={styles.summaryRow}>
              <ThemedText type="caption" themeColor="textMuted">
                시간
              </ThemedText>
              <ThemedText type="label" themeColor="textPrimary">
                {timeSummary}
              </ThemedText>
            </View>
          ) : null}
          {ingredientsSummary ? (
            <View style={styles.summaryRow}>
              <ThemedText type="caption" themeColor="textMuted">
                확인한 재료
              </ThemedText>
              <ThemedText type="label" themeColor="textPrimary" style={styles.summaryIngredients}>
                {ingredientsSummary}
              </ThemedText>
            </View>
          ) : null}
          {plan ? (
            <View style={styles.summaryRow}>
              <ThemedText type="caption" themeColor="textMuted">
                이렇게 드시기로
              </ThemedText>
              <ThemedText type="label" themeColor="textPrimary" style={styles.summaryIngredients}>
                {plan}
              </ThemedText>
            </View>
          ) : null}
        </ThemedView>

        <ThemedView type="brandSoft" style={styles.adviceCard}>
          <SproutIcon size={18} color={theme.brandText} />
          <ThemedText type="caption" themeColor="brandText" style={styles.adviceText}>
            {'불편함이 생기면 그때 알려주세요.\n미리 기록하지 않으셔도 괜찮아요.'}
          </ThemedText>
        </ThemedView>

        <View style={styles.flex} />
      </ThemedView>

      <BottomButton label="홈으로" onPress={() => router.replace('/(tabs)')} />
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
    alignItems: 'center',
  },
  heroWrap: {
    width: 136,
    height: 136,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCircle: {
    width: 136,
    height: 136,
    borderRadius: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotLeft: {
    left: -6,
    top: 18,
  },
  dotRight: {
    right: -2,
    top: 4,
  },
  headline: {
    fontSize: 24,
    lineHeight: 32,
    marginTop: Spacing.three,
  },
  summaryCard: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    marginTop: Spacing.five,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  summaryIngredients: {
    flex: 1,
    textAlign: 'right',
  },
  adviceCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: Spacing.three,
  },
  adviceText: {
    flex: 1,
    lineHeight: 19,
  },
  flex: {
    flex: 1,
    minHeight: Spacing.four,
  },
});
