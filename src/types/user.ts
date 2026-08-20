/**
 * 사용자 도메인 타입.
 */

/* ------------------------------------------------------------------ */
/* GET /me — 앱 부팅 시 최초 호출, 실제 API 요청/응답                      */
/* ------------------------------------------------------------------ */

/**
 * blocked=true 일 때 보여줄 title/body/footer 가 이 응답에 없다.
 * B1x(onboarding/medical.tsx)·symptom/medical.tsx 는 모두 서버가 준 문구를
 * 그대로 표시하는 구조라, blocked 분기는 문구 출처가 확정되기 전까지 보류한다.
 */
export type MeResponse = {
  user_id: number;
  nickname: string;
  onboarded: boolean;
  blocked: boolean;
};
