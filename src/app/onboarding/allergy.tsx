import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomButton } from '@/components/common/BottomButton';
import { ChoiceChip } from '@/components/onboarding/ChoiceChip';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { QuestionCard } from '@/components/onboarding/QuestionCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useKeyboardInset } from '@/hooks/use-keyboard-inset';
import { useMoruData } from '@/hooks/useMoruData';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import {
  ALLERGY_OPTIONS,
  CELIAC_DIAGNOSIS_OPTIONS,
  type Allergy,
  type CeliacDiagnosis,
} from '@/types/onboarding';

/**
 * '없어요' 는 나머지와 함께 고를 수 없다.
 * 상태를 건드리지 않고 다음 목록만 계산한다 — 부수효과는 호출부가 낸다.
 */
function nextAllergies(prev: readonly Allergy[], id: Allergy): Allergy[] {
  if (id === 'none') return prev.includes('none') ? [] : ['none'];
  const toggled = prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id];
  return toggled.filter((a) => a !== 'none');
}

/** B2 온보딩 · 알레르기 등록. 밀을 선택하면 셀리악병 진단 여부를 추가로 묻는다. */
export default function AllergyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { inset: keyboardInset, onLayout } = useKeyboardInset();
  const theme = useTheme();
  const { updateOnboarding } = useMoruData();

  const [selected, setSelected] = useState<Allergy[]>([]);
  const [celiac, setCeliac] = useState<CeliacDiagnosis | undefined>(undefined);
  const [etcText, setEtcText] = useState('');

  const toggle = (id: Allergy) => {
    /*
      계산을 updater 밖에서 끝내는 이유.

      전에는 setSelected 의 updater 안에서 setEtcText('') 를 불렀다.
      updater 는 순수해야 하고 React 가 다시 실행할 수 있다고 보는 함수라,
      그 안에 부수효과를 두면 재실행될 때 같이 다시 난다.
      (app.json 의 experiments.reactCompiler 가 true 라 재실행 여지가 더 크다)
    */
    const next = nextAllergies(selected, id);
    setSelected(next);
    if (!next.includes('etc')) setEtcText('');
  };

  const showCeliacQuestion = selected.includes('wheat');
  const showEtcInput = selected.includes('etc');

  /*
    여기서 멈추지 않으면 답한 적 없는 값이 서버에 기록된다.

    - '기타' 를 골라놓고 빈칸으로 넘기면 알레르기 목록에서 그 항목이 통째로 빠진다.
      라벨 "기타" 를 대신 보내봐야 실제 음식 이름이 아니라서 아무것도 걸러내지 못한다.
    - 셀리악 질문을 지나치면 서버 기본값이 대신 들어가 '모르겠어요' 로 남는다.
      사용자는 답한 적이 없는데 기록에는 답이 있다.
    - 아무 칩도 안 고른 것과 '없어요' 를 고른 것은 다른 답이다. '없어요' 칩이 있으니
      필수로 걸어도 막히는 사람은 없다. 셀리악도 '모르겠어요' 라는 출구가 있다.
  */
  const nothingSelected = selected.length === 0;
  const etcFilled = !showEtcInput || etcText.trim().length > 0;
  const celiacAnswered = !showCeliacQuestion || celiac !== undefined;
  const canProceed = !nothingSelected && etcFilled && celiacAnswered;

  const handleNext = () => {
    if (!canProceed) return;
    updateOnboarding({
      allergies: selected,
      allergyEtcText: showEtcInput && etcText.trim() ? etcText.trim() : undefined,
      celiacDiagnosis: showCeliacQuestion ? celiac : undefined,
    });
    router.push('/onboarding/avoided-food');
  };

  return (
    /*
      TextInput 이 있는 화면이라 키보드를 두 가지 다 막아야 한다.

      - keyboardShouldPersistTaps 기본값 'never' 는 키보드가 떠 있는 동안 첫 탭을
        키보드 닫기로 삼켜서 '다음' 의 onPress 가 아예 호출되지 않는다.
        사용자에게는 눌러도 반응이 없는 화면으로 보인다.
      - iOS 는 키보드가 올라와도 레이아웃을 줄이지 않아 '다음' 이 키보드 뒤에 깔린다.
        안드로이드도 마찬가지인 경우가 있다 — expo 기본값이 'resize' 라 창이 줄어들 것 같지만,
        SDK 54 의 edge-to-edge 에서는 IME 가 창을 안 줄이고 inset 으로만 오기도 한다.
        실제로 갤럭시 챗봇 화면에서 입력칸이 키보드 뒤에 깔렸다.
        기기마다 다르므로 useKeyboardInset 이 창이 실제로 줄었는지 재서 모자란 만큼만 채운다.

      contentInsetAdjustmentBehavior 는 키보드와 별개다.
      react-native-screens 가 화면의 첫 ScrollView 를 'automatic' 으로 덮어쓰는데,
      이 화면은 안전영역을 paddingTop: insets.top 으로 직접 넣고 있어서
      UIKit 인셋까지 붙으면 위가 두 번 밀리고 그만큼 아래가 잘린다.
    */
    <KeyboardAvoidingView
      style={styles.keyboardAvoider}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        onLayout={onLayout}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentInsetAdjustmentBehavior="never">
        <ThemedView
          type="onboardingBackground"
          style={[
            styles.container,
            // 키보드가 떠 있으면 그만큼 밀어 올린다. 그 자리는 키보드가 이미 덮고 있어서
            // 내비게이션 바 인셋을 같이 더할 필요가 없다.
            { paddingTop: insets.top, paddingBottom: (keyboardInset || insets.bottom) + 16 },
          ]}>
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

              {/*
                가장 흔한 상태(아무것도 안 고름)가 유일하게 설명 없는 dead button 이었다.
                왜 안 눌리는지를 말하되 재촉하지 않고 '없어요' 라는 출구를 함께 알린다.
              */}
              {nothingSelected ? (
                <ThemedText type="caption" themeColor="textMuted" style={styles.hint}>
                  하나만 골라주시면 다음으로 넘어가요. 알레르기가 없으시면 ‘없어요’ 를 눌러주세요.
                </ThemedText>
              ) : null}

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

              {/*
                다그치는 대신 왜 필요한지만 말한다.
                화면에 들어오자마자가 아니라 '기타' 를 고른 뒤 아직 비어 있을 때만 보인다.
              */}
              {showEtcInput && !etcFilled ? (
                <ThemedText type="caption" themeColor="textMuted" style={styles.hint}>
                  어떤 음식인지 알려주시면, MORU가 그 음식은 아예 빼고 추천할게요. 여러 개면 쉼표로
                  나눠 적어주세요.
                </ThemedText>
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

                {/* 답을 재촉하는 게 아니라 '모르겠어요' 라는 출구가 있다는 걸 알린다 */}
                {!celiacAnswered ? (
                  <ThemedText type="caption" themeColor="textMuted">
                    모르셔도 괜찮아요. ‘모르겠어요’ 를 골라주시면 그대로 기록해둘게요.
                  </ThemedText>
                ) : null}
              </ThemedView>
            ) : null}

            <View style={styles.flex} />
          </View>

          <BottomButton label="다음" disabled={!canProceed} onPress={handleNext} />
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
