import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { ThemeColor } from '@/constants/theme';

export type ChipProps = {
  label: string;
  selected?: boolean;
  /** 생략하면 선택 불가능한 표시용 칩이 된다 */
  onPress?: () => void;
  disabled?: boolean;
};

/**
 * 선택형 UI 전반에서 재사용하는 기본 칩. Figma pill 버튼 기준
 *
 * 누름·비활성을 opacity 로 표현하지 않는다. 바깥 Pressable 에 opacity 를 걸면
 * 안드로이드가 알파를 그리기 연산마다 따로 곱해서 칩 배경과 글자의 최종색이 어긋난다.
 * 색을 칠하는 View 가 하나뿐이도록 두고 그 View 의 배경색만 상태에 따라 바꾼다.
 */
export function Chip({ label, selected = false, onPress, disabled }: ChipProps) {
  const theme = useTheme();

  const backgroundFor = (pressed: boolean) => {
    if (disabled) return selected ? theme.brandDisabled : theme.surfaceDisabled;
    if (selected) return pressed ? theme.brandPressed : theme.brand;
    return pressed ? theme.surfacePressed : theme.surfaceCard;
  };

  /** 눌린 배경(surfacePressed) 위에서도 textSecondary 가 4.79:1 이라 글자색은 그대로 둔다 */
  // ★ 화살표 함수로 두고 children-as-function 안에서 부르면 안 된다.
  //   app.json 의 experiments.reactCompiler 가 켜져 있어서, 컴파일러가
  //   memo 블록을 재배치하면 선언 전에 참조되어 ReferenceError(TDZ) 가 난다.
  //   실제로 "labelColor is not defined" 로 화면이 죽었다. 값으로 계산해 둔다.
  const labelColor: ThemeColor = disabled
    ? 'textDisabled'
    : selected
      ? 'textOnBrand'
      : 'textSecondary';

  const content = (pressed: boolean) => (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: backgroundFor(pressed),
          borderColor: disabled ? theme.borderSubtle : selected ? theme.brand : theme.borderSubtle,
        },
      ]}>
      <ThemedText type="label" themeColor={labelColor}>
        {label}
      </ThemedText>
    </View>
  );

  if (!onPress) return content(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}>
      {({ pressed }) => content(pressed)}
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
});
