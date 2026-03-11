import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAiActions } from './useAiActions.js';
import type { UseAiActionsParams } from './useAiActions.js';
import { AiActionRegistry } from '../registry/AiActionRegistry.js';
import { createMockAiAction } from '../../testing/createMockAiAction.js';

const baseParams: UseAiActionsParams = {
  recordType: 'scorecard',
  recordId: 'sc-1',
  userId: 'user-1',
  currentRole: 'estimator',
  complexityTier: 'standard',
};

beforeEach(() => {
  AiActionRegistry._clearForTests();
});

describe('useAiActions', () => {
  it('returns empty actions when registry is empty', () => {
    const { result } = renderHook(() => useAiActions(baseParams));
    expect(result.current.actions).toEqual([]);
  });

  it('returns filtered actions for matching recordType and role', () => {
    const action = createMockAiAction({ allowedRoles: ['estimator'] });
    AiActionRegistry.register('scorecard', action);

    const { result } = renderHook(() => useAiActions(baseParams));
    expect(result.current.actions).toHaveLength(1);
    expect(result.current.actions[0].actionKey).toBe(action.actionKey);
  });

  it('filters out actions by complexity tier', () => {
    const action = createMockAiAction({ minComplexity: 'expert' });
    AiActionRegistry.register('scorecard', action);

    const { result } = renderHook(() =>
      useAiActions({ ...baseParams, complexityTier: 'essential' }),
    );
    expect(result.current.actions).toHaveLength(0);
  });

  it('filters out actions by policy.disableActions', () => {
    const action = createMockAiAction();
    AiActionRegistry.register('scorecard', action);

    const { result } = renderHook(() =>
      useAiActions({
        ...baseParams,
        policyContext: { disableActions: [action.actionKey] },
      }),
    );
    expect(result.current.actions).toHaveLength(0);
  });

  it('returns actions in relevance-ranked order by basePriorityScore', () => {
    const low = createMockAiAction({ actionKey: 'low-priority', basePriorityScore: 10 });
    const high = createMockAiAction({ actionKey: 'high-priority', basePriorityScore: 90 });
    AiActionRegistry.register('scorecard', low);
    AiActionRegistry.register('scorecard', high);

    const { result } = renderHook(() => useAiActions(baseParams));
    expect(result.current.actions[0].actionKey).toBe('high-priority');
    expect(result.current.actions[1].actionKey).toBe('low-priority');
  });

  it('relevance scoring incorporates contextTags', () => {
    const tagged = createMockAiAction({
      actionKey: 'tagged',
      basePriorityScore: 50,
      relevanceTags: ['budget', 'cost'],
    });
    const untagged = createMockAiAction({
      actionKey: 'untagged',
      basePriorityScore: 50,
      relevanceTags: ['unrelated'],
    });
    AiActionRegistry.register('scorecard', tagged);
    AiActionRegistry.register('scorecard', untagged);

    const { result } = renderHook(() =>
      useAiActions({ ...baseParams, contextTags: ['budget', 'cost'] }),
    );
    expect(result.current.actions[0].actionKey).toBe('tagged');
  });

  it('includes wildcard (*) actions in results', () => {
    const wildcardAction = createMockAiAction({ actionKey: 'global-action' });
    AiActionRegistry.register('*', wildcardAction);

    const { result } = renderHook(() => useAiActions(baseParams));
    expect(result.current.actions).toHaveLength(1);
    expect(result.current.actions[0].actionKey).toBe('global-action');
  });

  it('returns isLoading: false (synchronous)', () => {
    const { result } = renderHook(() => useAiActions(baseParams));
    expect(result.current.isLoading).toBe(false);
  });
});
