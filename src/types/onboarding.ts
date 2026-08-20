/**
 * 온보딩 도메인 타입.
 *
 * 각 선택지 목록은 `as const` 배열로 정의하고 거기서 유니온 타입을 파생시킨다.
 * 화면에서는 이 배열을 그대로 순회해 선택 UI를 그릴 수 있다.
 *
 * 안전 스크리닝 판정은 규칙 기반이며 AI를 사용하지 않는다.
 */

import type { SymptomType } from './symptom';

export type Option<T extends string> = {
  id: T;
  label: string;
};

/* ------------------------------------------------------------------ */
/* 안전 스크리닝 (onboarding/safety)                                    */
/* ------------------------------------------------------------------ */

export const SAFETY_FLAG_OPTIONS = [
  { id: 'bloody-stool', label: '혈변 또는 흑색변' },
  { id: 'weight-loss', label: '원인을 알 수 없는 체중 감소' },
  { id: 'night-symptoms', label: '수면을 방해하는 야간 증상' },
  { id: 'persistent-fever', label: '지속되는 발열' },
  { id: 'repeated-vomiting', label: '반복되는 구토' },
  { id: 'anemia', label: '빈혈 진단을 받은 적이 있음' },
  { id: 'onset-after-50', label: '50세 이후 처음 증상이 시작됨' },
] as const satisfies readonly Option<string>[];

export type SafetyFlag = (typeof SAFETY_FLAG_OPTIONS)[number]['id'];

/**
 * 규칙 기반 안전 판정.
 * 하나라도 해당하면 의료기관 안내 화면으로 이동한다.
 * B1 항목은 서버(GET /onboarding/safety/questions)에서 받아오므로 문자열 key 를 그대로 받는다.
 */
export function needsMedicalReferral(flags: readonly string[]): boolean {
  return flags.length > 0;
}

/* ------------------------------------------------------------------ */
/* 알레르기 (onboarding/allergy)                                        */
/* ------------------------------------------------------------------ */

export const ALLERGY_OPTIONS = [
  { id: 'none', label: '없어요' },
  { id: 'milk', label: '우유' },
  { id: 'egg', label: '계란' },
  { id: 'peanut', label: '땅콩' },
  { id: 'tree-nut', label: '견과류' },
  { id: 'wheat', label: '밀' },
  { id: 'crustacean', label: '갑각류' },
  { id: 'etc', label: '기타' },
] as const satisfies readonly Option<string>[];

export type Allergy = (typeof ALLERGY_OPTIONS)[number]['id'];

/** 셀리악병 진단 여부 (onboarding/allergy, 밀 알레르기 선택 시에만 노출) */
export const CELIAC_DIAGNOSIS_OPTIONS = [
  { id: 'no', label: '아니요' },
  { id: 'yes', label: '네' },
  { id: 'unknown', label: '모르겠어요' },
] as const satisfies readonly Option<string>[];

export type CeliacDiagnosis = (typeof CELIAC_DIAGNOSIS_OPTIONS)[number]['id'];

/* ------------------------------------------------------------------ */
/* 피하고 있는 음식 (onboarding/avoided-food)                           */
/* ------------------------------------------------------------------ */

export const AVOIDED_FOOD_OPTIONS = [
  // '없음' 은 맨 앞. 나머지와 함께 고를 수 없는 항목이라
  // 목록 중간에 있으면 못 보고 지나치거나 같이 눌러버린다.
  { id: 'none', label: '없음' },
  { id: 'dairy', label: '우유 / 유제품' },
  { id: 'wheat', label: '밀 / 빵' },
  { id: 'onion', label: '양파' },
  { id: 'garlic', label: '마늘' },
  { id: 'legume', label: '콩류' },
  { id: 'spicy', label: '매운 음식' },
  { id: 'coffee', label: '커피' },
  { id: 'alcohol', label: '술' },
  { id: 'carbonated', label: '탄산' },
  { id: 'bread-snack', label: '빵·과자' },
  { id: 'cereal', label: '시리얼' },
  { id: 'apple-pear', label: '사과·배' },
  { id: 'watermelon', label: '수박' },
  { id: 'honey-syrup', label: '꿀·시럽' },
  { id: 'ice-cream', label: '아이스크림' },
  { id: 'mushroom', label: '버섯' },
  { id: 'avocado', label: '아보카도' },
  { id: 'etc', label: '기타' },
] as const satisfies readonly Option<string>[];

export type AvoidedFood = (typeof AVOIDED_FOOD_OPTIONS)[number]['id'];

export const AVOIDED_REASON_OPTIONS = [
  { id: 'discomfort', label: '먹고 나면 불편해서' },
  { id: 'worried', label: '불편할까 봐 걱정돼서' },
  { id: 'told-by-others', label: '주변에서 피하라고 해서' },
  { id: 'medical-advice', label: '의료진의 안내를 받아서' },
  { id: 'etc', label: '기타' },
] as const satisfies readonly Option<string>[];

export type AvoidedReason = (typeof AVOIDED_REASON_OPTIONS)[number]['id'];

/* ------------------------------------------------------------------ */
/* 평소 증상 (onboarding/symptoms)                                      */
/* ------------------------------------------------------------------ */

export const SYMPTOM_FREQUENCY_OPTIONS = [
  { id: 'rarely', label: '가끔' },
  { id: 'weekly', label: '일주일에 몇 번' },
  { id: 'daily', label: '거의 매일' },
] as const satisfies readonly Option<string>[];

export type SymptomFrequency = (typeof SYMPTOM_FREQUENCY_OPTIONS)[number]['id'];

/* ------------------------------------------------------------------ */
/* 온보딩 전체 데이터                                                    */
/* ------------------------------------------------------------------ */

export type OnboardingData = {
  /** B1 서버 응답의 항목 key 목록 (exception 포함 가능) */
  safetyFlags: string[];
  /** medical 화면에서 "이미 병원에서 확인했어요"를 선택한 경우 true */
  medicalCheckConfirmed: boolean;
  allergies: Allergy[];
  /**
   * '기타' 를 고른 사람이 직접 적은 음식 이름.
   *
   * 서버로 보낼 때 'etc' 를 라벨 "기타" 로 바꾸면 안 된다.
   * "기타" 는 어떤 음식 이름과도 겹치지 않아서 아무것도 걸러내지 못한다.
   * 이 텍스트를 실제 알레르기 목록 항목으로 펼쳐서 보내야 차단이 동작한다.
   */
  allergyEtcText?: string;
  /** 밀 알레르기를 선택했을 때만 의미가 있다 */
  celiacDiagnosis?: CeliacDiagnosis;
  avoidedFoods: AvoidedFood[];
  /** allergyEtcText 와 같은 규칙으로 펼쳐서 보낸다 */
  avoidedFoodEtcText?: string;
  avoidedReasons: AvoidedReason[];
  /** 평소 경험하는 증상 */
  usualSymptoms: SymptomType[];
  /** allergyEtcText 와 같은 규칙으로 펼쳐서 보낸다 */
  usualSymptomEtcText?: string;
  symptomFrequency?: SymptomFrequency;
  completed: boolean;
};

export const EMPTY_ONBOARDING_DATA: OnboardingData = {
  safetyFlags: [],
  medicalCheckConfirmed: false,
  allergies: [],
  avoidedFoods: [],
  avoidedReasons: [],
  usualSymptoms: [],
  completed: false,
};

/* ------------------------------------------------------------------ */
/* 서버로 보낼 라벨 만들기                                               */
/* ------------------------------------------------------------------ */

function dedupe(labels: string[]): string[] {
  return [...new Set(labels)];
}

/**
 * '기타' 칸에 적은 글을 서버 목록의 개별 항목으로 나눈다.
 *
 * 나누는 이유는 서버가 항목을 통째로 부분 문자열 비교하기 때문이다
 * (services/mytable.py 의 `b in label`). "메밀, 복숭아" 를 한 항목으로 보내면
 * 그 긴 문자열이 어떤 음식 이름 안에도 들어 있지 않아서 한 개도 못 걸러낸다.
 * 항목마다 따로 보내야 각각이 비교 대상이 된다.
 *
 * 구분자는 쉼표와 줄바꿈뿐이다. 가운뎃점(·)·슬래시는 '우유·유제품' 처럼
 * 한 음식의 이름 안에서 쓰이는 글자라, 구분자로 삼으면 멀쩡한 이름을 반으로 쪼갠다.
 */
export function splitEtcText(text: string | undefined): string[] {
  if (!text) return [];
  return dedupe(
    text
      .split(/[,，\n]/)
      .map((part) => part.trim())
      .filter((part) => part.length > 0),
  );
}

/**
 * 선택한 칩 id 를 서버로 보낼 라벨 목록으로 바꾼다.
 *
 * - 'none' 은 "없다" 를 뜻하는 로컬 전용 선택지라 목록에서 뺀다.
 * - 'etc' 는 라벨 "기타" 대신 사용자가 적은 이름으로 펼친다.
 *   "기타" 는 어떤 음식·증상 이름과도 겹치지 않아서, 보내봐야 서버가 아무것도 걸러내지 못한다.
 *   적은 게 없으면 'etc' 자체를 뺀다 — 사용자가 답한 적 없는 "기타" 가 기록에 남는 것보다 낫다.
 */
export function toServerLabels<T extends string>(
  ids: readonly T[],
  options: readonly Option<T>[],
  etcText?: string,
): string[] {
  return dedupe(
    ids.flatMap((id) => {
      if (id === 'none') return [];
      if (id === 'etc') return splitEtcText(etcText);
      const label = options.find((option) => option.id === id)?.label;
      return label ? [label] : [];
    }),
  );
}

/* ------------------------------------------------------------------ */
/* B2·B3·B4 저장 — POST /onboarding/profile 실제 API 요청/응답            */
/* ------------------------------------------------------------------ */

export type BaselineFrequency =
  | 'rare'
  | 'monthly_1_2'
  | 'weekly_few'
  | 'weekly_1_2'
  | 'almost_daily'
  | 'weekly_3plus';

export type ProfileRequest = {
  nickname?: string | null;
  allergies?: string[];
  celiac?: 'yes' | 'no' | 'unknown';
  avoided_foods?: string[];
  baseline_symptoms?: string[];
  baseline_frequency?: BaselineFrequency;
};

export type ProfileResponse = {
  user_id: number;
  onboarded: boolean;
};
