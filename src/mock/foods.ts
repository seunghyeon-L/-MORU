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
    text: '녹차라떼가 먹고 싶어요.',
    createdAt: '2026-08-18T10:00:00.000Z',
  },
  {
    id: 'chat-2',
    role: 'assistant',
    text: '녹차라떼에는 우유가 들어가요. 우유를 줄이거나 다른 재료로 바꿔보는 방법도 함께 살펴볼 수 있어요.',
    createdAt: '2026-08-18T10:00:03.000Z',
  },
];

/* ------------------------------------------------------------------ */
/* 나의 식탁 ((tabs)/table)                                             */
/* ------------------------------------------------------------------ */

export const mockMyTableFoods: MyTableFood[] = [
  {
    id: 'table-rice',
    name: '흰쌀밥',
    status: 'safe',
    lastEatenAt: '2026-08-18T12:00:00.000Z',
    comfortableCount: 12,
    totalCount: 12,
  },
  {
    id: 'table-banana',
    name: '바나나',
    status: 'safe',
    lastEatenAt: '2026-08-16T08:30:00.000Z',
    comfortableCount: 7,
    totalCount: 8,
  },
  {
    id: 'table-cabbage',
    name: '양배추찜',
    status: 'safe',
    lastEatenAt: '2026-08-14T19:00:00.000Z',
    comfortableCount: 5,
    totalCount: 5,
  },
  {
    id: 'table-yogurt',
    name: '요거트',
    status: 'candidate',
    lastEatenAt: '2026-05-02T09:00:00.000Z',
    comfortableCount: 1,
    totalCount: 2,
  },
  {
    id: 'table-bread',
    name: '식빵',
    status: 'candidate',
    lastEatenAt: '2026-04-20T08:00:00.000Z',
    comfortableCount: 2,
    totalCount: 3,
  },
];
