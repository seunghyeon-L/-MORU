import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { BottomButton } from '@/components/common/BottomButton';
import { IngredientChip } from '@/components/food/IngredientChip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useMoruData } from '@/hooks/useMoruData';
import { Spacing } from '@/constants/theme';
import * as api from '@/services/api';
import {
  PORTION_OPTIONS,
  type FoodInputMethod,
  type Ingredient,
  type MealApiMethod,
  type MealApiPortion,
  type MealIdentifyResponse,
  type Portion,
} from '@/types/food';

/** Figma D2 실제 문구 — 공용 PORTION_OPTIONS 라벨과 달라 이 화면에서만 로컬로 매핑한다 */
const PORTION_LABELS: Record<Portion, string> = {
  small: '반',
  normal: '한 그릇',
  large: '한 그릇 반 이상',
};

/** portion 값은 API 경계(이 화면)에서만 서버 enum으로 변환한다 */
const PORTION_API_MAP: Record<Portion, MealApiPortion> = {
  small: 'half',
  normal: 'one',
  large: 'one_and_half_plus',
};

/** POST /meals 의 portion 은 필수값이다 — 사용자가 직접 고르지 않았을 때만 이 값으로 채운다 */
const DEFAULT_PORTION: Portion = 'normal';

/** 서버 전송용 method('text') → 로컬 FoodRecord.inputMethod('manual') 매핑 */
const METHOD_TO_INPUT_METHOD: Record<MealApiMethod, FoodInputMethod> = {
  photo: 'photo',
  search: 'search',
  text: 'manual',
};

/**
 * D2 음식 확인 · 재료 확인.
 * 사진(POST /meals/identify-photo)/텍스트(POST /meals/identify)로 추정된 음식의 재료를
 * 사용자가 직접 확인·수정하고, 섭취량·국물 여부와 함께 확인 버튼에서 POST /meals 로 확정한다.
 *
 * method(서버 enum: photo|text|search) 는 진입 경로 그대로 매핑한다.
 * D1 "메뉴 검색"은 food/chat.tsx 가 mode=search 를 그대로 넘겨 "search"로,
 * "직접 입력"은 mode=manual 을 자유 텍스트 입력으로 보고 "text"로 매핑한다.
 */
export default function FoodResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { refreshRecords } = useMoruData();
  // photoUri: 카메라(D1)에서 촬영한 사진, foodName/mode: H1(메뉴 검색/직접 입력)에서 전달
  // food_id: H1 suggestion(screen="D2")에서 이미 확인된 food_id 를 전달받았을 때만 온다
  const { photoUri, foodName, mode, food_id } = useLocalSearchParams<{
    photoUri?: string;
    foodName?: string;
    mode?: string;
    food_id?: string;
  }>();

  const [identify, setIdentify] = useState<MealIdentifyResponse | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [customIngredients, setCustomIngredients] = useState<Ingredient[]>([]);
  const [addingCustom, setAddingCustom] = useState(false);
  const [customText, setCustomText] = useState('');
  /** 화면엔 기본 선택 없이 두고, 확정 시 값이 없으면 DEFAULT_PORTION 으로만 채운다(아래 handleConfirm 참고) */
  const [portion, setPortion] = useState<Portion | undefined>();
  const [hasSoup, setHasSoup] = useState<boolean | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const method: MealApiMethod | undefined = photoUri
    ? 'photo'
    : mode === 'search'
      ? 'search'
      : mode === 'manual'
        ? 'text'
        : undefined;

  useEffect(() => {
    const load = foodName
      ? api.identifyMealFromText(foodName)
      : api.identifyMealFromPhoto(photoUri ?? '');

    load
      .then((result) => {
        setIdentify(result);
        // 서버가 미리 선택해준 checked 를 그대로 초기 선택 상태로 쓴다
        setSelectedIds(result.ingredients.filter((i) => i.checked).map((i) => String(i.id)));
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[D2] 재료 식별 실패:', err);
        setLoadError(true);
      });
  }, [foodName, photoUri]);

  const toggleIngredient = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const addCustomIngredient = () => {
    const name = customText.trim();
    if (!name) return;
    const id = `custom-${Date.now()}`;
    setCustomIngredients((prev) => [...prev, { id, name }]);
    setSelectedIds((prev) => [...prev, id]);
    setCustomText('');
    setAddingCustom(false);
  };

  const serverIngredientIds = new Set(identify?.ingredients.map((i) => String(i.id)) ?? []);
  const allIngredients: Ingredient[] = identify
    ? [...identify.ingredients.map((i) => ({ id: String(i.id), name: i.name })), ...customIngredients]
    : [];

  /** H1 suggestion 이 준 food_id 가 있으면 그걸 그대로 쓰고, 없으면 identify 응답의 food_id 를 쓴다 */
  const resolvedFoodId = food_id ? Number(food_id) : identify?.food_id;

  const handleConfirm = async () => {
    if (!identify || !method || submitting) return;

    setSubmitError(false);
    setSubmitting(true);
    try {
      const eatenAt = new Date().toISOString();
      const ingredientIds = selectedIds
        .filter((id) => serverIngredientIds.has(id))
        .map((id) => Number(id));
      const customNames = selectedIds
        .filter((id) => !serverIngredientIds.has(id))
        .map((id) => customIngredients.find((c) => c.id === id)?.name)
        .filter((name): name is string => Boolean(name));

      const result = await api.createMeal({
        food_id: resolvedFoodId ?? null,
        food_name: identify.food_name,
        eaten_at: eatenAt,
        portion: PORTION_API_MAP[portion ?? DEFAULT_PORTION],
        ate_broth: hasSoup ?? null,
        method,
        ingredient_ids: ingredientIds,
        custom_ingredients: customNames,
      });

      const selectedIngredients = selectedIds
        .map((id) => allIngredients.find((ingredient) => ingredient.id === id))
        .filter((ingredient): ingredient is Ingredient => Boolean(ingredient));

      void refreshRecords();   // 저장이 끝났으니 목록을 다시 받아온다

      const ingredientNames = selectedIngredients.map((ingredient) => ingredient.name).join(',');

      const forwardParams = {
        meal_id: String(result.meal_id),
        food_id: resolvedFoodId ? String(resolvedFoodId) : undefined,
        food_name: identify.food_name,
        eaten_at: eatenAt,
        portion: portion ?? DEFAULT_PORTION,
        ingredients: ingredientNames,
      };

      if (result.has_insight) {
        router.push({ pathname: '/food/ingredient', params: forwardParams });
      } else {
        router.push({ pathname: '/food/complete', params: forwardParams });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[D2] POST /meals failed:', err);
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView type="onboardingBackground" style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <BackButton />
          <ThemedText type="label" themeColor="textPrimary">
            음식 확인
          </ThemedText>
        </View>

        {photoUri ? (
          <ThemedView type="surfaceCard" style={styles.photoCard}>
            <Image source={{ uri: photoUri }} style={styles.photoImage} contentFit="cover" />
          </ThemedView>
        ) : null}

        {!identify && !loadError ? (
          // 사진 식별은 3~5초가 걸린다. 그동안 사진만 덩그러니 있고
          // 아무 표시가 없어서 멈춘 것처럼 보였다.
          <View style={styles.identifying}>
            <ActivityIndicator size="small" color={theme.brand} />
            <ThemedText type="bodyS" themeColor="textSecondary">
              {method === 'photo' ? '사진 속 음식을 확인하고 있어요' : '재료를 확인하고 있어요'}
            </ThemedText>
          </View>
        ) : null}

        {identify ? (
          <>
            <ThemedText type="h1" themeColor="textPrimary" style={styles.foodName}>
              {identify.food_name}
            </ThemedText>
            <ThemedText type="bodyS" themeColor="textSecondary" style={styles.sectionHint}>
              맞는 재료만 남겨주세요
            </ThemedText>

            <View style={styles.chipWrap}>
              {allIngredients.map((ingredient) => (
                <IngredientChip
                  key={ingredient.id}
                  ingredient={ingredient}
                  selected={selectedIds.includes(ingredient.id)}
                  onPress={() => toggleIngredient(ingredient.id)}
                />
              ))}

              {addingCustom ? (
                <TextInput
                  autoFocus
                  value={customText}
                  onChangeText={setCustomText}
                  onSubmitEditing={addCustomIngredient}
                  onBlur={addCustomIngredient}
                  placeholder="재료 이름"
                  placeholderTextColor={theme.textMuted}
                  style={[styles.customInput, { borderColor: theme.borderSubtle, color: theme.textPrimary }]}
                />
              ) : (
                <Pressable onPress={() => setAddingCustom(true)}>
                  <ThemedView type="onboardingBackground" style={[styles.chipBase, styles.addChip, { borderColor: theme.borderSubtle }]}>
                    <ThemedText type="label" themeColor="textMuted">
                      + 직접 추가
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              )}
            </View>

            <ThemedText type="label" themeColor="textPrimary" style={styles.sectionLabel}>
              얼마나 드셨나요?
            </ThemedText>
            <View style={styles.portionRow}>
              {PORTION_OPTIONS.map((option) => {
                const active = portion === option.id;
                return (
                  <Pressable
                    key={option.id}
                    style={styles.portionPressable}
                    onPress={() => setPortion((prev) => (prev === option.id ? undefined : option.id))}>
                    <ThemedView
                      type={active ? 'brand' : 'surfaceCard'}
                      style={[styles.portionOption, { borderColor: active ? theme.brand : theme.borderSubtle }]}>
                      <ThemedText type="label" themeColor={active ? 'textOnBrand' : 'textPrimary'}>
                        {PORTION_LABELS[option.id]}
                      </ThemedText>
                    </ThemedView>
                  </Pressable>
                );
              })}
            </View>

            {identify.has_broth ? (
              <ThemedView type="surfaceCard" style={styles.soupCard}>
                <ThemedText type="label" themeColor="textPrimary">
                  국물도 드셨나요?
                </ThemedText>
                <View style={styles.soupOptions}>
                  {[
                    { id: true, label: '네' },
                    { id: false, label: '아니요' },
                  ].map((option) => {
                    const active = hasSoup === option.id;
                    return (
                      <Pressable
                        key={String(option.id)}
                        onPress={() => setHasSoup((prev) => (prev === option.id ? undefined : option.id))}>
                        <ThemedView
                          type={active ? 'brand' : 'onboardingBackground'}
                          style={styles.soupOption}>
                          <ThemedText type="label" themeColor={active ? 'textOnBrand' : 'textMuted'}>
                            {option.label}
                          </ThemedText>
                        </ThemedView>
                      </Pressable>
                    );
                  })}
                </View>
              </ThemedView>
            ) : null}
          </>
        ) : loadError ? (
          <ThemedText type="bodyS" themeColor="textSecondary" style={styles.errorText}>
            음식 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </ThemedText>
        ) : null}

        {submitError ? (
          <ThemedText type="bodyS" themeColor="textSecondary" style={styles.errorText}>
            전송에 실패했어요. 잠시 후 다시 시도해주세요.
          </ThemedText>
        ) : null}
      </ScrollView>

      <BottomButton
        label="확인"
        loading={submitting}
        disabled={!identify || !method}
        onPress={handleConfirm}
        secondary={
          resolvedFoodId
            ? {
                label: '다른 방법으로 먹어볼까요?',
                variant: 'secondary',
                onPress: () =>
                  router.push({
                    pathname: '/food/alternative',
                    params: { food_id: String(resolvedFoodId) },
                  }),
              }
            : undefined
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  identifying: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.five,
    justifyContent: 'center',
  },
  errorText: {
    marginTop: Spacing.three,
  },
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  photoCard: {
    height: 200,
    borderRadius: 16,
    marginTop: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  foodName: {
    fontSize: 22,
    lineHeight: 30,
    marginTop: Spacing.four,
  },
  sectionHint: {
    marginTop: 6,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.three,
  },
  chipBase: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 999,
    borderWidth: 1,
  },
  addChip: {
    borderStyle: 'dashed',
  },
  customInput: {
    minWidth: 100,
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 999,
    borderWidth: 1,
    fontSize: 13.5,
  },
  sectionLabel: {
    marginTop: 28,
    marginBottom: 10,
  },
  portionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  portionPressable: {
    flex: 1,
  },
  portionOption: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  soupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 15,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginTop: 24,
  },
  soupOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  soupOption: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
});
