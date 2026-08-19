/**
 * 화면 개발용 임시 음식 데이터.
 *
 * Figma 시나리오에 맞춰 "양파가 포함된 식사 4회"를 만들어 둔다.
 * (그중 3회에 불편함 기록이 붙는다 — mock/symptoms.ts 참고)
 */

import type {
  Alternative,
  FoodItem,
  FoodRecord,
  Ingredient,
  IngredientSubstitution,
  MenuSuggestion,
  Recipe,
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
/* 대체 레시피 (food/alternative/recipe — H2)                           */
/* ------------------------------------------------------------------ */

export const mockRecipe: Recipe = {
  id: 'recipe-green-tea-latte',
  title: '속 편한 녹차라떼 레시피',
  ingredients: [
    { name: '우유 (또는 락토프리 우유)', amount: '150ml' },
    { name: '녹차가루', amount: '1/2 tsp' },
    { name: '알룰로스', amount: '1 tsp (선택)' },
    { name: '바닐라 익스트랙', amount: '2~3방울 (선택)' },
  ],
  tip: '우유 대신 오트우유를 사용하면 더 편안할 수 있어요.',
};

/* ------------------------------------------------------------------ */
/* 성분 대체 방법 (food/alternative/substitute — H3)                     */
/* ------------------------------------------------------------------ */

export const mockSubstitutions: IngredientSubstitution[] = [
  { id: 'sub-milk', original: '우유', substitute: '락토프리 우유', note: '또는 오트우유, 아몬드우유' },
  { id: 'sub-sugar', original: '설탕', substitute: '알룰로스, 스테비아', note: '또는 꿀 소량' },
  { id: 'sub-syrup', original: '시럽/소스', substitute: '바닐라 익스트랙', note: '또는 시나몬 파우더' },
];

export const mockSubstitutionTips = [
  { title: '양을 줄여서 시작하기', description: '소량으로 먼저 시도해보세요.' },
  { title: '공복은 피하기', description: '식사 후 또는 간식과 함께 드세요.' },
];

/* ------------------------------------------------------------------ */
/* 대체 메뉴 제안 (food/alternative/menu — H5)                          */
/* ------------------------------------------------------------------ */

export const mockMenuSuggestions: MenuSuggestion[] = [
  { id: 'menu-1', name: '간장 돼지고기 덮밥', description: '양념 자극이 적어요.' },
  { id: 'menu-2', name: '두부 간장 덮밥', description: '식물성 단백질로 편안하게.' },
  { id: 'menu-3', name: '오징어 숙주볶음', description: '매운 양념 없이 깔끔해요.' },
];

export const mockMoreMenuSuggestions: MenuSuggestion[] = [
  { id: 'menu-4', name: '순두부 덮밥', description: '부드럽고 자극이 적어요.' },
  { id: 'menu-5', name: '가자미 조림', description: '담백한 흰살 생선 메뉴예요.' },
];

/* ------------------------------------------------------------------ */
/* AI 채팅 (food/chat) — POST /chat/messages 실제 연동으로 대체되어         */
/* 더 이상 사용하지 않는다. 대화 이력을 불러오는 엔드포인트는 계약에 없다      */
/* ------------------------------------------------------------------ */
/* 나의 식탁 ((tabs)/table) — GET /mytable 실제 연동으로 대체되어          */
/* 더 이상 사용하지 않는다 (services/api.ts 의 getMyTable 참고)             */
/* ------------------------------------------------------------------ */
