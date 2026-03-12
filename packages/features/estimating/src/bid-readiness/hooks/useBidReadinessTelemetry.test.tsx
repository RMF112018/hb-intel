import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  useBidReadinessTelemetry,
} from './index.js';
import {
  bidReadinessKpiEmitter,
  createBidReadinessKpiSnapshot,
} from '../telemetry/index.js';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useBidReadinessTelemetry', () => {
  it('returns success for fresh telemetry snapshot', async () => {
    const wrapper = createWrapper();
    bidReadinessKpiEmitter.reset();
    bidReadinessKpiEmitter.emit({
      readyToBidRate: 82,
      checklistCes: 4.2,
    });

    const { result } = renderHook(
      () =>
        useBidReadinessTelemetry({
          complexity: 'Expert',
          audience: 'admin',
          staleAfterMs: 60_000,
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state).toBe('success');
    });

    expect(result.current.snapshot?.readyToBidRate).toBe(82);
    expect(result.current.isStale).toBe(false);
  });

  it('returns degraded state for stale snapshot', async () => {
    const wrapper = createWrapper();
    bidReadinessKpiEmitter.reset();
    const staleSnapshot = createBidReadinessKpiSnapshot(
      { readyToBidRate: 65 },
      '2000-01-01T00:00:00.000Z',
    );

    const staleSpy = vi.spyOn(bidReadinessKpiEmitter, 'getView').mockReturnValue(staleSnapshot);

    const { result } = renderHook(
      () =>
        useBidReadinessTelemetry({
          complexity: 'Standard',
          audience: 'canvas',
          staleAfterMs: 10,
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state).toBe('degraded');
    });

    expect(result.current.isStale).toBe(true);
    expect(result.current.backfillPending).toBe(true);
    staleSpy.mockRestore();
  });

  it('uses fallback snapshot when query errors', async () => {
    const wrapper = createWrapper();
    const fallbackSnapshot = createBidReadinessKpiSnapshot({ readyToBidRate: 55 });

    const spy = vi.spyOn(bidReadinessKpiEmitter, 'getView').mockImplementation(() => {
      throw new Error('telemetry unavailable');
    });

    const { result } = renderHook(
      () =>
        useBidReadinessTelemetry({
          complexity: 'Expert',
          audience: 'governance',
          fallbackSnapshot,
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state).toBe('degraded');
    });

    expect(result.current.snapshot?.readyToBidRate).toBe(55);

    spy.mockRestore();
  });
});
