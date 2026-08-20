import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { BottomButton } from '@/components/common/BottomButton';
import { Chip } from '@/components/common/Chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import * as api from '@/services/api';
import type { EliminationDays, IngredientContains } from '@/types/reintroduction';

/** 서버가 허용하는 값은 3 또는 7 뿐이다 (ChallengeIn.elimination_days enum) */
const PREP_DAY_OPTIONS: { days: EliminationDays; label: string }[] = [
  { days: 3, label: '가볍게' },
  { days: 7, label: '확실하게' },
];

function formatEndDate(days: number): string {
  const end = new Date();
  end.setDate(end.getDate() + days);
  return `${end.getMonth() + 1}월 ${end.getDate()}일에 끝나요`;
}

/**
 * F2 도전 · 제한 설정.
 * 화면 진입 시 GET /ingredients/{id}/contains 로 관련 음식을 읽어온다(쓰기 없음).
 * 확정 버튼을 눌렀을 때만 POST /challenges 를 호출한다 — 진입/토글로는 절대 호출하지 않는다.
 */
export default function ReintroductionSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { ingredient_id, ingredient_name } = useLocalSearchParams<{
    ingredient_id?: string;
    ingredient_name?: string;
  }>();
  const ingredientId = Number(ingredient_id);

  const [days, setDays] = useState<EliminationDays>();
  const [contains, setContains] = useState<IngredientContains | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  useEffect(() => {
    if (!ingredientId) return;
    api
      .getIngredientContains(ingredientId)
      .then(setContains)
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[F2] GET /ingredients/{id}/contains failed:', err);
        setLoadError(true);
      });
  }, [ingredientId]);

  const ingredientName = contains?.ingredient_name ?? ingredient_name ?? '이 음식';
  const relatedFoods = contains?.contains ?? [];

  const handleConfirm = async () => {
    if (!days || submitting || !ingredientId) return;

    setSubmitError(false);
    setSubmitting(true);
    try {
      const result = await api.createChallenge({
        ingredient_id: ingredientId,
        elimination_days: days,
      });
      router.push({
        pathname: '/reintroduction/progress',
        params: {
          challenge_id: String(result.challenge_id),
          status: result.status,
          eliminate_until: result.eliminate_until,
        },
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[F2] POST /challenges failed:', err);
      setSubmitError(true);
    } finally {
      setSubmitting(false);
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
            <BackButton />
            <ThemedText type="smallBold">{`${ingredientName} 확인하기`}</ThemedText>
          </View>

          <ThemedText type="h1" themeColor="textPrimary" style={styles.title}>
            {`며칠간 ${ingredientName}만\n빼둘게요`}
          </ThemedText>
          <ThemedText type="bodyS" themeColor="textSecondary">
            {`다른 음식은 평소대로 드셔도 돼요.\n${ingredientName} 하나만 잠깐 비워두는 거예요.`}
          </ThemedText>

          <View style={styles.section}>
            <ThemedText type="label" themeColor="textPrimary">
              얼마나 빼둘까요?
            </ThemedText>
            <View style={styles.dayRow}>
              {PREP_DAY_OPTIONS.map((option) => {
                const selected = days === option.days;
                return (
                  <Pressable
                    key={option.days}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setDays(option.days)}
                    style={styles.dayItem}>
                    {({ pressed }) => (
                      /*
                        눌림을 바깥 Pressable 의 opacity 로 표현하지 않는다.
                        안드로이드는 오프스크린 합성을 하지 않아 알파를 그리기 연산마다
                        따로 곱하므로, 불투명 배경을 가진 이 카드와 그 위 글자의 최종색이
                        어긋나 글자 주변에 밝은 사각형이 떠 보인다(MORUButton 주석 참고).
                        대신 색을 칠하는 이 View 자신의 backgroundColor 를 바꾼다.
                      */
                      <View
                        style={[
                          styles.dayCard,
                          {
                            backgroundColor: selected
                              ? pressed
                                ? theme.brandPressed
                                : theme.brand
                              : pressed
                                ? theme.surfacePressed
                                : theme.surfaceCard,
                            borderColor: selected ? theme.brand : theme.borderSubtle,
                          },
                        ]}>
                        <ThemedText
                          type="label"
                          themeColor={selected ? 'textOnBrand' : 'textPrimary'}
                          style={styles.dayNumber}>
                          {`${option.days}일`}
                        </ThemedText>
                        {/*
                          누르는 동안만 캡션을 textSecondary 로 올린다.
                          textMuted 는 surfacePressed(#E0E9E5) 위에서 4.26:1 로 AA 미달이고,
                          textSecondary 면 4.79:1(다크 6.63:1)로 올라온다.
                        */}
                        <ThemedText
                          type="caption"
                          themeColor={
                            selected ? 'textOnBrand' : pressed ? 'textSecondary' : 'textMuted'
                          }>
                          {option.label}
                        </ThemedText>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {days ? (
              <ThemedView type="surfaceCard" style={[styles.endDateRow, { borderColor: theme.borderSubtle }]}>
                <ThemedText type="label" themeColor="textPrimary">
                  {formatEndDate(days)}
                </ThemedText>
                <ThemedView type="brandSoft" style={styles.badge}>
                  <ThemedText type="caption" themeColor="brandText">
                    {`D-${days}`}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            ) : null}
          </View>

          {relatedFoods.length > 0 ? (
            <View style={styles.section}>
              <ThemedText type="label" themeColor="textPrimary">
                {`이런 음식에 ${ingredientName}이 들어있어요`}
              </ThemedText>
              <View style={styles.chipWrap}>
                {relatedFoods.map((name) => (
                  <Chip key={name} label={name} />
                ))}
              </View>
            </View>
          ) : null}

          {loadError ? (
            <ThemedText type="bodyS" themeColor="textSecondary" style={styles.errorText}>
              음식 목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
            </ThemedText>
          ) : null}
          {submitError ? (
            <ThemedText type="bodyS" themeColor="textSecondary" style={styles.errorText}>
              전송에 실패했어요. 잠시 후 다시 시도해주세요.
            </ThemedText>
          ) : null}
        </View>

        {/* POST /challenges 응답을 기다리는 동안이라 disabled 만으로는 대기 중임이 안 보인다 */}
        <BottomButton
          label="이렇게 시작할게요"
          disabled={!days || submitting}
          loading={submitting}
          onPress={handleConfirm}
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
  section: {
    gap: Spacing.two,
  },
  dayRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  dayItem: {
    flex: 1,
  },
  dayCard: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  dayNumber: {
    fontSize: 17,
  },
  endDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  errorText: {
    marginTop: -Spacing.one,
  },
});
