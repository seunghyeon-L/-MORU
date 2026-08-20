import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { BottomButton } from '@/components/common/BottomButton';
import { Chip } from '@/components/common/Chip';
import { AlternativeCard } from '@/components/food/AlternativeCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import * as api from '@/services/api';
import type { FoodAlternativesResponse } from '@/types/food';

/**
 * H4 음식 기반 대체안.
 * GET /foods/{food_id}/alternatives 를 그대로 표시한다. food_id 는 D2/H1 에서 전달받은 값만 쓴다.
 * substitute 옵션은 ingredient_ids 가 빈 배열이면 화면에 표시하지 않는다.
 */
export default function FoodAlternativeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { food_id } = useLocalSearchParams<{ food_id?: string }>();
  const foodId = Number(food_id);
  const hasValidFoodId = food_id !== undefined && Number.isFinite(foodId);

  const [data, setData] = useState<FoodAlternativesResponse | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!hasValidFoodId) return;
    api
      .getFoodAlternatives(foodId)
      .then(setData)
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[H4] GET /foods/{food_id}/alternatives failed:', err);
        setLoadError(true);
      });
  }, [hasValidFoodId, foodId]);

  const options = (data?.options ?? []).filter(
    (option) => option.kind !== 'substitute' || option.ingredient_ids.length > 0,
  );

  return (
    <ThemedView type="onboardingBackground" style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <BackButton />
          <ThemedText type="label" themeColor="textPrimary">
            음식 확인 결과
          </ThemedText>
        </View>

        {data ? (
          <>
            <ThemedView type="brandSoft" style={styles.foodCircle} />
            <ThemedText type="h1" themeColor="textPrimary" style={styles.foodName}>
              {data.food_name}
            </ThemedText>

            <ThemedText type="label" themeColor="textPrimary" style={styles.sectionLabel}>
              확인된 재료
            </ThemedText>
            <View style={styles.chipWrap}>
              {data.ingredients.map((ingredient) => (
                <Chip key={ingredient} label={ingredient} />
              ))}
            </View>

            {options.length > 0 ? (
              <>
                <ThemedText type="label" themeColor="textPrimary" style={styles.sectionLabel}>
                  이 음식, 어떻게 먹어볼까요?
                </ThemedText>
                <View style={styles.optionList}>
                  {options.map((option, i) => (
                    <AlternativeCard
                      key={`${option.kind}-${option.title}`}
                      alternative={{
                        id: option.title,
                        kind: 'method',
                        title: option.title,
                        description: option.detail,
                      }}
                      index={i + 1}
                      onPress={
                        option.kind === 'substitute'
                          ? () =>
                              router.push({
                                pathname: '/food/alternative/substitute',
                                params: { ingredient_ids: option.ingredient_ids.join(',') },
                              })
                          : option.kind === 'menu'
                            ? () =>
                                router.push({
                                  pathname: '/food/alternative/menu',
                                  params: { food_id: String(option.food_id) },
                                })
                            : undefined
                      }
                    />
                  ))}
                </View>
              </>
            ) : null}
          </>
        ) : !hasValidFoodId ? (
          <ThemedText type="bodyS" themeColor="textSecondary" style={styles.errorText}>
            불러올 음식 정보가 없어요.
          </ThemedText>
        ) : loadError ? (
          <ThemedText type="bodyS" themeColor="textSecondary" style={styles.errorText}>
            대체안을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </ThemedText>
        ) : null}
      </ScrollView>

      <BottomButton label="기록하기" onPress={() => router.push('/food/complete')} />
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
  foodCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: 'center',
    marginTop: Spacing.four,
  },
  foodName: {
    fontSize: 20,
    lineHeight: 27,
    textAlign: 'center',
    marginTop: Spacing.two,
  },
  sectionLabel: {
    marginTop: 28,
    marginBottom: 10,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionList: {
    gap: 10,
  },
  errorText: {
    marginTop: Spacing.three,
  },
});
