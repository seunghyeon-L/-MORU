import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { MORUButton } from '@/components/common/MORUButton';
import { SproutIcon } from '@/components/common/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMoruData } from '@/hooks/useMoruData';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

const DAY_OPTIONS = [
  { id: 'mon', label: '월' },
  { id: 'tue', label: '화' },
  { id: 'wed', label: '수' },
  { id: 'thu', label: '목' },
  { id: 'fri', label: '금' },
  { id: 'sat', label: '토' },
  { id: 'sun', label: '일' },
] as const;

type DayId = (typeof DAY_OPTIONS)[number]['id'];

/** 일정이 있어 자동으로 제외되는 날. 연동된 일정 데이터가 없는 기본 상태에서는 모든 요일을 선택할 수 있다 */
const BUSY_DAY_IDS: readonly DayId[] = [];

type AttemptResult = 'uncomfortable' | 'okay' | null;

/** 첫 방문 시 화면 기준 — 1번째 시도는 이미 진행된 상태로 보여준다 */
const INITIAL_ATTEMPTS: AttemptResult[] = ['uncomfortable', null, null];

function attemptStatusLabel(result: AttemptResult, isCurrent: boolean): string {
  if (result === 'uncomfortable') return '불편함이 있었어요';
  if (result === 'okay') return '괜찮았어요';
  return isCurrent ? '이번 주' : '다음 주';
}

/** F3 표적 도전 · 진행. 이번 주 편한 날 하루를 골라 소량으로 시도해본다 */
export default function ReintroductionProgressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { analysis } = useMoruData();

  const [attempts, setAttempts] = useState<AttemptResult[]>(INITIAL_ATTEMPTS);
  const [selectedDays, setSelectedDays] = useState<DayId[]>(['sun']);

  const toggleDay = (id: DayId) => {
    setSelectedDays((prev) => (prev.includes(id) ? prev.filter((day) => day !== id) : [...prev, id]));
  };

  const topPattern = analysis?.hasEnoughData ? analysis.ingredientPatterns[0] : undefined;
  const ingredientName = topPattern?.ingredientName ?? '이 음식';

  const currentIndex = attempts.findIndex((result) => result === null);
  const completedCount = attempts.filter((result) => result !== null).length;

  const handleTryToday = () => {
    if (currentIndex === -1) return;

    if (currentIndex === attempts.length - 1) {
      router.push('/reintroduction/result');
      return;
    }

    setAttempts((prev) =>
      prev.map((result, index) => (index === currentIndex ? 'okay' : result)),
    );
  };

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
            <ThemedText type="smallBold">{`${ingredientName} 확인하기`}</ThemedText>
          </View>

          <View style={styles.progressTrack}>
            {attempts.map((_, index) => (
              <ThemedView
                key={index}
                type={index < completedCount ? 'brand' : 'backgroundElement'}
                style={styles.progressSegment}
              />
            ))}
          </View>

          <ThemedText type="caption" themeColor="textMuted">
            {`${(currentIndex === -1 ? attempts.length : currentIndex + 1)}번째 시도`}
          </ThemedText>

          <ThemedText type="h1" themeColor="textPrimary" style={styles.title}>
            {`이번 주 아무 날 하루,\n${ingredientName}를 평소만큼 드셔보세요`}
          </ThemedText>
          <ThemedText type="bodyS" themeColor="textSecondary">
            연속으로 하지 않아도 돼요. 편한 날 하루면 됩니다.
          </ThemedText>

          <ThemedView type="surfaceCard" style={[styles.card, { borderColor: theme.borderSubtle }]}>
            <ThemedText type="label" themeColor="textPrimary">
              이번 주 가능한 날
            </ThemedText>
            <View style={styles.dayRow}>
              {DAY_OPTIONS.map((option) => {
                const busy = BUSY_DAY_IDS.includes(option.id);
                const selected = selectedDays.includes(option.id);
                return (
                  <Pressable
                    key={option.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected, disabled: busy }}
                    disabled={busy}
                    onPress={() => toggleDay(option.id)}
                    style={({ pressed }) => [styles.dayPress, (pressed || busy) && styles.dimmed]}>
                    <ThemedView
                      type={selected ? 'brand' : busy ? 'backgroundElement' : 'brandSoft'}
                      style={styles.dayCircle}>
                      <ThemedText
                        type="label"
                        themeColor={selected ? 'textOnBrand' : busy ? 'textMuted' : 'brandText'}>
                        {option.label}
                      </ThemedText>
                    </ThemedView>
                  </Pressable>
                );
              })}
            </View>
            <ThemedText type="caption" themeColor="textMuted">
              일정이 있는 날은 뺐어요.
            </ThemedText>
          </ThemedView>

          <ThemedView type="surfaceCard" style={[styles.card, { borderColor: theme.borderSubtle }]}>
            {attempts.map((result, index) => (
              <View key={index} style={styles.historyRow}>
                <ThemedView
                  type={result !== null ? 'brand' : 'backgroundElement'}
                  style={styles.historyDot}
                />
                <View style={styles.historyTexts}>
                  <ThemedText type="caption" themeColor="textMuted">
                    {`${index + 1}번째`}
                  </ThemedText>
                  <ThemedText type="label" themeColor="textPrimary">
                    {attemptStatusLabel(result, index === currentIndex)}
                  </ThemedText>
                </View>
              </View>
            ))}
          </ThemedView>

          <ThemedView type="brandSoft" style={styles.noticeCard}>
            <SproutIcon size={20} color={theme.brandText} />
            <ThemedText type="caption" themeColor="textPrimary" style={styles.noticeText}>
              {'증상이 나더라도 장에 손상이 가지는 않아요.\n편하게 시도해보세요.'}
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
              label="다음에 할게요"
              variant="secondary"
              onPress={() => router.push('/reintroduction')}
            />
          </View>
          <View style={styles.footerButton}>
            <MORUButton label="오늘 했어요" onPress={handleTryToday} />
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
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  progressTrack: {
    flexDirection: 'row',
    gap: 4,
    marginTop: Spacing.one,
  },
  progressSegment: {
    flex: 1,
    height: 5,
    borderRadius: 2.5,
  },
  title: {
    fontSize: 22,
    lineHeight: 30,
    marginTop: Spacing.one,
  },
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayPress: {
    borderRadius: 18,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    marginTop: Spacing.one,
  },
  noticeText: {
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingTop: Spacing.three,
  },
  footerButton: {
    flex: 1,
  },
  dimmed: {
    opacity: 0.5,
  },
});
