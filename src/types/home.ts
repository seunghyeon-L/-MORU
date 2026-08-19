/**
 * C 홈 도메인 타입 — GET /home.
 *
 * 카드는 배열이며 개수·순서·존재 여부를 서버가 정한다.
 * 화면은 type 별 렌더러만 만들고 반복해서 그린다 (cards: [] 도 정상 상태).
 */

export type ChallengeProgressAction = {
  label: string;
  screen: string;
  challenge_id: number;
};

export type ChallengeProgressCard = {
  type: 'challenge_progress';
  title: string;
  body: string;
  action: ChallengeProgressAction;
};

export type ChallengeSuggestionAction = {
  label: string;
  screen: string;
  ingredient_id: number;
};

export type ChallengeSuggestionCard = {
  type: 'challenge_suggestion';
  title: string;
  body: string;
  action: ChallengeSuggestionAction;
  dismiss: { label: string };
};

export type ScheduleNoteCard = {
  type: 'schedule_note';
  title: string;
  body: string;
};

/** 식사 기록이 충분히 쌓였을 때만 등장한다 — 현재는 오지 않을 수 있다 */
export type WeeklyRecapCard = {
  type: 'weekly_recap';
  title: string;
  body: string;
};

export type HomeCard = ChallengeProgressCard | ChallengeSuggestionCard | ScheduleNoteCard | WeeklyRecapCard;

export type HomeResponse = {
  greeting: string;
  cards: HomeCard[];
};

export type SnoozeResponse = {
  ok: boolean;
  days: number;
};
