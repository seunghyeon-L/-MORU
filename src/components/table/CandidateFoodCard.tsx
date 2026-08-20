import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import type { MyTableItem } from '@/types/food';

export type CandidateFoodCardProps = {
  food: MyTableItem;
  /** "확인해보기" 버튼 탭 시 재도입 화면으로 이동 */
  onCheck?: () => void;
};

/**
 * "다시 먹어볼 음식" 카드.
 * 아직 재도입을 시작하지 않은 음식이며, 넘어가도 아무 불이익이 없다.
 * note/버튼 문구는 서버(GET /mytable, action.label)가 준 값을 그대로 쓴다.
 */
export function CandidateFoodCard({ food, onCheck }: CandidateFoodCardProps) {
  const theme = useTheme();
  // children-as-function 안에서는 food.action 의 좁히기가 풀린다. 밖에서 잡아둔다.
  const action = food.action;

  return (
    <ThemedView
      type="surfaceCard"
      style={[styles.container, { borderColor: theme.borderSubtle }]}>
      <View style={styles.texts}>
        <ThemedText type="label" themeColor="textPrimary">
          {food.label}
        </ThemedText>
        {food.note ? (
          <ThemedText type="caption" themeColor="textMuted">
            {food.note}
          </ThemedText>
        ) : null}
      </View>

      {action ? (
        <Pressable accessibilityRole="button" onPress={onCheck}>
          {({ pressed }) => (
            // 눌림을 래퍼 opacity 로 표현하면 안드로이드에서 이음매가 보인다.
            // HWUI 가 오프스크린 합성 없이 알파를 그리기 연산마다 개별로 곱해서,
            // 겹친 불투명 레이어(알약 배경 · 그 위 글자)의 최종색이 서로 갈린다.
            // 색을 칠하는 View 자신의 배경을 바꾸면 레이어가 하나뿐이라 갈릴 것이 없다.
            <View
              style={[
                styles.checkButton,
                { backgroundColor: pressed ? theme.elementPressed : theme.brandSoft },
              ]}>
              <ThemedText type="label" themeColor="brandText">
                {action.label}
              </ThemedText>
            </View>
          )}
        </Pressable>
      ) : null}
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
  _unusedPressed: {
  },
});
