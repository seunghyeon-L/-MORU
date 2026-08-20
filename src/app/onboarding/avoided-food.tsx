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
import { ChoiceChip } from '@/components/onboarding/ChoiceChip';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { QuestionCard } from '@/components/onboarding/QuestionCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useKeyboardInset } from '@/hooks/use-keyboard-inset';
import { useMoruData } from '@/hooks/useMoruData';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { AVOIDED_FOOD_OPTIONS, type AvoidedFood } from '@/types/onboarding';

/**
 * '없음' 은 나머지와 함께 고를 수 없다.
 * '없음' 을 누르면 나머지가 풀리고, 다른 걸 누르면 '없음' 이 풀린다.
 * (allergy 화면의 nextAllergies 와 같은 규칙이다)
 */
function nextAvoidedFoods(prev: readonly AvoidedFood[], id: AvoidedFood): AvoidedFood[] {
  if (id === 'none') return prev.includes('none') ? [] : ['none'];
  const toggled = prev.includes(id) ? prev.filter((food) => food !== id) : [...prev, id];
  return toggled.filter((food) => food !== 'none');
}

/** B3 온보딩 · 피하는 음식. 지금 떠오르는 것만 골라도 되는 다중 선택 화면 */
export default function AvoidedFoodScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { inset: keyboardInset, onLayout } = useKeyboardInset();
  const theme = useTheme();
  const { updateOnboarding } = useMoruData();
  const [selected, setSelected] = useState<AvoidedFood[]>([]);
  const [etcText, setEtcText] = useState('');

  const toggle = (id: AvoidedFood) => {
    // 부수효과를 updater 밖으로 뺀 이유는 allergy 화면의 toggle 주석을 참고
    const next = nextAvoidedFoods(selected, id);
    setSelected(next);
    if (!next.includes('etc')) setEtcText('');
  };

  const showEtcInput = selected.includes('etc');

  /*
    진행 조건은 allergy 화면과 같은 규칙으로 둔다.
    같은 온보딩 안에서 화면마다 '다음' 이 되는 조건이 다르면 사용자가 규칙을 배울 수 없다.
    '없음' 칩이 있으므로 "아무것도 안 고름" 과 "없음" 을 구분해도 막히는 사람은 없다.
  */
  const nothingSelected = selected.length === 0;
  const etcFilled = !showEtcInput || etcText.trim().length > 0;
  const canProceed = !nothingSelected && etcFilled;

  const handleNext = () => {
    if (!canProceed) return;
    updateOnboarding({
      avoidedFoods: selected,
      avoidedFoodEtcText: showEtcInput && etcText.trim() ? etcText.trim() : undefined,
    });
    router.push('/onboarding/symptoms');
  };

  return (
    // 키보드 처리 이유는 allergy 화면의 같은 자리 주석을 참고
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
            <OnboardingHeader step={3} />

            <View style={styles.headerSpacer} />

            {/*
              안내문이 규칙과 어긋나면 안 된다.
              하나는 골라야 넘어가는 화면이므로, "떠오르는 것만" 뒤에 '없음' 이라는 출구를 붙인다.
            */}
            <QuestionCard
              question={'요즘 피하고 계신\n음식이 있나요?'}
              helperText={
                '지금 떠오르는 것만 골라주세요. 없으면 ‘없음’ 을 눌러주세요.\n나중에 바꿀 수 있어요.'
              }>
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

              {/* 아무것도 안 고른 상태가 설명 없는 dead button 이었다. 규칙만 짧게 말한다 */}
              {nothingSelected ? (
                <ThemedText type="caption" themeColor="textMuted" style={styles.hint}>
                  하나만 골라주시면 다음으로 넘어가요.
                </ThemedText>
              ) : null}

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

              {/* '기타' 를 고른 뒤 아직 비어 있을 때만. 처음부터 떠 있으면 그것도 재촉이다 */}
              {showEtcInput && !etcFilled ? (
                <ThemedText type="caption" themeColor="textMuted" style={styles.hint}>
                  적어주시면 나의 식탁에 함께 담아둘게요. 여러 개면 쉼표로 나눠 적어주세요.
                </ThemedText>
              ) : null}
            </QuestionCard>

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
  hint: {
    marginTop: 6,
  },
  flex: {
    flex: 1,
    minHeight: 16,
  },
});
