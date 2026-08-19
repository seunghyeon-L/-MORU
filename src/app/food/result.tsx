import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { BottomButton } from '@/components/common/BottomButton';
import { CameraIcon } from '@/components/common/icons';
import { IngredientChip } from '@/components/food/IngredientChip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import * as api from '@/services/api';
import {
  PORTION_OPTIONS,
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

/**
 * D2 음식 확인 · 재료 확인.
 * 사진(POST /meals/identify-photo)/텍스트(POST /meals/identify)로 추정된 음식의 재료를
 * 사용자가 직접 확인·수정하고, 섭취량·국물 여부와 함께 확인 버튼에서 POST /meals 로 확정한다.
 *
 * method(서버 enum: photo|text|search) 는 사진 경로("photo")만 근거가 명확하다.
 * 텍스트 경로(메뉴 검색/직접 입력)는 현재 food/chat.tsx 에서 mode(search|manual)가
 * 이 화면까지 전달되지 않고, search/text 중 무엇에 대응하는지도 계약에 없어
 * POST /meals 호출을 보류한다(BLOCKED) — 확인 버튼이 비활성 상태로 남는다.
 */
export default function FoodResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  // photoUri: 카메라(D1)에서 촬영한 사진, foodName: H1(메뉴 검색/직접 입력)에서 입력한 음식명
  const { photoUri, foodName } = useLocalSearchParams<{ photoUri?: string; foodName?: string }>();

  const [identify, setIdentify] = useState<MealIdentifyResponse | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [customIngredients, setCustomIngredients] = useState<Ingredient[]>([]);
  const [addingCustom, setAddingCustom] = useState(false);
  const [customText, setCustomText] = useState('');
  const [portion, setPortion] = useState<Portion | undefined>();
  const [hasSoup, setHasSoup] = useState<boolean | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  /** 사진 경로만 method 를 확정할 수 있다 — 나머지는 BLOCKED (파일 상단 주석 참고) */
  const method: MealApiMethod | undefined = photoUri ? 'photo' : undefined;

  useEffect(() => {
    const load = foodName
      ? api.identifyMealFromText(foodName)
      : api.identifyMealFromPhoto(photoUri ?? '');

    load
      .then((result) => {
        setIdentify(result);
        // 서버가 미리 선택해준 checked 를 그대로 초기 선택 상태로 쓴다
        setSelectedIds(result.ingredients.filter((i) => i.checked).map((i) => String(i.id)));
        setHasSoup(result.has_broth);
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

  const handleConfirm = async () => {
    if (!identify || !portion || !method || submitting) return;

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
        food_id: identify.food_id,
        food_name: identify.food_name,
        eaten_at: eatenAt,
        portion: PORTION_API_MAP[portion],
        ate_broth: hasSoup ?? null,
        method,
        ingredient_ids: ingredientIds,
        custom_ingredients: customNames,
      });

      const ingredientNames = selectedIds
        .map((id) => allIngredients.find((ingredient) => ingredient.id === id)?.name)
        .filter((name): name is string => Boolean(name))
        .join(',');

      const forwardParams = {
        meal_id: String(result.meal_id),
        food_id: String(identify.food_id),
        food_name: identify.food_name,
        eaten_at: eatenAt,
        portion,
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

        <ThemedView type="surfaceCard" style={styles.photoCard}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoImage} contentFit="cover" />
          ) : (
            <>
              <ThemedView type="brandSoft" style={styles.photoIconWrap}>
                <CameraIcon size={24} color={theme.brandText} />
              </ThemedView>
              <ThemedText type="caption" themeColor="textMuted" style={styles.photoLabel}>
                촬영한 사진
              </ThemedText>
            </>
          )}
        </ThemedView>

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
                  <Pressable key={option.id} style={styles.portionPressable} onPress={() => setPortion(option.id)}>
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
                    <Pressable key={String(option.id)} onPress={() => setHasSoup(option.id)}>
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
        disabled={!identify || !portion || !method || submitting}
        onPress={handleConfirm}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
  photoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoLabel: {},
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
