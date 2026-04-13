export type TimeOfDayGreeting = 'Good morning' | 'Good afternoon' | 'Good evening';

/**
 * Greeting windows (system local time):
 *   03:00:00 – 11:59:59 → Good morning
 *   12:00:00 – 17:00:59 → Good afternoon
 *   17:01:00 – 02:59:59 → Good evening
 *
 * Boundaries are evaluated at minute granularity, which is what the
 * system actually exposes through `Date.getHours()/getMinutes()`. The
 * `:59`-second tails in the spec collapse cleanly onto the minute
 * preceding the next window — e.g. 17:00:59 still falls inside the
 * 17:00 minute (afternoon), and 11:59:59 still falls inside 11:59
 * (morning). 17:01 is the first minute of evening.
 */
const MORNING_START = 3 * 60; // 03:00  →  180
const AFTERNOON_START = 12 * 60; // 12:00 → 720
const EVENING_START = 17 * 60 + 1; // 17:01 → 1021

export function resolveGreetingForTime(hour24: number, minute: number): TimeOfDayGreeting {
  const totalMinutes = hour24 * 60 + minute;
  if (totalMinutes >= MORNING_START && totalMinutes < AFTERNOON_START) {
    return 'Good morning';
  }
  if (totalMinutes >= AFTERNOON_START && totalMinutes < EVENING_START) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

/** Resolve using only the hour — equivalent to `hh:00`. */
export function resolveGreetingForHour(hour24: number): TimeOfDayGreeting {
  return resolveGreetingForTime(hour24, 0);
}

export function resolveGreetingAt(date: Date): TimeOfDayGreeting {
  return resolveGreetingForTime(date.getHours(), date.getMinutes());
}
