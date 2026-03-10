// state/__tests__/draftPayloadHelpers.test.ts
import { describe, it, expect } from 'vitest';
import {
  resolveDraftKey,
  computeIsComplete,
  computePercentComplete,
  getActionableStepIds,
  resolveUnlockedSteps,
  isTerminalStatus,
  STATUS_RANK,
} from '../draftPayload';

describe('resolveDraftKey', () => {
  it('returns string key as-is', () => {
    expect(resolveDraftKey({ draftKey: 'my-key' }, {})).toBe('my-key');
  });

  it('invokes function key with item', () => {
    const fn = (item: { id: string }) => `wizard-${item.id}`;
    expect(resolveDraftKey({ draftKey: fn }, { id: '42' })).toBe('wizard-42');
  });

  it('returns null when draftKey is undefined', () => {
    expect(resolveDraftKey({}, {})).toBeNull();
  });
});

describe('computeIsComplete', () => {
  const steps = [
    { stepId: 's1', required: true },
    { stepId: 's2', required: true },
    { stepId: 's3', required: false },
  ];

  it('returns true when all required steps are complete', () => {
    expect(computeIsComplete(steps, { s1: 'complete', s2: 'complete', s3: 'not-started' })).toBe(true);
  });

  it('returns false when some required steps are incomplete', () => {
    expect(computeIsComplete(steps, { s1: 'complete', s2: 'in-progress', s3: 'not-started' })).toBe(false);
  });

  it('counts skipped as complete for required steps', () => {
    expect(computeIsComplete(steps, { s1: 'complete', s2: 'skipped', s3: 'not-started' })).toBe(true);
  });
});

describe('computePercentComplete', () => {
  const steps = [
    { stepId: 's1', required: true },
    { stepId: 's2', required: true },
  ];

  it('returns 0 when no required steps are complete', () => {
    expect(computePercentComplete(steps, { s1: 'not-started', s2: 'not-started' })).toBe(0);
  });

  it('returns 50 when half of required steps are complete', () => {
    expect(computePercentComplete(steps, { s1: 'complete', s2: 'not-started' })).toBe(50);
  });

  it('returns 100 when all required steps are complete', () => {
    expect(computePercentComplete(steps, { s1: 'complete', s2: 'complete' })).toBe(100);
  });

  it('returns 100 when steps array is empty (no required steps)', () => {
    expect(computePercentComplete([], {})).toBe(100);
  });
});

describe('getActionableStepIds', () => {
  const steps = [
    { stepId: 's1' },
    { stepId: 's2' },
    { stepId: 's3' },
  ];

  it('sequential: returns only the active step', () => {
    const result = getActionableStepIds(steps, { s1: 'in-progress', s2: 'not-started', s3: 'not-started' }, [], 's1', 'sequential');
    expect(result).toEqual(new Set(['s1']));
  });

  it('sequential: returns empty set when no active step', () => {
    const result = getActionableStepIds(steps, { s1: 'complete', s2: 'complete', s3: 'complete' }, [], null, 'sequential');
    expect(result.size).toBe(0);
  });

  it('parallel: returns all non-complete steps', () => {
    const result = getActionableStepIds(steps, { s1: 'complete', s2: 'in-progress', s3: 'not-started' }, [], 's2', 'parallel');
    expect(result).toEqual(new Set(['s2', 's3']));
  });

  it('sequential-with-jumps: returns visited non-complete steps', () => {
    const result = getActionableStepIds(steps, { s1: 'complete', s2: 'in-progress', s3: 'not-started' }, ['s1', 's2', 's3'], 's2', 'sequential-with-jumps');
    expect(result).toEqual(new Set(['s2', 's3']));
  });
});

describe('resolveUnlockedSteps', () => {
  const steps = [
    { stepId: 's1', order: 1 },
    { stepId: 's2', order: 2 },
    { stepId: 's3', order: 3 },
  ];

  it('sequential: all steps are unlocked', () => {
    const result = resolveUnlockedSteps(steps, [], 'sequential');
    expect(result).toEqual(new Set(['s1', 's2', 's3']));
  });

  it('parallel: all steps are unlocked', () => {
    const result = resolveUnlockedSteps(steps, [], 'parallel');
    expect(result).toEqual(new Set(['s1', 's2', 's3']));
  });

  it('sequential-with-jumps: first step always unlocked', () => {
    const result = resolveUnlockedSteps(steps, [], 'sequential-with-jumps');
    expect(result).toEqual(new Set(['s1']));
  });

  it('sequential-with-jumps: visited steps + next unvisited are unlocked', () => {
    const result = resolveUnlockedSteps(steps, ['s1'], 'sequential-with-jumps');
    expect(result).toEqual(new Set(['s1', 's2']));
  });

  it('sequential-with-jumps: locked beyond next unvisited', () => {
    const result = resolveUnlockedSteps(steps, ['s1'], 'sequential-with-jumps');
    expect(result.has('s3')).toBe(false);
  });
});

describe('isTerminalStatus', () => {
  it('returns true for blocked', () => {
    expect(isTerminalStatus('blocked')).toBe(true);
  });

  it('returns true for skipped', () => {
    expect(isTerminalStatus('skipped')).toBe(true);
  });

  it('returns false for not-started', () => {
    expect(isTerminalStatus('not-started')).toBe(false);
  });

  it('returns false for in-progress', () => {
    expect(isTerminalStatus('in-progress')).toBe(false);
  });

  it('returns false for complete', () => {
    expect(isTerminalStatus('complete')).toBe(false);
  });
});

describe('getActionableStepIds — edge branches', () => {
  it('parallel: steps with missing statuses default to not-started (not complete)', () => {
    const steps = [{ stepId: 'x1' }];
    // statuses empty → falls back to 'not-started' !== 'complete' → actionable
    const result = getActionableStepIds(steps, {}, [], null, 'parallel');
    expect(result.has('x1')).toBe(true);
  });

  it('sequential-with-jumps: steps with missing statuses default to not-started', () => {
    const steps = [{ stepId: 'x1' }];
    const result = getActionableStepIds(steps, {}, ['x1'], 'x1', 'sequential-with-jumps');
    expect(result.has('x1')).toBe(true);
  });
});

describe('resolveUnlockedSteps — edge branches', () => {
  it('sequential-with-jumps: steps without order use 0 as default', () => {
    const steps = [{ stepId: 'a' }, { stepId: 'b' }];
    const result = resolveUnlockedSteps(steps, ['a'], 'sequential-with-jumps');
    // Both should be present — a is visited, b is next unvisited
    expect(result.has('a')).toBe(true);
    expect(result.has('b')).toBe(true);
  });
});

describe('STATUS_RANK', () => {
  it('ranks not-started < in-progress < complete', () => {
    expect(STATUS_RANK['not-started']).toBeLessThan(STATUS_RANK['in-progress']);
    expect(STATUS_RANK['in-progress']).toBeLessThan(STATUS_RANK['complete']);
  });

  it('assigns blocked and skipped rank 99 (terminal)', () => {
    expect(STATUS_RANK['blocked']).toBe(99);
    expect(STATUS_RANK['skipped']).toBe(99);
  });
});
