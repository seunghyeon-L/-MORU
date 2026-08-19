import { Link, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ScreenLink = {
  label: string;
  href: Href;
  /** 히스토리를 쌓지 않고 이동 (온보딩 → 탭 진입 등) */
  replace?: boolean;
};

export type ScreenPlaceholderProps = {
  title: string;
  /** 이 화면이 담당할 내용 요약 */
  description?: string;
  /** Figma 확정 후 이 화면에 들어갈 항목들 */
  items?: string[];
  /** 라우팅 확인용 이동 링크 */
  links?: ScreenLink[];
  children?: ReactNode;
};

/**
 * 라우팅 구조를 먼저 확인하기 위한 임시 화면 틀이다.
 * Figma UI를 구현할 때 각 화면에서 이 컴포넌트를 걷어내면 된다.
 */
export function ScreenPlaceholder({
  title,
  description,
  items,
  links,
  children,
}: ScreenPlaceholderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: insets.top + Spacing.four, paddingBottom: insets.bottom + Spacing.six },
      ]}>
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle">{title}</ThemedText>

        {description ? (
          <ThemedText type="small" themeColor="textSecondary">
            {description}
          </ThemedText>
        ) : null}

        {items?.length ? (
          <ThemedView type="backgroundElement" style={styles.itemBox}>
            {items.map((item) => (
              <ThemedText key={item} type="small" themeColor="textSecondary">
                {`· ${item}`}
              </ThemedText>
            ))}
          </ThemedView>
        ) : null}

        {children}

        {links?.length ? (
          <ThemedView style={styles.links}>
            {links.map((link) => (
              <Link
                key={`${link.label}-${String(link.href)}`}
                href={link.href}
                replace={link.replace}
                asChild>
                <Pressable style={({ pressed }) => pressed && styles.pressed}>
                  <ThemedView type="backgroundElement" style={styles.linkButton}>
                    <ThemedText type="linkPrimary">{link.label}</ThemedText>
                  </ThemedView>
                </Pressable>
              </Link>
            ))}
          </ThemedView>
        ) : null}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  container: {
    flexGrow: 1,
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  itemBox: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.half,
  },
  links: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  linkButton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
