import { ScreenPlaceholder } from '@/components/common/ScreenPlaceholder';

/**
 * AI 채팅 화면.
 *
 * 지금은 services/api.ts 의 mock 응답만 사용한다.
 * 온보딩 정보와 음식/증상 기록은 ChatContext 로 전달할 수 있게 구조만 잡아 두었다.
 * AI는 결정을 대신하지 않고 참고할 만한 선택지를 제안하는 역할만 한다.
 */
export default function FoodChatScreen() {
  return (
    <ScreenPlaceholder
      title="AI에게 물어보기"
      description="먹고 싶은 음식이나 궁금한 점을 물어보세요. 함께 선택지를 찾아볼게요."
      items={['대화 목록', '입력창', 'mock 응답 사용 중', '온보딩·기록 컨텍스트 전달 예정']}
      links={[{ label: '대체 음식 보기', href: '/food/alternative' }]}
    />
  );
}
