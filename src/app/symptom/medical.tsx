import { useRouter } from 'expo-router';
import { Image, Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomButton } from '@/components/common/BottomButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

const illustration = require('@/assets/images/illustrations/onboarding-medical.png');

/**
 * 증상 기록 중 "변에 피가 섞여 있었어요" 체크 시 안내하는 병원 확인 화면.
 * onboarding/medical(B1x)과 동일한 문구·레이아웃을 사용하되,
 * "이미 확인했어요"를 누르면 온보딩이 아니라 기존 증상 기록(symptom/detail)으로 돌아간다.
 */
export default function SymptomMedicalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

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
            {'먼저 병원에서\n확인해주세요'}
          </ThemedText>

          <ThemedText type="bodyM" themeColor="textSecondary" style={styles.description}>
            {'말씀해주신 증상은 식이 관리보다\n진료가 먼저 필요할 수 있어요.'}
          </ThemedText>

          <ThemedView
            type="surfaceCard"
            style={[styles.card, { borderColor: theme.borderSubtle }]}>
            <ThemedText type="caption" themeColor="textMuted">
              선택하신 항목
            </ThemedText>
            <View style={styles.reasonRow}>
              <ThemedView type="brand" style={styles.dot} />
              <ThemedText type="label" themeColor="textPrimary">
                변에 피가 섞여 있었어요
              </ThemedText>
            </View>
          </ThemedView>

          <View style={styles.flex} />

          <ThemedText type="caption" themeColor="textMuted" style={styles.footNote}>
            진료 후 다시 오시면 언제든 함께할게요.
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
  card: {
    marginTop: 24,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 10,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
