import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomButton } from '@/components/common/BottomButton';
import { ChoiceChip } from '@/components/onboarding/ChoiceChip';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { QuestionCard } from '@/components/onboarding/QuestionCard';
import { ThemedView } from '@/components/themed-view';
import { useMoruData } from '@/hooks/useMoruData';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { AVOIDED_FOOD_OPTIONS, type AvoidedFood } from '@/types/onboarding';

/** B3 온보딩 · 피하는 음식. 지금 떠오르는 것만 골라도 되는 다중 선택 화면 */
export default function AvoidedFoodScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { updateOnboarding } = useMoruData();
  const [selected, setSelected] = useState<AvoidedFood[]>([]);
  const [etcText, setEtcText] = useState('');

  const toggle = (id: AvoidedFood) => {
    setSelected((prev) => {
      const next = prev.includes(id) ? prev.filter((food) => food !== id) : [...prev, id];
      if (!next.includes('etc')) setEtcText('');
      return next;
    });
  };

  const showEtcInput = selected.includes('etc');

  const handleNext = () => {
    updateOnboarding({
      avoidedFoods: selected,
      avoidedFoodEtcText: showEtcInput && etcText.trim() ? etcText.trim() : undefined,
    });
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

            {showEtcInput ? (
              <TextInput
                value={etcText}
                onChangeText={setEtcText}
                placeholder="피하는 음식을 입력해주세요"
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.etcInput,
                  {
                    borderColor: theme.borderSubtle,
                    color: theme.textPrimary,
                    backgroundColor: theme.surfaceCard,
                  },
                ]}
              />
            ) : null}
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
  etcInput: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 13.5,
  },
  flex: {
    flex: 1,
    minHeight: 16,
  },
});
