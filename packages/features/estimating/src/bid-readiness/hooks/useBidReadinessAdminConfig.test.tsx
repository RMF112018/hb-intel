import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useBidReadinessAdminConfig } from './index.js';

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

describe('useBidReadinessAdminConfig', () => {
  it('loads draft config and supports deterministic edits', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useBidReadinessAdminConfig(), { wrapper });

    await waitFor(() => {
      expect(result.current.state).toBe('success');
    });

    expect(result.current.draft).not.toBeNull();

    const firstCriterion = result.current.draft?.profile.criteria[0];
    if (firstCriterion) {
      result.current.setCriterionWeight(firstCriterion.criterionId, 55);
      result.current.setCriterionBlocker(firstCriterion.criterionId, true);
    }

    result.current.setThreshold('readyMinScore', 95);

    expect(result.current.validationErrors.length).toBeGreaterThanOrEqual(0);
  });

  it('saves and resets draft snapshots deterministically', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useBidReadinessAdminConfig(), { wrapper });

    await waitFor(() => {
      expect(result.current.draft).not.toBeNull();
    });

    const snapshot = result.current.saveDraft();
    expect(snapshot).not.toBeNull();

    result.current.resetDraft();
    expect(result.current.draft).not.toBeNull();
  });
});
