import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
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

/**
 * 칩보다 큰 선택지를 세로로 나열할 때 쓰는 카드. Figma "증상 빈도" 카드 기준
 *
 * 누름·비활성을 opacity 로 표현하지 않는다. 예전에는 바깥 Pressable 에 opacity 0.6 을 걸고
 * 그 안에 불투명한 surfaceCard 카드를, 다시 그 안에 **글자만 감싸는 또 하나의 불투명
 * surfaceCard** 를 겹쳐 칠했다. 안드로이드는 오프스크린 합성을 하지 않고
 * (ReactViewGroup 의 needsOffscreenAlphaCompositing 기본값이 false)
 * 알파를 그리기 연산마다 따로 곱하므로, 겹친 두 불투명 레이어의 최종색이 어긋나
 * 누르는 동안 **글자를 감싼 밝은 사각형**이 카드 안에 떠 보였다.
 * 웹(react-native-web)은 CSS 그룹 불투명도라 이 현상이 재현되지 않는다.
 *
 * 그래서 배경을 칠하는 View 는 카드 하나뿐이고, 상태에 따라 그 View 의 색만 바꾼다.
 * 글자를 감싸던 ThemedView 는 배경 없는 View 로 내렸다 — 배치만 하던 자리였다.
 */
export function SelectionCard({
  title,
  description,
  selected = false,
  onPress,
  disabled,
  accessory,
}: SelectionCardProps) {
  const theme = useTheme();

  const backgroundFor = (pressed: boolean) => {
    if (disabled) return theme.surfaceDisabled;
    return pressed ? theme.surfacePressed : theme.surfaceCard;
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled || !onPress}
      onPress={onPress}>
      {({ pressed }) => (
        <View
          style={[
            styles.container,
            {
              backgroundColor: backgroundFor(pressed),
              borderColor: selected ? theme.brand : theme.borderSubtle,
              borderWidth: selected ? 1.5 : 1,
            },
          ]}>
          {accessory ?? (
            <View
              style={[
                styles.radio,
                { borderColor: selected ? theme.brand : theme.borderSubtle },
                // 비활성 카드에서도 고른 자리는 남긴다. 다만 채움색은 한 단 낮춘다
                selected && { backgroundColor: disabled ? theme.brandDisabled : theme.brand },
              ]}
            />
          )}
          <View style={styles.texts}>
            <ThemedText type="label" themeColor={disabled ? 'textDisabled' : 'textPrimary'}>
              {title}
            </ThemedText>
            {description ? (
              <ThemedText type="caption" themeColor={disabled ? 'textDisabled' : 'textMuted'}>
                {description}
              </ThemedText>
            ) : null}
          </View>
        </View>
      )}
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
});
