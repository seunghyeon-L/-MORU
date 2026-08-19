import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

/** 카드형 체크리스트 항목. Figma "안전 확인" 화면 기준 */
export function Checkbox({ label, checked, onChange, disabled }: CheckboxProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={({ pressed }) => (pressed || disabled) && styles.dimmed}>
      <ThemedView
        type="surfaceCard"
        style={[
          styles.container,
          { borderColor: checked ? theme.brand : theme.brandLight },
        ]}>
        <ThemedView
          type={checked ? 'brand' : 'brandSoft'}
          style={[styles.box, { borderColor: checked ? theme.brand : theme.brandLight }]}>
          {checked ? (
            <ThemedText type="label" themeColor="textOnBrand">
              {'✓'}
            </ThemedText>
          ) : null}
        </ThemedView>
        <ThemedText type="bodyS" themeColor="textPrimary">
          {label}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: Spacing.three,
    borderRadius: 15,
    borderWidth: 1,
    shadowColor: '#3B332B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimmed: {
    opacity: 0.6,
  },
});
