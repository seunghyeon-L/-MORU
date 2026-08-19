import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';

export type ChipProps = {
  label: string;
  selected?: boolean;
  /** 생략하면 선택 불가능한 표시용 칩이 된다 */
  onPress?: () => void;
  disabled?: boolean;
};

/** 선택형 UI 전반에서 재사용하는 기본 칩. Figma pill 버튼 기준 */
export function Chip({ label, selected = false, onPress, disabled }: ChipProps) {
  const theme = useTheme();

  const content = (
    <ThemedView
      type="surfaceCard"
      style={[styles.chip, { borderColor: selected ? theme.brand : theme.borderSubtle }]}>
      <ThemedText type="label" themeColor={selected ? 'textPrimary' : 'textSecondary'}>
        {label}
      </ThemedText>
    </ThemedView>
  );

  if (!onPress) return content;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => (pressed || disabled) && styles.dimmed}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 999,
    borderWidth: 1,
  },
  dimmed: {
    opacity: 0.6,
  },
});
