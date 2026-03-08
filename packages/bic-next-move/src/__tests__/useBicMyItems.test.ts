import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBicMyItems } from '../hooks/useBicMyItems';
import {
  registerBicModule,
  _clearRegistryForTests,
} from '../registry/BicModuleRegistry';
import { mockBicStates } from '@hbc/bic-next-move/testing';

// Mock useComplexity (not used by this hook, but transitively imported)
vi.mock('@hbc/ui-kit', () => ({
  useComplexity: () => ({ variant: 'standard' }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

beforeEach(() => _clearRegistryForTests());
afterEach(() => _clearRegistryForTests());

describe('useBicMyItems', () => {
  it('returns items from registered modules', async () => {
    registerBicModule({
      key: 'bd-scorecard',
      label: 'Scorecards',
      queryFn: async () => [
        { itemKey: 'bd-scorecard::001', moduleKey: 'bd-scorecard', moduleLabel: 'Scorecards',
          state: mockBicStates.upcoming, href: '/bd/001', title: 'Test' },
      ],
    });

    const { result } = renderHook(
      () => useBicMyItems({ userId: 'user-123' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.failedModules).toHaveLength(0);
  });

  it('filters by moduleKey', async () => {
    registerBicModule({
      key: 'bd-scorecard',
      label: 'Scorecards',
      queryFn: async () => [
        { itemKey: 'bd-scorecard::001', moduleKey: 'bd-scorecard', moduleLabel: 'Scorecards',
          state: mockBicStates.upcoming, href: '/bd/001', title: 'Test' },
      ],
    });
    registerBicModule({
      key: 'estimating-pursuit',
      label: 'Pursuits',
      queryFn: async () => [
        { itemKey: 'estimating-pursuit::001', moduleKey: 'estimating-pursuit', moduleLabel: 'Pursuits',
          state: mockBicStates.watch, href: '/est/001', title: 'Test' },
      ],
    });

    const { result } = renderHook(
      () => useBicMyItems({ userId: 'user-123', moduleKey: 'bd-scorecard' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].moduleKey).toBe('bd-scorecard');
  });

  it('filters by urgencyTier', async () => {
    registerBicModule({
      key: 'bd-scorecard',
      label: 'Scorecards',
      queryFn: async () => [
        { itemKey: 'bd-scorecard::001', moduleKey: 'bd-scorecard', moduleLabel: 'Scorecards',
          state: mockBicStates.upcoming, href: '/bd/001', title: 'A' },
        { itemKey: 'bd-scorecard::002', moduleKey: 'bd-scorecard', moduleLabel: 'Scorecards',
          state: mockBicStates.immediate, href: '/bd/002', title: 'B' },
      ],
    });

    const { result } = renderHook(
      () => useBicMyItems({ userId: 'user-123', urgencyTier: 'immediate' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].state.urgencyTier).toBe('immediate');
  });

  it('does not fetch when enabled is false', async () => {
    registerBicModule({
      key: 'bd-scorecard',
      label: 'Scorecards',
      queryFn: async () => [
        { itemKey: 'bd-scorecard::001', moduleKey: 'bd-scorecard', moduleLabel: 'Scorecards',
          state: mockBicStates.upcoming, href: '/bd/001', title: 'Test' },
      ],
    });

    const { result } = renderHook(
      () => useBicMyItems({ userId: 'user-123', enabled: false }),
      { wrapper: createWrapper() }
    );

    // Should stay in loading state with no items
    expect(result.current.items).toHaveLength(0);
  });

  it('reports failed modules', async () => {
    registerBicModule({
      key: 'bd-scorecard',
      label: 'Scorecards',
      queryFn: async () => { throw new Error('Network error'); },
    });

    const { result } = renderHook(
      () => useBicMyItems({ userId: 'user-123' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.failedModules).toContain('bd-scorecard');
  });
});
