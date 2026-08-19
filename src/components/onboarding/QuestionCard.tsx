import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export type QuestionCardProps = {
  question: string;
  /** 보조 설명. 불안을 높이지 않는 중립적 문구를 사용한다 */
  helperText?: string;
  /** 복수 선택 가능 여부 안내 */
  multiple?: boolean;
  children?: ReactNode;
};

/** 온보딩 한 화면에 들어가는 질문 + 선택지 묶음 */
export function QuestionCard({ question, helperText, multiple, children }: QuestionCardProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="default">{question}</ThemedText>

      {helperText ? (
        <ThemedText type="small" themeColor="textSecondary">
          {helperText}
        </ThemedText>
      ) : null}

      {multiple ? (
        <ThemedText type="small" themeColor="textSecondary">
          해당하는 것을 모두 선택해주세요.
        </ThemedText>
      ) : null}

      <ThemedView style={styles.options}>{children}</ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  options: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
});
