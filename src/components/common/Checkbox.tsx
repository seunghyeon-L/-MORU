import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { type ThemeColor, Spacing } from '@/constants/theme';

export type CheckboxTone = 'brand' | 'coral';

export type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** 'coral' — 혈변 등 위험 신호처럼 색으로 주의를 끌어야 하는 항목에 사용 */
  tone?: CheckboxTone;
};

/**
 * 카드형 체크리스트 항목. Figma "안전 확인" 화면 기준
 *
 * 누름·비활성을 opacity 로 표현하지 않는다. 예전에는 바깥 Pressable 에 opacity 0.6 을 걸고
 * 그 안에 불투명한 surfaceCard 카드(+elevation 1 그림자)와 또 하나의 불투명 체크박스를 겹쳤다.
 * 안드로이드는 오프스크린 합성을 하지 않고 알파를 그리기 연산마다 따로 곱하므로
 * 겹친 레이어와 그림자의 최종색이 제각각 어긋나 누르는 동안 이음매가 보였다.
 * 그래서 카드 View 하나의 배경색만 상태에 따라 바꾸고, 그림자는 평상시에만 준다.
 */
export function Checkbox({ label, checked, onChange, disabled, tone = 'brand' }: CheckboxProps) {
  const theme = useTheme();
  const accentColor = checked
    ? (tone === 'coral' ? theme.coral : theme.brand)
    : theme.borderSubtle;   // 안 체크는 옅은 선. 체크하면 브랜드색 2px 로 또렷해진다

  const backgroundFor = (pressed: boolean) => {
    if (disabled) return theme.surfaceDisabled;
    return pressed ? theme.surfacePressed : theme.surfaceCard;
  };

  /**
   * 라벨은 체크 여부와 상관없이 textPrimary 다.
   *
   * 전에는 체크하면 brandText 로 바뀌었는데 흰 카드 위에서 5.75:1 이라
   * 안 체크된 라벨(textPrimary 12.30:1)보다 오히려 흐렸다 — **고른 쪽이 더 안 보이는 역전**이다.
   * 초록은 2px 테두리와 채워진 체크박스가 이미 말해 준다.
   */
  // ★ 화살표 함수로 두고 children-as-function 안에서 부르면 안 된다.
  //   app.json 의 experiments.reactCompiler 가 켜져 있어서, 컴파일러가
  //   memo 블록을 재배치하면 선언 전에 참조되어 ReferenceError(TDZ) 가 난다.
  //   실제로 "labelColor is not defined" 로 화면이 죽었다. 값으로 계산해 둔다.
  const labelColor: ThemeColor = disabled ? 'textDisabled' : 'textPrimary';

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}>
      {({ pressed }) => (
        /*
          체크돼도 카드 배경은 흰색(surfaceCard)을 유지한다.

          전에는 체크하면 brandSoft(#EDF4F0)로 바뀌었는데,
          온보딩 페이지 배경이 #F1F6F1 이라 거의 같은 색이다.
          그래서 체크하는 순간 카드가 배경에 묻혀 오히려 안 보였다.
          가시성을 높이려던 게 반대로 작동한 것이다.

          대신 테두리를 브랜드색 2px 로 세우고 체크박스를 채운다.
          페이지 배경이 무슨 색이든 대비가 유지된다.
        */
        <View
          style={[
            styles.container,
            {
              backgroundColor: backgroundFor(pressed),
              borderColor: disabled ? theme.borderSubtle : accentColor,
              borderWidth: checked ? 2 : 1,
            },
            // 그림자는 떠 있을 때만. 누른 카드는 가라앉는 편이 자연스럽다
            !pressed && !disabled && styles.raised,
          ]}>
          {/*
            안 체크된 상태의 체크박스 안쪽은 칠하지 않는다.
            surfaceCard 로 칠해 두면 눌려서 카드 배경이 바뀌는 순간
            체크박스 자리만 흰 사각형으로 남아 이음매가 된다.
          */}
          <View
            style={[
              styles.box,
              {
                borderColor: disabled ? theme.borderSubtle : accentColor,
                backgroundColor: checked ? accentColor : 'transparent',
              },
            ]}>
            {checked ? (
              <ThemedText type="label" themeColor="textOnBrand">
                {'✓'}
              </ThemedText>
            ) : null}
          </View>
          <ThemedText type="bodyS" themeColor={labelColor}>
            {label}
          </ThemedText>
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
    paddingVertical: 12,
    paddingHorizontal: Spacing.three,
    borderRadius: 15,
    borderWidth: 1,
  },
  raised: {
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
});
