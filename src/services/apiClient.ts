/**
 * MORU 백엔드 공통 API client.
 * 모든 요청에 X-Device-Id 헤더를 자동으로 붙인다.
 * 아직 어떤 화면에서도 사용하지 않는다 — 연동 기반만 준비해 둔다.
 */

import { getDeviceId } from './deviceId';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

export type ApiRequestOptions = Omit<RequestInit, 'body'> & { body?: unknown };

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const deviceId = await getDeviceId();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id': deviceId,
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API ${response.status} ${path}: ${await response.text()}`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
