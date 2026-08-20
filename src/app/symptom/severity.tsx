import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { BottomButton } from '@/components/common/BottomButton';
import { SeveritySelector } from '@/components/symptom/SeveritySelector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMoruData } from '@/hooks/useMoruData';
import * as api from '@/services/api';
import { Spacing } from '@/constants/theme';
import type { OverallState, Severity } from '@/types/symptom';

/** 이 값 이상이면 증상 상세(E1~E2)로 이어지고, 미만이면 바로 기록을 마친다 */
const CONTINUE_THRESHOLD = 5;

function stateFromSeverity(value: Severity): OverallState {
  if (value <= 3) return 'good';
  if (value <= 6) return 'okay';
  return 'uncomfortable';
}

/**
 * E0 증상 기록 · 강도 체크.
 * 낮은 값이면 그 자리에서 기록을 마치고, 높은 값이면 어떤 증상인지 조금 더 물어본다.
 */
export default function SymptomSeverityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { refreshRecords } = useMoruData();
  const [severity, setSeverity] = useState<Severity>();
  const [saving, setSaving] = useState(false);

  const willContinue = severity !== undefined && severity >= CONTINUE_THRESHOLD;

  const handlePress = async () => {
    if (severity === undefined || saving) return;

    if (willContinue) {
      router.push({ pathname: '/symptom/detail', params: { severity: String(severity) } });
      return;
    }

    setSaving(true);
    try {
      // 강도가 낮아 여기서 끝나는 경우에도 서버에 남긴다.
      // 전에는 로컬에만 쌓여서 앱을 껐다 켜면 사라졌다.
      //
      // 증상 강도는 전부 'none' 으로 보낸다 — 불편함이 없었다는 뜻이다.
      // 서버는 이런 기록을 "반응 있었음" 으로 세지 않는다.
      await api.logSymptom({
        details: [],
        onset: 'just_now',
        location: null,
        blood_in_stool: false,
        contexts: [],
      });
      await refreshRecords();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[E0] POST /symptoms failed:', err);
    } finally {
      setSaving(false);
    }
    router.replace('/(tabs)/record');
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
            <BackButton />
            <ThemedText type="smallBold">증상 기록</ThemedText>
          </View>

          <ThemedText type="h1" themeColor="textPrimary" style={styles.title}>
            지금 얼마나 불편한가요?
          </ThemedText>
          <ThemedText type="bodyS" themeColor="textSecondary" style={styles.subtitle}>
            오늘의 전반적인 불편함을 하나만 선택해주세요.
          </ThemedText>

          <ThemedView type="surfaceCard" style={styles.card}>
            <ThemedText type="label" themeColor="textPrimary">
              불편함 정도
            </ThemedText>
            <View style={styles.selectorWrap}>
              <SeveritySelector
                value={severity}
                onChange={setSeverity}
                minLabel="약간 불편"
                maxLabel="매우 불편"
              />
            </View>
            <ThemedView type="backgroundElement" style={styles.helperBox}>
              <ThemedText type="caption" themeColor="textMuted" style={styles.helperText}>
                불편함이 크면 어떤 증상인지 조금 더 여쭤볼게요.
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView type="brandSoft" style={styles.noticeCard}>
            <ThemedView type="brandLight" style={styles.noticeCheck}>
              <ThemedText type="label" themeColor="brandText">
                {'✓'}
              </ThemedText>
            </ThemedView>
            <View style={styles.noticeTexts}>
              <ThemedText type="label" themeColor="textPrimary">
                불편하지 않은 날은 여기서 끝!
              </ThemedText>
              <ThemedText type="caption" themeColor="textMuted">
                {'모든 증상을 하나씩 체크하지 않아도 돼요.\n오늘의 정도만 남기면 충분해요.'}
              </ThemedText>
            </View>
          </ThemedView>

          <View style={styles.plainNotice}>
            <ThemedText type="label" themeColor="textPrimary">
              기록은 가볍게, 필요한 날만 자세하게
            </ThemedText>
            <ThemedText type="caption" themeColor="textMuted">
              증상이 심한 날에만 다음 단계로 이어집니다.
            </ThemedText>
          </View>

          <ThemedText type="caption" themeColor="textMuted" style={styles.footerHint}>
            숫자를 누르면 바로 기록돼요
          </ThemedText>
        </View>

        {severity !== undefined ? (
          /*
            '기록하기' 쪽만 POST /symptoms 와 목록 갱신을 기다린다.
            '다음' 은 다음 화면으로 넘기기만 하므로 saving 이 true 가 되지 않는다.
          */
          <BottomButton
            label={willContinue ? '다음' : '기록하기'}
            onPress={handlePress}
            disabled={saving}
            loading={saving}
          />
        ) : null}
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
  subtitle: {
    marginTop: -Spacing.two,
  },
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.three,
    shadowColor: '#3B332B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 1,
  },
  selectorWrap: {
    gap: Spacing.two,
  },
  helperBox: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  helperText: {
    textAlign: 'center',
  },
  noticeCard: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  noticeCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeTexts: {
    flex: 1,
    gap: 4,
  },
  plainNotice: {
    paddingHorizontal: Spacing.one,
    gap: 4,
  },
  footerHint: {
    textAlign: 'center',
    marginTop: Spacing.one,
  },
});
