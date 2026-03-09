import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAcknowledgment } from '../useAcknowledgment';
import type {
  IAcknowledgmentConfig,
  IAcknowledgmentState,
  ISubmitAcknowledgmentResponse,
} from '../../types';

// ─── Mock useOfflineQueue ────────────────────────────────────────────────────

vi.mock('../useOfflineQueue', () => ({
  useOfflineQueue: () => ({
    enqueue: vi.fn().mockResolvedValue(undefined),
    has: vi.fn().mockResolvedValue(false),
  }),
}));

// ─── Fixtures ────────────────────────────────────────────────────────────────

const pendingState: IAcknowledgmentState = {
  config: {
    label: 'Test Ack',
    mode: 'single',
    contextType: 'admin-provisioning',
    resolveParties: () => [
      { userId: 'user-1', displayName: 'Alice', role: 'PM', required: true },
    ],
    resolvePromptMessage: () => 'Please acknowledge.',
  },
  events: [],
  isComplete: false,
  currentSequentialParty: null,
  overallStatus: 'pending',
};

const config: IAcknowledgmentConfig<unknown> = pendingState.config;

function createWrapper(prePopulate = true) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  if (prePopulate) {
    queryClient.setQueryData(
      ['acknowledgments', 'admin-provisioning', 'ctx-001'],
      pendingState
    );
  }
  return {
    wrapper: ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children),
    queryClient,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useAcknowledgment — main flow', () => {
  beforeEach(() => {
    vi.mocked(globalThis.fetch).mockReset();
  });

  it('returns state from query cache when pre-populated', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () => useAcknowledgment(config, 'ctx-001', 'user-1'),
      { wrapper }
    );
    expect(result.current.state).toEqual(pendingState);
    expect(result.current.isLoading).toBe(false);
  });

  it('shows isLoading true before data resolves', () => {
    vi.mocked(globalThis.fetch).mockReturnValue(
      new Promise(() => {}) // never resolves
    );
    const { wrapper } = createWrapper(false);
    const { result } = renderHook(
      () => useAcknowledgment(config, 'ctx-001', 'user-1'),
      { wrapper }
    );
    expect(result.current.isLoading).toBe(true);
    expect(result.current.state).toBeUndefined();
  });

  it('invalidates query on successful mutation', async () => {
    const successResponse: ISubmitAcknowledgmentResponse = {
      event: {
        partyUserId: 'user-1',
        partyDisplayName: 'Alice',
        status: 'acknowledged',
        acknowledgedAt: '2026-03-09T10:00:00Z',
      },
      updatedState: { ...pendingState, overallStatus: 'acknowledged', isComplete: false },
      isComplete: false,
    };
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify(successResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(
      () => useAcknowledgment(config, 'ctx-001', 'user-1'),
      { wrapper }
    );

    await act(async () => {
      await result.current.submit({ status: 'acknowledged' });
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalled();
    });
  });

  it('fires onAllAcknowledged when response.isComplete is true', async () => {
    const onAllAcknowledged = vi.fn();
    const configWithCallback: IAcknowledgmentConfig<unknown> = {
      ...config,
      onAllAcknowledged,
    };
    const successResponse: ISubmitAcknowledgmentResponse = {
      event: {
        partyUserId: 'user-1',
        partyDisplayName: 'Alice',
        status: 'acknowledged',
        acknowledgedAt: '2026-03-09T10:00:00Z',
      },
      updatedState: { ...pendingState, overallStatus: 'acknowledged', isComplete: true },
      isComplete: true,
    };
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify(successResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(
      () => useAcknowledgment(configWithCallback, 'ctx-001', 'user-1'),
      { wrapper }
    );

    await act(async () => {
      await result.current.submit({ status: 'acknowledged' });
    });

    await waitFor(() => {
      expect(onAllAcknowledged).toHaveBeenCalledTimes(1);
    });
  });

  it('rolls back to snapshot on logical failure (403)', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response('Forbidden', { status: 403 })
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
        'admin-provisioning',
        'ctx-001',
      ]);
      // Should revert to original pending state (no optimistic event persisted)
      expect(cached?.events).toEqual(pendingState.events);
    });
  });
});
