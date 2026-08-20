import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Chip } from '@/components/common/Chip';
import { MORUButton } from '@/components/common/MORUButton';
import { SproutIcon } from '@/components/common/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import * as api from '@/services/api';
import type { ChallengeAttemptResult, ChallengeDetail } from '@/types/reintroduction';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function weekdayLabel(dateStr: string): string {
  return WEEKDAY_LABELS[new Date(dateStr).getDay()];
}

/**
 * F3 표적 도전 · 진행.
 * F2에서 생성된 challenge_id 로 GET /challenges/{id} 를 불러와 그대로 표시한다.
 * 시도 결과를 확정할 때만 POST /challenges/{id}/attempts/{seq} 를 호출한다.
 */
export default function ReintroductionProgressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { challenge_id } = useLocalSearchParams<{ challenge_id?: string }>();
  const challengeId = Number(challenge_id);

  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [loadError, setLoadError] = useState(false);
  /*
    boolean 이 아니라 '지금 보내는 중인 답' 을 담는다.
    두 버튼이 같은 요청을 쓰므로 boolean 이면 누르지도 않은 버튼까지 대기 표시가 붙는다.
    어느 쪽을 눌렀는지 화면이 되돌려줘야 사용자가 자기 행동을 확인할 수 있다.
  */
  const [pending, setPending] = useState<ChallengeAttemptResult | null>(null);
  const [submitError, setSubmitError] = useState(false);

  useEffect(() => {
    if (!challengeId) return;
    api
      .getChallengeDetail(challengeId)
      .then(setChallenge)
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[F3] GET /challenges/{id} failed:', err);
        setLoadError(true);
      });
  }, [challengeId]);

  const handleAttempt = async (result: ChallengeAttemptResult) => {
    if (!challenge || pending) return;

    setSubmitError(false);
    setPending(result);
    try {
      const response = await api.recordChallengeAttempt(challenge.challenge_id, challenge.current_seq, {
        result,
        tested_at: new Date().toISOString(),
      });

      if (response.finished) {
        router.push({
          pathname: '/reintroduction/result',
          params: { challenge_id: String(challenge.challenge_id) },
        });
        return;
      }

      const refreshed = await api.getChallengeDetail(challenge.challenge_id);
      setChallenge(refreshed);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[F3] POST attempt failed:', err);
      setSubmitError(true);
    } finally {
      setPending(null);
    }
  };

  if (!challenge) {
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
              <ThemedText type="smallBold">확인하기</ThemedText>
            </View>
            {loadError ? (
              <ThemedText type="bodyS" themeColor="textSecondary" style={styles.errorText}>
                진행 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
              </ThemedText>
            ) : null}
          </View>
        </ThemedView>
      </ScrollView>
    );
  }

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
            <ThemedText type="smallBold">{`${challenge.ingredient_name} 확인하기`}</ThemedText>
          </View>

          <ThemedText type="caption" themeColor="textMuted">
            {`${challenge.current_seq}번째 시도`}
          </ThemedText>

          <ThemedText type="h1" themeColor="textPrimary" style={styles.title}>
            {challenge.instruction}
          </ThemedText>
          {challenge.note ? (
            <ThemedText type="bodyS" themeColor="textSecondary">
              {challenge.note}
            </ThemedText>
          ) : null}

          {challenge.available_days.length > 0 ? (
            <ThemedView type="surfaceCard" style={[styles.card, { borderColor: theme.borderSubtle }]}>
              <ThemedText type="label" themeColor="textPrimary">
                이번 주 가능한 날
              </ThemedText>
              <View style={styles.dayRow}>
                {challenge.available_days.map((date) => (
                  <Chip key={date} label={weekdayLabel(date)} />
                ))}
              </View>
              {challenge.excluded_note ? (
                <ThemedText type="caption" themeColor="textMuted">
                  {challenge.excluded_note}
                </ThemedText>
              ) : null}
            </ThemedView>
          ) : null}

          <ThemedView type="surfaceCard" style={[styles.card, { borderColor: theme.borderSubtle }]}>
            {challenge.attempts.map((attempt) => (
              <View key={attempt.seq} style={styles.historyRow}>
                <ThemedView
                  type={attempt.status === 'done' ? 'brand' : 'backgroundElement'}
                  style={styles.historyDot}
                />
                <View style={styles.historyTexts}>
                  <ThemedText type="caption" themeColor="textMuted">
                    {`${attempt.seq}번째`}
                  </ThemedText>
                  <ThemedText type="label" themeColor="textPrimary">
                    {attempt.label}
                  </ThemedText>
                </View>
              </View>
            ))}
          </ThemedView>

          <ThemedView type="brandSoft" style={styles.noticeCard}>
            <SproutIcon size={20} color={theme.brandText} />
            <ThemedText type="caption" themeColor="textPrimary" style={styles.noticeText}>
              {challenge.reassurance}
            </ThemedText>
          </ThemedView>

          {submitError ? (
            <ThemedText type="bodyS" themeColor="textSecondary" style={styles.errorText}>
              전송에 실패했어요. 잠시 후 다시 시도해주세요.
            </ThemedText>
          ) : null}
        </View>

        <View
          style={[
            styles.footerRow,
            { paddingHorizontal: Spacing.four },
          ]}>
          {/* 두 답 모두 POST /challenges/{id}/attempts/{seq} 응답을 기다린다 */}
          <View style={styles.footerButton}>
            <MORUButton
              label="괜찮았어요"
              variant="secondary"
              disabled={pending !== null}
              loading={pending === 'no_reaction'}
              onPress={() => handleAttempt('no_reaction')}
            />
          </View>
          <View style={styles.footerButton}>
            <MORUButton
              label="불편함이 있었어요"
              disabled={pending !== null}
              loading={pending === 'reaction'}
              onPress={() => handleAttempt('reaction')}
            />
          </View>
        </View>
        <View
          style={[
            styles.footerRow,
            { paddingBottom: insets.bottom + Spacing.three, paddingHorizontal: Spacing.four },
          ]}>
          {/*
            이 버튼은 화면만 옮긴다 — 서버를 기다리지 않으므로 loading 을 주지 않는다.
            보내는 중에 빠져나가지 못하게 막기만 한다.
          */}
          <View style={styles.footerButton}>
            <MORUButton
              label="다음에 할게요"
              variant="secondary"
              disabled={pending !== null}
              onPress={() => router.push('/reintroduction')}
            />
          </View>
        </View>
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
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  title: {
    fontSize: 22,
    lineHeight: 30,
    marginTop: Spacing.one,
  },
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  historyTexts: {
    flex: 1,
    gap: 2,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    marginTop: Spacing.one,
  },
  noticeText: {
    flex: 1,
  },
  errorText: {
    marginTop: Spacing.one,
  },
  footerRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  footerButton: {
    flex: 1,
  },
});
