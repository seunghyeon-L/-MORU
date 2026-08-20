import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export type MORUButtonVariant = 'primary' | 'secondary' | 'ghost';

export type MORUButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: MORUButtonVariant;
  disabled?: boolean;
  /**
   * 서버를 기다리는 중.
   *
   * 챗봇·사진 식별은 2~5초가 걸리는데 그동안 화면이 그대로였다.
   * 눌렀는데 아무 반응이 없으면 사용자는 고장난 줄 알고 다시 누른다.
   */
  loading?: boolean;
};

/** 앱 전반에서 쓰는 기본 버튼. Figma "Button (auto-pressed)" 컴포넌트 기준 */
export function MORUButton({ label, variant = 'primary', disabled, loading, ...rest }: MORUButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({ pressed }) => [(pressed || disabled || loading) && styles.dimmed]}
      {...rest}>
      <ThemedView
        type={variant === 'primary' ? 'brand' : 'surfaceCard'}
        style={[
          styles.container,
          variant === 'secondary' && { borderWidth: 1, borderColor: theme.brand },
          variant === 'primary' && styles.primaryShadow,
        ]}>
        <View style={styles.labelRow}>
          {loading ? (
            <ActivityIndicator
              size="small"
              color={variant === 'primary' ? theme.textOnBrand : theme.textSecondary}
            />
          ) : null}
          <ThemedText
            type="button"
            themeColor={variant === 'primary' ? 'textOnBrand' : 'textSecondary'}>
            {label}
          </ThemedText>
        </View>
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
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
