import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export type CheckboxTone = 'brand' | 'coral';

export type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** 'coral' — 혈변 등 위험 신호처럼 색으로 주의를 끌어야 하는 항목에 사용 */
  tone?: CheckboxTone;
};

/** 카드형 체크리스트 항목. Figma "안전 확인" 화면 기준 */
export function Checkbox({ label, checked, onChange, disabled, tone = 'brand' }: CheckboxProps) {
  const theme = useTheme();
  const accentColor = tone === 'coral' ? theme.coral : checked ? theme.brand : theme.brandLight;
  const softBackground = tone === 'coral' ? 'coralLight' : 'brandSoft';
  const fillBackground = tone === 'coral' ? 'coral' : 'brand';

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={({ pressed }) => (pressed || disabled) && styles.dimmed}>
      <ThemedView
        type={checked ? softBackground : 'surfaceCard'}
        style={[styles.container, { borderColor: accentColor }]}>
        <ThemedView
          type={checked ? fillBackground : 'surfaceCard'}
          style={[styles.box, { borderColor: accentColor }]}>
          {checked ? (
            <ThemedText type="label" themeColor="textOnBrand">
              {'✓'}
            </ThemedText>
          ) : null}
        </ThemedView>
        <ThemedText
          type="bodyS"
          themeColor={checked ? (tone === 'coral' ? 'textPrimary' : 'brandText') : 'textPrimary'}>
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
