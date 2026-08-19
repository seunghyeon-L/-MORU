import { useRouter } from 'expo-router';
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
import type { FoodItem } from '@/types/food';

/**
 * H4 음식 기반 대체안.
 * 확인된 음식을 기준으로 지금 시도해볼 수 있는 4가지 방법을 보여준다.
 * 3번(대체 성분 제안) → H3, 4번(대체 메뉴 제안) → H5.
 */
export default function FoodAlternativeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [food, setFood] = useState<FoodItem | undefined>();

  useEffect(() => {
    api.getFoodItem('food-jeyuk-bokkeum').then(setFood);
  }, []);

  const options = [
    { title: '양 조절', description: '1/2인 또는 고기 양을 줄여보세요.' },
    { title: '빼서 먹기', description: '마늘, 양파(양념)를 빼거나 줄여보세요.' },
    {
      title: '대체 성분 제안',
      description: '더 편안할 수 있는 재료로 바꿔보세요.',
      onPress: () => router.push('/food/alternative/substitute'),
    },
    {
      title: '대체 메뉴 제안',
      description: '비슷한 맛의 다른 메뉴를 찾아드릴게요.',
      onPress: () => router.push('/food/alternative/menu'),
    },
  ];

  return (
    <ThemedView type="onboardingBackground" style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <BackButton />
          <ThemedText type="label" themeColor="textPrimary">
            음식 확인 결과
          </ThemedText>
        </View>

        {food ? (
          <>
            <ThemedView type="brandSoft" style={styles.foodCircle} />
            <ThemedText type="h1" themeColor="textPrimary" style={styles.foodName}>
              {food.name}
            </ThemedText>

            <ThemedText type="label" themeColor="textPrimary" style={styles.sectionLabel}>
              확인된 재료
            </ThemedText>
            <View style={styles.chipWrap}>
              {food.ingredients.map((ingredient) => (
                <Chip key={ingredient.id} label={ingredient.name} />
              ))}
            </View>
          </>
        ) : null}

        <ThemedText type="label" themeColor="textPrimary" style={styles.sectionLabel}>
          이 음식, 어떻게 먹어볼까요?
        </ThemedText>
        <View style={styles.optionList}>
          {options.map((option, i) => (
            <AlternativeCard
              key={option.title}
              alternative={{ id: option.title, kind: 'method', title: option.title, description: option.description }}
              index={i + 1}
              onPress={option.onPress}
            />
          ))}
        </View>
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
});
