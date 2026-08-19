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
