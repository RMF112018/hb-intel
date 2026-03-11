import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { SessionStateContext } from '@hbc/session-state';
import { createMockSessionContext, createMockQueuedOperation } from '@hbc/session-state/testing';
import { useOfflineQueue } from '../hooks/useOfflineQueue';
import type { IAcknowledgmentQueueEntry } from '../types';

function createWrapper(overrides: Parameters<typeof createMockSessionContext>[0] = {}) {
  const ctx = createMockSessionContext(overrides);
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <SessionStateContext.Provider value={ctx}>{children}</SessionStateContext.Provider>
  );
  return { Wrapper, ctx };
}

const mockEntry: IAcknowledgmentQueueEntry = {
  queue: 'acknowledgments',
  endpoint: '/api/acknowledgments',
  method: 'POST',
  body: {
    contextType: 'turnover-meeting',
    contextId: 'ctx-1',
    partyUserId: 'user-1',
    status: 'acknowledged',
    acknowledgedAt: '2026-03-11T00:00:00.000Z',
  },
  enqueuedAt: '2026-03-11T00:00:00.000Z',
  idempotencyKey: 'turnover-meeting:ctx-1:user-1',
};

describe('useOfflineQueue', () => {
  it('enqueue calls queueOperation with acknowledgment type', () => {
    const queueOperation = vi.fn();
    const { Wrapper } = createWrapper({ queueOperation });

    const { result } = renderHook(() => useOfflineQueue('acknowledgments'), { wrapper: Wrapper });

    act(() => {
      result.current.enqueue(mockEntry);
    });

    expect(queueOperation).toHaveBeenCalledWith({
      type: 'acknowledgment',
      target: '/api/acknowledgments',
      payload: {
        body: mockEntry.body,
        idempotencyKey: mockEntry.idempotencyKey,
        enqueuedAt: mockEntry.enqueuedAt,
      },
      maxRetries: 3,
    });
  });

  it('has() returns true when matching operation exists', () => {
    const op = createMockQueuedOperation({
      type: 'acknowledgment',
      payload: { idempotencyKey: 'turnover-meeting:ctx-1:user-1' },
    });
    const { Wrapper } = createWrapper({ queuedOperations: [op] });

    const { result } = renderHook(() => useOfflineQueue('acknowledgments'), { wrapper: Wrapper });

    expect(result.current.has('turnover-meeting:ctx-1:user-1')).toBe(true);
  });

  it('has() returns false when no matching operation exists', () => {
    const { Wrapper } = createWrapper({ queuedOperations: [] });

    const { result } = renderHook(() => useOfflineQueue('acknowledgments'), { wrapper: Wrapper });

    expect(result.current.has('nonexistent-key')).toBe(false);
  });
});
