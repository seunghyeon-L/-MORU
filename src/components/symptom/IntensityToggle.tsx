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
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
              <ThemedView
                type={selected ? 'brand' : 'backgroundElement'}
                style={[styles.pill, { borderColor: selected ? theme.brand : theme.borderSubtle }]}>
                <ThemedText type="label" themeColor={selected ? 'textOnBrand' : 'textSecondary'}>
                  {option.label}
                </ThemedText>
              </ThemedView>
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
  pressed: {
    opacity: 0.7,
  },
});
