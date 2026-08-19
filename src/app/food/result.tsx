import { useRouter } from 'expo-router';
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
import { PORTION_OPTIONS, type FoodItem, type Ingredient, type Portion } from '@/types/food';

/** Figma D2 실제 문구 — 공용 PORTION_OPTIONS 라벨과 달라 이 화면에서만 로컬로 매핑한다 */
const PORTION_LABELS: Record<Portion, string> = {
  small: '반',
  normal: '한 그릇',
  large: '한 그릇 반 이상',
};

/**
 * D2 음식 확인 · 재료 확인.
 * 사진/검색으로 추정된 음식의 재료를 사용자가 직접 확인·수정하고
 * 섭취량 · 국물 여부를 남긴다. 저장/API 연동은 아직 하지 않는다.
 */
export default function FoodResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [foodItem, setFoodItem] = useState<FoodItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [customIngredients, setCustomIngredients] = useState<Ingredient[]>([]);
  const [addingCustom, setAddingCustom] = useState(false);
  const [customText, setCustomText] = useState('');
  const [portion, setPortion] = useState<Portion | undefined>();
  const [hasSoup, setHasSoup] = useState<boolean | undefined>();

  useEffect(() => {
    api.recognizeFoodFromImage('').then((item) => {
      setFoodItem(item);
      // Figma 예시처럼 마지막 재료(대파) 하나만 기본 해제된 상태로 시작한다
      setSelectedIds(item.ingredients.slice(0, -1).map((ingredient) => ingredient.id));
    });
  }, []);

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

  const canConfirm = portion !== undefined && hasSoup !== undefined;
  const allIngredients = foodItem ? [...foodItem.ingredients, ...customIngredients] : [];

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
          <ThemedView type="brandSoft" style={styles.photoIconWrap}>
            <CameraIcon size={24} color={theme.brandText} />
          </ThemedView>
          <ThemedText type="caption" themeColor="textMuted" style={styles.photoLabel}>
            촬영한 사진
          </ThemedText>
        </ThemedView>

        {foodItem ? (
          <>
            <ThemedText type="h1" themeColor="textPrimary" style={styles.foodName}>
              {foodItem.name}
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
        ) : null}
      </ScrollView>

      <BottomButton
        label="확인"
        disabled={!canConfirm}
        onPress={() => router.push('/food/ingredient')}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
