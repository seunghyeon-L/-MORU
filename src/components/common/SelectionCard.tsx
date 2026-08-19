import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export type SelectionCardProps = {
  title: string;
  description?: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  /** 카드 오른쪽에 붙일 요소 (체크 표시 등) */
  accessory?: ReactNode;
};

/** 칩보다 큰 선택지를 세로로 나열할 때 쓰는 카드 */
export function SelectionCard({
  title,
  description,
  selected = false,
  onPress,
  disabled,
  accessory,
}: SelectionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => (pressed || disabled) && styles.dimmed}>
      <ThemedView
        type={selected ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.container}>
        <ThemedView type={selected ? 'backgroundSelected' : 'backgroundElement'} style={styles.texts}>
          <ThemedText type="smallBold">{title}</ThemedText>
          {description ? (
            <ThemedText type="small" themeColor="textSecondary">
              {description}
            </ThemedText>
          ) : null}
        </ThemedView>
        {accessory}
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  texts: {
    flex: 1,
    gap: Spacing.half,
  },
  dimmed: {
    opacity: 0.6,
  },
});
