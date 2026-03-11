import React from 'react';
import { renderHook } from '@testing-library/react';
import { SessionStateContext } from '@hbc/session-state';
import { createMockSessionContext, createMockQueuedOperation } from '@hbc/session-state/testing';
import { useAcknowledgmentQueueReplay } from '../hooks/useAcknowledgmentQueueReplay';

function createWrapper(overrides: Parameters<typeof createMockSessionContext>[0] = {}) {
  const ctx = createMockSessionContext(overrides);
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <SessionStateContext.Provider value={ctx}>{children}</SessionStateContext.Provider>
  );
  return { Wrapper, ctx };
}

describe('useAcknowledgmentQueueReplay', () => {
  it('returns replayCount matching acknowledgment operations', () => {
    const ops = [
      createMockQueuedOperation({ operationId: 'op-1', type: 'acknowledgment' }),
      createMockQueuedOperation({ operationId: 'op-2', type: 'acknowledgment' }),
      createMockQueuedOperation({ operationId: 'op-3', type: 'upload' }),
    ];
    const { Wrapper } = createWrapper({ queuedOperations: ops });

    const { result } = renderHook(() => useAcknowledgmentQueueReplay(), { wrapper: Wrapper });

    expect(result.current.replayCount).toBe(2);
  });

  it('isReplaying is true when online and operations have retryCount > 0', () => {
    const ops = [
      createMockQueuedOperation({ operationId: 'op-1', type: 'acknowledgment', retryCount: 1 }),
    ];
    const { Wrapper } = createWrapper({ connectivity: 'online', queuedOperations: ops });

    const { result } = renderHook(() => useAcknowledgmentQueueReplay(), { wrapper: Wrapper });

    expect(result.current.isReplaying).toBe(true);
  });

  it('isReplaying is false when offline', () => {
    const ops = [
      createMockQueuedOperation({ operationId: 'op-1', type: 'acknowledgment', retryCount: 1 }),
    ];
    const { Wrapper } = createWrapper({ connectivity: 'offline', queuedOperations: ops });

    const { result } = renderHook(() => useAcknowledgmentQueueReplay(), { wrapper: Wrapper });

    expect(result.current.isReplaying).toBe(false);
  });

  it('isReplaying is false when no operations have retried', () => {
    const ops = [
      createMockQueuedOperation({ operationId: 'op-1', type: 'acknowledgment', retryCount: 0 }),
    ];
    const { Wrapper } = createWrapper({ connectivity: 'online', queuedOperations: ops });

    const { result } = renderHook(() => useAcknowledgmentQueueReplay(), { wrapper: Wrapper });

    expect(result.current.isReplaying).toBe(false);
  });
});
