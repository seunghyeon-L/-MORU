/**
 * 화면 개발용 임시 음식 데이터.
 *
 * Figma 시나리오에 맞춰 "양파가 포함된 식사 4회"를 만들어 둔다.
 * (그중 3회에 불편함 기록이 붙는다 — mock/symptoms.ts 참고)
 */

import type { FoodItem, FoodRecord, Ingredient } from '@/types/food';

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
  gochujang: { id: 'gochujang', name: '고추장' },
  sugar: { id: 'sugar', name: '설탕' },
  sesameOil: { id: 'sesame-oil', name: '참기름' },
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
  {
    id: 'food-jeyuk-bokkeum',
    name: '제육볶음',
    ingredients: [
      mockIngredients.pork,
      mockIngredients.onion,
      mockIngredients.garlic,
      mockIngredients.gochujang,
      mockIngredients.sugar,
      mockIngredients.sesameOil,
    ],
    confirmedByUser: true,
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
/* H2~H5(레시피/성분 대체/대체 메뉴/음식 기반 대체안) — 실제 API 연동으로     */
/* 대체되어 더 이상 사용하지 않는다 (services/api.ts 참고)                  */
/* AI 채팅 (food/chat) — POST /chat/messages 실제 연동으로 대체되어         */
/* 더 이상 사용하지 않는다. 대화 이력을 불러오는 엔드포인트는 계약에 없다      */
/* 나의 식탁 ((tabs)/table) — GET /mytable 실제 연동으로 대체되어          */
/* 더 이상 사용하지 않는다 (services/api.ts 의 getMyTable 참고)             */
/* ------------------------------------------------------------------ */
