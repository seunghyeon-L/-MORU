import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
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
            <ThemedView
              type={value === level ? 'backgroundSelected' : 'backgroundElement'}
              style={styles.dot}>
              <ThemedText type="small" themeColor={value === level ? 'text' : 'textSecondary'}>
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
