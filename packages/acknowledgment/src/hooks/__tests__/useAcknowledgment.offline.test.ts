import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAcknowledgment } from '../useAcknowledgment';
import type {
  IAcknowledgmentConfig,
  IAcknowledgmentState,
} from '../../types';

// ─── Mock useOfflineQueue ────────────────────────────────────────────────────

const mockEnqueue = vi.fn().mockResolvedValue(undefined);
const mockHas = vi.fn().mockResolvedValue(false);

vi.mock('../useOfflineQueue', () => ({
  useOfflineQueue: () => ({
    enqueue: mockEnqueue,
    has: mockHas,
  }),
}));

// ─── Fixtures ────────────────────────────────────────────────────────────────

const pendingState: IAcknowledgmentState = {
  config: {
    label: 'Test Ack',
    mode: 'single',
    contextType: 'project-hub-pmp',
    resolveParties: () => [
      { userId: 'user-1', displayName: 'Alice', role: 'PM', required: true },
    ],
    resolvePromptMessage: () => 'Please acknowledge.',
  },
  events: [
    {
      partyUserId: 'user-1',
      partyDisplayName: 'Alice',
      status: 'pending',
      acknowledgedAt: null,
    },
  ],
  isComplete: false,
  currentSequentialParty: null,
  overallStatus: 'pending',
};

const config: IAcknowledgmentConfig<unknown> = pendingState.config;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  // Pre-populate the query cache with pending state
  queryClient.setQueryData(
    ['acknowledgments', 'project-hub-pmp', 'ctx-001'],
    pendingState
  );
  return {
    wrapper: ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children),
    queryClient,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useAcknowledgment — offline queue (D-02)', () => {
  beforeEach(() => {
    mockEnqueue.mockClear();
    mockHas.mockClear().mockResolvedValue(false);
    vi.mocked(globalThis.fetch).mockReset();
  });

  it('enqueues on network failure with IAcknowledgmentQueueEntry shape', async () => {
    vi.mocked(globalThis.fetch).mockRejectedValue(
      new TypeError('Failed to fetch')
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(
      () => useAcknowledgment(config, 'ctx-001', 'user-1'),
      { wrapper }
    );

    await act(async () => {
      try {
        await result.current.submit({ status: 'acknowledged' });
      } catch {
        // mutation error is expected
      }
    });

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledTimes(1);
    });

    expect(mockEnqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        queue: 'acknowledgments',
        endpoint: '/api/acknowledgments',
        method: 'POST',
        idempotencyKey: 'project-hub-pmp:ctx-001:user-1',
      })
    );
    expect(mockEnqueue.mock.calls[0][0]).toHaveProperty('enqueuedAt');
    expect(mockEnqueue.mock.calls[0][0]).toHaveProperty('body');
  });

  it('marks isPendingSync=true after network failure', async () => {
    vi.mocked(globalThis.fetch).mockRejectedValue(
      new TypeError('Failed to fetch')
    );
    const { wrapper, queryClient } = createWrapper();

    const { result } = renderHook(
      () => useAcknowledgment(config, 'ctx-001', 'user-1'),
      { wrapper }
    );

    await act(async () => {
      try {
        await result.current.submit({ status: 'acknowledged' });
      } catch {
        // mutation error is expected
      }
    });

    await waitFor(() => {
      const cached = queryClient.getQueryData<IAcknowledgmentState>([
        'acknowledgments',
        'project-hub-pmp',
        'ctx-001',
      ]);
      const event = cached?.events.find((e) => e.partyUserId === 'user-1');
      expect(event?.isPendingSync).toBe(true);
    });
  });

  it('does NOT enqueue on logical failure (403)', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response('Forbidden', { status: 403 })
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(
      () => useAcknowledgment(config, 'ctx-001', 'user-1'),
      { wrapper }
    );

    await act(async () => {
      try {
        await result.current.submit({ status: 'acknowledged' });
      } catch {
        // mutation error is expected
      }
    });

    // Wait a tick for any async handlers
    await waitFor(() => {
      expect(mockEnqueue).not.toHaveBeenCalled();
    });
  });

  it('does not create duplicate entries when has() returns true', async () => {
    mockHas.mockResolvedValue(true);
    vi.mocked(globalThis.fetch).mockRejectedValue(
      new TypeError('Failed to fetch')
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(
      () => useAcknowledgment(config, 'ctx-001', 'user-1'),
      { wrapper }
    );

    await act(async () => {
      try {
        await result.current.submit({ status: 'acknowledged' });
      } catch {
        // mutation error is expected
      }
    });

    await waitFor(() => {
      expect(mockHas).toHaveBeenCalledWith('project-hub-pmp:ctx-001:user-1');
    });

    expect(mockEnqueue).not.toHaveBeenCalled();
  });
});
