import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomButton } from '@/components/common/BottomButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

const logoMark = require('@/assets/images/logo/moru-mark.png');

const COMPLETE_STEPS = [
  '음식 사진으로 기록해요',
  '증상과 그날의 상황을 남겨요',
  '나의 패턴을 확인해요',
  '다시 시도하고 식탁을 넓혀요',
];

/** B6 온보딩 · 완료. 온보딩을 마치고 홈으로 진입하는 축하 화면 */
export default function OnboardingCompleteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <ThemedView
        type="onboardingBackground"
        style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.content}>
          <ThemedView type="brand" style={styles.badge}>
            <Image source={logoMark} style={styles.logo} resizeMode="contain" />
          </ThemedView>

          <ThemedText type="h1" themeColor="textPrimary" style={styles.headline}>
            {'MORU와 함께\n나만의 식탁을 넓혀봐요!'}
          </ThemedText>

          <View style={styles.steps}>
            {COMPLETE_STEPS.map((step, index) => (
              <View key={step} style={styles.stepRow}>
                <ThemedView type="brandLighter" style={styles.stepBadge}>
                  <ThemedText type="label" themeColor="brandText">
                    {index + 1}
                  </ThemedText>
                </ThemedView>
                <ThemedText type="label" themeColor="textPrimary" style={styles.stepText}>
                  {step}
                </ThemedText>
              </View>
            ))}
          </View>

          <View style={styles.flex} />
        </View>

        <BottomButton label="시작하기" onPress={() => router.replace('/(tabs)')} />
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
  badge: {
    width: 124,
    height: 124,
    borderRadius: 62,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 52,
  },
  logo: {
    width: 58,
    height: 65,
  },
  headline: {
    textAlign: 'center',
    marginTop: 34,
  },
  steps: {
    marginTop: 42,
    gap: 28,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    flex: 1,
  },
  flex: {
    flex: 1,
    minHeight: 24,
  },
});
