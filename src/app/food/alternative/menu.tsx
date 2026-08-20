import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { MORUButton } from '@/components/common/MORUButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import * as api from '@/services/api';
import type { MenuAlternativesResponse } from '@/types/food';

/**
 * H5 대체 메뉴 제안.
 * GET /foods/{food_id}/menu-alternatives 를 그대로 표시한다. food_id 는 H4 응답에서만 받는다.
 * has_more 는 표시 신호일 뿐 추가로 불러올 endpoint(offset/cursor)가 계약에 없어
 * "더 보기" 동작은 만들지 않는다.
 *
 * "기록하기"는 item.name 으로 D2를 D1 텍스트 입력과 동일한 경로(POST /meals/identify)로 띄운다 —
 * 이 food_id는 기록용이 아니라 H4 재진입 전용이라 여기서는 쓰지 않는다.
 * "다른 방법으로 먹기"는 item.food_id 가 있을 때만 보여주고, 그 값을 그대로 H4에 전달한다.
 */
export default function AlternativeMenuScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { food_id } = useLocalSearchParams<{ food_id?: string }>();
  const foodId = Number(food_id);
  const hasValidFoodId = food_id !== undefined && Number.isFinite(foodId);

  const [data, setData] = useState<MenuAlternativesResponse | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!hasValidFoodId) return;
    api
      .getMenuAlternatives(foodId)
      .then(setData)
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[H5] GET /foods/{food_id}/menu-alternatives failed:', err);
        setLoadError(true);
      });
  }, [hasValidFoodId, foodId]);

  return (
    <ThemedView type="onboardingBackground" style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <BackButton />
          <ThemedText type="label" themeColor="textPrimary">
            대체 메뉴 제안
          </ThemedText>
        </View>

        {data ? (
          <>
            <ThemedText type="h1" themeColor="textPrimary" style={styles.title}>
              {data.headline}
            </ThemedText>

            {data.items.length > 0 ? (
              <View style={styles.list}>
                {data.items.map((item) => (
                  <ThemedView key={item.name} type="surfaceCard" style={styles.card}>
                    <View style={styles.cardRow}>
                      <ThemedView type="brandSoft" style={styles.thumb} />
                      <View style={styles.cardTexts}>
                        <ThemedText type="label" themeColor="textPrimary">
                          {item.name}
                        </ThemedText>
                        <ThemedText type="caption" themeColor="textMuted">
                          {item.why}
                        </ThemedText>
                      </View>
                    </View>
                    <View style={styles.cardActions}>
                      <View style={styles.cardActionFlex}>
                        <MORUButton
                          label="기록하기"
                          onPress={() =>
                            router.push({
                              pathname: '/food/result',
                              params: { foodName: item.name, mode: 'search' },
                            })
                          }
                        />
                      </View>
                      {item.food_id != null ? (
                        <View style={styles.cardActionFlex}>
                          <MORUButton
                            label="다른 방법으로 먹기"
                            variant="secondary"
                            onPress={() =>
                              router.push({
                                pathname: '/food/alternative',
                                params: { food_id: String(item.food_id) },
                              })
                            }
                          />
                        </View>
                      ) : null}
                    </View>
                  </ThemedView>
                ))}
              </View>
            ) : (
              <ThemedText type="bodyS" themeColor="textSecondary" style={styles.errorText}>
                지금은 추천할 대체 메뉴가 없어요.
              </ThemedText>
            )}
          </>
        ) : !hasValidFoodId ? (
          <ThemedText type="bodyS" themeColor="textSecondary" style={styles.errorText}>
            불러올 음식 정보가 없어요.
          </ThemedText>
        ) : loadError ? (
          <ThemedText type="bodyS" themeColor="textSecondary" style={styles.errorText}>
            대체 메뉴를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </ThemedText>
        ) : null}
      </ScrollView>
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
    marginBottom: Spacing.four,
  },
  list: {
    gap: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  cardTexts: {
    flex: 1,
    gap: 3,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cardActionFlex: {
    flex: 1,
  },
  errorText: {
    marginTop: Spacing.three,
  },
});
