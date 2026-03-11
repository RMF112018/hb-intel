import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFirstVisit } from '../hooks/useFirstVisit.js';
import { createEmptyStateVisitStore } from '../classification/emptyStateVisitStore.js';
import type { IEmptyStateVisitStore } from '../types/ISmartEmptyState.js';

describe('useFirstVisit', () => {
  function createFreshStore(): IEmptyStateVisitStore {
    return createEmptyStateVisitStore();
  }

  it('returns isFirstVisit: true when store has no record', () => {
    const store = createFreshStore();
    const { result } = renderHook(() =>
      useFirstVisit({ module: 'accounting', view: 'dashboard', store }),
    );
    expect(result.current.isFirstVisit).toBe(true);
  });

  it('returns isFirstVisit: false when store has existing visit', () => {
    const store = createFreshStore();
    store.markVisited('accounting', 'dashboard');
    const { result } = renderHook(() =>
      useFirstVisit({ module: 'accounting', view: 'dashboard', store }),
    );
    expect(result.current.isFirstVisit).toBe(false);
  });

  it('markVisited updates store and flips local state to false', () => {
    const store = createFreshStore();
    const { result } = renderHook(() =>
      useFirstVisit({ module: 'accounting', view: 'list', store }),
    );
    expect(result.current.isFirstVisit).toBe(true);

    act(() => {
      result.current.markVisited();
    });

    expect(result.current.isFirstVisit).toBe(false);
    expect(store.hasVisited('accounting', 'list')).toBe(true);
  });

  it('uses injected store over default', () => {
    const customStore: IEmptyStateVisitStore = {
      hasVisited: () => true,
      markVisited: () => {},
    };
    const { result } = renderHook(() =>
      useFirstVisit({ module: 'test', view: 'view', store: customStore }),
    );
    expect(result.current.isFirstVisit).toBe(false);
  });

  it('works with default store when no store param provided', () => {
    const { result } = renderHook(() =>
      useFirstVisit({ module: 'default-store-test', view: 'view' }),
    );
    expect(typeof result.current.isFirstVisit).toBe('boolean');
    expect(typeof result.current.markVisited).toBe('function');
  });

  it('markVisited is stable reference between renders with same deps', () => {
    const store = createFreshStore();
    const { result, rerender } = renderHook(() =>
      useFirstVisit({ module: 'stable', view: 'ref', store }),
    );
    const firstRef = result.current.markVisited;
    rerender();
    expect(result.current.markVisited).toBe(firstRef);
  });

  it('multiple module/view pairs are independent', () => {
    const store = createFreshStore();
    const { result: r1 } = renderHook(() =>
      useFirstVisit({ module: 'mod-a', view: 'view-1', store }),
    );
    const { result: r2 } = renderHook(() =>
      useFirstVisit({ module: 'mod-b', view: 'view-2', store }),
    );

    expect(r1.current.isFirstVisit).toBe(true);
    expect(r2.current.isFirstVisit).toBe(true);

    act(() => {
      r1.current.markVisited();
    });

    expect(r1.current.isFirstVisit).toBe(false);
    expect(r2.current.isFirstVisit).toBe(true);
  });

  it('calling markVisited multiple times is idempotent', () => {
    const store = createFreshStore();
    const { result } = renderHook(() =>
      useFirstVisit({ module: 'idem', view: 'test', store }),
    );

    act(() => {
      result.current.markVisited();
    });
    act(() => {
      result.current.markVisited();
    });

    expect(result.current.isFirstVisit).toBe(false);
    expect(store.hasVisited('idem', 'test')).toBe(true);
  });

  it('reads store exactly once on mount via useState initializer', () => {
    let callCount = 0;
    const countingStore: IEmptyStateVisitStore = {
      hasVisited: () => {
        callCount++;
        return false;
      },
      markVisited: () => {},
    };
    const { rerender } = renderHook(() =>
      useFirstVisit({ module: 'count', view: 'test', store: countingStore }),
    );
    expect(callCount).toBe(1);
    rerender();
    expect(callCount).toBe(1);
  });

  it('returns markVisited that returns void', () => {
    const store = createFreshStore();
    const { result } = renderHook(() =>
      useFirstVisit({ module: 'void', view: 'test', store }),
    );
    let returnVal: unknown;
    act(() => {
      returnVal = result.current.markVisited();
    });
    expect(returnVal).toBeUndefined();
  });
});
