import { Pressable, StyleSheet } from 'react-native';

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

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.scale}>
        {SEVERITY_VALUES.map((level) => (
          <Pressable
            key={level}
            accessibilityRole="button"
            accessibilityState={{ selected: value === level }}
            onPress={() => onChange(level)}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
            {/*
              선택됐을 때 brand 로 채운다. 바로 옆 IntensityToggle 과 같은 방식이다.

              전에는 backgroundSelected(#E0E1E6) ← backgroundElement(#F0F0F3) 였다.
              둘 다 Expo 템플릿의 기본 회색이고 대비비가 1.15:1 이라
              **골랐는지 안 골랐는지 눈으로 구분이 안 됐다.**
              다른 화면은 전부 흰색 → 브랜드 초록으로 바뀌는데 여기만 회색이었다.
            */}
            <ThemedView
              type={value === level ? 'brand' : 'backgroundElement'}
              style={[
                styles.dot,
                { borderColor: value === level ? theme.brand : theme.borderSubtle },
              ]}>
              <ThemedText
                type="small"
                themeColor={value === level ? 'textOnBrand' : 'textSecondary'}>
                {level}
              </ThemedText>
            </ThemedView>
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
  pressed: {
    opacity: 0.7,
  },
});
