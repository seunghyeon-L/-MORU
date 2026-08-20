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
 * suggestions(screen="D2"|"H4")는 서버가 준 food_id/food_name 을 그대로 다음 화면에 전달하며,
 * 답변 텍스트에서 음식 이름을 추출해 food_id 를 만들지 않는다.
 * - screen="D2"(음식 기록 흐름)는 D1 바텀시트(메뉴 검색/직접 입력, mode=search|manual)로 들어온
 *   대화에서만 탭으로 이동한다 — 일반 "AI와 대화하기"에서 음식 기록 화면으로 강제 이동시키지 않는다.
 * - screen="H4"(대체안 허브)는 진입 방식과 무관하게 탭하면 이동한다.
 *
 * targetFood: 이 세션 중 서버가 처음으로 food_id 를 확정해서 준 음식을 고정해서 기억한다.
 * "대체 레시피"/"성분 조절 제안"/"나에게 맞는 선택" 하단 카드는 targetFood 가 이미 있으면
 * AI에게 다시 묻지 않고 그 food_id 로 곧장 H4(대체안 허브)로 이동한다 — H4 는 이미
 * GET /foods/{food_id}/alternatives 로 대체 성분(H3)/대체 메뉴(H5)/대체 레시피(H3→H2)까지
 * 실제 API로 뻗어나가는 화면이라, 하단 3개 카드를 각각 다른 화면으로 억지로 분기시키지 않고
 * 이미 검증된 이 허브로 보낸다. targetFood 가 아직 없으면(대화에서 음식이 확정되기 전) 기존처럼
 * 카드 문구를 채팅으로 보내고, 그 응답에 food_id 가 실려 오면 그때 targetFood 로 고정된다.
 * 한번 고정된 targetFood 는 이후 대화에서 다른 음식이 언급돼도 바뀌지 않는다.
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
  /** 이 대화 세션에서 서버가 처음 확정해준 food_id — 한번 정해지면 바뀌지 않는다 */
  const [targetFood, setTargetFood] = useState<{ food_id: number; food_name?: string }>();

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

      // 이 세션에서 처음으로 food_id 가 확정되면 targetFood 로 고정한다 — 이후 다른 음식이
      // 언급돼도 덮어쓰지 않는다(Test 4: 기준 음식은 최초 확정된 값에서 바뀌지 않아야 함).
      if (!targetFood) {
        const withFood = response.suggestions.find((suggestion) => suggestion.food_id !== undefined);
        if (withFood?.food_id !== undefined) {
          setTargetFood({ food_id: withFood.food_id, food_name: withFood.food_name });
        }
      }

      setSuggestions(response.suggestions);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[H1] POST /chat/messages failed:', err);
    } finally {
      setSending(false);
    }
  };

  /** D2 는 음식 기록 흐름 전용이라 D1 바텀시트로 들어온 대화(isFoodEntry)에서만 이동을 허용한다 */
  const isSuggestionNavigable = (suggestion: ChatSuggestion) =>
    (isFoodEntry && suggestion.screen === 'D2' && suggestion.food_id !== undefined) ||
    (suggestion.screen === 'H4' && (targetFood?.food_id ?? suggestion.food_id) !== undefined);

  const handleSuggestionPress = (suggestion: ChatSuggestion) => {
    if (isFoodEntry && suggestion.screen === 'D2' && suggestion.food_id !== undefined) {
      router.push({
        pathname: '/food/result',
        params: { food_id: String(suggestion.food_id), foodName: suggestion.food_name, mode },
      });
    } else if (suggestion.screen === 'H4') {
      // targetFood 가 이미 고정돼 있으면 이 대화 세션 전체에서 그 food_id 를 우선한다
      const foodId = targetFood?.food_id ?? suggestion.food_id;
      if (foodId !== undefined) {
        router.push({ pathname: '/food/alternative', params: { food_id: String(foodId) } });
      }
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
                  onPress={isSuggestionNavigable(suggestion) ? () => handleSuggestionPress(suggestion) : undefined}
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
                // targetFood 가 이미 확정돼 있으면 AI에게 다시 묻지 않고 곧장 그 음식의 H4로 이동한다.
                // 아직 없으면 기존처럼 카드 문구를 채팅으로 보내 AI가 음식을 확정하게 한다.
                onPress={() =>
                  targetFood
                    ? router.push({
                        pathname: '/food/alternative',
                        params: { food_id: String(targetFood.food_id) },
                      })
                    : send(prompt.title)
                }
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
