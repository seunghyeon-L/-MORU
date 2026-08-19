import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export type ChipProps = {
  label: string;
  selected?: boolean;
  /** 생략하면 선택 불가능한 표시용 칩이 된다 */
  onPress?: () => void;
  disabled?: boolean;
};

/** 선택형 UI 전반에서 재사용하는 기본 칩 */
export function Chip({ label, selected = false, onPress, disabled }: ChipProps) {
  const content = (
    <ThemedView type={selected ? 'backgroundSelected' : 'backgroundElement'} style={styles.chip}>
      <ThemedText type="small" themeColor={selected ? 'text' : 'textSecondary'}>
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
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
  dimmed: {
    opacity: 0.6,
  },
});
