import { useLocalSearchParams, useRouter } from 'expo-router';
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
import type { SubstitutionsResponse } from '@/types/food';

/**
 * H3 성분 대체 방법.
 * H4 에서 전달받은 ingredient_ids 로 GET /substitutions 를 그대로 표시한다.
 * recipes 는 서버가 준 목록만 보여주고, 선택하면 recipe_id 를 그대로 H2로 전달한다.
 */
export default function AlternativeSubstituteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { ingredient_ids } = useLocalSearchParams<{ ingredient_ids?: string }>();

  const [data, setData] = useState<SubstitutionsResponse | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!ingredient_ids) return;
    const ids = ingredient_ids
      .split(',')
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id));
    if (ids.length === 0) return;

    api
      .getSubstitutions(ids)
      .then(setData)
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[H3] GET /substitutions failed:', err);
        setLoadError(true);
      });
  }, [ingredient_ids]);

  return (
    <ThemedView type="onboardingBackground" style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <BackButton />
          <ThemedText type="label" themeColor="textPrimary">
            성분 대체 방법
          </ThemedText>
        </View>

        {data ? (
          <>
            <ThemedText type="h1" themeColor="textPrimary" style={styles.title}>
              {data.intro}
            </ThemedText>

            {data.groups.length > 0 ? (
              <>
                <ThemedText type="label" themeColor="textPrimary" style={styles.sectionLabel}>
                  바꿔볼 수 있는 성분
                </ThemedText>
                <View style={styles.list}>
                  {data.groups.map((group) => (
                    <ThemedView
                      key={group.ingredient}
                      type="surfaceCard"
                      style={[styles.substitutionCard, { borderColor: theme.borderSubtle }]}>
                      <ThemedView type="brandSoft" style={styles.substitutionIcon}>
                        <View style={[styles.dot, { backgroundColor: theme.brand }]} />
                      </ThemedView>
                      <View style={styles.substitutionTexts}>
                        <ThemedText type="label" themeColor="textMuted">
                          {group.ingredient}
                        </ThemedText>
                        <ThemedText type="label" themeColor="brandText">
                          {group.replacement}
                        </ThemedText>
                        {group.alt ? (
                          <ThemedText type="caption" themeColor="textMuted">
                            {group.alt}
                          </ThemedText>
                        ) : null}
                      </View>
                    </ThemedView>
                  ))}
                </View>
              </>
            ) : null}

            {data.tips.length > 0 ? (
              <>
                <ThemedText type="label" themeColor="textPrimary" style={styles.sectionLabel}>
                  이렇게 먹어보세요
                </ThemedText>
                <View style={styles.list}>
                  {data.tips.map((tip) => (
                    <AlternativeCard
                      key={tip.seq}
                      alternative={{
                        id: String(tip.seq),
                        kind: 'method',
                        title: tip.title,
                        description: tip.detail,
                      }}
                      index={tip.seq}
                    />
                  ))}
                </View>
              </>
            ) : null}

            {data.recipes.length > 0 ? (
              <>
                <ThemedText type="label" themeColor="textPrimary" style={styles.sectionLabel}>
                  추천 레시피
                </ThemedText>
                <View style={styles.list}>
                  {data.recipes.map((recipe) => (
                    <SelectionCard
                      key={recipe.recipe_id}
                      title={recipe.title}
                      onPress={() =>
                        router.push({
                          pathname: '/food/alternative/recipe',
                          params: { recipe_id: String(recipe.recipe_id) },
                        })
                      }
                    />
                  ))}
                </View>
              </>
            ) : null}
          </>
        ) : loadError ? (
          <ThemedText type="bodyS" themeColor="textSecondary" style={styles.errorText}>
            성분 대체 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </ThemedText>
        ) : null}
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
  substitutionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 15,
    borderWidth: 1,
  },
  substitutionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  substitutionTexts: {
    flex: 1,
    gap: 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  errorText: {
    marginTop: Spacing.three,
  },
});
