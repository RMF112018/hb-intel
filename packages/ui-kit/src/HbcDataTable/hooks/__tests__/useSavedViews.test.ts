import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSavedViews } from '../useSavedViews.js';

const baseOptions = {
  toolId: 'test-tool',
  userId: 'user-1',
};

describe('useSavedViews', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with empty views', async () => {
    const { result } = renderHook(() => useSavedViews(baseOptions));
    // Wait for async load
    await act(async () => {});
    expect(result.current.views).toEqual([]);
  });

  it('creates a view and adds it to list', async () => {
    const { result } = renderHook(() => useSavedViews(baseOptions));
    await act(async () => {});

    let entry: unknown;
    act(() => {
      entry = result.current.createView('My View', { columns: ['a'], columnOrder: ['a'], columnWidths: {}, filters: [], sortColumn: 'a', sortDirection: 'asc' as const });
    });
    expect(entry).not.toBeNull();
    expect(result.current.views).toHaveLength(1);
    expect(result.current.views[0].name).toBe('My View');
  });

  it('deletes a view', async () => {
    const { result } = renderHook(() => useSavedViews(baseOptions));
    await act(async () => {});

    let entry: { id: string } | null = null;
    act(() => {
      entry = result.current.createView('To Delete', { columns: [], columnOrder: [], columnWidths: {}, filters: [], sortColumn: '', sortDirection: 'asc' as const });
    });
    expect(result.current.views).toHaveLength(1);

    act(() => { result.current.deleteView(entry!.id); });
    expect(result.current.views).toHaveLength(0);
  });

  it('enforces max 20 personal views', async () => {
    const { result } = renderHook(() => useSavedViews(baseOptions));
    await act(async () => {});

    // Create 20 views
    for (let i = 0; i < 20; i++) {
      act(() => { result.current.createView(`View ${i}`, { columns: [], columnOrder: [], columnWidths: {}, filters: [], sortColumn: '', sortDirection: 'asc' as const }); });
    }
    expect(result.current.isAtLimit).toBe(true);

    // 21st should return null
    let overflow: unknown;
    act(() => { overflow = result.current.createView('Overflow', { columns: [], columnOrder: [], columnWidths: {}, filters: [], sortColumn: '', sortDirection: 'asc' as const }); });
    expect(overflow).toBeNull();
    expect(result.current.views).toHaveLength(20);
  });

  it('generates deep link URL', async () => {
    const { result } = renderHook(() => useSavedViews(baseOptions));
    await act(async () => {});

    const config = { columns: ['a'], columnOrder: ['a'], columnWidths: {}, filters: [], sortColumn: 'a', sortDirection: 'asc' as const };
    const link = result.current.getDeepLink(config);
    expect(link).toContain('view=');
  });

  it('activates and deactivates views', async () => {
    const { result } = renderHook(() => useSavedViews(baseOptions));
    await act(async () => {});

    act(() => { result.current.createView('Active', { columns: [], columnOrder: [], columnWidths: {}, filters: [], sortColumn: '', sortDirection: 'asc' as const }); });
    const viewId = result.current.views[0].id;

    act(() => { result.current.activateView(viewId); });
    expect(result.current.activeView?.id).toBe(viewId);

    act(() => { result.current.activateView(null); });
    expect(result.current.activeView).toBeNull();
  });
});
