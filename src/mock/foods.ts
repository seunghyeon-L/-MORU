/**
 * 화면 개발용 임시 음식 데이터.
 *
 * Figma 시나리오에 맞춰 "양파가 포함된 식사 4회"를 만들어 둔다.
 * (그중 3회에 불편함 기록이 붙는다 — mock/symptoms.ts 참고)
 */

import type {
  Alternative,
  ChatMessage,
  FoodItem,
  FoodRecord,
  Ingredient,
  MyTableFood,
} from '@/types/food';

/* ------------------------------------------------------------------ */
/* 재료                                                                 */
/* ------------------------------------------------------------------ */

export const mockIngredients = {
  onion: { id: 'onion', name: '양파', note: '가열하면 매운맛이 줄어드는 편이에요.' },
  garlic: { id: 'garlic', name: '마늘' },
  milk: { id: 'milk', name: '우유' },
  wheat: { id: 'wheat', name: '밀' },
  cheese: { id: 'cheese', name: '치즈' },
  pork: { id: 'pork', name: '돼지고기' },
  rice: { id: 'rice', name: '쌀' },
  greenTea: { id: 'green-tea', name: '녹차' },
  cabbage: { id: 'cabbage', name: '양배추' },
  kimchi: { id: 'kimchi', name: '김치' },
  tofu: { id: 'tofu', name: '두부' },
  scallion: { id: 'scallion', name: '대파' },
} satisfies Record<string, Ingredient>;

/* ------------------------------------------------------------------ */
/* 음식                                                                 */
/* ------------------------------------------------------------------ */

export const mockFoodItems: FoodItem[] = [
  {
    id: 'food-kimchi-jjigae',
    name: '김치찌개',
    ingredients: [
      mockIngredients.kimchi,
      mockIngredients.pork,
      mockIngredients.tofu,
      mockIngredients.onion,
      mockIngredients.garlic,
      mockIngredients.scallion,
    ],
    confirmedByUser: true,
  },
  {
    id: 'food-cream-pasta',
    name: '크림 파스타',
    ingredients: [
      mockIngredients.onion,
      mockIngredients.milk,
      mockIngredients.wheat,
      mockIngredients.cheese,
    ],
    confirmedByUser: true,
  },
  {
    id: 'food-bibimbap',
    name: '비빔밥',
    ingredients: [mockIngredients.onion, mockIngredients.rice, mockIngredients.cabbage],
    confirmedByUser: true,
  },
  {
    id: 'food-fried-rice',
    name: '볶음밥',
    ingredients: [mockIngredients.onion, mockIngredients.rice, mockIngredients.garlic],
    confirmedByUser: true,
  },
  {
    id: 'food-green-tea-latte',
    name: '녹차라떼',
    ingredients: [mockIngredients.greenTea, mockIngredients.milk],
    confirmedByUser: false,
  },
];

/* ------------------------------------------------------------------ */
/* 음식 기록 — 양파가 포함된 식사 4회                                    */
/* ------------------------------------------------------------------ */

export const mockFoodRecords: FoodRecord[] = [
  {
    id: 'food-record-1',
    food: mockFoodItems[0],
    eatenAt: '2026-08-05T12:30:00.000Z',
    inputMethod: 'photo',
    portion: 'normal',
    cookingMethod: 'boiled',
  },
  {
    id: 'food-record-2',
    food: mockFoodItems[1],
    eatenAt: '2026-08-09T19:10:00.000Z',
    inputMethod: 'search',
    portion: 'large',
    cookingMethod: 'stir-fried',
  },
  {
    id: 'food-record-3',
    food: mockFoodItems[2],
    eatenAt: '2026-08-13T12:00:00.000Z',
    inputMethod: 'manual',
    portion: 'normal',
    cookingMethod: 'raw',
  },
  {
    id: 'food-record-4',
    food: mockFoodItems[3],
    eatenAt: '2026-08-17T18:40:00.000Z',
    inputMethod: 'photo',
    portion: 'small',
    cookingMethod: 'stir-fried',
  },
];

/* ------------------------------------------------------------------ */
/* 대체 제안 (food/alternative)                                         */
/* ------------------------------------------------------------------ */

export const mockAlternatives: Alternative[] = [
  {
    id: 'alt-1',
    kind: 'method',
    title: '소량부터 시도해보기',
    description: '평소보다 조금만',
  },
  {
    id: 'alt-2',
    kind: 'method',
    title: '반 그릇만 드시기',
    description: '국물은 조금, 건더기 위주로',
  },
  {
    id: 'alt-3',
    kind: 'ingredient',
    title: '마늘 빼달라고 요청하기',
    description: '식당에서도 대부분 가능해요',
  },
  {
    id: 'alt-4',
    kind: 'menu',
    title: '다른 메뉴 골라보기',
    description: '맑은 국 · 된장찌개',
  },
];

/* ------------------------------------------------------------------ */
/* AI 채팅 (food/chat) — 지금은 mock 응답만 사용한다                     */
/* ------------------------------------------------------------------ */

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'chat-1',
    role: 'user',
    text: '녹차라떼 마시고 싶어!',
    createdAt: '2026-08-18T10:00:00.000Z',
  },
  {
    id: 'chat-2',
    role: 'assistant',
    text: '녹차라떼, 즐기고 싶은 마음 너무 잘 알아요 😊\n당신에게 더 편안할 수 있는 방법을 찾아볼게요.',
    createdAt: '2026-08-18T10:00:03.000Z',
  },
];

/* ------------------------------------------------------------------ */
/* 나의 식탁 ((tabs)/table)                                             */
/* ------------------------------------------------------------------ */

/** 원래 피하던 음식 전체 개수 (온보딩에서 등록한 회피 목록 기준) — 확장 현황 요약(ExpansionCard)에 사용 */
export const mockOriginallyAvoidedCount = 8;

export const mockMyTableFoods: MyTableFood[] = [
  {
    id: 'table-milk',
    name: '우유',
    status: 'safe',
    comfortableCount: 5,
    totalCount: 5,
  },
  {
    id: 'table-wheat-bread',
    name: '밀빵',
    status: 'safe',
    comfortableCount: 4,
    totalCount: 4,
  },
  {
    id: 'table-legumes',
    name: '콩류',
    status: 'safe',
    comfortableCount: 3,
    totalCount: 3,
  },
  {
    id: 'table-coffee',
    name: '커피',
    status: 'safe',
    comfortableCount: 6,
    totalCount: 6,
  },
  {
    id: 'table-soda',
    name: '탄산음료',
    status: 'safe',
    comfortableCount: 3,
    totalCount: 4,
  },
  {
    id: 'table-apple',
    name: '사과',
    status: 'safe',
    comfortableCount: 4,
    totalCount: 4,
  },
  {
    id: 'table-onion',
    name: '양파',
    status: 'candidate',
    comfortableCount: 1,
    totalCount: 3,
  },
  {
    id: 'table-garlic',
    name: '마늘',
    status: 'unconfirmed',
    comfortableCount: 0,
    totalCount: 0,
  },
  {
    id: 'table-spicy',
    name: '매운 음식',
    status: 'unconfirmed',
    comfortableCount: 0,
    totalCount: 0,
  },
];
