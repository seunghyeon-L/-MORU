import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export type SelectionCardProps = {
  title: string;
  description?: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  /** 카드 왼쪽에 붙일 요소. 생략하면 기본 라디오 점을 그린다 */
  accessory?: ReactNode;
};

/** 칩보다 큰 선택지를 세로로 나열할 때 쓰는 카드. Figma "증상 빈도" 카드 기준 */
export function SelectionCard({
  title,
  description,
  selected = false,
  onPress,
  disabled,
  accessory,
}: SelectionCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => (pressed || disabled) && styles.dimmed}>
      <ThemedView
        type="surfaceCard"
        style={[
          styles.container,
          { borderColor: selected ? theme.brand : theme.borderSubtle, borderWidth: selected ? 1.5 : 1 },
        ]}>
        {accessory ?? (
          <View
            style={[
              styles.radio,
              { borderColor: selected ? theme.brand : theme.borderSubtle },
              selected && { backgroundColor: theme.brand },
            ]}
          />
        )}
        <ThemedView type="surfaceCard" style={styles.texts}>
          <ThemedText type="label" themeColor="textPrimary">
            {title}
          </ThemedText>
          {description ? (
            <ThemedText type="caption" themeColor="textMuted">
              {description}
            </ThemedText>
          ) : null}
        </ThemedView>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: Spacing.three,
    borderRadius: 15,
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  dimmed: {
    opacity: 0.6,
  },
});
