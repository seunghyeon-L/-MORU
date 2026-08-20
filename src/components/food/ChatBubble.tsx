import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { ChatMessage } from '@/types/food';

export type ChatBubbleProps = {
  message: ChatMessage;
};

/** AI 채팅 말풍선. AI는 제안형·중립적 어조로만 응답한다. */
export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    // 배경이 없는 순수 레이아웃 행 — ThemedView(배경 있음)를 쓰면 메시지마다
    // 화면 전체 폭짜리 흰 띠가 깔려 이어 붙은 큰 흰 사각형처럼 보인다.
    <View style={[styles.row, isUser ? styles.rowEnd : styles.rowStart]}>
      {!isUser ? (
        <ThemedView type="brand" style={styles.avatar}>
          <ThemedText type="caption" themeColor="textOnBrand">
            M
          </ThemedText>
        </ThemedView>
      ) : null}
      <ThemedView
        type={isUser ? 'brand' : 'surfaceCard'}
        style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <ThemedText
          type="bodyS"
          themeColor={isUser ? 'textOnBrand' : 'textPrimary'}
          style={styles.bubbleText}>
          {message.text}
        </ThemedText>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingVertical: Spacing.one,
  },
  rowStart: {
    justifyContent: 'flex-start',
  },
  rowEnd: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
  },
  bubbleUser: {
    borderBottomRightRadius: 6,
  },
  bubbleAssistant: {
    borderBottomLeftRadius: 6,
  },
  bubbleText: {
    lineHeight: 22,
  },
});
