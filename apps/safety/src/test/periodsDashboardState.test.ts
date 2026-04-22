// Phase-3 root-cause remediation — Periods tab UX honesty.
// Covers every branch of derivePeriodsDashboardState so the page can no
// longer collapse unrelated failures into a misleading message.
import { describe, it, expect } from 'vitest';
import {
  derivePeriodsDashboardState,
  type QueryLike,
} from '../pages/periodsDashboardState.js';

function query(overrides: Partial<QueryLike> = {}): QueryLike {
  return {
    isPending: false,
    isError: false,
    error: null,
    data: undefined,
    ...overrides,
  };
}

describe('derivePeriodsDashboardState', () => {
  it('returns loading when either parent query is pending', () => {
    expect(
      derivePeriodsDashboardState(query({ isPending: true }), query(), 0).variant,
    ).toBe('loading');
    expect(
      derivePeriodsDashboardState(query(), query({ isPending: true }), 0).variant,
    ).toBe('loading');
  });

  it('returns fatal-periods when only reporting-periods failed', () => {
    const state = derivePeriodsDashboardState(
      query({ isError: true, error: new Error('Fetch Safety Reporting Periods failed (403).') }),
      query(),
      0,
    );
    expect(state.variant).toBe('fatal-periods');
    if (state.variant !== 'fatal-periods') return;
    expect(state.message).toMatch(/Reporting periods failed to load/i);
    expect(state.detail).toMatch(/Safety Reporting Periods/);
  });

  it('returns fatal-both when both parents failed', () => {
    const state = derivePeriodsDashboardState(
      query({
        isError: true,
        error: new Error('Fetch Safety Reporting Periods failed (500).'),
      }),
      query({
        isError: true,
        error: new Error('Fetch Safety Project Week Records failed (500).'),
      }),
      0,
    );
    expect(state.variant).toBe('fatal-both');
    if (state.variant !== 'fatal-both') return;
    expect(state.message).toMatch(/both failed to load/i);
    expect(state.periodsDetail).toMatch(/Safety Reporting Periods/);
    expect(state.projectWeeksDetail).toMatch(/Safety Project Week Records/);
  });

  it('returns subordinate-project-weeks when periods loaded but project-weeks failed', () => {
    const state = derivePeriodsDashboardState(
      query({ data: [{}] }),
      query({
        isError: true,
        error: new Error('Fetch Safety Project Week Records failed (404).'),
      }),
      0,
    );
    expect(state.variant).toBe('subordinate-project-weeks');
    if (state.variant !== 'subordinate-project-weeks') return;
    // This is the specific lie we're fixing — message must NOT blame periods.
    expect(state.message).not.toMatch(/reporting periods/i);
    expect(state.message).toMatch(/project-week records failed/i);
    // And the real adapter message must be preserved for retry diagnostics.
    expect(state.detail).toMatch(/Safety Project Week Records/);
    expect(state.detail).toMatch(/404/);
  });

  it('returns empty when both loaded and there are zero project-weeks', () => {
    const state = derivePeriodsDashboardState(query({ data: [{}] }), query({ data: [] }), 0);
    expect(state.variant).toBe('empty');
  });

  it('returns ready when both loaded and project-weeks are present', () => {
    const state = derivePeriodsDashboardState(
      query({ data: [{}] }),
      query({ data: [{}, {}] }),
      2,
    );
    expect(state.variant).toBe('ready');
    if (state.variant !== 'ready') return;
    expect(state.projectWeekCount).toBe(2);
  });

  it('handles non-Error error values without crashing', () => {
    const state = derivePeriodsDashboardState(
      query(),
      query({ isError: true, error: 'stringly-typed failure' }),
      0,
    );
    expect(state.variant).toBe('subordinate-project-weeks');
    if (state.variant !== 'subordinate-project-weeks') return;
    expect(state.detail).toBe('stringly-typed failure');
  });
});
