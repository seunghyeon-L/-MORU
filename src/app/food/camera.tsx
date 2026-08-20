import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { BottomButton } from '@/components/common/BottomButton';
import { CameraIcon } from '@/components/common/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

/**
 * 음식 사진 / 원재료표 촬영 (D1 → 카메라 → D2).
 * expo-image-picker 로 실제 기기 카메라 권한 요청 · 촬영을 수행하고
 * 촬영된 이미지를 D2(food/result)로 전달한다. mode=label 이면 문구만 바뀐다.
 */
export default function FoodCameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isLabel = mode === 'label';

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const capture = async () => {
    setError(null);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError('카메라 권한이 필요해요. 기기 설정에서 허용해주세요.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setPhotoUri(uri);
    router.push({
      pathname: '/food/result',
      params: { photoUri: uri, ...(isLabel ? { mode: 'label' } : {}) },
    });
  };

  return (
    <ThemedView type="onboardingBackground" style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <BackButton />
          <ThemedText type="label" themeColor="textPrimary">
            {isLabel ? '원재료표 촬영' : '음식 사진'}
          </ThemedText>
        </View>

        <ThemedText type="bodyS" themeColor="textSecondary" style={styles.description}>
          {isLabel
            ? '가공식품 뒷면의 원재료표를 촬영해주세요.'
            : '음식 사진을 찍으면 메뉴와 재료를 함께 확인해볼 수 있어요.'}
        </ThemedText>

        <Pressable onPress={capture}>
          <ThemedView type="surfaceCard" style={styles.previewCard}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.previewImage} contentFit="cover" />
            ) : (
              <ThemedView type="brandSoft" style={styles.previewIconWrap}>
                <CameraIcon size={28} color={theme.brandText} />
              </ThemedView>
            )}
          </ThemedView>
        </Pressable>

        {error ? (
          <ThemedText type="caption" themeColor="coral" style={styles.error}>
            {error}
          </ThemedText>
        ) : null}
      </ScrollView>

      <BottomButton label="사진 촬영하기" onPress={capture} />
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
  description: {
    marginTop: Spacing.three,
  },
  previewCard: {
    height: 260,
    borderRadius: 16,
    marginTop: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    marginTop: Spacing.two,
    textAlign: 'center',
  },
});
