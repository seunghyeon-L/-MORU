import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export type MORUButtonVariant = 'primary' | 'secondary' | 'ghost';

export type MORUButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: MORUButtonVariant;
  disabled?: boolean;
};

/** 앱 전반에서 쓰는 기본 버튼. Figma "Button (auto-pressed)" 컴포넌트 기준 */
export function MORUButton({ label, variant = 'primary', disabled, ...rest }: MORUButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [(pressed || disabled) && styles.dimmed]}
      {...rest}>
      <ThemedView
        type={variant === 'primary' ? 'brand' : 'surfaceCard'}
        style={[
          styles.container,
          variant === 'secondary' && { borderWidth: 1, borderColor: theme.brand },
          variant === 'primary' && styles.primaryShadow,
        ]}>
        <ThemedText
          type="button"
          themeColor={variant === 'primary' ? 'textOnBrand' : 'textSecondary'}>
          {label}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  primaryShadow: {
    shadowColor: '#5C6B47',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 2,
  },
  dimmed: {
    opacity: 0.6,
  },
});
