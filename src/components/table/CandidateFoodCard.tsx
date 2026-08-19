import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import type { MyTableFood } from '@/types/food';

export type CandidateFoodCardProps = {
  food: MyTableFood;
  /** "확인해보기" 버튼 탭 시 재도입 화면으로 이동 */
  onCheck?: () => void;
};

/**
 * "다시 먹어볼 음식" 카드.
 * 아직 재도입을 시작하지 않은 음식이며, 넘어가도 아무 불이익이 없다.
 */
export function CandidateFoodCard({ food, onCheck }: CandidateFoodCardProps) {
  const theme = useTheme();

  return (
    <ThemedView
      type="surfaceCard"
      style={[styles.container, { borderColor: theme.borderSubtle }]}>
      <View style={styles.texts}>
        <ThemedText type="label" themeColor="textPrimary">
          {food.name}
        </ThemedText>
        <ThemedText type="caption" themeColor="textMuted">
          아직 확인 전
        </ThemedText>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onCheck}
        style={({ pressed }) => pressed && styles.pressed}>
        <ThemedView type="brandSoft" style={styles.checkButton}>
          <ThemedText type="label" themeColor="brandText">
            확인해보기
          </ThemedText>
        </ThemedView>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
  },
  texts: {
    gap: 2,
  },
  checkButton: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.three,
    borderRadius: 999,
  },
  pressed: {
    opacity: 0.7,
  },
});
