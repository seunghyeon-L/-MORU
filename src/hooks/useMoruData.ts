/**
 * MORU 앱 데이터의 단일 진입점.
 *
 * 아직 상태관리 라이브러리를 추가하지 않는다.
 * 모듈 스코프의 작은 스토어 + React 내장 useSyncExternalStore 만 사용해서
 * 화면 사이에 온보딩 선택값을 공유할 수 있는 최소 구조만 만든다.
 *
 * ★ 기록(식사·증상)은 로컬에 쌓지 않는다. 서버가 원본이다.
 *   전에는 저장할 때마다 로컬 배열에도 append 했는데, 초기값이 mock 이라
 *   기록한 적 없는 항목이 "최근 기록" 에 섞여 보였다.
 *
 * 데이터는 services/api.ts 를 통해서만 가져온다.
 * 나중에 Zustand/Jotai 등으로 옮기더라도 화면 쪽 코드는 useMoruData() 그대로 두면 된다.
 */

import { useCallback, useEffect, useSyncExternalStore } from 'react';

import * as api from '@/services/api';
import type { RecordsResponse } from '@/types/record';
import {
  ALLERGY_OPTIONS,
  AVOIDED_FOOD_OPTIONS,
  EMPTY_ONBOARDING_DATA,
  toServerLabels,
  type BaselineFrequency,
  type OnboardingData,
  type SymptomFrequency,
} from '@/types/onboarding';
import { SYMPTOM_TYPE_OPTIONS } from '@/types/symptom';

/** 로컬 3단계 빈도 → 서버 6단계 enum. 각 옵션의 실제 안내 문구(한 달에 1~2번 등) 기준으로 매핑한다 */
const FREQUENCY_TO_API: Record<SymptomFrequency, BaselineFrequency> = {
  rarely: 'monthly_1_2',
  weekly: 'weekly_1_2',
  daily: 'almost_daily',
};

export type MoruState = {
  /** 온보딩 중 사용자가 고른 값 (로컬 상태) */
  onboarding: OnboardingData;
  /** GET /records 응답. 서버가 원본이고 로컬에서 만들지 않는다 */
  records: RecordsResponse;
  /** api 로부터 최초 데이터를 받아왔는지 */
  loaded: boolean;
};

const initialState: MoruState = {
  onboarding: EMPTY_ONBOARDING_DATA,
  records: { days: 14, meals: [], symptoms: [] },
  loaded: false,
};

/* ------------------------------------------------------------------ */
/* 아주 작은 모듈 스토어                                                 */
/* ------------------------------------------------------------------ */

let state: MoruState = initialState;
const listeners = new Set<() => void>();

function setState(patch: Partial<MoruState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return state;
}

let loadPromise: Promise<void> | null = null;

/** 최초 1회만 실제로 실행된다 */
function loadOnce(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = api
    .getRecords()
    .then((records) => setState({ records, loaded: true }))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[records] GET /records failed:', err);
      setState({ loaded: true });
    });

  return loadPromise;
}

/* ------------------------------------------------------------------ */
/* hook                                                                */
/* ------------------------------------------------------------------ */

export function useMoruData() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    void loadOnce();
  }, []);

  /** 온보딩 화면에서 선택값을 조금씩 채워 넣을 때 사용한다 */
  const updateOnboarding = useCallback((patch: Partial<OnboardingData>) => {
    setState({ onboarding: { ...state.onboarding, ...patch } });
  }, []);

  const resetOnboarding = useCallback(() => {
    setState({ onboarding: EMPTY_ONBOARDING_DATA });
  }, []);

  /**
   * 온보딩 마지막 화면에서 호출. POST /onboarding/profile 은 화면에 표시된 칩 문자열을
   * 그대로 보낸다 — 임의로 바꾸는 건 두 가지뿐이고, 둘 다 toServerLabels 안에 있다.
   * "없음"을 뜻하는 로컬 전용 선택지('none')를 빼는 것, 그리고 '기타' 를 라벨 "기타" 가 아니라
   * 사용자가 적은 이름으로 펼치는 것. 후자를 안 하면 서버가 알레르기를 하나도 못 걸러낸다.
   */
  const completeOnboarding = useCallback(async () => {
    const completed: OnboardingData = { ...state.onboarding, completed: true };
    setState({ onboarding: completed });

    const allergies = toServerLabels(
      completed.allergies,
      ALLERGY_OPTIONS,
      completed.allergyEtcText,
    );
    const avoidedFoods = toServerLabels(
      completed.avoidedFoods,
      AVOIDED_FOOD_OPTIONS,
      completed.avoidedFoodEtcText,
    );
    const baselineSymptoms = toServerLabels(
      completed.usualSymptoms,
      SYMPTOM_TYPE_OPTIONS,
      completed.usualSymptomEtcText,
    );

    await api.saveOnboardingData({
      allergies,
      avoided_foods: avoidedFoods,
      baseline_symptoms: baselineSymptoms,
      ...(completed.celiacDiagnosis ? { celiac: completed.celiacDiagnosis } : {}),
      ...(completed.symptomFrequency
        ? { baseline_frequency: FREQUENCY_TO_API[completed.symptomFrequency] }
        : {}),
    });
  }, []);

  /**
   * 저장이 끝난 뒤 목록을 다시 받아온다.
   * 로컬에 append 하지 않는 이유는 파일 상단 주석 참고.
   */
  const refreshRecords = useCallback(async () => {
    try {
      setState({ records: await api.getRecords() });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[records] refresh failed:', err);
    }
  }, []);

  return {
    ...snapshot,
    updateOnboarding,
    resetOnboarding,
    completeOnboarding,
    refreshRecords,
  };
}
