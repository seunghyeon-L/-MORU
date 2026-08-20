import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, type ThemeColor } from '@/constants/theme';

export type MORUButtonVariant = 'primary' | 'secondary' | 'ghost';

export type MORUButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: MORUButtonVariant;
  disabled?: boolean;
  /**
   * 서버를 기다리는 중.
   *
   * 챗봇·사진 식별은 2~5초가 걸리는데 그동안 화면이 그대로였다.
   * 눌렀는데 아무 반응이 없으면 사용자는 고장난 줄 알고 다시 누른다.
   */
  loading?: boolean;
};

/**
 * 앱 전반에서 쓰는 기본 버튼. Figma "Button (auto-pressed)" 컴포넌트 기준
 *
 * 누름·비활성을 opacity 로 표현하지 않는다. 예전에는 바깥 Pressable 에 opacity 0.6 을
 * 걸었는데, 안드로이드는 오프스크린 합성을 하지 않고(ReactViewGroup 의
 * needsOffscreenAlphaCompositing 기본값이 false) 알파를 그리기 연산마다 따로 곱한다.
 * 그래서 배경·그림자·글자 레이어의 최종 알파가 제각각이 되어 눌린 동안
 * 글자 주변에 밝은 사각형이 떠 보였다. 웹(react-native-web)은 CSS 그룹 불투명도라
 * 균일하게 흐려져서 이 현상이 재현되지 않는다.
 *
 * 대신 색을 칠하는 View 하나의 backgroundColor 를 직접 바꾼다.
 * 상태를 아는 곳과 색을 칠하는 곳이 같은 View 여야 이음매가 생기지 않는다.
 */
export function MORUButton({ label, variant = 'primary', disabled, loading, ...rest }: MORUButtonProps) {
  const theme = useTheme();
  const inactive = disabled || loading;

  const backgroundFor = (pressed: boolean) => {
    if (variant === 'primary') {
      if (inactive) return theme.brandDisabled;
      return pressed ? theme.brandPressed : theme.brand;
    }
    /**
     * ghost 는 배경을 칠하지 않는다. 예전에는 surfaceCard 로 칠해져서
     * 온보딩 배경(#F1F6F1) 위에 "건너뛰기" 가 흰 카드로 떠 있었다.
     *
     * 누를 때는 surfacePressed 가 아니라 elementPressed 를 쓴다 —
     * ghost 아래에 깔린 건 흰 카드가 아니라 온보딩 배경이라
     * surfacePressed 로는 휘도비가 1.13:1 에 그쳐 눌린 게 보이지 않았다(elementPressed 는 1.27:1).
     */
    if (variant === 'ghost') {
      if (inactive) return 'transparent';
      return pressed ? theme.elementPressed : 'transparent';
    }
    if (inactive) return theme.surfaceDisabled;
    return pressed ? theme.surfacePressed : theme.surfaceCard;
  };

  /**
   * 비활성은 흐리게가 아니라 글자색을 낮춰서 알린다.
   *
   * ghost 는 누르는 동안 배경이 elementPressed(#CCDFD5)까지 내려가는데
   * 그 위에서 brandText 는 4.13:1 로 AA 미달이라 textPrimary 로 올린다.
   * secondary 의 눌림 배경(surfacePressed)은 한 단만 내려가 textSecondary 로도 4.79:1 이 나온다 —
   * 누를 때마다 글자색까지 바뀌면 오히려 산만해서 그대로 둔다.
   */
  // ★ 화살표 함수로 두고 children-as-function 안에서 부르면 안 된다.
  //   app.json 의 experiments.reactCompiler 가 켜져 있어서, 컴파일러가
  //   memo 블록을 재배치하면 선언 전에 참조되어 ReferenceError(TDZ) 가 난다.
  //   실제로 "labelColor is not defined" 로 화면이 죽었다. 값으로 계산해 둔다.
  const labelBase: ThemeColor = inactive
    ? 'textDisabled'
    : variant === 'primary'
      ? 'textOnBrand'
      : variant === 'ghost'
        ? 'brandText'
        : 'textSecondary';
  const labelPressed: ThemeColor =
    !inactive && variant === 'ghost' ? 'textPrimary' : labelBase;

  /**
   * ghost 도 테두리를 준다. 배경이 투명이라 테두리가 없으면 버튼이 아니라 그냥 문구로 보인다.
   * 실제로 '홈으로'(analysis/index.tsx)가 온보딩 배경 위에서 안내 문구와 구별되지 않았다.
   * brand(#9BBFAE)는 그 배경과 1.84:1 이라 선이 보이지 않아 brandText(5.26:1)로 긋는다.
   */
  const borderFor = (): string | undefined => {
    if (variant === 'primary') return undefined;
    if (inactive) return theme.borderSubtle;
    return variant === 'ghost' ? theme.brandText : theme.brand;
  };

  const borderColor = borderFor();

  return (
    <Pressable accessibilityRole="button" disabled={inactive} {...rest}>
      {({ pressed }) => (
        <View
          style={[
            styles.container,
            { backgroundColor: backgroundFor(pressed) },
            // primary 는 테두리가 없지만 두께는 1 로 맞춰 둔다.
            // BottomButton 처럼 primary 와 ghost 를 같은 줄에 놓을 때 높이가 2px 어긋나기 때문이다.
            // 투명 테두리 아래로는 배경이 그대로 칠해져 보이는 결과는 같다.
            { borderWidth: 1, borderColor: borderColor ?? 'transparent' },
            // 그림자는 떠 있을 때만. 누르면 가라앉는 편이 자연스럽고,
            // elevation 과 배경이 겹쳐 생기던 합성 간섭도 함께 없어진다.
            variant === 'primary' && !pressed && !inactive && styles.primaryShadow,
          ]}>
          <View style={styles.labelRow}>
            {loading ? <ActivityIndicator size="small" color={theme.textDisabled} /> : null}
            <ThemedText type="button" themeColor={pressed ? labelPressed : labelBase}>
              {label}
            </ThemedText>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  primaryShadow: {
    shadowColor: '#5C6B47',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 2,
  },
});
