import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomButton } from '@/components/common/BottomButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import * as api from '@/services/api';

const illustration = require('@/assets/images/illustrations/onboarding-intro.png');

const INTRO_STEPS = [
  { title: '먹은 것을 사진으로 남기고', description: '불편했던 날은 함께 기록해요' },
  { title: '반복되는 패턴을 찾아드려요', description: '음식만이 아니라 그날의 상황까지' },
  { title: '피하던 음식을 다시 시도해요', description: '시도한 사람의 71%가 되찾았어요' },
];

/**
 * A1 서비스 소개.
 * MORU는 진단·치료 서비스가 아니라는 점을 먼저 안내하고 온보딩으로 연결한다.
 *
 * 부팅 시 GET /me 를 한 번 확인해 onboarded=true 인 기기는 소개/온보딩을 건너뛰고
 * 바로 홈으로 보낸다. onboarded=false 는 기존과 동일하게 이 화면에 남아 "시작하기"로
 * /onboarding/safety 로 진입한다(원래도 그 경로였으므로 변경하지 않는다).
 *
 * blocked=true 처리는 보류한다 — GET /me 응답에는 B1x가 요구하는 title/body/footer
 * 문구가 없어, 서버가 문구를 함께 내려주기 전까지는 임의로 화면을 만들지 않는다.
 */
export default function StartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const checkedOnce = useRef(false);

  useEffect(() => {
    if (checkedOnce.current) return;
    checkedOnce.current = true;

    api
      .getMe()
      .then((me) => {
        if (me.onboarded) {
          router.replace('/(tabs)');
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[A1] GET /me failed:', err);
      });
  }, [router]);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}>
      <ThemedView
        type="onboardingBackground"
        style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <Image source={illustration} style={styles.illustration} />
            <ThemedText type="h1" themeColor="textPrimary" style={styles.brandName}>
              MORU
            </ThemedText>
          </View>

          <ThemedText type="h1" themeColor="textPrimary" style={styles.headline}>
            {'두려움 때문에 좁아진 식탁,\n안심하고 다시 넓혀드릴게요'}
          </ThemedText>

          <View style={styles.cards}>
            {INTRO_STEPS.map((step, index) => (
              <ThemedView key={step.title} type="surfaceCard" style={styles.card}>
                <ThemedView type="brandLight" style={styles.cardBadge}>
                  <ThemedText type="caption" themeColor="brandText">
                    {index + 1}
                  </ThemedText>
                </ThemedView>
                <View style={styles.cardTexts}>
                  <ThemedText type="label" themeColor="textPrimary">
                    {step.title}
                  </ThemedText>
                  <ThemedText type="caption" themeColor="textMuted">
                    {step.description}
                  </ThemedText>
                </View>
              </ThemedView>
            ))}
          </View>

          <View style={styles.flex} />

          <ThemedText type="caption" themeColor="textMuted" style={styles.disclaimer}>
            {'MORU는 질병을 진단하거나 치료하는 의료 서비스가 아닙니다.\n기록을 바탕으로 음식 선택과 자기관리를 돕습니다.'}
          </ThemedText>

          <View style={styles.spacer14} />
        </View>

        <BottomButton label="시작하기" onPress={() => router.push('/onboarding/safety')} />
      </ThemedView>
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
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  hero: {
    alignItems: 'center',
    gap: 14,
    marginTop: 40,
  },
  illustration: {
    width: 150,
    height: 150,
  },
  brandName: {
    fontSize: 19,
  },
  headline: {
    textAlign: 'center',
    marginTop: 28,
  },
  cards: {
    gap: 10,
    marginTop: 30,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 15,
    shadowColor: '#3B332B',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 1,
  },
  cardBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTexts: {
    flex: 1,
    gap: 3,
  },
  flex: {
    flex: 1,
    minHeight: 24,
  },
  disclaimer: {
    textAlign: 'center',
  },
  spacer14: {
    height: 14,
  },
});
