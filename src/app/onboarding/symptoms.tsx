import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomButton } from '@/components/common/BottomButton';
import { SelectionCard } from '@/components/common/SelectionCard';
import { ChoiceChip } from '@/components/onboarding/ChoiceChip';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { QuestionCard } from '@/components/onboarding/QuestionCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMoruData } from '@/hooks/useMoruData';
import { Spacing } from '@/constants/theme';
import { SYMPTOM_FREQUENCY_OPTIONS, type SymptomFrequency } from '@/types/onboarding';
import { SYMPTOM_TYPE_OPTIONS, type SymptomType } from '@/types/symptom';

const FREQUENCY_DESCRIPTIONS: Record<SymptomFrequency, string> = {
  rarely: '한 달에 1~2번',
  weekly: '주 1~2회',
  daily: '주 3회 이상',
};

/** B4 온보딩 · 증상 문진. 완료 시 온보딩 데이터를 저장하고 완료 화면(B6)으로 이동한다. */
export default function OnboardingSymptomsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateOnboarding, completeOnboarding } = useMoruData();

  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomType[]>([]);
  const [frequency, setFrequency] = useState<SymptomFrequency | undefined>(undefined);

  const toggleSymptom = (id: SymptomType) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((symptom) => symptom !== id) : [...prev, id],
    );
  };

  const handleNext = async () => {
    updateOnboarding({ usualSymptoms: selectedSymptoms, symptomFrequency: frequency });
    await completeOnboarding();
    router.push('/onboarding/complete');
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <ThemedView
        type="onboardingBackground"
        style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.content}>
          <OnboardingHeader step={4} />

          <View style={styles.headerSpacer} />

          <QuestionCard
            question={'평소 어떤 증상을\n겪으시나요?'}
            helperText="지금 상태를 기억해뒀다가, 나중에 얼마나 나아졌는지 보여드릴게요.">
            <View style={styles.chipWrap}>
              {SYMPTOM_TYPE_OPTIONS.map((option) => (
                <ChoiceChip
                  key={option.id}
                  option={option}
                  selected={selectedSymptoms.includes(option.id)}
                  onToggle={toggleSymptom}
                />
              ))}
            </View>
          </QuestionCard>

          <View style={styles.frequencySection}>
            <ThemedText type="label" themeColor="textPrimary">
              얼마나 자주 겪으세요?
            </ThemedText>
            <View style={styles.frequencyList}>
              {SYMPTOM_FREQUENCY_OPTIONS.map((option) => (
                <SelectionCard
                  key={option.id}
                  title={option.label}
                  description={FREQUENCY_DESCRIPTIONS[option.id]}
                  selected={frequency === option.id}
                  onPress={() => setFrequency(option.id)}
                />
              ))}
            </View>
          </View>

          <View style={styles.flex} />
        </View>

        <BottomButton label="다음" onPress={handleNext} />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  headerSpacer: {
    height: 8,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencySection: {
    marginTop: 26,
    gap: 10,
  },
  frequencyList: {
    gap: 8,
  },
  flex: {
    flex: 1,
    minHeight: 16,
  },
});
