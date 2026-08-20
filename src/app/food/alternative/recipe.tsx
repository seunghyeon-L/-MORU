import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { MORUButton } from '@/components/common/MORUButton';
import { CupIcon } from '@/components/common/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import * as api from '@/services/api';
import type { RecipeDetail } from '@/types/food';

/**
 * H2 대체 레시피.
 * GET /recipes/{recipe_id} 를 그대로 표시한다. recipe_id 는 H3의 recipes 목록 또는
 * G(나의 식탁) 저장한 추천(kind="recipe")에서만 받는다 — 다른 진입점은 없다.
 */
export default function AlternativeRecipeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { recipe_id } = useLocalSearchParams<{ recipe_id?: string }>();
  const recipeId = Number(recipe_id);
  const hasValidRecipeId = recipe_id !== undefined && Number.isFinite(recipeId);

  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (!hasValidRecipeId) return;
    api
      .getRecipe(recipeId)
      .then(setRecipe)
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[H2] GET /recipes/{recipe_id} failed:', err);
        setLoadError(true);
      });
  }, [hasValidRecipeId, recipeId]);

  const handleSave = async () => {
    if (!hasValidRecipeId || saving || saved) return;
    setSaveError(false);
    setSaving(true);
    try {
      await api.saveRecommendation({ kind: 'recipe', ref_id: recipeId });
      setSaved(true);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[H2] POST /saved failed:', err);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

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

            <View style={styles.illustrationWrap}>
              <ThemedView type="brandSoft" style={styles.illustration}>
                <CupIcon size={40} color={theme.brandText} />
              </ThemedView>
            </View>

            <ThemedView type="surfaceCard" style={styles.card}>
              <ThemedText type="label" themeColor="textPrimary">
                {`재료 (${recipe.servings})`}
              </ThemedText>
              <View style={styles.ingredientList}>
                {recipe.items.map((item) => (
                  <View key={item.name} style={styles.ingredientRow}>
                    <ThemedText type="bodyS" themeColor="textSecondary" style={styles.ingredientName}>
                      {`· ${item.name}`}
                    </ThemedText>
                    <ThemedText type="bodyS" themeColor="textMuted">
                      {item.optional ? `${item.amount} (선택)` : item.amount}
                    </ThemedText>
                  </View>
                ))}
              </View>

              {recipe.tip ? (
                <ThemedView type="onboardingBackground" style={styles.tipBox}>
                  <ThemedView type="brandLight" style={styles.tipBadge}>
                    <ThemedText type="caption" themeColor="brandText" style={styles.tipLabel}>
                      TIP
                    </ThemedText>
                  </ThemedView>
                  <ThemedText type="caption" themeColor="textMuted" style={styles.tipText}>
                    {recipe.tip}
                  </ThemedText>
                </ThemedView>
              ) : null}
            </ThemedView>

            {saveError ? (
              <ThemedText type="bodyS" themeColor="textSecondary" style={styles.errorText}>
                저장에 실패했어요. 잠시 후 다시 시도해주세요.
              </ThemedText>
            ) : null}
          </>
        ) : !hasValidRecipeId ? (
          <ThemedText type="bodyS" themeColor="textSecondary" style={styles.errorText}>
            불러올 레시피 정보가 없어요.
          </ThemedText>
        ) : loadError ? (
          <ThemedText type="bodyS" themeColor="textSecondary" style={styles.errorText}>
            레시피를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </ThemedText>
        ) : null}
      </ScrollView>

      <View style={[styles.ctaRow, { paddingBottom: insets.bottom + Spacing.three }]}>
        <View style={styles.ctaFlex}>
          <MORUButton
            label={saved ? '저장했어요' : '레시피 저장'}
            variant="secondary"
            disabled={!recipe || saving || saved}
            onPress={handleSave}
          />
        </View>
        <View style={styles.ctaFlexPrimary}>
          <MORUButton label="닫기" variant="primary" onPress={() => router.back()} />
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
  illustrationWrap: {
    alignItems: 'center',
    marginTop: Spacing.four,
  },
  illustration: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
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
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 12,
    padding: 12,
  },
  tipBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  tipLabel: {
    fontWeight: '700',
  },
  tipText: {
    flex: 1,
    lineHeight: 19,
  },
  errorText: {
    marginTop: Spacing.three,
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
  ctaFlexPrimary: {
    flex: 1.4,
  },
});
