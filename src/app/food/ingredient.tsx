import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { MORUButton } from '@/components/common/MORUButton';
import { SearchIcon } from '@/components/common/icons';
import { AlternativeCard } from '@/components/food/AlternativeCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMoruData } from '@/hooks/useMoruData';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import * as api from '@/services/api';
import type { Alternative } from '@/types/food';

/**
 * D3 음식 확인 · 참고 정보와 대체안.
 * 최근 기록 기반 관찰(원인 단정 없음) + 지금 바로 시도해볼 수 있는 대안을 보여준다.
 * D4(기록 완료) 화면은 아직 없어 CTA는 임시로 홈으로 돌아간다.
 */
export default function FoodIngredientScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { analysis } = useMoruData();

  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    api.getAlternatives('food-kimchi-jjigae').then(setAlternatives);
  }, []);

  const topPattern = analysis?.hasEnoughData ? analysis.ingredientPatterns[0] : undefined;
  const sleepFactor = topPattern?.coOccurringFactors.find((f) => f.factor === 'poor-sleep');

  const finish = () => router.replace('/(tabs)');

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <ThemedView
        type="onboardingBackground"
        style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing.four }]}>
        <View style={styles.headerRow}>
          <BackButton />
          <ThemedText type="label" themeColor="textPrimary">
            김치찌개
          </ThemedText>
        </View>

        <ThemedView type="surfaceCard" style={styles.hintBar}>
          <SearchIcon size={18} color={theme.textMuted} />
          <ThemedText type="bodyS" themeColor="textSecondary" style={styles.hintText}>
            국물에 양파즙이 들어있을 수 있어요
          </ThemedText>
        </ThemedView>

        {topPattern ? (
          <ThemedView type="surfaceCard" style={styles.patternCard}>
            <ThemedText type="caption" themeColor="textMuted">
              최근 기록을 보면
            </ThemedText>
            <ThemedText type="label" themeColor="textPrimary" style={styles.patternHeadline}>
              {`${topPattern.ingredientName}가 들어간 식사 ${topPattern.discomfort.total}번 중 ${topPattern.discomfort.matched}번,\n몇 시간 뒤 불편함이 기록됐어요.`}
            </ThemedText>

            {sleepFactor ? (
              <ThemedView type="onboardingBackground" style={styles.caveatBox}>
                <ThemedText type="caption" themeColor="textMuted">
                  {`다만 그중 ${sleepFactor.occurrence.matched}번은 수면이 5시간 이하였어요.\n음식 때문이라고 단정하기는 일러요.`}
                </ThemedText>
              </ThemedView>
            ) : null}
          </ThemedView>
        ) : null}

        <ThemedText type="label" themeColor="textPrimary" style={styles.sectionLabel}>
          이렇게 하면 드실 수 있어요
        </ThemedText>

        <View style={styles.alternativeList}>
          {alternatives.map((alternative, i) => (
            <AlternativeCard
              key={alternative.id}
              alternative={alternative}
              index={i + 1}
              selected={selectedId === alternative.id}
              onPress={() => setSelectedId(alternative.id)}
            />
          ))}
        </View>

        <View style={styles.flex} />

        <View style={styles.ctaRow}>
          <View style={styles.ctaPressable}>
            <MORUButton label="그냥 먹을래요" variant="secondary" onPress={finish} />
          </View>
          <View style={styles.ctaPressable}>
            <MORUButton label="기록하기" variant="primary" onPress={finish} />
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
