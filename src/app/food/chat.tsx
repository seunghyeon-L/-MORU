import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { SelectionCard } from '@/components/common/SelectionCard';
import { CloverIcon, DocumentIcon, RefreshIcon, SendArrowIcon } from '@/components/common/icons';
import { ChatBubble } from '@/components/food/ChatBubble';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import * as api from '@/services/api';
import type { ChatMessage } from '@/types/food';

type Suggestion = {
  id: string;
  title: string;
  description: string;
  iconBg: 'brandLight' | 'coralLight';
  Icon: typeof DocumentIcon;
};

const SUGGESTIONS: Suggestion[] = [
  {
    id: 'recipe',
    title: '대체 레시피',
    description: '속 편한 녹차라떼 레시피 보기',
    iconBg: 'brandLight',
    Icon: DocumentIcon,
  },
  {
    id: 'adjust',
    title: '성분 조절 제안',
    description: '어떤 성분을 줄이거나 바꿀 수 있을까요?',
    iconBg: 'coralLight',
    Icon: RefreshIcon,
  },
  {
    id: 'personalized',
    title: '나에게 맞는 선택',
    description: '내 기록을 바탕으로 추천해드릴게요',
    iconBg: 'brandLight',
    Icon: CloverIcon,
  },
];

/**
 * H1 AI와 대화하기.
 * AI는 결정을 대신하지 않고 참고할 만한 선택지를 제안하는 역할만 한다.
 * POST /chat/messages 를 전송 시점에만 호출한다 — 대화 이력을 불러오는 엔드포인트는
 * 계약에 없어 화면은 항상 빈 대화로 시작한다. session_id 를 들고 있다가 다음 전송에
 * 그대로 실어 보내면 서버가 같은 대화로 이어준다.
 */
export default function FoodChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  // D1 "메뉴 검색"/"직접 입력"에서 들어온 경우에만 첫 입력을 D2로 전달한다
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isFoodEntry = mode === 'search' || mode === 'manual';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<number>();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const userMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      role: 'user',
      text: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const response = await api.sendChatMessage({ session_id: sessionId, text: trimmed });
      setSessionId(response.session_id);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: response.reply,
          createdAt: new Date().toISOString(),
        },
      ]);

      if (isFoodEntry) {
        router.push({ pathname: '/food/result', params: { foodName: trimmed } });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[H1] POST /chat/messages failed:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ThemedView type="onboardingBackground" style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <BackButton />
          <ThemedText type="label" themeColor="textPrimary">
            AI와 대화하기
          </ThemedText>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}

          <ThemedText type="label" themeColor="textPrimary" style={styles.sectionLabel}>
            이렇게 도와드릴게요
          </ThemedText>

          <View style={styles.suggestions}>
            {SUGGESTIONS.map((suggestion) => (
              <SelectionCard
                key={suggestion.id}
                title={suggestion.title}
                description={suggestion.description}
                onPress={() => send(suggestion.title)}
                accessory={
                  <ThemedView type={suggestion.iconBg} style={styles.suggestionIcon}>
                    <suggestion.Icon
                      size={20}
                      color={suggestion.iconBg === 'coralLight' ? theme.coral : theme.brandText}
                    />
                  </ThemedView>
                }
              />
            ))}
          </View>
        </ScrollView>

        <View style={[styles.inputRow, { paddingBottom: insets.bottom + Spacing.two }]}>
          <ThemedView type="surfaceCard" style={styles.inputWrap}>
            <TextInput
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => send(input)}
              placeholder={isFoodEntry ? '음식 이름을 입력해주세요 (예: 김치찌개)' : '궁금한 걸 물어보세요'}
              placeholderTextColor={theme.textMuted}
              style={[styles.input, { color: theme.textPrimary }]}
              returnKeyType="send"
            />
          </ThemedView>
          <Pressable onPress={() => send(input)} disabled={!input.trim()}>
            <ThemedView type="brand" style={[styles.sendButton, !input.trim() && styles.sendButtonDimmed]}>
              <SendArrowIcon size={18} color={theme.textOnBrand} />
            </ThemedView>
          </Pressable>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.two,
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  sectionLabel: {
    marginTop: Spacing.four,
    marginBottom: 10,
  },
  suggestions: {
    gap: 10,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  inputWrap: {
    flex: 1,
    borderRadius: 999,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  input: {
    fontSize: 13.5,
    paddingVertical: 13,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDimmed: {
    opacity: 0.5,
  },
});
