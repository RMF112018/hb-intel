import { describe, it, expect } from 'vitest';
import { urgencyClass, urgencyLabel, relativeDate, truncate, resolveVariant } from '../components/_utils';

describe('urgencyClass', () => {
  it('returns blocked class when isBlocked', () => {
    expect(urgencyClass('upcoming', true)).toBe('hbc-bic--blocked');
  });
  it('returns immediate class', () => {
    expect(urgencyClass('immediate', false)).toBe('hbc-bic--immediate');
  });
  it('returns watch class', () => {
    expect(urgencyClass('watch', false)).toBe('hbc-bic--watch');
  });
  it('returns upcoming class', () => {
    expect(urgencyClass('upcoming', false)).toBe('hbc-bic--upcoming');
  });
});

describe('urgencyLabel', () => {
  it('returns Blocked when isBlocked', () => {
    expect(urgencyLabel('upcoming', false, true)).toBe('Blocked');
  });
  it('returns Overdue when isOverdue', () => {
    expect(urgencyLabel('immediate', true, false)).toBe('Overdue');
  });
  it('returns Due today for immediate', () => {
    expect(urgencyLabel('immediate', false, false)).toBe('Due today');
  });
  it('returns Due soon for watch', () => {
    expect(urgencyLabel('watch', false, false)).toBe('Due soon');
  });
  it('returns Upcoming for upcoming', () => {
    expect(urgencyLabel('upcoming', false, false)).toBe('Upcoming');
  });
});

describe('relativeDate', () => {
  it('returns "Due today" for today', () => {
    const today = new Date();
    expect(relativeDate(today.toISOString())).toBe('Due today');
  });
  it('returns "Due tomorrow" for +1 day', () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    expect(relativeDate(tomorrow.toISOString())).toBe('Due tomorrow');
  });
  it('returns "Due in N days" for >1 day', () => {
    const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    expect(relativeDate(future.toISOString())).toMatch(/Due in \d+ days/);
  });
  it('returns "Overdue by 1 day" for -1 day', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(relativeDate(yesterday.toISOString())).toBe('Overdue by 1 day');
  });
  it('returns "Overdue by N days" for >1 day past', () => {
    const past = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(relativeDate(past.toISOString())).toMatch(/Overdue by \d+ days/);
  });
});

describe('truncate', () => {
  it('returns text unchanged when under limit', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });
  it('truncates with ellipsis when over limit', () => {
    expect(truncate('hello world', 5)).toBe('hell…');
  });
  it('returns text at exact limit', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });
});

describe('resolveVariant', () => {
  it('returns forceVariant when provided', () => {
    expect(resolveVariant('expert', 'essential')).toBe('expert');
  });
  it('returns contextVariant when forceVariant is undefined', () => {
    expect(resolveVariant(undefined, 'standard')).toBe('standard');
  });
});
