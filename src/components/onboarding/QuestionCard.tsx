import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export type QuestionCardProps = {
  question: string;
  /** 보조 설명. 불안을 높이지 않는 중립적 문구를 사용한다 */
  helperText?: string;
  children?: ReactNode;
};

/**
 * 온보딩 한 화면에 들어가는 질문 + 선택지 묶음.
 * 좌우 여백은 화면(screen) 컨테이너가 갖고 있으므로 여기서는 세로 간격만 담당한다.
 */
export function QuestionCard({ question, helperText, children }: QuestionCardProps) {
  return (
    <ThemedView type="onboardingBackground" style={styles.container}>
      <ThemedText type="h1" themeColor="textPrimary">
        {question}
      </ThemedText>

      {helperText ? (
        <ThemedText type="bodyS" themeColor="textSecondary">
          {helperText}
        </ThemedText>
      ) : null}

      <ThemedView type="onboardingBackground" style={styles.options}>
        {children}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  options: {
    gap: Spacing.two,
    paddingTop: Spacing.four,
  },
});
