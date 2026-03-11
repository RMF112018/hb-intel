import { describe, it, expect, beforeEach } from 'vitest';
import { AiActionRegistry, registerAiAction, registerAiActions } from './AiActionRegistry.js';
import { createMockAiAction } from '../../testing/createMockAiAction.js';
import type { IAiActionInvokeContext } from '../types/index.js';

const baseContext: IAiActionInvokeContext = {
  userId: 'user-1',
  role: 'estimator',
  recordType: 'scorecard',
  recordId: 'sc-1',
  complexity: 'standard',
};

beforeEach(() => {
  AiActionRegistry._clearForTests();
});

describe('AiActionRegistry', () => {
  describe('register', () => {
    it('registers a single action with composite key', () => {
      const action = createMockAiAction();
      AiActionRegistry.register('scorecard', action);
      expect(AiActionRegistry.get(action.actionKey, 'scorecard')).toBe(action);
    });

    it('rejects duplicate composite key', () => {
      const action = createMockAiAction();
      AiActionRegistry.register('scorecard', action);
      expect(() => AiActionRegistry.register('scorecard', action)).toThrow(
        '[ai-assist] Duplicate action registration: "scorecard::mock-summarize-scorecard"',
      );
    });

    it('allows same actionKey under different recordType', () => {
      const action = createMockAiAction();
      AiActionRegistry.register('scorecard', action);
      AiActionRegistry.register('estimate', action);
      expect(AiActionRegistry.get(action.actionKey, 'scorecard')).toBe(action);
      expect(AiActionRegistry.get(action.actionKey, 'estimate')).toBe(action);
    });

    it('throws on empty actionKey', () => {
      expect(() =>
        AiActionRegistry.register('scorecard', createMockAiAction({ actionKey: '' })),
      ).toThrow('actionKey must be non-empty');
    });

    it('throws on empty label', () => {
      expect(() =>
        AiActionRegistry.register('scorecard', createMockAiAction({ label: '' })),
      ).toThrow('label must be non-empty');
    });

    it('throws on empty modelKey', () => {
      expect(() =>
        AiActionRegistry.register('scorecard', createMockAiAction({ modelKey: '' })),
      ).toThrow('modelKey must be non-empty');
    });

    it('throws when buildPrompt is not a function', () => {
      expect(() =>
        AiActionRegistry.register(
          'scorecard',
          createMockAiAction({ buildPrompt: 'not-a-fn' as never }),
        ),
      ).toThrow('buildPrompt must be a function');
    });

    it('throws when parseResponse is not a function', () => {
      expect(() =>
        AiActionRegistry.register(
          'scorecard',
          createMockAiAction({ parseResponse: null as never }),
        ),
      ).toThrow('parseResponse must be a function');
    });
  });

  describe('registerMany', () => {
    it('registers a batch of actions', () => {
      const a1 = createMockAiAction({ actionKey: 'a1' });
      const a2 = createMockAiAction({ actionKey: 'a2' });
      AiActionRegistry.registerMany('scorecard', [a1, a2]);
      expect(AiActionRegistry.getAll()).toHaveLength(2);
    });
  });

  describe('registerActions', () => {
    it('delegates to registerMany with recordType', () => {
      const a1 = createMockAiAction({ actionKey: 'a1' });
      AiActionRegistry.registerActions({ recordType: 'bid', actions: [a1] });
      expect(AiActionRegistry.get('a1', 'bid')).toBe(a1);
    });
  });

  describe('get', () => {
    it('scans all entries when recordType omitted', () => {
      const action = createMockAiAction();
      AiActionRegistry.register('scorecard', action);
      expect(AiActionRegistry.get(action.actionKey)).toBe(action);
    });

    it('returns undefined for unknown key', () => {
      expect(AiActionRegistry.get('nope')).toBeUndefined();
    });
  });

  describe('getByRecordType', () => {
    it('returns actions sorted by basePriorityScore desc then actionKey asc', () => {
      AiActionRegistry.register('sc', createMockAiAction({ actionKey: 'b', basePriorityScore: 50 }));
      AiActionRegistry.register('sc', createMockAiAction({ actionKey: 'a', basePriorityScore: 50 }));
      AiActionRegistry.register('sc', createMockAiAction({ actionKey: 'c', basePriorityScore: 100 }));

      const result = AiActionRegistry.getByRecordType('sc');
      expect(result.map((a) => a.actionKey)).toEqual(['c', 'a', 'b']);
    });

    it('includes wildcard recordType actions', () => {
      registerAiAction(createMockAiAction({ actionKey: 'wild' }));
      AiActionRegistry.register('sc', createMockAiAction({ actionKey: 'specific' }));
      const result = AiActionRegistry.getByRecordType('sc');
      expect(result.map((a) => a.actionKey)).toContain('wild');
      expect(result.map((a) => a.actionKey)).toContain('specific');
    });
  });

  describe('getForContext', () => {
    it('filters by role', () => {
      AiActionRegistry.register(
        'scorecard',
        createMockAiAction({ actionKey: 'restricted', allowedRoles: ['admin'] }),
      );
      AiActionRegistry.register(
        'scorecard',
        createMockAiAction({ actionKey: 'open' }),
      );
      const result = AiActionRegistry.getForContext(baseContext);
      expect(result.map((a) => a.actionKey)).toEqual(['open']);
    });

    it('filters by complexity tier', () => {
      AiActionRegistry.register(
        'scorecard',
        createMockAiAction({ actionKey: 'expert-only', minComplexity: 'expert' }),
      );
      AiActionRegistry.register(
        'scorecard',
        createMockAiAction({ actionKey: 'basic' }),
      );
      const result = AiActionRegistry.getForContext(baseContext);
      expect(result.map((a) => a.actionKey)).toEqual(['basic']);
    });

    it('filters by policy disableActions', () => {
      AiActionRegistry.register('scorecard', createMockAiAction({ actionKey: 'disabled' }));
      AiActionRegistry.register('scorecard', createMockAiAction({ actionKey: 'enabled' }));
      const result = AiActionRegistry.getForContext(baseContext, {
        disableActions: ['disabled'],
      });
      expect(result.map((a) => a.actionKey)).toEqual(['enabled']);
    });

    it('uses setPolicy when no policy argument', () => {
      AiActionRegistry.register('scorecard', createMockAiAction({ actionKey: 'a1' }));
      AiActionRegistry.setPolicy({ disableActions: ['a1'] });
      const result = AiActionRegistry.getForContext(baseContext);
      expect(result).toHaveLength(0);
    });
  });

  describe('wildcard free functions', () => {
    it('registerAiAction registers with wildcard recordType', () => {
      const action = createMockAiAction({ actionKey: 'wild-single' });
      registerAiAction(action);
      expect(AiActionRegistry.get('wild-single', '*')).toBe(action);
    });

    it('registerAiActions registers multiple with wildcard', () => {
      registerAiActions([
        createMockAiAction({ actionKey: 'w1' }),
        createMockAiAction({ actionKey: 'w2' }),
      ]);
      expect(AiActionRegistry.getAll()).toHaveLength(2);
    });
  });

  describe('clear', () => {
    it('removes all registrations', () => {
      AiActionRegistry.register('sc', createMockAiAction());
      AiActionRegistry.clear();
      expect(AiActionRegistry.getAll()).toHaveLength(0);
    });
  });
});
