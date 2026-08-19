import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomButton } from '@/components/common/BottomButton';
import { Checkbox } from '@/components/common/Checkbox';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { QuestionCard } from '@/components/onboarding/QuestionCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMoruData } from '@/hooks/useMoruData';
import { Spacing } from '@/constants/theme';
import { apiRequest } from '@/services/apiClient';
import { needsMedicalReferral } from '@/types/onboarding';

type SafetyQuestionItem = { key: string; label: string };
type SafetyQuestions = {
  title: string;
  sub: string;
  items: SafetyQuestionItem[];
  exception: SafetyQuestionItem;
  none_label: string;
};

/** POST /onboarding/safety 응답 — blocked 여부와 B1x에 그대로 전달할 문구 */
type SafetyScreenResult = {
  blocked: boolean;
  flags: string[];
  title: string;
  body: string;
  footer: string;
};

/**
 * B1 온보딩 · 안전 확인.
 *
 * 문항은 GET /onboarding/safety/questions 에서 받아온다.
 * 판정은 규칙 기반이며 AI를 사용하지 않는다 (needsMedicalReferral 참고).
 * exception("이미 병원에서 확인했어요")을 선택하면 항목이 있어도 B2로 진행한다.
 */
export default function SafetyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateOnboarding } = useMoruData();

  const [data, setData] = useState<SafetyQuestions | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [exceptionSelected, setExceptionSelected] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [postError, setPostError] = useState(false);

  useEffect(() => {
    apiRequest<SafetyQuestions>('/onboarding/safety/questions')
      .then(setData)
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[B1] GET /onboarding/safety/questions failed:', err);
        setLoadError(true);
      });
  }, []);

  const toggle = (key: string) => {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  /**
   * 두 버튼 모두 실제 체크 상태를 기준으로 판정한다.
   * 선택된 항목이 없으면(해당 없어요) POST 없이 바로 B2로 이동한다.
   * 선택된 항목이 있으면 POST /onboarding/safety 로 서버에 판정을 맡기고,
   * 응답의 blocked 값을 그대로 따른다 (프론트에서 다시 판단하지 않는다).
   */
  const handleContinue = async () => {
    if (submitting) return;

    if (!needsMedicalReferral(selected)) {
      updateOnboarding({ safetyFlags: [] });
      router.push('/onboarding/allergy');
      return;
    }

    if (!data) return;

    setPostError(false);
    setSubmitting(true);
    try {
      // GET 응답의 key 를 그대로 사용해 요청 body 를 만든다 (하드코딩된 목록 사용 안 함)
      const payload: Record<string, boolean> = {};
      data.items.forEach((item) => {
        payload[item.key] = selected.includes(item.key);
      });
      payload[data.exception.key] = exceptionSelected;

      const result = await apiRequest<SafetyScreenResult>('/onboarding/safety', {
        method: 'POST',
        body: payload,
      });

      updateOnboarding({ safetyFlags: result.flags });

      if (result.blocked) {
        router.push({
          pathname: '/onboarding/medical',
          params: {
            title: result.title,
            body: result.body,
            footer: result.footer,
            flags: result.flags.join(','),
          },
        });
      } else {
        router.push('/onboarding/allergy');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[B1] POST /onboarding/safety failed:', err);
      setPostError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <ThemedView
        type="onboardingBackground"
        style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.content}>
          <OnboardingHeader step={1} />

          <View style={styles.headerSpacer} />

          {data ? (
            <QuestionCard question={data.title} helperText={data.sub}>
              <View style={styles.checklist}>
                {data.items.map((item) => (
                  <Checkbox
                    key={item.key}
                    label={item.label}
                    checked={selected.includes(item.key)}
                    onChange={() => toggle(item.key)}
                  />
                ))}

                {selected.length > 0 ? (
                  <Checkbox
                    label={data.exception.label}
                    checked={exceptionSelected}
                    onChange={() => setExceptionSelected((prev) => !prev)}
                  />
                ) : null}
              </View>
            </QuestionCard>
          ) : loadError ? (
            <ThemedText type="bodyS" themeColor="textSecondary" style={styles.errorText}>
              문항을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
            </ThemedText>
          ) : null}

          {postError ? (
            <ThemedText type="bodyS" themeColor="textSecondary" style={styles.errorText}>
              전송에 실패했어요. 잠시 후 다시 시도해주세요.
            </ThemedText>
          ) : null}

          <View style={styles.flex} />
        </View>

        <BottomButton
          label={data?.none_label ?? '해당하는 것이 없어요'}
          disabled={submitting}
          onPress={handleContinue}
          secondary={{
            label: '하나라도 있어요',
            variant: 'secondary',
            disabled: submitting,
            onPress: handleContinue,
          }}
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
  errorText: {
    paddingTop: Spacing.three,
  },
  flex: {
    flex: 1,
    minHeight: 16,
  },
});
