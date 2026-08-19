import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { MORUButton } from '@/components/common/MORUButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import * as api from '@/services/api';
import type { Recipe } from '@/types/food';

/** H2 대체 레시피. 뒤로가기는 이전 화면(H4)으로 돌아간다. */
export default function AlternativeRecipeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    api.getRecipe('recipe-green-tea-latte').then(setRecipe);
  }, []);

  return (
    <ThemedView type="onboardingBackground" style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <BackButton />
          <ThemedText type="label" themeColor="textPrimary">
            대체 레시피
          </ThemedText>
        </View>

        {recipe ? (
          <>
            <ThemedText type="h1" themeColor="textPrimary" style={styles.title}>
              {recipe.title}
            </ThemedText>

            <ThemedView type="brandSoft" style={styles.illustration} />

            <ThemedView type="surfaceCard" style={styles.card}>
              <ThemedText type="label" themeColor="textPrimary">
                재료 (1인분 기준)
              </ThemedText>
              <View style={styles.ingredientList}>
                {recipe.ingredients.map((ingredient) => (
                  <View key={ingredient.name} style={styles.ingredientRow}>
                    <ThemedText type="bodyS" themeColor="textSecondary" style={styles.ingredientName}>
                      {`· ${ingredient.name}`}
                    </ThemedText>
                    <ThemedText type="bodyS" themeColor="textMuted">
                      {ingredient.amount}
                    </ThemedText>
                  </View>
                ))}
              </View>

              {recipe.tip ? (
                <ThemedView type="onboardingBackground" style={styles.tipBox}>
                  <ThemedText type="caption" themeColor="brandText" style={styles.tipLabel}>
                    TIP
                  </ThemedText>
                  <ThemedText type="caption" themeColor="textMuted" style={styles.tipText}>
                    {recipe.tip}
                  </ThemedText>
                </ThemedView>
              ) : null}
            </ThemedView>
          </>
        ) : null}
      </ScrollView>

      <View style={[styles.ctaRow, { paddingBottom: insets.bottom + Spacing.three }]}>
        <View style={styles.ctaFlex}>
          <MORUButton label="레시피 저장" variant="secondary" onPress={() => {}} />
        </View>
        <View style={styles.ctaFlex}>
          <MORUButton
            label="재료 대체 방법 보기"
            variant="primary"
            onPress={() => router.push('/food/alternative/substitute')}
          />
        </View>
      </View>
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
  illustration: {
    height: 160,
    borderRadius: 80,
    marginTop: Spacing.four,
    marginHorizontal: Spacing.six,
  },
  card: {
    borderRadius: 16,
    padding: 18,
    marginTop: Spacing.four,
    gap: 12,
  },
  ingredientList: {
    gap: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ingredientName: {
    flex: 1,
  },
  tipBox: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: 12,
    padding: 12,
  },
  tipLabel: {
    fontWeight: '700',
  },
  tipText: {
    flex: 1,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  ctaFlex: {
    flex: 1,
  },
});
