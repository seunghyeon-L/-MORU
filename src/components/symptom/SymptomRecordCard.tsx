import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { OVERALL_STATE_OPTIONS, SYMPTOM_TYPE_OPTIONS, type SymptomRecord } from '@/types/symptom';

export type SymptomRecordCardProps = {
  record: SymptomRecord;
  onPress?: () => void;
};

function labelOf<T extends { id: string; label: string }>(
  options: readonly T[],
  id: string,
): string {
  return options.find((option) => option.id === id)?.label ?? id;
}

/** 증상 기록 하나를 요약해서 보여주는 카드 */
export function SymptomRecordCard({ record, onPress }: SymptomRecordCardProps) {
  const theme = useTheme();

  // 눌림은 배경색으로만 표현한다. 래퍼 opacity 는 안드로이드에서
  // 겹친 레이어마다 알파가 따로 곱해져 카드와 글자의 색이 갈린다.
  const card = (background: string) => (
    <View style={[styles.container, { backgroundColor: background }]}>
      <ThemedText type="smallBold">{labelOf(OVERALL_STATE_OPTIONS, record.state)}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {record.recordedAt}
      </ThemedText>

      {record.detail ? (
        <ThemedText type="small" themeColor="textSecondary">
          {record.detail.symptoms
            .map((symptom) => labelOf(SYMPTOM_TYPE_OPTIONS, symptom))
            .join(', ')}
        </ThemedText>
      ) : null}
    </View>
  );

  if (!onPress) return card(theme.backgroundElement);

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => card(pressed ? theme.elementPressed : theme.backgroundElement)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.half,
  },
  _unusedPressed: {
  },
});
