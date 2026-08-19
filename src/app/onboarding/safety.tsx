import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomButton } from '@/components/common/BottomButton';
import { Checkbox } from '@/components/common/Checkbox';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { QuestionCard } from '@/components/onboarding/QuestionCard';
import { ThemedView } from '@/components/themed-view';
import { useMoruData } from '@/hooks/useMoruData';
import { Spacing } from '@/constants/theme';
import { SAFETY_FLAG_OPTIONS, needsMedicalReferral, type SafetyFlag } from '@/types/onboarding';

/**
 * B1 온보딩 · 안전 확인.
 *
 * 판정은 규칙 기반이며 AI를 사용하지 않는다 (needsMedicalReferral 참고).
 * "해당하는 것이 없어요" → 알레르기(B2), "하나라도 있어요" → 병원 안내(B1x).
 */
export default function SafetyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateOnboarding } = useMoruData();
  const [selected, setSelected] = useState<SafetyFlag[]>([]);

  const toggle = (id: SafetyFlag) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((flag) => flag !== id) : [...prev, id]));
  };

  /**
   * 두 버튼 모두 실제 체크된 위험 신호(selected)를 기준으로 판정한다.
   * 라벨과 무관하게 선택된 항목이 있으면 항상 병원 안내로 이동한다.
   */
  const handleContinue = () => {
    updateOnboarding({ safetyFlags: selected });
    router.push(needsMedicalReferral(selected) ? '/onboarding/medical' : '/onboarding/allergy');
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <ThemedView
        type="onboardingBackground"
        style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.content}>
          <OnboardingHeader step={1} />

          <View style={styles.headerSpacer} />

          <QuestionCard
            question="먼저 확인할게요"
            helperText={'아래 중 해당하는 것이 있다면 알려주세요.\nMORU보다 병원 진료가 먼저 필요할 수 있어요.'}>
            <View style={styles.checklist}>
              {SAFETY_FLAG_OPTIONS.map((option) => (
                <Checkbox
                  key={option.id}
                  label={option.label}
                  checked={selected.includes(option.id)}
                  onChange={() => toggle(option.id)}
                />
              ))}
            </View>
          </QuestionCard>

          <View style={styles.flex} />
        </View>

        <BottomButton
          label="해당하는 것이 없어요"
          onPress={handleContinue}
          secondary={{ label: '하나라도 있어요', variant: 'secondary', onPress: handleContinue }}
        />
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
  checklist: {
    gap: 7,
  },
  flex: {
    flex: 1,
    minHeight: 16,
  },
});
