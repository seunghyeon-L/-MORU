import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
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
  const body = (
    <ThemedView type="backgroundElement" style={styles.container}>
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
    </ThemedView>
  );

  if (!onPress) return body;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.half,
  },
  pressed: {
    opacity: 0.7,
  },
});
