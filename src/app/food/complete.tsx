import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomButton } from '@/components/common/BottomButton';
import { SproutIcon } from '@/components/common/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

/**
 * D4 기록 완료.
 * D2/D3 에는 아직 화면 간 데이터 공유 구조가 없어(모두 로컬 state), Figma 예시와 동일한
 * 요약값을 mock 으로 보여준다. 실제 저장/API 연동은 하지 않는다.
 */
export default function FoodCompleteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const summary = {
    food: '김치찌개 · 한 그릇',
    time: '8월 16일 / 12:30',
    ingredients: '김치 · 돼지고기 · 두부\n양파 · 마늘',
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <ThemedView
        type="onboardingBackground"
        style={[styles.container, { paddingTop: insets.top + Spacing.six }]}>
        <View style={styles.heroWrap}>
          <View style={[styles.dot, styles.dotLeft, { backgroundColor: theme.brandLighter }]} />
          <View style={[styles.dot, styles.dotRight, { backgroundColor: theme.coralLight }]} />
          <ThemedView type="surfaceCard" style={styles.heroCircle}>
            <SproutIcon size={48} color={theme.brand} />
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
          <View style={styles.summaryRow}>
            <ThemedText type="caption" themeColor="textMuted">
              음식
            </ThemedText>
            <ThemedText type="label" themeColor="textPrimary">
              {summary.food}
            </ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText type="caption" themeColor="textMuted">
              시간
            </ThemedText>
            <ThemedText type="label" themeColor="textPrimary">
              {summary.time}
            </ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText type="caption" themeColor="textMuted">
              확인한 재료
            </ThemedText>
            <ThemedText type="label" themeColor="textPrimary" style={styles.summaryIngredients}>
              {summary.ingredients}
            </ThemedText>
          </View>
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
    width: 124,
    height: 124,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCircle: {
    width: 124,
    height: 124,
    borderRadius: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
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
    fontSize: 22,
    lineHeight: 30,
    marginTop: Spacing.three,
  },
  summaryCard: {
    width: '100%',
    borderRadius: 16,
    padding: 18,
    gap: 14,
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
