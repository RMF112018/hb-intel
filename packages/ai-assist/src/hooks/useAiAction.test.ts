import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAiAction } from './useAiAction.js';
import { AiActionRegistry } from '../registry/AiActionRegistry.js';
import { createMockAiAction } from '../../testing/createMockAiAction.js';
import type { IAiActionResult } from '../types/index.js';

const mockResult: IAiActionResult = {
  outputType: 'text',
  text: 'AI response',
  confidenceDetails: {
    confidenceScore: 0.92,
    confidenceBadge: 'high',
    citedSources: [],
    modelDeploymentName: 'gpt-4o',
    modelDeploymentVersion: '2024-08-06',
  },
};

const mockInvoke = vi.fn().mockResolvedValue(mockResult);
const mockCancel = vi.fn();

vi.mock('../api/index.js', () => ({
  AiAssistApi: vi.fn().mockImplementation(() => ({
    invoke: mockInvoke,
    cancel: mockCancel,
  })),
}));

const invokeContext = {
  userId: 'user-1',
  role: 'estimator',
  recordType: 'scorecard',
  recordId: 'sc-1',
  complexity: 'standard',
  record: { id: 'sc-1' },
};

beforeEach(() => {
  AiActionRegistry._clearForTests();
  mockInvoke.mockClear();
  mockCancel.mockClear();
  mockInvoke.mockResolvedValue(mockResult);
});

describe('useAiAction', () => {
  it('initial state is idle', () => {
    const action = createMockAiAction();
    AiActionRegistry.register('scorecard', action);

    const { result } = renderHook(() => useAiAction(action.actionKey));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('invoke sets isLoading, resolves with result and confidenceDetails', async () => {
    const action = createMockAiAction();
    AiActionRegistry.register('scorecard', action);

    const { result } = renderHook(() => useAiAction(action.actionKey));

    let invokeResult: IAiActionResult | null = null;
    await act(async () => {
      invokeResult = await result.current.invoke(invokeContext);
    });

    expect(invokeResult).toBe(mockResult);
    expect(result.current.result).toBe(mockResult);
    expect(result.current.result?.confidenceDetails.confidenceScore).toBe(0.92);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('invoke returns null and sets error on API failure', async () => {
    const action = createMockAiAction();
    AiActionRegistry.register('scorecard', action);
    mockInvoke.mockRejectedValueOnce(new Error('API failure'));

    const { result } = renderHook(() => useAiAction(action.actionKey));

    let invokeResult: IAiActionResult | null = null;
    await act(async () => {
      invokeResult = await result.current.invoke(invokeContext);
    });

    expect(invokeResult).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('API failure');
    expect(result.current.isLoading).toBe(false);
  });

  it('invoke sets error when actionKey not found in registry', async () => {
    const { result } = renderHook(() => useAiAction('nonexistent-action'));

    let invokeResult: IAiActionResult | null = null;
    await act(async () => {
      invokeResult = await result.current.invoke(invokeContext);
    });

    expect(invokeResult).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('nonexistent-action');
  });

  it('cancel calls api.cancel with actionKey', () => {
    const action = createMockAiAction();
    AiActionRegistry.register('scorecard', action);

    const { result } = renderHook(() => useAiAction(action.actionKey));
    act(() => {
      result.current.cancel();
    });

    expect(mockCancel).toHaveBeenCalledWith(action.actionKey);
  });

  it('error is cleared on new invoke', async () => {
    const action = createMockAiAction();
    AiActionRegistry.register('scorecard', action);
    mockInvoke.mockRejectedValueOnce(new Error('first error'));

    const { result } = renderHook(() => useAiAction(action.actionKey));

    await act(async () => {
      await result.current.invoke(invokeContext);
    });
    expect(result.current.error).not.toBeNull();

    await act(async () => {
      await result.current.invoke(invokeContext);
    });
    expect(result.current.error).toBeNull();
    expect(result.current.result).toBe(mockResult);
  });

  it('successive invocations replace previous result', async () => {
    const action = createMockAiAction();
    AiActionRegistry.register('scorecard', action);

    const secondResult: IAiActionResult = {
      outputType: 'text',
      text: 'Second response',
      confidenceDetails: {
        confidenceScore: 0.75,
        confidenceBadge: 'medium',
        citedSources: [],
        modelDeploymentName: 'gpt-4o',
        modelDeploymentVersion: '2024-08-06',
      },
    };

    const { result } = renderHook(() => useAiAction(action.actionKey));

    await act(async () => {
      await result.current.invoke(invokeContext);
    });
    expect(result.current.result).toBe(mockResult);

    mockInvoke.mockResolvedValueOnce(secondResult);
    await act(async () => {
      await result.current.invoke(invokeContext);
    });
    expect(result.current.result).toBe(secondResult);
  });
});
