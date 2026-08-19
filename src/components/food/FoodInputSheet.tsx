import { useRouter, type Href } from 'expo-router';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CameraIcon, DocumentIcon, PencilIcon, SearchIcon, type IconProps } from '@/components/common/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export type FoodInputSheetProps = {
  visible: boolean;
  onClose: () => void;
};

type InputOption = {
  id: string;
  title: string;
  description: string;
  Icon: (props: IconProps) => React.JSX.Element;
  href: Href;
};

/**
 * D1 "무엇을 드셨나요?" — 음식 기록 입력 방식 선택 바텀시트.
 * 별도 route 없이 홈/기록 화면에서 state 로 열고 닫는다.
 */
export function FoodInputSheet({ visible, onClose }: FoodInputSheetProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const options: InputOption[] = [
    { id: 'photo', title: '사진 찍기', description: '가장 빠른 방법이에요', Icon: CameraIcon, href: '/food/camera' },
    { id: 'search', title: '메뉴 검색', description: '사진이 없어도 괜찮아요', Icon: SearchIcon, href: '/food/search' },
    // 검색 화면 자체에 "직접 입력" 항목이 포함돼 있어 기존 route 를 그대로 재사용한다.
    { id: 'manual', title: '직접 입력', description: '검색에 없는 음식이라면', Icon: PencilIcon, href: '/food/search' },
    // 원재료표 촬영 전용 화면은 아직 없어 카메라 촬영 흐름을 재사용한다.
    { id: 'label', title: '원재료표 촬영', description: '가공식품 뒷면을 찍어주세요', Icon: DocumentIcon, href: '/food/camera' },
  ];

  const select = (href: Href) => {
    onClose();
    router.push(href);
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.dim} onPress={onClose} accessibilityLabel="닫기" />

        <ThemedView
          type="onboardingBackground"
          style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.four }]}>
          <View style={styles.handle} />

          <ThemedText type="h1" themeColor="textPrimary" style={styles.title}>
            무엇을 드셨나요?
          </ThemedText>
          <ThemedText type="bodyS" themeColor="textSecondary" style={styles.subtitle}>
            편한 방법으로 알려주세요
          </ThemedText>

          <View style={styles.options}>
            {options.map((option) => (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                onPress={() => select(option.href)}
                style={({ pressed }) => [
                  styles.option,
                  {
                    backgroundColor: pressed ? theme.brandSoft : theme.surfaceCard,
                    borderColor: pressed ? theme.brand : 'transparent',
                  },
                ]}>
                <option.Icon size={23} color={theme.textMuted} />
                <View style={styles.optionTexts}>
                  <ThemedText type="label" themeColor="textPrimary">
                    {option.title}
                  </ThemedText>
                  <ThemedText type="caption" themeColor="textMuted">
                    {option.description}
                  </ThemedText>
                </View>
              </Pressable>
            ))}
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(58, 52, 44, 0.45)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(58, 52, 44, 0.15)',
    marginBottom: Spacing.four,
  },
  title: {
    fontSize: 20,
    lineHeight: 27,
  },
  subtitle: {
    marginTop: 6,
    marginBottom: Spacing.four,
  },
  options: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 15,
    borderWidth: 1.5,
  },
  optionTexts: {
    flex: 1,
    gap: 3,
  },
});
