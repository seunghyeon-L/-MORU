import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FoodInputSheet } from '@/components/food/FoodInputSheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import * as api from '@/services/api';
import type { HomeCard, HomeResponse } from '@/types/home';

/**
 * 탭 화면 콘텐츠 맨 아래에서 하단 탭바가 먹는 높이. insets.bottom 은 별도로 더해야 한다.
 *
 * 세 플랫폼 모두 탭 화면의 **레이아웃 높이는 탭바를 포함한 전체 높이**다.
 * react-native-screens 의 BottomTabsScreen 이 position:absolute + height:'100%' 로
 * 탭 호스트 전체를 채우고(BottomTabsScreen.tsx:320-326), 호스트는 다시 flex:1 + height:'100%'
 * 라 루트(=창 전체) 높이를 그대로 받는다(BottomTabs.tsx:72-78).
 * 네이티브가 실제 콘텐츠 영역 크기를 Yoga 로 돌려주는 경로는 없다 —
 * RNSBottomTabsShadowNode 의 StateData 에는 imageLoader 만 들어 있다.
 *
 * iOS 는 탭바가 콘텐츠 위에 반투명하게 덮이므로 이 전제가 맞고, 덮이는 만큼(49pt)만 비우면 된다.
 *
 * 안드로이드는 다르다. TabsHost 는 세로 LinearLayout 이고 콘텐츠가 들어가는
 * contentView(weight=1) 위에 BottomNavigationView 를 쌓는다
 * (TabsHost.kt:94-110, 195-198). 즉 **콘텐츠 영역이 탭바 위에서 끝나는데**
 * 그 사실이 Yoga 에 전달되지 않는다. 게다가 TabScreen.onLayout 은 no-op 이라
 * (TabScreen.kt:21-27) 자식은 Yoga 가 계산한 "창 전체 높이" 자리에 그대로 놓이고,
 * 그중 탭바 높이만큼 아래가 contentView(FrameLayout, clipChildren 기본값 true)에 잘려 나간다.
 * 사용자가 갤럭시에서 본 "버튼 아래가 탭바 경계에서 잘림"이 바로 이것이다.
 * Material3 BottomNavigationView 기본 높이가 80dp 고, edge-to-edge(Expo SDK 54 기본)에서는
 * 시스템 내비게이션 바 인셋이 그 아래 padding 으로 더 붙으므로 insets.bottom 도 같이 더한다.
 *
 * 웹은 app-tabs.web.tsx 의 TabList 가 position:absolute bottom:0 라 iOS 와 같은 모양으로 겹친다.
 * 높이는 paddingTop 16 + 아이콘 24 + gap 4 + small 라벨 ≈ 18 + paddingBottom 8 ≈ 70.
 */

/**
 * C 홈 (기본 화면).
 * GET /home 의 cards 배열을 type 별로 그대로 렌더링한다. cards: [] 는 신규 사용자의 정상 상태다.
 */
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [home, setHome] = useState<HomeResponse | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [snoozingId, setSnoozingId] = useState<number | null>(null);
  const [foodSheetVisible, setFoodSheetVisible] = useState(false);

  useEffect(() => {
    api
      .getHomeCards()
      .then(setHome)
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[Home] GET /home failed:', err);
        setLoadError(true);
      });
  }, []);

  /** "나중에" — 서버에 snooze 를 저장하고 홈을 다시 불러온다. 프론트에서 카드만 숨기지 않는다 */
  const handleSnooze = async (ingredientId: number) => {
    setSnoozingId(ingredientId);
    try {
      await api.snoozeSuggestion(ingredientId);
      const refreshed = await api.getHomeCards();
      setHome(refreshed);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[Home] snooze failed:', err);
    } finally {
      setSnoozingId(null);
    }
  };

  const renderCard = (card: HomeCard, index: number) => {
    switch (card.type) {
      case 'challenge_progress':
        return (
          <ThemedView key={index} type="surfaceCard" style={styles.card}>
            <ThemedText type="h1" themeColor="textPrimary" style={styles.cardHeadline}>
              {card.title}
            </ThemedText>
            <ThemedText type="bodyS" themeColor="textSecondary" style={styles.cardBody}>
              {card.body}
            </ThemedText>
            <Pressable
              style={styles.ctaPressable}
              onPress={() =>
                router.push({
                  pathname: '/reintroduction/progress',
                  params: { challenge_id: String(card.action.challenge_id) },
                })
              }>
              {({ pressed }) => (
                <ThemedView type={pressed ? 'brandPressed' : 'brand'} style={styles.ctaPrimary}>
                  <ThemedText type="label" themeColor="textOnBrand">
                    {card.action.label}
                  </ThemedText>
                </ThemedView>
              )}
            </Pressable>
          </ThemedView>
        );

      case 'challenge_suggestion':
        return (
          <ThemedView key={index} type="surfaceCard" style={styles.card}>
            <ThemedView type="brandLight" style={styles.badge}>
              <ThemedText type="caption" themeColor="textPrimary">
                다시 먹어볼 음식
              </ThemedText>
            </ThemedView>
            <ThemedText type="h1" themeColor="textPrimary" style={styles.cardHeadline}>
              {card.title}
            </ThemedText>
            <ThemedText type="bodyS" themeColor="textSecondary" style={styles.cardBody}>
              {card.body}
            </ThemedText>
            <View style={styles.ctaRow}>
              <Pressable style={styles.ctaPressable} onPress={() => router.push('/reintroduction')}>
                {({ pressed }) => (
                  <ThemedView type={pressed ? 'brandPressed' : 'brand'} style={styles.ctaPrimary}>
                    <ThemedText type="label" themeColor="textOnBrand">
                      {card.action.label}
                    </ThemedText>
                  </ThemedView>
                )}
              </Pressable>
              <Pressable
                style={styles.ctaPressable}
                disabled={snoozingId === card.action.ingredient_id}
                onPress={() => handleSnooze(card.action.ingredient_id)}>
                {({ pressed }) => (
                  // 보조 버튼의 평상 배경(onboardingBackground)은 이미 아주 밝아서
                  // 한 단 어둡게 해도 휘도비가 잘 안 벌어진다.
                  // elementPressed 가 1.27:1(다크 2.13:1)로 가장 낫다.
                  // 그 위에서는 라벨을 textPrimary 로 올린다 — textMuted 로는 AA 미달이다.
                  <ThemedView
                    type={pressed ? 'elementPressed' : 'onboardingBackground'}
                    style={styles.ctaSecondary}>
                    <ThemedText type="label" themeColor={pressed ? 'textPrimary' : 'textMuted'}>
                      {card.dismiss.label}
                    </ThemedText>
                  </ThemedView>
                )}
              </Pressable>
            </View>
          </ThemedView>
        );

      case 'schedule_note':
      case 'weekly_recap':
        return (
          <ThemedView key={index} type="surfaceCard" style={styles.card}>
            <ThemedText type="label" themeColor="textPrimary">
              {card.title}
            </ThemedText>
            <ThemedText type="bodyS" themeColor="textSecondary" style={styles.cardBody}>
              {card.body}
            </ThemedText>
          </ThemedView>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <ThemedView
        type="onboardingBackground"
        style={[
          styles.container,
          {
            paddingTop: insets.top + Spacing.three,
            // 탭바가 먹는 높이 + 시스템 바 인셋 위에 Spacing.three 만큼만 실제 여백을 둔다.
            // 전에 쓰던 Spacing.six(64)는 탭바 높이를 어림잡은 숫자였고,
            // iOS 에서는 15pt 밖에 안 남고, 안드로이드에서는 탭바 80dp 에 16dp 모자라
            // 버튼 아래 16dp 가 잘려 나갔다 — 사용자가 갤럭시에서 본 그 잘림이다.
            paddingBottom: insets.bottom + BottomTabInset + Spacing.three,
          },
        ]}>
        <View style={styles.header}>
          <ThemedText type="label" themeColor="textMuted">
            MORU
          </ThemedText>
          <ThemedText type="h1" themeColor="textPrimary" style={styles.greeting}>
            {home?.greeting ?? ''}
          </ThemedText>
        </View>

        {home && home.cards.length > 0 ? (
          home.cards.map(renderCard)
        ) : home && home.cards.length === 0 ? (
          <ThemedView type="surfaceCard" style={styles.card}>
            <ThemedText type="label" themeColor="textPrimary">
              아직 보여드릴 카드가 없어요
            </ThemedText>
            <ThemedText type="bodyS" themeColor="textSecondary" style={styles.cardBody}>
              기록이 쌓이면 여기에 보여드릴게요.
            </ThemedText>
          </ThemedView>
        ) : loadError ? (
          <ThemedText type="bodyS" themeColor="textSecondary" style={styles.errorText}>
            홈 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </ThemedText>
        ) : null}

        <View style={styles.flex} />

        {/*
          누름 피드백은 opacity 가 아니라 배경색으로 준다.
          안드로이드는 오프스크린 합성 없이 알파를 그리기 연산마다 개별로 곱해서,
          겹친 불투명 레이어(Pressable > ThemedView > 글자)마다 최종색이 어긋난다.
          brand(#9BBFAE) → brandPressed(#C3D9CE) 는 휘도비 1.35:1 이라 눌린 게 보이고,
          그 위 textOnBrand(#3A342C) 는 8.26:1 로 평상시(6.10:1)보다 오히려 잘 읽힌다.
        */}
        <Pressable onPress={() => setFoodSheetVisible(true)}>
          {({ pressed }) => (
            <ThemedView type={pressed ? 'brandPressed' : 'brand'} style={styles.checkButton}>
              <ThemedText type="button" themeColor="textOnBrand">
                오늘 먹은 것 확인하기
              </ThemedText>
            </ThemedView>
          )}
        </Pressable>
      </ThemedView>

      <FoodInputSheet visible={foodSheetVisible} onClose={() => setFoodSheetVisible(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  header: {
    marginBottom: 22,
  },
  greeting: {
    fontSize: 19,
    lineHeight: 27,
    marginTop: 4,
  },
  card: {
    borderRadius: 15,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 12,
    shadowColor: '#3B332B',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  cardHeadline: {
    fontSize: 17,
    lineHeight: 24,
    marginTop: 12,
  },
  cardBody: {
    marginTop: 8,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ctaPressable: {
    flex: 1,
    marginTop: 16,
  },
  ctaPrimary: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 11,
  },
  ctaSecondary: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 11,
  },
  errorText: {
    marginBottom: 12,
  },
  flex: {
    flex: 1,
    minHeight: 24,
  },
  checkButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 15,
  },
});
