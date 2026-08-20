import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomButton } from '@/components/common/BottomButton';
import { SelectionCard } from '@/components/common/SelectionCard';
import { ChoiceChip } from '@/components/onboarding/ChoiceChip';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { QuestionCard } from '@/components/onboarding/QuestionCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMoruData } from '@/hooks/useMoruData';
import { useTheme } from '@/hooks/use-theme';
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
  const theme = useTheme();
  const { updateOnboarding, completeOnboarding } = useMoruData();

  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomType[]>([]);
  const [frequency, setFrequency] = useState<SymptomFrequency | undefined>(undefined);
  const [etcText, setEtcText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [postError, setPostError] = useState(false);

  const toggleSymptom = (id: SymptomType) => {
    // 부수효과를 updater 밖으로 뺀 이유는 allergy 화면의 toggle 주석을 참고
    const next = selectedSymptoms.includes(id)
      ? selectedSymptoms.filter((symptom) => symptom !== id)
      : [...selectedSymptoms, id];
    setSelectedSymptoms(next);
    // 칩을 풀면 적어둔 내용도 같이 지운다 (allergy·avoided-food 화면과 같은 방식)
    if (!next.includes('etc')) setEtcText('');
  };

  const showEtcInput = selectedSymptoms.includes('etc');

  /*
    빈도를 필수로 거는 이유는 미응답이 조용히 답으로 굳기 때문이다.
    안 고르고 넘기면 서버 기본값이 대신 들어가는데, 그 값은 이 화면의 세 선택지
    어느 것으로도 만들 수 없다. 즉 미응답에만 붙는 상태가 기준선으로 남는다.

    반대로 증상 선택은 필수로 걸지 않는다.
    이 목록에는 allergy·avoided-food 와 달리 '없어요' 칩이 없다.
    필수로 걸면 겪는 증상이 없는 사람은 아무거나 눌러야 넘어갈 수 있는데,
    빈 목록은 정직하지만 지어낸 증상은 기준선을 망친다.
  */
  const etcFilled = !showEtcInput || etcText.trim().length > 0;
  const canProceed = frequency !== undefined && etcFilled;

  const handleNext = async () => {
    if (!canProceed || submitting) return;

    setSubmitting(true);
    setPostError(false);
    updateOnboarding({
      usualSymptoms: selectedSymptoms,
      usualSymptomEtcText: showEtcInput && etcText.trim() ? etcText.trim() : undefined,
      symptomFrequency: frequency,
    });

    try {
      await completeOnboarding();
      router.push('/onboarding/complete');
    } catch (err) {
      // 전에는 여기서 던진 예외가 콘솔로만 갔다.
      // 사용자 눈에는 버튼을 눌러도 아무 일도 안 일어나는 화면이었다.
      // eslint-disable-next-line no-console
      console.error('[B4] POST /onboarding/profile failed:', err);
      setPostError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // 키보드 처리 이유는 allergy 화면의 같은 자리 주석을 참고
    <KeyboardAvoidingView
      style={styles.keyboardAvoider}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentInsetAdjustmentBehavior="never">
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

              {/*
                '기타' 칩은 원래부터 있었는데 적을 곳이 없었다.
                고르면 기록에는 "기타" 한 줄만 남고 무슨 증상인지는 사라졌다.
              */}
              {showEtcInput ? (
                <TextInput
                  value={etcText}
                  onChangeText={setEtcText}
                  placeholder="어떤 증상인지 입력해주세요"
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

              {/* 화면에 들어오자마자가 아니라 '기타' 를 고른 뒤 아직 비어 있을 때만 보인다 */}
              {showEtcInput && !etcFilled ? (
                <ThemedText type="caption" themeColor="textMuted" style={styles.hint}>
                  적어주시면 그 증상도 함께 지켜볼게요. 여러 개면 쉼표로 나눠 적어주세요.
                </ThemedText>
              ) : null}
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

              {/*
                '다음' 이 비활성인 이유를 여기서 말한다.
                증상 칩은 필수가 아닌데 그걸 모르면 칩만 고르다 막힌 것처럼 느낀다.
                그래서 막는 조건과 막지 않는 조건을 한 문장에 같이 둔다.
              */}
              {frequency === undefined ? (
                <ThemedText type="caption" themeColor="textMuted">
                  빈도만 하나 골라주시면 다음으로 넘어가요. 증상은 안 고르셔도 괜찮아요.
                </ThemedText>
              ) : null}
            </View>

            {postError ? (
              <ThemedText type="bodyS" themeColor="textSecondary" style={styles.errorText}>
                전송에 실패했어요. 잠시 후 다시 시도해주세요.
              </ThemedText>
            ) : null}

            <View style={styles.flex} />
          </View>

          <BottomButton
            label="다음"
            disabled={!canProceed}
            loading={submitting}
            onPress={handleNext}
          />
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoider: {
    flex: 1,
  },
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
  hint: {
    marginTop: 6,
  },
  frequencySection: {
    marginTop: 26,
    gap: 10,
  },
  frequencyList: {
    gap: 8,
  },
  errorText: {
    paddingTop: Spacing.three,
  },
  flex: {
    flex: 1,
    minHeight: 16,
  },
});
