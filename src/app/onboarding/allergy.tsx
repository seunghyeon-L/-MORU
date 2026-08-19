import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomButton } from '@/components/common/BottomButton';
import { ChoiceChip } from '@/components/onboarding/ChoiceChip';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { QuestionCard } from '@/components/onboarding/QuestionCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMoruData } from '@/hooks/useMoruData';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import {
  ALLERGY_OPTIONS,
  CELIAC_DIAGNOSIS_OPTIONS,
  type Allergy,
  type CeliacDiagnosis,
} from '@/types/onboarding';

/** B2 온보딩 · 알레르기 등록. 밀을 선택하면 셀리악병 진단 여부를 추가로 묻는다. */
export default function AllergyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { updateOnboarding } = useMoruData();

  const [selected, setSelected] = useState<Allergy[]>([]);
  const [celiac, setCeliac] = useState<CeliacDiagnosis | undefined>(undefined);
  const [etcText, setEtcText] = useState('');

  const toggle = (id: Allergy) => {
    setSelected((prev) => {
      let next: Allergy[];
      if (id === 'none') {
        next = prev.includes('none') ? [] : ['none'];
      } else {
        next = prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id];
        next = next.filter((a) => a !== 'none');
      }
      if (!next.includes('etc')) setEtcText('');
      return next;
    });
  };

  const showCeliacQuestion = selected.includes('wheat');
  const showEtcInput = selected.includes('etc');

  const handleNext = () => {
    updateOnboarding({
      allergies: selected,
      allergyEtcText: showEtcInput && etcText.trim() ? etcText.trim() : undefined,
      celiacDiagnosis: showCeliacQuestion ? celiac : undefined,
    });
    router.push('/onboarding/avoided-food');
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <ThemedView
        type="onboardingBackground"
        style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.content}>
          <OnboardingHeader step={2} />

          <View style={styles.headerSpacer} />

          <QuestionCard
            question={'알레르기가 있는\n음식이 있나요?'}
            helperText={'알레르기는 양과 상관없이 위험해서,\nMORU가 아예 추천하지 않아요.'}>
            <View style={styles.chipWrap}>
              {ALLERGY_OPTIONS.map((option) => (
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
                placeholder="알레르기가 있는 음식을 입력해주세요"
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

          {showCeliacQuestion ? (
            <ThemedView
              type="surfaceCard"
              style={[styles.celiacCard, { borderColor: theme.brand }]}>
              <ThemedText type="label" themeColor="textPrimary">
                셀리악병 진단을 받으신 적 있나요?
              </ThemedText>
              <ThemedText type="caption" themeColor="textMuted">
                진단받으셨다면 밀은 양과 무관하게 제외돼요.
              </ThemedText>
              <View style={styles.celiacOptions}>
                {CELIAC_DIAGNOSIS_OPTIONS.map((option) => {
                  const active = celiac === option.id;
                  return (
                    <Pressable
                      key={option.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      style={styles.celiacOptionPressable}
                      onPress={() => setCeliac(option.id)}>
                      <ThemedView
                        type={active ? 'brand' : 'onboardingBackground'}
                        style={styles.celiacOption}>
                        <ThemedText
                          type="caption"
                          themeColor={active ? 'textOnBrand' : 'textMuted'}>
                          {option.label}
                        </ThemedText>
                      </ThemedView>
                    </Pressable>
                  );
                })}
              </View>
            </ThemedView>
          ) : null}

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
  etcInput: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 13.5,
  },
  celiacCard: {
    marginTop: 24,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 12,
  },
  celiacOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  celiacOptionPressable: {
    flex: 1,
  },
  celiacOption: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 11,
  },
  flex: {
    flex: 1,
    minHeight: 16,
  },
});
