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
import type { ChatMessage, ChatSuggestion } from '@/types/food';

type StaticPrompt = {
  id: string;
  title: string;
  description: string;
  iconBg: 'brandLight' | 'coralLight';
  Icon: typeof DocumentIcon;
};

const STATIC_PROMPTS: StaticPrompt[] = [
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
 *
 * D1 바텀시트(메뉴 검색/직접 입력, mode=search|manual)로 들어온 "음식 기록용" 대화에서만
 * suggestions(screen="D2"|"H4") 탭이 화면 이동을 일으킨다 — 서버가 준 food_id/food_name 을
 * 그대로 다음 화면에 전달하며, 답변 텍스트에서 음식 이름을 추출해 food_id 를 만들지 않는다.
 * 바텀시트를 거치지 않은 일반 "AI와 대화하기"는 대체 레시피/성분 대체/개인화 추천을 대화로만
 * 응답하는 기능이라, 뒤로가기를 누르기 전까지 어떤 이유로도 화면을 벗어나지 않는다.
 * blocked:true 면 suggestions 가 오지 않으므로 별도 분기 없이 자연히 아무것도 뜨지 않는다.
 */
export default function FoodChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  // D1 "메뉴 검색"/"직접 입력"에서 들어온 경우에만 입력창 placeholder 를 음식 이름 기준으로 바꾼다
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isFoodEntry = mode === 'search' || mode === 'manual';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<number>();
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  /**
   * fromInput 은 사용자가 입력창에 직접 타이핑해서 보낸 메시지일 때만 true 로 넘긴다.
   * "이렇게 도와드릴게요" 추천 카드(대체 레시피 등)는 대화 예시일 뿐 음식 이름이 아니므로,
   * 탭했을 때는 food-entry 모드여도 D2로 자동 이동하지 않는다.
   */
  const send = async (text: string, fromInput = false) => {
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
    setSuggestions([]);
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

      // D1 "메뉴 검색"/"직접 입력"은 음식 "기록" 기능이라 대화창에 머무르지 않고 항상 D2로 넘어간다.
      // suggestions 에 food_id 가 있으면 그대로 쓰고, 없으면 입력한 텍스트로 D2 자체 identify 를 태운다.
      if (isFoodEntry && fromInput) {
        const d2Suggestion = response.suggestions.find((suggestion) => suggestion.screen === 'D2');
        router.push({
          pathname: '/food/result',
          params: {
            foodName: d2Suggestion?.food_name ?? trimmed,
            food_id: d2Suggestion?.food_id !== undefined ? String(d2Suggestion.food_id) : undefined,
            mode,
          },
        });
        return;
      }

      setSuggestions(response.suggestions);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[H1] POST /chat/messages failed:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSuggestionPress = (suggestion: ChatSuggestion) => {
    if (suggestion.screen === 'D2' && suggestion.food_id !== undefined) {
      router.push({
        pathname: '/food/result',
        params: { food_id: String(suggestion.food_id), foodName: suggestion.food_name, mode },
      });
    } else if (suggestion.screen === 'H4' && suggestion.food_id !== undefined) {
      router.push({ pathname: '/food/alternative', params: { food_id: String(suggestion.food_id) } });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ThemedView type="onboardingBackground" style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <BackButton />
          <ThemedText type="smallBold" themeColor="textPrimary">
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

          {suggestions.length > 0 ? (
            <View style={styles.chatSuggestions}>
              {suggestions.map((suggestion, index) => (
                <SelectionCard
                  key={`${suggestion.screen}-${index}`}
                  title={suggestion.label}
                  // 바텀시트(메뉴 검색/직접 입력)로 들어온 기록용 대화에서만 탭으로 화면 이동한다.
                  // 일반 "AI와 대화하기"는 뒤로가기 전까지 대화창에 머물러야 해서 탭해도 이동하지 않는다.
                  onPress={isFoodEntry ? () => handleSuggestionPress(suggestion) : undefined}
                />
              ))}
            </View>
          ) : null}

          <ThemedText type="label" themeColor="textPrimary" style={styles.sectionLabel}>
            이렇게 도와드릴게요
          </ThemedText>

          <View style={styles.suggestions}>
            {STATIC_PROMPTS.map((prompt) => (
              <SelectionCard
                key={prompt.id}
                title={prompt.title}
                description={prompt.description}
                onPress={() => send(prompt.title)}
                accessory={
                  <ThemedView type={prompt.iconBg} style={styles.suggestionIcon}>
                    <prompt.Icon
                      size={20}
                      color={prompt.iconBg === 'coralLight' ? theme.coral : theme.brandText}
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
              onSubmitEditing={() => send(input, true)}
              placeholder={isFoodEntry ? '음식 이름을 입력해주세요 (예: 김치찌개)' : '궁금한 걸 물어보세요'}
              placeholderTextColor={theme.textMuted}
              style={[styles.input, { color: theme.textPrimary }]}
              returnKeyType="send"
            />
          </ThemedView>
          <Pressable onPress={() => send(input, true)} disabled={!input.trim()}>
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
  chatSuggestions: {
    gap: 8,
    marginTop: Spacing.two,
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
