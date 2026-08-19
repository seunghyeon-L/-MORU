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
      <ThemedView
        type={isUser ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.bubble}>
        <ThemedText type="small">{message.text}</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: Spacing.one,
  },
  rowStart: {
    justifyContent: 'flex-start',
  },
  rowEnd: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
});
