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
import {
  CONTEXT_FACTOR_OPTIONS,
  DISCOMFORT_LOCATION_OPTIONS,
  ONSET_OPTIONS,
  SYMPTOM_CHECK_ITEMS,
  type ContextFactor,
  type DiscomfortLocation,
  type Onset,
  type Severity,
  type SymptomIntensity,
  type SymptomType,
} from '@/types/symptom';

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
export default function SymptomDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addSymptomRecord } = useMoruData();
  const { severity: severityParam } = useLocalSearchParams<{ severity?: string }>();
  const severity = (Number(severityParam) || 7) as Severity;

  const [step, setStep] = useState<1 | 2>(1);
  const [saving, setSaving] = useState(false);

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

  const step1Ready = Boolean(onset && location);
  const step2Ready = factors.length > 0;

  /** 온보딩 안전 확인(B1)이 위험 신호를 병원 안내로 넘기는 것과 동일한 패턴 */
  const handleBloodChange = (checked: boolean) => {
    setHasBloodInStool(checked);
    if (checked) {
      router.push('/symptom/medical');
    }
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
    if (!step2Ready || saving) return;

    setSaving(true);
    const now = new Date().toISOString();
    const symptoms = SYMPTOM_CHECK_ITEMS.filter(
      (item) => intensities[item.id] && intensities[item.id] !== 'none',
    ).map((item) => item.id);

    await addSymptomRecord({
      id: `symptom-${Date.now()}`,
      recordedAt: now,
      state: 'uncomfortable',
      detail: {
        symptoms,
        symptomIntensities: intensities,
        occurredAt: now,
        onset,
        location,
        hasBloodInStool,
        severity,
        contextFactors: factors.filter((factor) => factor !== 'none-change'),
      },
    });
    router.replace('/analysis');
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
