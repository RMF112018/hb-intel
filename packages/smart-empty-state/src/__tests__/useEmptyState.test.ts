import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEmptyState } from '../hooks/useEmptyState.js';
import { createEmptyStateVisitStore } from '../classification/emptyStateVisitStore.js';
import { createMockEmptyStateConfig } from '@hbc/smart-empty-state/testing';
import type { IEmptyStateContext, IEmptyStateVisitStore, ISmartEmptyStateConfig } from '../types/ISmartEmptyState.js';

function mockResolverConfig(): ISmartEmptyStateConfig {
  return { resolve: () => createMockEmptyStateConfig() };
}

describe('useEmptyState', () => {
  function createFreshStore(): IEmptyStateVisitStore {
    return createEmptyStateVisitStore();
  }

  it('returns classification from classifyEmptyState (D-01)', () => {
    const store = createFreshStore();
    const { result } = renderHook(() =>
      useEmptyState({
        config: mockResolverConfig(),
        context: {
          module: 'test',
          view: 'list',
          hasActiveFilters: false,
          hasPermission: true,
          currentUserRole: 'user',
          isLoadError: false,
        },
        firstVisitStore: store,
      }),
    );
    // store has no record → isFirstVisit = true → classification = 'first-use'
    expect(result.current.classification).toBe('first-use');
  });

  it('returns resolved config from config.resolve()', () => {
    const store = createFreshStore();
    store.markVisited('test', 'list');
    const { result } = renderHook(() =>
      useEmptyState({
        config: mockResolverConfig(),
        context: {
          module: 'test',
          view: 'list',
          hasActiveFilters: false,
          hasPermission: true,
          currentUserRole: 'user',
          isLoadError: false,
        },
        firstVisitStore: store,
      }),
    );
    expect(result.current.resolved).toBeDefined();
    expect(result.current.resolved.heading).toBe('No items yet');
    expect(result.current.resolved.description).toBe('Create your first record to get started.');
  });

  it('uses explicit context.isFirstVisit = true over store', () => {
    const store = createFreshStore();
    store.markVisited('test', 'list'); // store says not first visit
    const { result } = renderHook(() =>
      useEmptyState({
        config: mockResolverConfig(),
        context: {
          module: 'test',
          view: 'list',
          hasActiveFilters: false,
          hasPermission: true,
          isFirstVisit: true, // explicit override
          currentUserRole: 'user',
          isLoadError: false,
        },
        firstVisitStore: store,
      }),
    );
    expect(result.current.classification).toBe('first-use');
  });

  it('uses explicit context.isFirstVisit = false over store', () => {
    const store = createFreshStore();
    // store has no record → would be first visit
    const { result } = renderHook(() =>
      useEmptyState({
        config: mockResolverConfig(),
        context: {
          module: 'test',
          view: 'list',
          hasActiveFilters: false,
          hasPermission: true,
          isFirstVisit: false, // explicit override
          currentUserRole: 'user',
          isLoadError: false,
        },
        firstVisitStore: store,
      }),
    );
    expect(result.current.classification).toBe('truly-empty');
  });

  it('resolves isFirstVisit from store when context.isFirstVisit is undefined', () => {
    const store = createFreshStore();
    // no visit recorded → store says first visit
    const { result } = renderHook(() =>
      useEmptyState({
        config: mockResolverConfig(),
        context: {
          module: 'test',
          view: 'list',
          hasActiveFilters: false,
          hasPermission: true,
          currentUserRole: 'user',
          isLoadError: false,
        },
        firstVisitStore: store,
      }),
    );
    expect(result.current.classification).toBe('first-use');
  });

  it('passes normalized context with resolved isFirstVisit to config.resolve()', () => {
    const store = createFreshStore();
    let capturedContext: IEmptyStateContext | undefined;
    const config: ISmartEmptyStateConfig = {
      resolve: (ctx) => {
        capturedContext = ctx;
        return {
          module: ctx.module,
          view: ctx.view,
          classification: 'truly-empty',
          heading: 'Test',
          description: 'Test desc',
        };
      },
    };

    renderHook(() =>
      useEmptyState({
        config,
        context: {
          module: 'test',
          view: 'list',
          hasActiveFilters: false,
          hasPermission: true,
          currentUserRole: 'user',
          isLoadError: false,
        },
        firstVisitStore: store,
      }),
    );

    expect(capturedContext).toBeDefined();
    expect(capturedContext!.isFirstVisit).toBe(true);
  });

  it('deterministic output for equivalent input state', () => {
    const store = createFreshStore();
    store.markVisited('test', 'list');
    const params = {
      config: mockResolverConfig(),
      context: {
        module: 'test' as const,
        view: 'list' as const,
        hasActiveFilters: false,
        hasPermission: true,
        currentUserRole: 'user',
        isLoadError: false,
      },
      firstVisitStore: store,
    };

    const { result: r1 } = renderHook(() => useEmptyState(params));
    const { result: r2 } = renderHook(() => useEmptyState(params));

    expect(r1.current.classification).toBe(r2.current.classification);
    expect(r1.current.resolved.heading).toBe(r2.current.resolved.heading);
  });

  it('classifies loading-failed when isLoadError is true', () => {
    const store = createFreshStore();
    const { result } = renderHook(() =>
      useEmptyState({
        config: mockResolverConfig(),
        context: {
          module: 'test',
          view: 'list',
          hasActiveFilters: false,
          hasPermission: true,
          currentUserRole: 'user',
          isLoadError: true,
        },
        firstVisitStore: store,
      }),
    );
    expect(result.current.classification).toBe('loading-failed');
  });

  it('classifies permission-empty when hasPermission is false', () => {
    const store = createFreshStore();
    const { result } = renderHook(() =>
      useEmptyState({
        config: mockResolverConfig(),
        context: {
          module: 'test',
          view: 'list',
          hasActiveFilters: false,
          hasPermission: false,
          currentUserRole: 'user',
          isLoadError: false,
        },
        firstVisitStore: store,
      }),
    );
    expect(result.current.classification).toBe('permission-empty');
  });

  it('classifies filter-empty when hasActiveFilters is true', () => {
    const store = createFreshStore();
    store.markVisited('test', 'list');
    const { result } = renderHook(() =>
      useEmptyState({
        config: mockResolverConfig(),
        context: {
          module: 'test',
          view: 'list',
          hasActiveFilters: true,
          hasPermission: true,
          currentUserRole: 'user',
          isLoadError: false,
        },
        firstVisitStore: store,
      }),
    );
    expect(result.current.classification).toBe('filter-empty');
  });
});
