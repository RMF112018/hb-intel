import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  useBidReadiness,
  useBidReadinessProfile,
  type UseBidReadinessParams,
} from './index.js';

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

const baseParams: UseBidReadinessParams = {
  pursuit: {
    pursuitId: 'p-1001',
    costSectionsPopulated: true,
    bidBondConfirmed: true,
    addendaAcknowledged: false,
    subcontractorCoverageMet: true,
    bidDocumentsAttached: true,
    ceSignOff: false,
  },
};

describe('useBidReadiness', () => {
  it('returns success state with deterministic blocker-first grouping', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useBidReadiness(baseParams), { wrapper });

    await waitFor(() => {
      expect(result.current.state).toBe('success');
    });

    expect(result.current.viewState).not.toBeNull();
    expect(result.current.blockerCount).toBeGreaterThan(0);
    expect(result.current.groupedCriteria.blockers.length).toBe(result.current.blockerCount);

    const criteria = result.current.viewState?.criteria ?? [];
    const firstNonBlocker = criteria.findIndex((item) => !item.criterion.isBlocker);
    const firstBlockerAfterNonBlocker = criteria.findIndex(
      (item, index) => index > firstNonBlocker && item.criterion.isBlocker,
    );

    if (firstNonBlocker >= 0) {
      expect(firstBlockerAfterNonBlocker).toBe(-1);
    }
  });

  it('returns degraded state when profile override falls back', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useBidReadiness({
        ...baseParams,
        profileOverride: {
          thresholds: {
            readyMinScore: 60,
            nearlyReadyMinScore: 80,
            attentionNeededMinScore: 30,
          },
        },
      }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state).toBe('degraded');
    });

    expect(result.current.isDegraded).toBe(true);
    expect(result.current.validationErrors.length).toBeGreaterThan(0);
  });

  it('returns empty state when criteria are fully filtered out', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () =>
        useBidReadiness({
          ...baseParams,
          criterionVisibilityFilter: () => false,
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state).toBe('empty');
    });

    expect(result.current.viewState?.criteria).toHaveLength(0);
  });

  it('returns empty state when pursuit is missing', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () =>
        useBidReadiness({
          pursuit: null,
        }),
      { wrapper },
    );

    expect(result.current.state).toBe('empty');
    expect(result.current.viewState).toBeNull();
  });
});

describe('useBidReadinessProfile', () => {
  it('returns resolved profile metadata and refresh function', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useBidReadinessProfile(), { wrapper });

    await waitFor(() => {
      expect(result.current.state).toBe('success');
    });

    expect(result.current.profile?.criteria.length).toBe(6);
    expect(typeof result.current.refresh).toBe('function');
  });
});
