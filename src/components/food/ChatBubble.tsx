import { StyleSheet } from 'react-native';

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
    <ThemedView style={[styles.row, isUser ? styles.rowEnd : styles.rowStart]}>
      {!isUser ? (
        <ThemedView type="brand" style={styles.avatar}>
          <ThemedText type="caption" themeColor="textOnBrand">
            M
          </ThemedText>
        </ThemedView>
      ) : null}
      <ThemedView type="surfaceCard" style={styles.bubble}>
        <ThemedText type="bodyS" themeColor="textPrimary" style={styles.bubbleText}>
          {message.text}
        </ThemedText>
      </ThemedView>
    </ThemedView>
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
  bubbleText: {
    lineHeight: 22,
  },
});
