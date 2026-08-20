/** GET /records — 기록 메인 목록 */

export type MealRecord = {
  id: number;
  food_id: number | null;
  food_name: string;
  /** ISO 8601 (+09:00) */
  eaten_at: string;
  method: 'photo' | 'text' | 'search';
  portion: 'half' | 'one' | 'one_and_half_plus';
  /** 서버가 만든 표시 문구 — "반 그릇 · 국물까지" */
  summary: string;
  has_insight: boolean;
};

export type SymptomLogRecord = {
  id: number;
  logged_at: string | null;
  onset_at: string;
  resolved_at: string | null;
  /** "배가 빵빵함 많이, 쥐어짜는 통증 조금" */
  summary: string;
  /** "1시간쯤 전 · 아랫배" */
  detail: string;
  /** 이미 한국어로 온다 — "수면 5시간 이하" */
  contexts: string[];
};

export type RecordsResponse = {
  days: number;
  meals: MealRecord[];
  symptoms: SymptomLogRecord[];
};
