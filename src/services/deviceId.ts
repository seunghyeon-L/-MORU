/**
 * 기기별 Device ID.
 * 최초 실행 시 UUID(v4)를 생성해 AsyncStorage에 영구 저장하고,
 * 이후에는 저장된 값을 그대로 재사용한다.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'moru.deviceId';

function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

let cached: string | null = null;
let loading: Promise<string> | null = null;

export function getDeviceId(): Promise<string> {
  if (cached) return Promise.resolve(cached);
  if (loading) return loading;

  loading = AsyncStorage.getItem(DEVICE_ID_KEY).then(async (stored) => {
    const id = stored ?? generateUuid();
    if (!stored) await AsyncStorage.setItem(DEVICE_ID_KEY, id);
    cached = id;
    return id;
  });

  return loading;
}
