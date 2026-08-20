import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { SYMPTOM_INTENSITY_OPTIONS, type SymptomIntensity } from '@/types/symptom';

export type IntensityToggleProps = {
  title: string;
  value?: SymptomIntensity;
  onChange: (value: SymptomIntensity) => void;
};

/** "배가 빵빵함" 같은 항목 하나에 대한 없음·조금·많이 3단계 선택 카드 */
export function IntensityToggle({ title, value, onChange }: IntensityToggleProps) {
  const theme = useTheme();

  /**
   * 누름을 opacity 로 표현하지 않는다. 안드로이드는 오프스크린 합성을 하지 않고
   * 알파를 그리기 연산마다 따로 곱해서, 래퍼에 opacity 를 걸면 그 안의 불투명한 알약 배경과
   * 카드의 elevation 그림자가 서로 다른 알파로 그려져 이음매가 보인다.
   * 대신 알약 자신의 배경색을 바꾼다.
   *
   * 안 고른 알약의 평상 배경(backgroundElement)은 이미 회색이라
   * surfacePressed 로는 휘도비 1.09:1 에 그친다. 한 단 더 내린 elementPressed 를 쓴다(1.22:1).
   */
  const backgroundFor = (selected: boolean, pressed: boolean) => {
    if (selected) return pressed ? theme.brandPressed : theme.brand;
    return pressed ? theme.elementPressed : theme.backgroundElement;
  };

  return (
    <ThemedView type="surfaceCard" style={styles.card}>
      <ThemedText type="label" themeColor="textPrimary">
        {title}
      </ThemedText>
      <View style={styles.row}>
        {SYMPTOM_INTENSITY_OPTIONS.map((option) => {
          const selected = value === option.id;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.id)}
              style={styles.item}>
              {({ pressed }) => (
                <View
                  style={[
                    styles.pill,
                    {
                      backgroundColor: backgroundFor(selected, pressed),
                      borderColor: selected ? theme.brand : theme.borderSubtle,
                    },
                  ]}>
                  {/* 눌린 배경 위에서 textSecondary 는 4.27:1 이라 textPrimary 로 올린다 */}
                  <ThemedText
                    type="label"
                    themeColor={selected ? 'textOnBrand' : pressed ? 'textPrimary' : 'textSecondary'}>
                    {option.label}
                  </ThemedText>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
    shadowColor: '#3B332B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  item: {
    flex: 1,
  },
  pill: {
    paddingVertical: 10,
    borderRadius: Spacing.two,
    borderWidth: 1,
    alignItems: 'center',
  },
});
