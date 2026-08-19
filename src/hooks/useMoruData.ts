/**
 * MORU 앱 데이터의 단일 진입점.
 *
 * 아직 상태관리 라이브러리를 추가하지 않는다.
 * 모듈 스코프의 작은 스토어 + React 내장 useSyncExternalStore 만 사용해서
 * 화면 사이에 온보딩 선택값과 mock 데이터를 공유할 수 있는 최소 구조만 만든다.
 *
 * 데이터는 services/api.ts 를 통해서만 가져온다.
 * 나중에 Zustand/Jotai 등으로 옮기더라도 화면 쪽 코드는 useMoruData() 그대로 두면 된다.
 */

import { useCallback, useEffect, useSyncExternalStore } from 'react';

import * as api from '@/services/api';
import type { AnalysisResult } from '@/types/analysis';
import type { FoodRecord, MyTableFood } from '@/types/food';
import { EMPTY_ONBOARDING_DATA, type OnboardingData } from '@/types/onboarding';
import type { ReintroductionCandidate } from '@/types/reintroduction';
import type { SymptomRecord } from '@/types/symptom';

export type MoruState = {
  /** 온보딩 중 사용자가 고른 값 (로컬 상태) */
  onboarding: OnboardingData;
  foodRecords: FoodRecord[];
  symptomRecords: SymptomRecord[];
  myTableFoods: MyTableFood[];
  analysis: AnalysisResult | null;
  reintroductionCandidates: ReintroductionCandidate[];
  /** api 로부터 최초 데이터를 받아왔는지 */
  loaded: boolean;
};

const initialState: MoruState = {
  onboarding: EMPTY_ONBOARDING_DATA,
  foodRecords: [],
  symptomRecords: [],
  myTableFoods: [],
  analysis: null,
  reintroductionCandidates: [],
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

  loadPromise = Promise.all([
    api.getFoodRecords(),
    api.getSymptomRecords(),
    api.getMyTableFoods(),
    api.getAnalysis(),
    api.getReintroductionCandidates(),
  ]).then(([foodRecords, symptomRecords, myTableFoods, analysis, reintroductionCandidates]) => {
    setState({
      foodRecords,
      symptomRecords,
      myTableFoods,
      analysis,
      reintroductionCandidates,
      loaded: true,
    });
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

  /** 온보딩 마지막 화면에서 호출 */
  const completeOnboarding = useCallback(async () => {
    const completed: OnboardingData = { ...state.onboarding, completed: true };
    setState({ onboarding: completed });
    await api.saveOnboardingData(completed);
  }, []);

  const addFoodRecord = useCallback(async (record: FoodRecord) => {
    const saved = await api.createFoodRecord(record);
    setState({ foodRecords: [saved, ...state.foodRecords] });
  }, []);

  const addSymptomRecord = useCallback(async (record: SymptomRecord) => {
    const saved = await api.createSymptomRecord(record);
    setState({ symptomRecords: [saved, ...state.symptomRecords] });
  }, []);

  return {
    ...snapshot,
    updateOnboarding,
    resetOnboarding,
    completeOnboarding,
    addFoodRecord,
    addSymptomRecord,
  };
}
