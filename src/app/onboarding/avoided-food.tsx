import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomButton } from '@/components/common/BottomButton';
import { ChoiceChip } from '@/components/onboarding/ChoiceChip';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { QuestionCard } from '@/components/onboarding/QuestionCard';
import { ThemedView } from '@/components/themed-view';
import { useMoruData } from '@/hooks/useMoruData';
import { Spacing } from '@/constants/theme';
import { AVOIDED_FOOD_OPTIONS, type AvoidedFood } from '@/types/onboarding';

/** B3 온보딩 · 피하는 음식. 지금 떠오르는 것만 골라도 되는 다중 선택 화면 */
export default function AvoidedFoodScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateOnboarding } = useMoruData();
  const [selected, setSelected] = useState<AvoidedFood[]>([]);

  const toggle = (id: AvoidedFood) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((food) => food !== id) : [...prev, id]));
  };

  const handleNext = () => {
    updateOnboarding({ avoidedFoods: selected });
    router.push('/onboarding/symptoms');
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <ThemedView
        type="onboardingBackground"
        style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.content}>
          <OnboardingHeader step={3} />

          <View style={styles.headerSpacer} />

          <QuestionCard
            question={'요즘 피하고 계신\n음식이 있나요?'}
            helperText="지금 떠오르는 것만 골라주세요. 나중에 바꿀 수 있어요.">
            <View style={styles.chipWrap}>
              {AVOIDED_FOOD_OPTIONS.map((option) => (
                <ChoiceChip
                  key={option.id}
                  option={option}
                  selected={selected.includes(option.id)}
                  onToggle={toggle}
                />
              ))}
            </View>
          </QuestionCard>

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
    height: 10,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  flex: {
    flex: 1,
    minHeight: 16,
  },
});
