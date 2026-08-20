import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CandidateFoodCard } from '@/components/table/CandidateFoodCard';
import { ExpansionCard } from '@/components/table/ExpansionCard';
import { MoreVerticalIcon } from '@/components/common/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { BottomTabInset, Spacing } from '@/constants/theme';
import * as api from '@/services/api';
import type { MyTableResponse, MyTableSection } from '@/types/food';

/**
 * 탭 화면 콘텐츠 맨 아래에서 하단 탭바가 먹는 높이. 자세한 근거는 (tabs)/index.tsx 의 같은 상수 주석 참고.
 * 요약: 탭 화면의 레이아웃 높이는 세 플랫폼 모두 "탭바를 포함한 전체 높이"인데,
 * 안드로이드만 실제 콘텐츠 영역이 탭바 위에서 끝나서(TabsHost.kt 의 세로 LinearLayout)
 * 아래쪽이 잘린다. iOS·웹은 탭바가 덮는다. 어느 쪽이든 이만큼은 비워 둬야 한다.
 */

function TableSectionBlock({
  section,
  theme,
  onCheck,
}: {
  section: MyTableSection;
  theme: ReturnType<typeof useTheme>;
  onCheck: () => void;
}) {
  if (section.items.length === 0) return null;

  switch (section.status) {
    case 'safe':
      return (
        <View style={styles.section}>
          <ThemedText type="label" themeColor="textPrimary">
            {section.title}
          </ThemedText>
          <View style={styles.tagWrap}>
            {section.items.map((item) => (
              <ThemedView key={item.id} type="brandSoft" style={styles.tag}>
                <View style={[styles.tagDot, { backgroundColor: theme.brand }]} />
                <ThemedText type="label" themeColor="brandText">
                  {item.label}
                </ThemedText>
              </ThemedView>
            ))}
          </View>
        </View>
      );

    case 'candidate':
      return (
        <View style={styles.section}>
          <ThemedText type="label" themeColor="textPrimary">
            {section.title}
          </ThemedText>
          {section.items.map((item) => (
            <ThemedView
              key={item.id}
              type="surfaceCard"
              style={[styles.candidateCard, { borderColor: theme.coral }]}>
              <ThemedText type="label" themeColor="textPrimary">
                {item.label}
              </ThemedText>
              {item.note || item.hint ? (
                <ThemedText type="caption" themeColor="textMuted">
                  {[item.note, item.hint].filter(Boolean).join(' · ')}
                </ThemedText>
              ) : null}
            </ThemedView>
          ))}
        </View>
      );

    case 'to_try':
      return (
        <View style={styles.section}>
          <ThemedText type="label" themeColor="textPrimary">
            {section.title}
          </ThemedText>
          <View style={styles.candidateList}>
            {section.items.map((item) => (
              <CandidateFoodCard key={item.id} food={item} onCheck={onCheck} />
            ))}
          </View>
        </View>
      );

    default:
      return null;
  }
}

/**
 * G 나의 식탁.
 * GET /mytable 을 화면 진입마다 직접 불러온다 — useMoruData 의 1회성 캐시를 쓰지 않는다.
 * F4 "나의 식탁에 저장하기"(POST /challenges/{id}/save) 이후 이 화면으로 돌아왔을 때
 * 최신 상태가 반영되려면 재진입 시마다 새로 조회해야 하기 때문이다.
 * 점수형 UI는 쓰지 않고, 서버가 준 headline/title/note/hint 문구를 그대로 표시한다.
 */
export default function TableScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [table, setTable] = useState<MyTableResponse | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    api
      .getMyTable()
      .then(setTable)
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[G] GET /mytable failed:', err);
        setLoadError(true);
      });
  }, []);

  const goToReintroduction = () => router.push('/reintroduction');

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <ThemedView
        type="onboardingBackground"
        style={[
          styles.container,
          {
            paddingTop: insets.top + Spacing.three,
            paddingBottom: insets.bottom + BottomTabInset + Spacing.three,
          },
        ]}>
        <View style={styles.headerRow}>
          <ThemedText type="h1" themeColor="textPrimary">
            나의 식탁
          </ThemedText>
          <MoreVerticalIcon size={20} color={theme.textMuted} />
        </View>

        {table ? (
          <>
            <ExpansionCard headline={table.headline} sub={table.sub} />

            {table.sections.map((section) => (
              <TableSectionBlock
                key={section.status}
                section={section}
                theme={theme}
                onCheck={goToReintroduction}
              />
            ))}

            {table.saved_recommendations.length > 0 ? (
              <View style={styles.section}>
                <ThemedText type="label" themeColor="textPrimary">
                  저장한 추천
                </ThemedText>
                <View style={styles.savedList}>
                  {table.saved_recommendations.map((rec) => {
                    const card = (
                      <ThemedView type="surfaceCard" style={styles.savedCard}>
                        <ThemedText type="label" themeColor="textPrimary">
                          {rec.title}
                        </ThemedText>
                      </ThemedView>
                    );
                    const key = `${rec.kind}-${rec.ref_id}`;
                    // screen 기준으로 진입 화면을 정한다 — kind 로 다시 추론하지 않는다
                    const target =
                      rec.screen === 'H2'
                        ? { pathname: '/food/alternative/recipe' as const, params: { recipe_id: String(rec.ref_id) } }
                        : rec.screen === 'H3'
                          ? {
                              pathname: '/food/alternative/substitute' as const,
                              params: { ingredient_ids: String(rec.ref_id) },
                            }
                          : rec.screen === 'H5'
                            ? {
                                pathname: '/food/alternative/menu' as const,
                                params: { food_id: String(rec.ref_id) },
                              }
                            : null;

                    if (!target) {
                      return <View key={key}>{card}</View>;
                    }
                    return (
                      <Pressable key={key} onPress={() => router.push(target)}>
                        {card}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}
          </>
        ) : loadError ? (
          <ThemedText type="bodyS" themeColor="textSecondary" style={styles.errorText}>
            나의 식탁 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </ThemedText>
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
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  section: {
    gap: Spacing.two,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: Spacing.two,
    borderRadius: 999,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  candidateCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1.5,
    gap: 4,
  },
  candidateList: {
    gap: Spacing.two,
  },
  savedList: {
    gap: Spacing.two,
  },
  savedCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  errorText: {
    marginTop: Spacing.three,
  },
});
