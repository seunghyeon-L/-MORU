/**
 * 사용자 프로필 타입.
 * 백엔드 연결 시 그대로 매핑할 수 있도록 최소한의 필드만 정의한다.
 */

export type UserProfile = {
  id: string;
  nickname?: string;
  /** ISO 8601 문자열 */
  createdAt: string;
  /** 온보딩을 끝까지 완료했는지 여부 */
  onboardingCompleted: boolean;
  /** 안전 스크리닝에서 의료기관 안내를 받은 적이 있는지 */
  medicalReferralShown: boolean;
};

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
