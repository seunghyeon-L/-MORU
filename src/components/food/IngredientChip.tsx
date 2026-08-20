import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { ThemeColor } from '@/constants/theme';
import type { Ingredient } from '@/types/food';

export type IngredientChipProps = {
  ingredient: Ingredient;
  selected?: boolean;
  onPress?: () => void;
};

/**
 * 음식에 포함된 재료 하나를 나타내는 칩.
 * Figma D2 "재료 확인" 화면 기준 — 선택 시 체크 표시 + 연한 배경으로 구분한다.
 *
 * 누름은 opacity 가 아니라 칩 자신의 배경색으로 표현한다.
 * 안드로이드에서 래퍼 opacity 는 겹친 불투명 레이어마다 알파가 따로 곱해져 이음매를 만든다.
 */
export function IngredientChip({ ingredient, selected = false, onPress }: IngredientChipProps) {
  const theme = useTheme();

  /**
   * 선택된 칩의 평상 배경(brandSoft)은 이미 톤이 깔려 있어
   * surfacePressed 로는 눌린 게 보이지 않는다(라이트 1.11:1). 한 단 더 내린 elementPressed 를 쓴다.
   */
  const backgroundFor = (pressed: boolean) => {
    if (selected) return pressed ? theme.elementPressed : theme.brandSoft;
    return pressed ? theme.surfacePressed : theme.surfaceCard;
  };

  /**
   * 고른 칩의 이름은 textPrimary 로 쓴다.
   *
   * brandText 로 두면 brandSoft 위에서 5.15:1 이라 안 고른 칩(흰 배경 + textSecondary, 5.94:1)보다
   * 흐려서 **고른 쪽이 더 안 보이는 역전**이 났다. 초록은 앞의 체크 표시와 테두리가 맡는다.
   * (고른 칩은 눌리면 배경이 elementPressed 까지 내려가는데, 거기서 brandText 는 4.13:1 로 AA 미달이기도 하다.)
   */
  // ★ 화살표 함수로 두고 children-as-function 안에서 부르면 안 된다.
  //   app.json 의 experiments.reactCompiler 가 켜져 있어서, 컴파일러가
  //   memo 블록을 재배치하면 선언 전에 참조되어 ReferenceError(TDZ) 가 난다.
  //   실제로 "labelColor is not defined" 로 화면이 죽었다. 값으로 계산해 둔다.
  const labelColor: ThemeColor = selected ? 'textPrimary' : 'textSecondary';

  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress}>
      {({ pressed }) => (
        <View
          style={[
            styles.chip,
            {
              backgroundColor: backgroundFor(pressed),
              borderColor: selected ? theme.brand : theme.borderSubtle,
            },
          ]}>
          {/* 체크 표시만 초록으로 남긴다. 아이콘이라 3:1(비텍스트 기준)이면 되고
              눌린 배경 위에서도 4.13:1 이 나온다 */}
          {selected ? (
            <ThemedText type="label" themeColor={pressed ? 'textPrimary' : 'brandText'}>
              {'✓ '}
            </ThemedText>
          ) : null}
          <ThemedText type="label" themeColor={labelColor}>
            {ingredient.name}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 999,
    borderWidth: 1,
  },
});
