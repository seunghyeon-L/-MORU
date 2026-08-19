import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomButton } from '@/components/common/BottomButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

const illustration = require('@/assets/images/illustrations/onboarding-medical.png');

/**
 * B1x 안전 · 병원 안내 (차단).
 *
 * 문구(title/body/footer)와 선택 항목(flags)은 B1의 POST /onboarding/safety
 * 응답을 그대로 전달받아 표시한다 — 프론트에서 재조합하지 않는다.
 * "이미 병원에서 확인했어요"를 선택하면 온보딩을 이어갈 수 있다.
 */
export default function MedicalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { title, body, footer, flags } = useLocalSearchParams<{
    title?: string;
    body?: string;
    footer?: string;
    flags?: string;
  }>();

  const selectedFlags = flags ? flags.split(',').filter(Boolean) : [];

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

          <ThemedView
            type="surfaceCard"
            style={[styles.card, { borderColor: theme.borderSubtle }]}>
            <ThemedText type="caption" themeColor="textMuted">
              선택하신 항목
            </ThemedText>
            <View style={styles.reasonList}>
              {(selectedFlags.length > 0 ? selectedFlags : ['해당 항목 확인 중']).map((flag) => (
                <View key={flag} style={styles.reasonRow}>
                  <ThemedView type="brand" style={styles.dot} />
                  <ThemedText type="label" themeColor="textPrimary">
                    {flag}
                  </ThemedText>
                </View>
              ))}
            </View>
          </ThemedView>

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
            onPress: () => router.push('/onboarding/allergy'),
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
  reasonList: {
    gap: 8,
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
