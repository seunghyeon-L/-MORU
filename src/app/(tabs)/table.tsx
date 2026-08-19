import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CandidateFoodCard } from '@/components/table/CandidateFoodCard';
import { ExpansionCard } from '@/components/table/ExpansionCard';
import { MoreVerticalIcon } from '@/components/common/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMoruData } from '@/hooks/useMoruData';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { mockOriginallyAvoidedCount } from '@/mock/foods';

/**
 * G 나의 식탁.
 * 점수 기반 UI는 사용하지 않고 상태와 관찰 횟수만 보여준다.
 */
export default function TableScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { myTableFoods } = useMoruData();

  const safeFoods = myTableFoods.filter((food) => food.status === 'safe');
  const candidateFoods = myTableFoods.filter((food) => food.status === 'candidate');
  const unconfirmedFoods = myTableFoods.filter((food) => food.status === 'unconfirmed');

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <ThemedView
        type="onboardingBackground"
        style={[
          styles.container,
          { paddingTop: insets.top + Spacing.three, paddingBottom: insets.bottom + Spacing.six },
        ]}>
        <View style={styles.headerRow}>
          <ThemedText type="h1" themeColor="textPrimary">
            나의 식탁
          </ThemedText>
          <MoreVerticalIcon size={20} color={theme.textMuted} />
        </View>

        <ExpansionCard reclaimedCount={safeFoods.length} avoidedCount={mockOriginallyAvoidedCount} />

        {safeFoods.length > 0 ? (
          <View style={styles.section}>
            <ThemedText type="label" themeColor="textPrimary">
              안심하고 먹는 음식
            </ThemedText>
            <View style={styles.tagWrap}>
              {safeFoods.map((food) => (
                <ThemedView key={food.id} type="brandSoft" style={styles.tag}>
                  <View style={[styles.tagDot, { backgroundColor: theme.brand }]} />
                  <ThemedText type="label" themeColor="brandText">
                    {food.name}
                  </ThemedText>
                </ThemedView>
              ))}
            </View>
          </View>
        ) : null}

        {candidateFoods.length > 0 ? (
          <View style={styles.section}>
            <ThemedText type="label" themeColor="textPrimary">
              확인된 후보
            </ThemedText>
            {candidateFoods.map((food) => {
              const reaction = food.totalCount - food.comfortableCount;
              return (
                <ThemedView
                  key={food.id}
                  type="surfaceCard"
                  style={[styles.candidateCard, { borderColor: theme.coral }]}>
                  <ThemedText type="label" themeColor="textPrimary">
                    {food.name}
                  </ThemedText>
                  <ThemedText type="caption" themeColor="textMuted">
                    {`${food.totalCount}번 중 ${reaction}번 반응 · 양을 줄여보세요`}
                  </ThemedText>
                </ThemedView>
              );
            })}
          </View>
        ) : null}

        {unconfirmedFoods.length > 0 ? (
          <View style={styles.section}>
            <ThemedText type="label" themeColor="textPrimary">
              다시 먹어볼 음식
            </ThemedText>
            <View style={styles.candidateList}>
              {unconfirmedFoods.map((food) => (
                <CandidateFoodCard
                  key={food.id}
                  food={food}
                  onCheck={() => router.push('/reintroduction')}
                />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <ThemedText type="label" themeColor="textPrimary">
            대체 추천
          </ThemedText>
          <ThemedText type="caption" themeColor="textMuted">
            내 기록을 바탕으로 더 편한 선택을 찾아드려요.
          </ThemedText>
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
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  section: {
    gap: Spacing.two,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: Spacing.two,
    borderRadius: 999,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  candidateCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1.5,
    gap: 4,
  },
  candidateList: {
    gap: Spacing.two,
  },
});
