import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { MORUButton } from '@/components/common/MORUButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import * as api from '@/services/api';
import type { MenuSuggestion } from '@/types/food';

/**
 * H5 대체 메뉴 제안.
 * 메뉴를 "기록하기"로 선택하면 D2(음식 확인) 흐름으로 다시 진입한다.
 */
export default function AlternativeMenuScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [menus, setMenus] = useState<MenuSuggestion[]>([]);
  const [moreLoaded, setMoreLoaded] = useState(false);

  useEffect(() => {
    api.getMenuSuggestions('food-jeyuk-bokkeum').then(setMenus);
  }, []);

  const loadMore = async () => {
    const more = await api.getMoreMenuSuggestions('food-jeyuk-bokkeum');
    setMenus((prev) => [...prev, ...more]);
    setMoreLoaded(true);
  };

  return (
    <ThemedView type="onboardingBackground" style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <BackButton />
          <ThemedText type="label" themeColor="textPrimary">
            대체 메뉴 제안
          </ThemedText>
        </View>

        <ThemedText type="h1" themeColor="textPrimary" style={styles.title}>
          제육볶음 대신 이런 메뉴는 어떠세요?
        </ThemedText>

        <View style={styles.list}>
          {menus.map((menu) => (
            <ThemedView key={menu.id} type="surfaceCard" style={styles.card}>
              <View style={styles.cardRow}>
                <ThemedView type="brandSoft" style={styles.thumb} />
                <View style={styles.cardTexts}>
                  <ThemedText type="label" themeColor="textPrimary">
                    {menu.name}
                  </ThemedText>
                  <ThemedText type="caption" themeColor="textMuted">
                    {menu.description}
                  </ThemedText>
                </View>
              </View>
              <MORUButton label="기록하기" onPress={() => router.push('/food/result')} />
            </ThemedView>
          ))}
        </View>

        {!moreLoaded ? (
          <Pressable onPress={loadMore} style={[styles.moreButton, { borderColor: theme.borderSubtle }]}>
            <ThemedText type="label" themeColor="textMuted">
              더 많은 메뉴 보기
            </ThemedText>
          </Pressable>
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
  moreButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 4,
  },
});
