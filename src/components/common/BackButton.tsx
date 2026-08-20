import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export type BackButtonProps = {
  /** 지정하면 router.back() 대신 이 함수를 호출한다 */
  onPress?: () => void;
  label?: string;
};

export function BackButton({ onPress, label = '뒤로' }: BackButtonProps) {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress ?? (() => router.back())}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <ThemedText type="small">{'←'}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.two,
    paddingRight: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
});
