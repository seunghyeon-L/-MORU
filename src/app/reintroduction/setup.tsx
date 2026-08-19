import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { BottomButton } from '@/components/common/BottomButton';
import { Chip } from '@/components/common/Chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMoruData } from '@/hooks/useMoruData';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { mockFoodItems } from '@/mock/foods';

const PREP_DAY_OPTIONS = [
  { days: 3, label: '가볍게' },
  { days: 5, label: '권장' },
  { days: 7, label: '확실하게' },
] as const;

function formatEndDate(days: number): string {
  const end = new Date();
  end.setDate(end.getDate() + days);
  return `${end.getMonth() + 1}월 ${end.getDate()}일에 끝나요`;
}

/** F2 도전 · 제한 설정. 재도입할 음식을 며칠간 빼둘지 준비 기간만 정한다 */
export default function ReintroductionSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { analysis } = useMoruData();
  const [days, setDays] = useState<number>();

  const topPattern = analysis?.hasEnoughData ? analysis.ingredientPatterns[0] : undefined;
  const ingredientName = topPattern?.ingredientName ?? '이 음식';

  const relatedFoods = topPattern
    ? mockFoodItems
        .filter((item) => item.ingredients.some((ingredient) => ingredient.id === topPattern.ingredientId))
        .map((item) => item.name)
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
            <ThemedText type="smallBold">{`${ingredientName} 확인하기`}</ThemedText>
          </View>

          <ThemedText type="h1" themeColor="textPrimary" style={styles.title}>
            {`며칠간 ${ingredientName}만\n빼둘게요`}
          </ThemedText>
          <ThemedText type="bodyS" themeColor="textSecondary">
            {`다른 음식은 평소대로 드셔도 돼요.\n${ingredientName} 하나만 잠깐 비워두는 거예요.`}
          </ThemedText>

          <View style={styles.section}>
            <ThemedText type="label" themeColor="textPrimary">
              얼마나 빼둘까요?
            </ThemedText>
            <View style={styles.dayRow}>
              {PREP_DAY_OPTIONS.map((option) => {
                const selected = days === option.days;
                return (
                  <Pressable
                    key={option.days}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setDays(option.days)}
                    style={({ pressed }) => [styles.dayItem, pressed && styles.pressed]}>
                    <ThemedView
                      type={selected ? 'brand' : 'surfaceCard'}
                      style={[
                        styles.dayCard,
                        { borderColor: selected ? theme.brand : theme.borderSubtle },
                      ]}>
                      <ThemedText
                        type="label"
                        themeColor={selected ? 'textOnBrand' : 'textPrimary'}
                        style={styles.dayNumber}>
                        {`${option.days}일`}
                      </ThemedText>
                      <ThemedText
                        type="caption"
                        themeColor={selected ? 'textOnBrand' : 'textMuted'}>
                        {option.label}
                      </ThemedText>
                    </ThemedView>
                  </Pressable>
                );
              })}
            </View>

            {days ? (
              <ThemedView type="surfaceCard" style={[styles.endDateRow, { borderColor: theme.borderSubtle }]}>
                <ThemedText type="label" themeColor="textPrimary">
                  {formatEndDate(days)}
                </ThemedText>
                <ThemedView type="brandSoft" style={styles.badge}>
                  <ThemedText type="caption" themeColor="brandText">
                    {`D-${days}`}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            ) : null}
          </View>

          {relatedFoods.length > 0 ? (
            <View style={styles.section}>
              <ThemedText type="label" themeColor="textPrimary">
                {`이런 음식에 ${ingredientName}이 들어있어요`}
              </ThemedText>
              <View style={styles.chipWrap}>
                {relatedFoods.map((name) => (
                  <Chip key={name} label={name} />
                ))}
              </View>
            </View>
          ) : null}
        </View>

        <BottomButton
          label="이렇게 시작할게요"
          disabled={!days}
          onPress={() => router.push('/reintroduction/progress')}
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
  section: {
    gap: Spacing.two,
  },
  dayRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  dayItem: {
    flex: 1,
  },
  dayCard: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  dayNumber: {
    fontSize: 17,
  },
  endDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});
