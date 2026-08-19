/**
 * MORU 백엔드 공통 API client.
 * 모든 요청에 X-Device-Id 헤더를 자동으로 붙인다.
 * 실제 API를 호출하는 모든 화면/services 함수는 이 함수를 통해서만 호출한다.
 */

import { getDeviceId } from './deviceId';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

export type ApiRequestOptions = Omit<RequestInit, 'body'> & { body?: unknown };

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const deviceId = await getDeviceId();

  /** multipart(FormData) 요청은 JSON.stringify 하지 않고, Content-Type 도 fetch 가 boundary 를 붙여 자동 설정하게 둔다 */
  const isFormData = body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      'X-Device-Id': deviceId,
      ...headers,
    },
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API ${response.status} ${path}: ${await response.text()}`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
