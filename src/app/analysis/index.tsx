import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { BottomButton } from '@/components/common/BottomButton';
import { Chip } from '@/components/common/Chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMoruData } from '@/hooks/useMoruData';
import { Spacing } from '@/constants/theme';
import type { IngredientPattern, SymptomFoodWindow } from '@/types/analysis';
import type { FoodRecord } from '@/types/food';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function formatClock(iso: string): string {
  const date = new Date(iso);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function mealLabel(iso: string): string {
  const hour = new Date(iso).getHours();
  if (hour < 10) return '아침';
  if (hour < 16) return '점심';
  return '저녁';
}

function hoursAgo(fromIso: string, toIso: string): number {
  return Math.max(1, Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 3600000));
}

type TimelineEntry = {
  window: SymptomFoodWindow;
  foodRecord: FoodRecord;
};

/** 상위 패턴 재료가 포함된 식사 → 이후 증상 발생까지의 타임라인 (최대 2개) */
function buildTimeline(
  windows: SymptomFoodWindow[],
  foodRecords: FoodRecord[],
  ingredientId: string,
): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  for (const window of windows) {
    const foodRecord = foodRecords.find(
      (record) =>
        window.foodRecordIds.includes(record.id) &&
        record.food.ingredients.some((ingredient) => ingredient.id === ingredientId),
    );
    if (foodRecord) entries.push({ window, foodRecord });
    if (entries.length === 2) break;
  }
  return entries;
}

/**
 * E3 개인화 패턴 분석.
 *
 * 특정 음식을 원인으로 단정하지 않고, "N번 중 M번" 형태의 관찰 결과와
 * 함께 기록된 상황(수면 부족 등 교란 변수)을 나란히 보여준다.
 */
export default function AnalysisScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { analysis, foodRecords } = useMoruData();

  const topPattern: IngredientPattern | undefined = analysis?.hasEnoughData
    ? analysis.ingredientPatterns[0]
    : undefined;

  const timeline = topPattern
    ? buildTimeline(analysis?.symptomFoodWindows ?? [], foodRecords, topPattern.ingredientId)
    : [];

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

          <ThemedText type="h1" themeColor="textPrimary" style={styles.title}>
            {'지금까지 기록을\n모아봤어요'}
          </ThemedText>

          {topPattern ? (
            <>
              <ThemedView type="surfaceCard" style={styles.card}>
                <ThemedText type="bodyM" themeColor="textPrimary">
                  {`${topPattern.ingredientName}가 들어간 식사 ${topPattern.discomfort.total}번 중 ${topPattern.discomfort.matched}번,\n몇 시간 뒤 불편함이 있었어요.`}
                </ThemedText>

                <View style={styles.timeline}>
                  {timeline.map(({ window, foodRecord }) => (
                    <View key={window.symptomRecordId} style={styles.timelineRow}>
                      <ThemedView type="brand" style={styles.timelineDot} />
                      <View style={styles.timelineTexts}>
                        <ThemedText type="label" themeColor="textPrimary">
                          {`${formatClock(foodRecord.eatenAt)} ${mealLabel(foodRecord.eatenAt)} · ${foodRecord.food.name}`}
                        </ThemedText>
                        <ThemedText type="caption" themeColor="textMuted">
                          {`${hoursAgo(foodRecord.eatenAt, window.symptomOccurredAt)}시간 전`}
                        </ThemedText>
                      </View>
                    </View>
                  ))}
                </View>

                {topPattern.coOccurringFactors.length > 0 ? (
                  <View style={styles.factorSection}>
                    <ThemedText type="caption" themeColor="textMuted">
                      그날 함께 있었던 것
                    </ThemedText>
                    <View style={styles.factorRow}>
                      {topPattern.coOccurringFactors.map((factor) => (
                        <Chip
                          key={factor.factor}
                          label={`${factor.label} · ${factor.occurrence.matched}번`}
                        />
                      ))}
                    </View>
                  </View>
                ) : null}
              </ThemedView>

              <ThemedView type="backgroundElement" style={styles.conclusionCard}>
                <ThemedText type="label" themeColor="textPrimary">
                  음식 때문인지는 아직 알 수 없어요
                </ThemedText>
                <ThemedText type="caption" themeColor="textMuted">
                  {'수면이 겹친 날이 많아서, 지금 단정하기는 일러요.\n정확히 알아보고 싶으시면 도와드릴게요.'}
                </ThemedText>
              </ThemedView>
            </>
          ) : (
            <ThemedView type="surfaceCard" style={styles.card}>
              <ThemedText type="bodyM" themeColor="textSecondary">
                아직 패턴을 보여드릴 만큼 기록이 쌓이지 않았어요. 기록이 조금 더 모이면 함께
                살펴볼게요.
              </ThemedText>
            </ThemedView>
          )}
        </View>

        <BottomButton
          label={topPattern ? `${topPattern.ingredientName}, 확인해볼래요` : '홈으로'}
          onPress={() => (topPattern ? router.push('/reintroduction') : router.replace('/(tabs)'))}
          secondary={
            topPattern
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
});
