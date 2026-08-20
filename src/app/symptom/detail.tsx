import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { BottomButton } from '@/components/common/BottomButton';
import { Checkbox } from '@/components/common/Checkbox';
import { SelectionCard } from '@/components/common/SelectionCard';
import { IntensityToggle } from '@/components/symptom/IntensityToggle';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useMoruData } from '@/hooks/useMoruData';
import { Spacing } from '@/constants/theme';
import * as api from '@/services/api';
import {
  CONTEXT_FACTOR_OPTIONS,
  DISCOMFORT_LOCATION_OPTIONS,
  ONSET_OPTIONS,
  SYMPTOM_CHECK_ITEMS,
  type ContextFactor,
  type DiscomfortLocation,
  type Onset,
  type Severity,
  type SymptomApiLevel,
  type SymptomApiOnset,
  type SymptomIntensity,
  type SymptomType,
} from '@/types/symptom';

/** 로컬 UI 값 → POST /symptoms 요청 스키마 값 매핑 */
const ONSET_TO_API: Record<Onset, SymptomApiOnset> = {
  'just-now': 'just_now',
  'hour-ago': 'about_1h',
  morning: 'since_morning',
  yesterday: 'since_yesterday',
};

const INTENSITY_TO_API: Record<SymptomIntensity, SymptomApiLevel> = {
  none: 'none',
  mild: 'mild',
  severe: 'strong',
};

/** E2 화면에 보여줄 순서 (기타/불규칙한 식사 시간/중요한 일정 제외, Figma 기준) */
const SITUATION_IDS: ContextFactor[] = [
  'poor-sleep',
  'stress',
  'large-meal',
  'alcohol',
  'menstruation',
  'none-change',
];

function GridOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.gridItem, pressed && styles.pressed]}>
      <ThemedView
        type={selected ? 'brand' : 'surfaceCard'}
        style={[styles.gridInner, { borderColor: selected ? theme.brand : theme.borderSubtle }]}>
        <ThemedText type="label" themeColor={selected ? 'textOnBrand' : 'textPrimary'}>
          {label}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

/**
 * E1 + E2 증상 상세 기록.
 *
 * 1단계(E1) — 어떤 불편함이 있었는지, 언제부터, 어디가, 혈변 여부.
 * 2단계(E2) — 오늘 평소와 다른 점(교란 변수). 두 단계 모두 별도 route를 늘리지 않고
 * 이 화면 안에서 local step 으로 전환한다.
 */
/**
 * 화면의 상황 요인 id → 서버 API 키.
 * 여기에 없는 항목(기타·특별한 변화 없음)은 보내지 않는다 —
 * 집계에 쓸 정보가 없기 때문이다.
 */
const CONTEXT_FACTOR_TO_API: Partial<Record<ContextFactor, string>> = {
  'poor-sleep': 'short_sleep',
  stress: 'high_stress',
  'large-meal': 'overeating',
  alcohol: 'alcohol',
  menstruation: 'menstruation',
  'irregular-meal': 'irregular_meal',
  'busy-schedule': 'busy_schedule',
};

export default function SymptomDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { refreshRecords } = useMoruData();
  const { severity: severityParam } = useLocalSearchParams<{ severity?: string }>();
  const severity = (Number(severityParam) || 7) as Severity;

  const [step, setStep] = useState<1 | 2>(1);
  const [saving, setSaving] = useState(false);
  const [postError, setPostError] = useState(false);

  // 1단계 state
  const [intensities, setIntensities] = useState<Partial<Record<SymptomType, SymptomIntensity>>>(
    {},
  );
  const [onset, setOnset] = useState<Onset>();
  const [location, setLocation] = useState<DiscomfortLocation>();
  const [hasBloodInStool, setHasBloodInStool] = useState(false);

  // 2단계 state
  const [factors, setFactors] = useState<ContextFactor[]>([]);

  const setIntensity = (id: SymptomType, value: SymptomIntensity) => {
    setIntensities((prev) => ({ ...prev, [id]: value }));
  };

  const toggleFactor = (id: ContextFactor) => {
    setFactors((prev) => {
      if (id === 'none-change') {
        return prev.includes('none-change') ? [] : ['none-change'];
      }
      const withoutNone = prev.filter((factor) => factor !== 'none-change');
      return withoutNone.includes(id)
        ? withoutNone.filter((factor) => factor !== id)
        : [...withoutNone, id];
    });
  };

  /** location 은 POST /symptoms 계약상 선택값(optional)이라 진행 조건에 넣지 않는다 — onset 만 필수다 */
  const step1Ready = Boolean(onset);
  const step2Ready = factors.length > 0;

  /**
   * 위험 신호 여부는 서버(POST /symptoms 의 red_flag)가 판정한다.
   * 여기서는 값만 담아뒀다가 기록을 마칠 때 함께 보낸다.
   */
  const handleBloodChange = (checked: boolean) => {
    setHasBloodInStool(checked);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      return;
    }
    router.back();
  };

  const handleStep1Next = () => {
    if (!step1Ready) return;
    setStep(2);
  };

  const handleFinish = async () => {
    if (!step2Ready || saving || !onset) return;

    setPostError(false);
    setSaving(true);
    const now = new Date().toISOString();
    const symptoms = SYMPTOM_CHECK_ITEMS.filter(
      (item) => intensities[item.id] && intensities[item.id] !== 'none',
    ).map((item) => item.id);
    // 서버에는 한국어 라벨이 아니라 API 키를 보낸다.
    // 라벨을 보내면 패턴 분석이 교란 요인을 문장에 끼울 때
    // "잠을 적게 잤어요가 겹친 날이 많아서" 처럼 깨진다.
    const contextKeys = factors.flatMap((factor) => {
      const key = CONTEXT_FACTOR_TO_API[factor];
      return key ? [key] : [];
    });

    try {
      const response = await api.logSymptom({
        details: SYMPTOM_CHECK_ITEMS.map((item) => ({
          kind: item.label,
          level: INTENSITY_TO_API[intensities[item.id] ?? 'none'],
        })),
        onset: ONSET_TO_API[onset],
        location,
        blood_in_stool: hasBloodInStool,
        contexts: contextKeys,
      });

      await refreshRecords();   // 저장이 끝났으니 목록을 다시 받아온다

      if (response.red_flag && response.notice) {
        router.push({
          pathname: '/symptom/medical',
          params: {
            title: response.notice.title,
            body: response.notice.body,
            footer: response.notice.footer,
          },
        });
      } else {
        router.replace('/analysis');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[E1/E2] POST /symptoms failed:', err);
      setPostError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <ThemedView
        type="onboardingBackground"
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing.three },
        ]}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <BackButton onPress={handleBack} />
            <ThemedText type="smallBold">증상 기록</ThemedText>
          </View>

          {step === 1 ? (
            <>
              <ThemedText type="h1" themeColor="textPrimary" style={styles.title}>
                어떤 불편함이 있었나요?
              </ThemedText>

              <View style={styles.intensityList}>
                {SYMPTOM_CHECK_ITEMS.map((item) => (
                  <IntensityToggle
                    key={item.id}
                    title={item.label}
                    value={intensities[item.id]}
                    onChange={(value) => setIntensity(item.id, value)}
                  />
                ))}
              </View>

              <View style={styles.section}>
                <ThemedText type="label" themeColor="textPrimary">
                  언제부터 그러셨어요?
                </ThemedText>
                <View style={styles.grid}>
                  {ONSET_OPTIONS.map((option) => (
                    <GridOption
                      key={option.id}
                      label={option.label}
                      selected={onset === option.id}
                      onPress={() => setOnset(option.id)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <ThemedText type="label" themeColor="textPrimary">
                  어디가 불편하세요?
                </ThemedText>
                <View style={styles.grid}>
                  {DISCOMFORT_LOCATION_OPTIONS.map((option) => (
                    <GridOption
                      key={option.id}
                      label={option.label}
                      selected={location === option.id}
                      onPress={() => setLocation(option.id)}
                    />
                  ))}
                </View>
              </View>

              <Checkbox
                label="변에 피가 섞여 있었어요"
                checked={hasBloodInStool}
                onChange={handleBloodChange}
                tone="coral"
              />
            </>
          ) : (
            <>
              <ThemedText type="h1" themeColor="textPrimary" style={styles.title}>
                {'오늘은 평소와\n다른 점이 있었나요?'}
              </ThemedText>
              <ThemedText type="bodyS" themeColor="textSecondary">
                {'불편함이 컸던 날에만 여쭤봐요.\n해당 없으면 넘기셔도 괜찮아요.'}
              </ThemedText>

              <View style={styles.factorList}>
                {SITUATION_IDS.map((id) => {
                  const option = CONTEXT_FACTOR_OPTIONS.find((factor) => factor.id === id);
                  if (!option) return null;
                  return (
                    <SelectionCard
                      key={option.id}
                      title={option.label}
                      selected={factors.includes(option.id)}
                      onPress={() => toggleFactor(option.id)}
                    />
                  );
                })}
              </View>

              <ThemedView type="backgroundElement" style={styles.factorNote}>
                <ThemedText type="caption" themeColor="textSecondary">
                  {'이걸 함께 남겨두면, 나중에 음식 때문인지\n그날 상황 때문인지 구분할 수 있어요.'}
                </ThemedText>
              </ThemedView>
            </>
          )}

          {postError ? (
            <ThemedText type="bodyS" themeColor="textSecondary" style={styles.errorText}>
              전송에 실패했어요. 잠시 후 다시 시도해주세요.
            </ThemedText>
          ) : null}
        </View>

        <BottomButton
          label={step === 1 ? '기록하기' : '기록 마치기'}
          onPress={step === 1 ? handleStep1Next : handleFinish}
          disabled={step === 1 ? !step1Ready : !step2Ready || saving}
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
    gap: Spacing.three,
  },
  errorText: {
    marginTop: -Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    marginTop: Spacing.one,
  },
  intensityList: {
    gap: Spacing.two,
  },
  section: {
    gap: Spacing.two,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  gridItem: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  gridInner: {
    paddingVertical: 13,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
  },
  factorList: {
    gap: Spacing.two,
  },
  factorNote: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
});
