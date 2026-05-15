import { describe, expect, it } from 'vitest';
import {
  resolveMyWorkPageHeaderFirstName,
  resolveMyWorkPageHeaderGreetingAt,
  resolveMyWorkPageHeaderGreetingForTime,
  resolveMyWorkPageHeaderWelcomeMessage,
} from './myWorkPageHeaderWelcome.js';

describe('resolveMyWorkPageHeaderGreetingForTime — minute-level boundaries', () => {
  it.each([
    [2, 59, 'Good evening'],
    [3, 0, 'Good morning'],
    [11, 59, 'Good morning'],
    [12, 0, 'Good afternoon'],
    [17, 0, 'Good afternoon'],
    [17, 1, 'Good evening'],
    [0, 0, 'Good evening'],
  ] as const)('hh:mm %i:%i → %s', (hour, minute, expected) => {
    expect(resolveMyWorkPageHeaderGreetingForTime(hour, minute)).toBe(expected);
  });
});

describe('resolveMyWorkPageHeaderGreetingAt — Date-wrapper boundaries', () => {
  it('treats 17:00 as afternoon and 17:01 as evening on the same day', () => {
    const afternoon = new Date();
    afternoon.setHours(17, 0, 0, 0);
    expect(resolveMyWorkPageHeaderGreetingAt(afternoon)).toBe('Good afternoon');

    const evening = new Date();
    evening.setHours(17, 1, 0, 0);
    expect(resolveMyWorkPageHeaderGreetingAt(evening)).toBe('Good evening');
  });

  it('treats 02:59 as evening and 03:00 as morning on the same day', () => {
    const lateNight = new Date();
    lateNight.setHours(2, 59, 0, 0);
    expect(resolveMyWorkPageHeaderGreetingAt(lateNight)).toBe('Good evening');

    const dawn = new Date();
    dawn.setHours(3, 0, 0, 0);
    expect(resolveMyWorkPageHeaderGreetingAt(dawn)).toBe('Good morning');
  });

  it('treats 11:59 as morning and 12:00 as afternoon on the same day', () => {
    const lateMorning = new Date();
    lateMorning.setHours(11, 59, 0, 0);
    expect(resolveMyWorkPageHeaderGreetingAt(lateMorning)).toBe('Good morning');

    const noon = new Date();
    noon.setHours(12, 0, 0, 0);
    expect(resolveMyWorkPageHeaderGreetingAt(noon)).toBe('Good afternoon');
  });
});

describe('resolveMyWorkPageHeaderFirstName — fallback order', () => {
  it('resolves first-name using preferred name before display name and email', () => {
    expect(
      resolveMyWorkPageHeaderFirstName({
        preferredName: 'Morgan Blake',
        displayName: 'Display Name',
        email: 'user@example.com',
      }),
    ).toBe('Morgan');
  });

  it('falls back to display name first token when preferred name is absent', () => {
    expect(
      resolveMyWorkPageHeaderFirstName({
        displayName: 'Bobby Fetting',
        email: 'other@example.com',
      }),
    ).toBe('Bobby');
  });

  it('normalizes email local-part with dot separators', () => {
    expect(resolveMyWorkPageHeaderFirstName({ email: 'taylor.hale@hb.com' })).toBe('taylor');
  });

  it('normalizes email local-part with underscore separators', () => {
    expect(resolveMyWorkPageHeaderFirstName({ email: 'bobby_fetting@hb.com' })).toBe('bobby');
  });

  it('normalizes email local-part with hyphen separators', () => {
    expect(resolveMyWorkPageHeaderFirstName({ email: 'user-name@hb.com' })).toBe('user');
  });

  it('falls back to "there" for empty identity', () => {
    expect(resolveMyWorkPageHeaderFirstName({})).toBe('there');
  });

  it('falls back to "there" when all fields are whitespace-only or empty', () => {
    expect(
      resolveMyWorkPageHeaderFirstName({
        preferredName: '   ',
        displayName: '',
        email: undefined,
      }),
    ).toBe('there');
  });

  it('falls back to "there" when email local-part is only separators', () => {
    expect(resolveMyWorkPageHeaderFirstName({ email: '...___---@hb.com' })).toBe('there');
  });

  it('handles preferred name with multiple whitespace tokens', () => {
    expect(resolveMyWorkPageHeaderFirstName({ preferredName: 'Morgan\tBlake' })).toBe('Morgan');
  });
});

describe('resolveMyWorkPageHeaderWelcomeMessage — headline composition', () => {
  it('formats morning headline for display name fixture', () => {
    const morning = new Date();
    morning.setHours(9, 0, 0, 0);
    const message = resolveMyWorkPageHeaderWelcomeMessage(
      { displayName: 'Bobby Fetting' },
      morning,
    );
    expect(message.greeting).toBe('Good morning');
    expect(message.firstName).toBe('Bobby');
    expect(message.headline).toBe('Good morning, Bobby.');
  });

  it('formats afternoon headline for email-only fixture', () => {
    const afternoon = new Date('2026-04-04T13:00:00');
    const message = resolveMyWorkPageHeaderWelcomeMessage(
      { email: 'taylor.hale@hb.com' },
      afternoon,
    );
    expect(message.headline).toBe('Good afternoon, taylor.');
  });

  it('formats evening headline for empty identity fallback', () => {
    const evening = new Date();
    evening.setHours(20, 0, 0, 0);
    const message = resolveMyWorkPageHeaderWelcomeMessage({}, evening);
    expect(message.headline).toBe('Good evening, there.');
  });

  it('uses single space after comma, single terminal period', () => {
    const morning = new Date();
    morning.setHours(9, 0, 0, 0);
    const message = resolveMyWorkPageHeaderWelcomeMessage({ displayName: 'Sam' }, morning);
    expect(message.headline).toMatch(/^Good morning, Sam\.$/);
  });
});
