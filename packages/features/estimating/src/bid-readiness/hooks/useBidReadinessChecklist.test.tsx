import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { mapHealthIndicatorStateToBidReadinessView, mapPursuitToHealthIndicatorItem } from '../adapters/index.js';
import { useBidReadinessChecklist } from './index.js';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function createViewState() {
  const state = mapPursuitToHealthIndicatorItem({
    pursuitId: 'p-checklist',
    costSectionsPopulated: false,
    bidBondConfirmed: true,
    addendaAcknowledged: true,
    subcontractorCoverageMet: false,
    bidDocumentsAttached: true,
    ceSignOff: false,
  });
  return mapHealthIndicatorStateToBidReadinessView(state);
}

describe('useBidReadinessChecklist', () => {
  it('returns grouped checklist state and supports completion updates', async () => {
    const wrapper = createWrapper();
    const viewState = createViewState();

    const { result } = renderHook(() => useBidReadinessChecklist({ viewState }), { wrapper });

    await waitFor(() => {
      expect(result.current.state).toBe('success');
    });

    expect(result.current.items.length).toBeGreaterThan(0);
    expect(result.current.grouped.blockers.length).toBeGreaterThan(0);

    const firstItem = result.current.items[0];
    act(() => {
      result.current.updateCompletion(firstItem.checklistItemId, true);
    });

    await waitFor(() => {
      expect(result.current.recomputeRequired).toBe(true);
    });
  });

  it('returns empty when view state missing', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useBidReadinessChecklist({ viewState: null }), { wrapper });

    expect(result.current.state).toBe('empty');
  });
});
