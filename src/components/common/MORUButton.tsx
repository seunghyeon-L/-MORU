import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export type MORUButtonVariant = 'primary' | 'secondary' | 'ghost';

export type MORUButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: MORUButtonVariant;
  disabled?: boolean;
};

/**
 * 앱 전반에서 쓰는 기본 버튼.
 * 상세 디자인은 Figma 확정 후 적용한다. 지금은 props 구조만 잡아 둔다.
 */
export function MORUButton({ label, variant = 'primary', disabled, ...rest }: MORUButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [(pressed || disabled) && styles.dimmed]}
      {...rest}>
      <ThemedView
        type={variant === 'primary' ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.container}>
        <ThemedText type="smallBold" themeColor={variant === 'ghost' ? 'textSecondary' : 'text'}>
          {label}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  dimmed: {
    opacity: 0.5,
  },
});
