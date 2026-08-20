import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { SEVERITY_VALUES, type Severity } from '@/types/symptom';

export type SeveritySelectorProps = {
  value?: Severity;
  onChange: (value: Severity) => void;
  /** 양끝 라벨 */
  minLabel?: string;
  maxLabel?: string;
};

/**
 * 불편함 정도 1~9 선택.
 * 사용자를 평가하는 점수가 아니라 그날의 느낌을 남기는 값이다.
 */
export function SeveritySelector({
  value,
  onChange,
  minLabel = '조금 불편해요',
  maxLabel = '많이 불편해요',
}: SeveritySelectorProps) {
  const theme = useTheme();

  /**
   * 누름을 opacity 로 표현하지 않는다. 안드로이드는 알파를 그리기 연산마다 따로 곱해서
   * 래퍼에 opacity 를 걸면 그 안의 불투명한 숫자 원과 글자의 최종색이 어긋난다.
   * 대신 원 자신의 배경색을 바꾼다. 안 고른 원의 평상 배경(backgroundElement)은
   * 이미 회색이라 surfacePressed 로는 1.09:1 뿐이라 elementPressed 를 쓴다(1.22:1).
   */
  const backgroundFor = (selected: boolean, pressed: boolean) => {
    if (selected) return pressed ? theme.brandPressed : theme.brand;
    return pressed ? theme.elementPressed : theme.backgroundElement;
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.scale}>
        {SEVERITY_VALUES.map((level) => (
          <Pressable
            key={level}
            accessibilityRole="button"
            accessibilityState={{ selected: value === level }}
            onPress={() => onChange(level)}
            style={styles.item}>
            {({ pressed }) => (
              /*
                선택됐을 때 brand 로 채운다. 바로 옆 IntensityToggle 과 같은 방식이다.

                전에는 backgroundSelected(#E0E1E6) ← backgroundElement(#F0F0F3) 였다.
                둘 다 Expo 템플릿의 기본 회색이고 대비비가 1.15:1 이라
                **골랐는지 안 골랐는지 눈으로 구분이 안 됐다.**
                다른 화면은 전부 흰색 → 브랜드 초록으로 바뀌는데 여기만 회색이었다.
              */
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: backgroundFor(value === level, pressed),
                    borderColor: value === level ? theme.brand : theme.borderSubtle,
                  },
                ]}>
                {/* 눌린 배경 위에서 textSecondary 는 4.27:1 이라 textPrimary 로 올린다 */}
                <ThemedText
                  type="small"
                  themeColor={
                    value === level ? 'textOnBrand' : pressed ? 'textPrimary' : 'textSecondary'
                  }>
                  {level}
                </ThemedText>
              </View>
            )}
          </Pressable>
        ))}
      </ThemedView>

      <ThemedView style={styles.labels}>
        <ThemedText type="small" themeColor="textSecondary">
          {minLabel}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {maxLabel}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  scale: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  item: {
    flex: 1,
  },
  dot: {
    aspectRatio: 1,
    borderRadius: Spacing.five,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
