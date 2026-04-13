import { describe, expect, it } from 'vitest';
import {
  resolveGreetingAt,
  resolveGreetingForHour,
  resolveGreetingForTime,
} from '../helpers/greeting.js';

/**
 * Phase-02 Prompt-03 — greeting-awareness window boundaries.
 *
 *   03:00:00 – 11:59:59 → Good morning
 *   12:00:00 – 17:00:59 → Good afternoon
 *   17:01:00 – 02:59:59 → Good evening
 */
describe('resolveGreetingForTime — Phase-02 window boundaries', () => {
  it.each([
    [2, 59, 'Good evening'],
    [3, 0, 'Good morning'],
    [11, 59, 'Good morning'],
    [12, 0, 'Good afternoon'],
    [17, 0, 'Good afternoon'],
    [17, 1, 'Good evening'],
    [0, 0, 'Good evening'],
  ] as const)('hh:mm %i:%i → %s', (hour, minute, expected) => {
    expect(resolveGreetingForTime(hour, minute)).toBe(expected);
  });
});

describe('resolveGreetingAt — Date-based wrapper honours minute-level boundaries', () => {
  it('treats 17:00 as afternoon and 17:01 as evening on the same day', () => {
    const afternoon = new Date();
    afternoon.setHours(17, 0, 0, 0);
    expect(resolveGreetingAt(afternoon)).toBe('Good afternoon');

    const evening = new Date();
    evening.setHours(17, 1, 0, 0);
    expect(resolveGreetingAt(evening)).toBe('Good evening');
  });

  it('treats 02:59 as evening and 03:00 as morning on the same day', () => {
    const lateNight = new Date();
    lateNight.setHours(2, 59, 0, 0);
    expect(resolveGreetingAt(lateNight)).toBe('Good evening');

    const dawn = new Date();
    dawn.setHours(3, 0, 0, 0);
    expect(resolveGreetingAt(dawn)).toBe('Good morning');
  });
});

describe('resolveGreetingForHour — hour-only wrapper (hh:00)', () => {
  it.each([
    [0, 'Good evening'],
    [2, 'Good evening'],
    [3, 'Good morning'],
    [11, 'Good morning'],
    [12, 'Good afternoon'],
    [17, 'Good afternoon'],
    [18, 'Good evening'],
    [23, 'Good evening'],
  ] as const)('hour %i → %s', (hour, expected) => {
    expect(resolveGreetingForHour(hour)).toBe(expected);
  });
});
