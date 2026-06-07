import { useMemo } from 'react';
import { Event, UserProfile } from '../types';

// ── Scoring weights ────────────────────────────────────────────────────────────
// Coursemate presence is the primary signal (tackles social uncertainty).
// Interest/country matches are secondary (tackles choice overload).
// Time proximity adds a bonus so tonight events surface first.

const W_COURSE   = 0.45;
const W_INTEREST = 0.25;
const W_COUNTRY  = 0.15;
const W_TIME     = 0.15; // max time bonus

const MAX_COURSEMATES = 40;
const MAX_INTERESTS   = 25;
const MAX_COUNTRY     = 50;

function computeScore(event: Event): number {
  const courseScore   = Math.min(event.coursemateCount / MAX_COURSEMATES, 1) * W_COURSE;
  const interestScore = Math.min(event.interestMatchCount / MAX_INTERESTS, 1) * W_INTEREST;
  const countryScore  = Math.min(event.countryMatchCount / MAX_COUNTRY, 1) * W_COUNTRY;

  const [y, m, d] = event.date.split('-').map(Number);
  const eventMs = new Date(y, m - 1, d).getTime();
  const n = new Date();
  const todayMs = new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime();
  const daysAway = Math.max(0, Math.round((eventMs - todayMs) / 86_400_000));

  const timeBonus = daysAway === 0 ? W_TIME
                  : daysAway <= 2  ? W_TIME * 0.67
                  : daysAway <= 7  ? W_TIME * 0.33
                  : 0;

  return courseScore + interestScore + countryScore + timeBonus;
}

// Events scoring at or above this are placed in "Most relevant to you"
export const RELEVANCE_THRESHOLD = 0.42;

// Pure function exposed so FeedScreen can use it for sectioning
export function scoreEvent(event: Event): number {
  return computeScore(event);
}

export function useNudgeRanking(events: Event[], _profile: UserProfile): Event[] {
  return useMemo(
    () => [...events].sort((a, b) => computeScore(b) - computeScore(a)),
    [events],
  );
}
