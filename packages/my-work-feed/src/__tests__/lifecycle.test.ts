import {
  MY_WORK_TRANSITION_GRAPH,
  isTransitionAllowed,
  isTerminalState,
  isActiveLaneState,
  applyStateTransition,
} from '../normalization/lifecycle.js';
import { createMockMyWorkItem } from '@hbc/my-work-feed/testing';
import type { MyWorkState } from '../types/index.js';

describe('Lifecycle state machine', () => {
  describe('MY_WORK_TRANSITION_GRAPH', () => {
    it('is frozen', () => {
      expect(Object.isFrozen(MY_WORK_TRANSITION_GRAPH)).toBe(true);
    });

    it('defines transitions for all states', () => {
      const states: MyWorkState[] = ['new', 'active', 'blocked', 'waiting', 'deferred', 'superseded', 'completed'];
      for (const state of states) {
        expect(MY_WORK_TRANSITION_GRAPH[state]).toBeDefined();
      }
    });
  });

  describe('isTransitionAllowed', () => {
    const validTransitions: [MyWorkState, MyWorkState][] = [
      ['new', 'active'],
      ['active', 'blocked'],
      ['active', 'waiting'],
      ['active', 'deferred'],
      ['active', 'completed'],
      ['active', 'superseded'],
      ['blocked', 'active'],
      ['blocked', 'completed'],
      ['waiting', 'active'],
      ['deferred', 'active'],
      ['deferred', 'completed'],
    ];

    it.each(validTransitions)('allows %s → %s', (from, to) => {
      expect(isTransitionAllowed(from, to)).toBe(true);
    });

    const invalidTransitions: [MyWorkState, MyWorkState][] = [
      ['new', 'completed'],
      ['new', 'blocked'],
      ['superseded', 'active'],
      ['completed', 'active'],
      ['completed', 'superseded'],
    ];

    it.each(invalidTransitions)('disallows %s → %s', (from, to) => {
      expect(isTransitionAllowed(from, to)).toBe(false);
    });
  });

  describe('isTerminalState', () => {
    it('returns true for superseded', () => {
      expect(isTerminalState('superseded')).toBe(true);
    });

    it('returns true for completed', () => {
      expect(isTerminalState('completed')).toBe(true);
    });

    it('returns false for active states', () => {
      expect(isTerminalState('new')).toBe(false);
      expect(isTerminalState('active')).toBe(false);
      expect(isTerminalState('blocked')).toBe(false);
      expect(isTerminalState('waiting')).toBe(false);
      expect(isTerminalState('deferred')).toBe(false);
    });
  });

  describe('isActiveLaneState', () => {
    it('returns true for new, active, blocked, waiting', () => {
      expect(isActiveLaneState('new')).toBe(true);
      expect(isActiveLaneState('active')).toBe(true);
      expect(isActiveLaneState('blocked')).toBe(true);
      expect(isActiveLaneState('waiting')).toBe(true);
    });

    it('returns false for deferred, superseded, completed', () => {
      expect(isActiveLaneState('deferred')).toBe(false);
      expect(isActiveLaneState('superseded')).toBe(false);
      expect(isActiveLaneState('completed')).toBe(false);
    });
  });

  describe('assignLane (via lifecycle)', () => {
    it('returns delegated-team when delegatedTo is set via transition', () => {
      const item = createMockMyWorkItem({
        state: 'new',
        priority: 'soon',
        isBlocked: false,
        delegatedTo: { type: 'user', id: 'u-2', label: 'Bob' },
      });
      // Transitioning to active should derive delegated-team since delegatedTo is present
      const result = applyStateTransition(item, 'active', '2026-02-01T00:00:00.000Z');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.item.lane).toBe('delegated-team');
      }
    });

    it('returns watch for non-blocked, non-now, non-deferred, non-delegated items', () => {
      const item = createMockMyWorkItem({
        state: 'new',
        priority: 'soon',
        isBlocked: false,
        delegatedTo: null,
        delegatedBy: null,
      });
      const result = applyStateTransition(item, 'active', '2026-02-01T00:00:00.000Z');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.item.lane).toBe('watch');
      }
    });
  });

  describe('applyStateTransition', () => {
    it('transitions active → blocked with updated timestamps and lane', () => {
      const item = createMockMyWorkItem({ state: 'active' });
      const result = applyStateTransition(item, 'blocked', '2026-02-01T00:00:00.000Z');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.item.state).toBe('blocked');
        expect(result.item.lane).toBe('waiting-blocked');
        expect(result.item.timestamps.updatedAtIso).toBe('2026-02-01T00:00:00.000Z');
      }
    });

    it('transitions active → deferred and sets markedDeferredAtIso', () => {
      const item = createMockMyWorkItem({ state: 'active' });
      const result = applyStateTransition(item, 'deferred', '2026-02-01T00:00:00.000Z');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.item.state).toBe('deferred');
        expect(result.item.lane).toBe('deferred');
        expect(result.item.timestamps.markedDeferredAtIso).toBe('2026-02-01T00:00:00.000Z');
      }
    });

    it('preserves original timestamps when not transitioning to deferred', () => {
      const item = createMockMyWorkItem({
        state: 'active',
        timestamps: {
          createdAtIso: '2026-01-01T00:00:00.000Z',
          updatedAtIso: '2026-01-15T00:00:00.000Z',
          markedReadAtIso: '2026-01-10T00:00:00.000Z',
          markedDeferredAtIso: null,
          deferredUntilIso: null,
        },
      });
      const result = applyStateTransition(item, 'completed', '2026-02-01T00:00:00.000Z');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.item.timestamps.createdAtIso).toBe('2026-01-01T00:00:00.000Z');
        expect(result.item.timestamps.markedReadAtIso).toBe('2026-01-10T00:00:00.000Z');
        expect(result.item.timestamps.updatedAtIso).toBe('2026-02-01T00:00:00.000Z');
      }
    });

    it('returns failure for invalid transition', () => {
      const item = createMockMyWorkItem({ state: 'completed' });
      const result = applyStateTransition(item, 'active', '2026-02-01T00:00:00.000Z');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toBe('invalid-transition');
        expect(result.message).toContain('completed');
        expect(result.message).toContain('active');
      }
    });

    it('returns failure for terminal state superseded', () => {
      const item = createMockMyWorkItem({ state: 'superseded' });
      const result = applyStateTransition(item, 'active', '2026-02-01T00:00:00.000Z');
      expect(result.ok).toBe(false);
    });

    it('derives do-now lane for new → active with priority now', () => {
      const item = createMockMyWorkItem({ state: 'new', priority: 'now' });
      const result = applyStateTransition(item, 'active', '2026-02-01T00:00:00.000Z');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.item.lane).toBe('do-now');
      }
    });

    it('derives watch lane for active → waiting is waiting-blocked', () => {
      const item = createMockMyWorkItem({ state: 'active', priority: 'soon' });
      const result = applyStateTransition(item, 'waiting', '2026-02-01T00:00:00.000Z');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.item.lane).toBe('waiting-blocked');
      }
    });

    it('does not mutate the original item', () => {
      const item = createMockMyWorkItem({ state: 'active' });
      const originalState = item.state;
      applyStateTransition(item, 'completed', '2026-02-01T00:00:00.000Z');
      expect(item.state).toBe(originalState);
    });
  });
});
