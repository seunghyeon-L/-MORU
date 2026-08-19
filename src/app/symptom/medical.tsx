import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomButton } from '@/components/common/BottomButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

const illustration = require('@/assets/images/illustrations/onboarding-medical.png');

/**
 * 증상 기록 중 위험 신호(red_flag)로 차단됐을 때의 병원 안내 화면.
 * onboarding/medical(B1x)과 레이아웃은 같지만, 문구는 POST /symptoms 응답의
 * notice.title/body/footer 를 그대로 전달받아 표시한다 — B1x와 문구 출처를 합치지 않는다.
 * "이미 확인했어요"를 누르면 증상 기록(symptom/detail)으로 돌아간다.
 */
export default function SymptomMedicalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { title, body, footer } = useLocalSearchParams<{
    title?: string;
    body?: string;
    footer?: string;
  }>();

  const openNearbyHospitalSearch = () => {
    const url = Platform.select({
      ios: 'https://maps.apple.com/?q=%EB%B3%91%EC%9B%90',
      android: 'geo:0,0?q=병원',
      default: 'https://map.naver.com/p/search/병원',
    });
    if (url) Linking.openURL(url).catch(() => {});
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <ThemedView
        type="onboardingBackground"
        style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.content}>
          <View style={styles.illustrationWrap}>
            <Image source={illustration} style={styles.illustration} />
          </View>

          <ThemedText type="h1" themeColor="textPrimary" style={styles.headline}>
            {title}
          </ThemedText>

          <ThemedText type="bodyM" themeColor="textSecondary" style={styles.description}>
            {body}
          </ThemedText>

          <View style={styles.flex} />

          <ThemedText type="caption" themeColor="textMuted" style={styles.footNote}>
            {footer}
          </ThemedText>

          <View style={styles.spacer14} />
        </View>

        <BottomButton
          label="가까운 병원 찾아보기"
          onPress={openNearbyHospitalSearch}
          secondary={{
            label: '이미 병원에서 확인했어요',
            variant: 'secondary',
            onPress: () => router.back(),
          }}
        />
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
  illustrationWrap: {
    alignItems: 'center',
    marginTop: 50,
  },
  illustration: {
    width: 124,
    height: 124,
  },
  headline: {
    textAlign: 'center',
    marginTop: 22,
  },
  description: {
    textAlign: 'center',
    marginTop: 12,
  },
  flex: {
    flex: 1,
    minHeight: 24,
  },
  footNote: {
    textAlign: 'center',
  },
  spacer14: {
    height: 14,
  },
});
