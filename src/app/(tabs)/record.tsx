import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CameraIcon, ChevronRightIcon, PulseIcon, SmilePlusIcon } from '@/components/common/icons';
import { FoodInputSheet } from '@/components/food/FoodInputSheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMoruData } from '@/hooks/useMoruData';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { PORTION_OPTIONS } from '@/types/food';
import { OVERALL_STATE_OPTIONS, SYMPTOM_TYPE_OPTIONS, type Severity } from '@/types/symptom';

/** severity 1~9 → "조금/보통/많이" 3단계 표현 (E0 화면과 동일한 문구 사용) */
function severityLabel(severity: Severity): string {
  if (severity <= 3) return '조금';
  if (severity <= 6) return '보통';
  return '많이';
}

function formatDay(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(date)) / 86400000);
  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

type RecentItem = {
  id: string;
  time: number;
  day: string;
  clock: string;
  title: string;
  badge: string;
};

/**
 * 기록 메인 (Figma "기록 메인 v2").
 * 빠른 기록 진입, 오늘의 상태, 최근 기록을 한 화면에서 보여준다.
 */
export default function RecordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { foodRecords, symptomRecords } = useMoruData();
  const [foodSheetVisible, setFoodSheetVisible] = useState(false);

  const recentFoodItems: RecentItem[] = foodRecords.map((record) => ({
    id: record.id,
    time: new Date(record.eatenAt).getTime(),
    day: formatDay(record.eatenAt),
    clock: formatTime(record.eatenAt),
    title: `${record.food.name} · ${PORTION_OPTIONS.find((o) => o.id === record.portion)?.label ?? ''}`,
    badge: '음식',
  }));

  const recentSymptomItems: RecentItem[] = symptomRecords.map((record) => {
    const title = record.detail
      ? `${SYMPTOM_TYPE_OPTIONS.find((o) => o.id === record.detail!.symptoms[0])?.label ?? '증상'} · ${severityLabel(record.detail.severity)}`
      : (OVERALL_STATE_OPTIONS.find((o) => o.id === record.state)?.label ?? '기록');
    return {
      id: record.id,
      time: new Date(record.recordedAt).getTime(),
      day: formatDay(record.recordedAt),
      clock: formatTime(record.recordedAt),
      title,
      badge: '증상',
    };
  });

  const recentItems = [...recentFoodItems, ...recentSymptomItems]
    .sort((a, b) => b.time - a.time)
    .slice(0, 2);

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <ThemedView
        type="onboardingBackground"
        style={[
          styles.container,
          { paddingTop: insets.top + Spacing.three, paddingBottom: insets.bottom + Spacing.six },
        ]}>
        <ThemedText type="h1" themeColor="textPrimary" style={styles.title}>
          기록
        </ThemedText>
        <ThemedText type="bodyS" themeColor="textSecondary" style={styles.subtitle}>
          오늘 먹은 것과 몸의 반응을 남겨보세요.
        </ThemedText>

        <ThemedText type="label" themeColor="textPrimary" style={styles.sectionLabel}>
          빠르게 기록하기
        </ThemedText>

        <View style={styles.quickRow}>
          {/* 음식 기록 → D1 입력 방식 선택 바텀시트를 연다 */}
          <Pressable style={styles.quickCardPressable} onPress={() => setFoodSheetVisible(true)}>
            <ThemedView type="surfaceCard" style={styles.quickCard}>
              <ThemedView type="brandLight" style={styles.quickIcon}>
                <CameraIcon size={20} color={theme.brandText} />
              </ThemedView>
              <ThemedText type="label" themeColor="textPrimary" style={styles.quickTitle}>
                음식 기록
              </ThemedText>
              <ThemedText type="caption" themeColor="textMuted">
                사진이나 메뉴로 간단하게 남겨요
              </ThemedText>
            </ThemedView>
          </Pressable>

          <Pressable style={styles.quickCardPressable} onPress={() => router.push('/symptom')}>
            <ThemedView type="surfaceCard" style={styles.quickCard}>
              <ThemedView type="coralLight" style={styles.quickIcon}>
                <PulseIcon size={20} color={theme.coral} />
              </ThemedView>
              <ThemedText type="label" themeColor="textPrimary" style={styles.quickTitle}>
                증상 기록
              </ThemedText>
              <ThemedText type="caption" themeColor="textMuted">
                불편했던 순간과 상황을 함께 남겨요
              </ThemedText>
            </ThemedView>
          </Pressable>
        </View>

        <Pressable onPress={() => router.push('/food/chat')}>
          <ThemedView type="brandLighter" style={styles.aiCard}>
            <ThemedView type="brand" style={styles.aiBadge}>
              <ThemedText type="label" themeColor="textOnBrand">
                AI
              </ThemedText>
            </ThemedView>
            <View style={styles.aiTexts}>
              <ThemedText type="label" themeColor="textPrimary">
                AI에게 물어보기
              </ThemedText>
              <ThemedText type="caption" themeColor="textMuted">
                먹기 전 고민되거나 기록이 궁금할 때 물어보세요.
              </ThemedText>
            </View>
            <ChevronRightIcon size={18} color={theme.textMuted} />
          </ThemedView>
        </Pressable>

        <ThemedText type="label" themeColor="textPrimary" style={styles.sectionLabel}>
          오늘의 상태
        </ThemedText>

        <ThemedView type="surfaceCard" style={styles.statusCard}>
          <View style={styles.statusTexts}>
            <ThemedText type="bodyS" themeColor="textPrimary">
              오늘은 아직 상태를 기록하지 않았어요.
            </ThemedText>
            <Pressable onPress={() => router.push('/symptom')}>
              <ThemedText type="label" themeColor="brandText">
                지금 상태 남기기
              </ThemedText>
            </Pressable>
          </View>
          <Pressable onPress={() => router.push('/symptom')}>
            <ThemedView type="brandSoft" style={styles.statusIcon}>
              <SmilePlusIcon size={26} color={theme.brand} />
            </ThemedView>
          </Pressable>
        </ThemedView>

        <View style={styles.recentHeaderRow}>
          <ThemedText type="label" themeColor="textPrimary">
            최근 기록
          </ThemedText>
          <Pressable onPress={() => router.push('/analysis')}>
            <ThemedText type="caption" themeColor="textMuted">
              전체 보기
            </ThemedText>
          </Pressable>
        </View>

        {recentItems.length > 0 ? (
          <ThemedView type="surfaceCard" style={styles.recentCard}>
            {recentItems.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.recentRow,
                  index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.borderSubtle },
                ]}>
                <ThemedText type="caption" themeColor="textMuted" style={styles.recentTime}>
                  {`${item.day} ${item.clock}`}
                </ThemedText>
                <ThemedText type="label" themeColor="textPrimary" style={styles.recentTitle}>
                  {item.title}
                </ThemedText>
                <ThemedText type="caption" themeColor="textMuted">
                  {item.badge}
                </ThemedText>
              </View>
            ))}
          </ThemedView>
        ) : null}
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
  title: {
    fontSize: 26,
    lineHeight: 34,
  },
  subtitle: {
    marginTop: 6,
  },
  sectionLabel: {
    marginTop: 28,
    marginBottom: 10,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickCardPressable: {
    flex: 1,
  },
  quickCard: {
    borderRadius: 16,
    padding: 16,
    gap: 10,
    shadowColor: '#3B332B',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 1,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTitle: {
    marginTop: 2,
  },
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  aiBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTexts: {
    flex: 1,
    gap: 3,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#3B332B',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 1,
  },
  statusTexts: {
    flex: 1,
    gap: 8,
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 10,
  },
  recentCard: {
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: '#3B332B',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 1,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  recentTime: {
    width: 68,
  },
  recentTitle: {
    flex: 1,
  },
});
