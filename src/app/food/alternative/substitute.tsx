import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { BottomButton } from '@/components/common/BottomButton';
import { SelectionCard } from '@/components/common/SelectionCard';
import { AlternativeCard } from '@/components/food/AlternativeCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import * as api from '@/services/api';
import { mockSubstitutionTips } from '@/mock/foods';
import type { IngredientSubstitution } from '@/types/food';

/** H3 성분 대체 방법. 뒤로가기는 이전 화면(H4)으로 돌아간다. */
export default function AlternativeSubstituteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [substitutions, setSubstitutions] = useState<IngredientSubstitution[]>([]);

  useEffect(() => {
    api.getIngredientSubstitutions('food-green-tea-latte').then(setSubstitutions);
  }, []);

  return (
    <ThemedView type="onboardingBackground" style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <BackButton />
          <ThemedText type="label" themeColor="textPrimary">
            성분 대체 방법
          </ThemedText>
        </View>

        <ThemedText type="h1" themeColor="textPrimary" style={styles.title}>
          {'일반 녹차라떼의 성분을\n더 편안하게 바꿔볼 수 있어요.'}
        </ThemedText>

        <ThemedText type="label" themeColor="textPrimary" style={styles.sectionLabel}>
          바꿔볼 수 있는 성분
        </ThemedText>
        <View style={styles.list}>
          {substitutions.map((substitution) => (
            <SelectionCard
              key={substitution.id}
              title={substitution.original}
              description={`${substitution.substitute}${substitution.note ? `\n${substitution.note}` : ''}`}
              accessory={<View style={[styles.dot, { backgroundColor: theme.brand }]} />}
            />
          ))}
        </View>

        <ThemedText type="label" themeColor="textPrimary" style={styles.sectionLabel}>
          이렇게 먹어보세요
        </ThemedText>
        <View style={styles.list}>
          {mockSubstitutionTips.map((tip, i) => (
            <AlternativeCard
              key={tip.title}
              alternative={{ id: tip.title, kind: 'method', title: tip.title, description: tip.description }}
              index={i + 1}
            />
          ))}
        </View>
      </ScrollView>

      <BottomButton label="이 조합으로 기록하기" onPress={() => router.push('/food/complete')} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  title: {
    fontSize: 20,
    lineHeight: 27,
    marginTop: Spacing.three,
  },
  sectionLabel: {
    marginTop: 28,
    marginBottom: 10,
  },
  list: {
    gap: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
