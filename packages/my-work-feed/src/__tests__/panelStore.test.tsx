import { renderHook, act } from '@testing-library/react';
import { MyWorkPanelStoreProvider, useMyWorkPanelStore } from '../store/MyWorkPanelStore.js';
import type { IMyWorkSavedGrouping } from '../types/index.js';
import type { ReactNode } from 'react';

function wrapper({ children }: { children: ReactNode }) {
  return <MyWorkPanelStoreProvider>{children}</MyWorkPanelStoreProvider>;
}

describe('MyWorkPanelStore', () => {
  it('throws when used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useMyWorkPanelStore())).toThrow(
      'useMyWorkPanelStore must be used within a MyWorkPanelStoreProvider',
    );
    spy.mockRestore();
  });

  it('starts with panel closed, no grouping, empty expanded groups', () => {
    const { result } = renderHook(() => useMyWorkPanelStore(), { wrapper });
    expect(result.current.isPanelOpen).toBe(false);
    expect(result.current.grouping).toBeNull();
    expect(result.current.expandedGroups.size).toBe(0);
  });

  it('openPanel sets isPanelOpen to true', () => {
    const { result } = renderHook(() => useMyWorkPanelStore(), { wrapper });
    act(() => result.current.openPanel());
    expect(result.current.isPanelOpen).toBe(true);
  });

  it('closePanel sets isPanelOpen to false', () => {
    const { result } = renderHook(() => useMyWorkPanelStore(), { wrapper });
    act(() => result.current.openPanel());
    act(() => result.current.closePanel());
    expect(result.current.isPanelOpen).toBe(false);
  });

  it('togglePanel flips isPanelOpen', () => {
    const { result } = renderHook(() => useMyWorkPanelStore(), { wrapper });
    act(() => result.current.togglePanel());
    expect(result.current.isPanelOpen).toBe(true);
    act(() => result.current.togglePanel());
    expect(result.current.isPanelOpen).toBe(false);
  });

  it('setGrouping updates grouping and resets expandedGroups', () => {
    const { result } = renderHook(() => useMyWorkPanelStore(), { wrapper });
    // expand some groups first
    act(() => result.current.toggleGroup('g1'));
    expect(result.current.expandedGroups.has('g1')).toBe(true);

    const grouping: IMyWorkSavedGrouping = {
      key: 'by-priority',
      label: 'Priority',
      groupingFn: (item) => item.priority,
    };
    act(() => result.current.setGrouping(grouping));
    expect(result.current.grouping).toBe(grouping);
    expect(result.current.expandedGroups.size).toBe(0);
  });

  it('toggleGroup adds and removes group keys', () => {
    const { result } = renderHook(() => useMyWorkPanelStore(), { wrapper });
    act(() => result.current.toggleGroup('g1'));
    expect(result.current.expandedGroups.has('g1')).toBe(true);
    act(() => result.current.toggleGroup('g2'));
    expect(result.current.expandedGroups.has('g2')).toBe(true);
    act(() => result.current.toggleGroup('g1'));
    expect(result.current.expandedGroups.has('g1')).toBe(false);
    expect(result.current.expandedGroups.has('g2')).toBe(true);
  });

  it('setGrouping to null clears grouping', () => {
    const { result } = renderHook(() => useMyWorkPanelStore(), { wrapper });
    const grouping: IMyWorkSavedGrouping = {
      key: 'by-lane',
      label: 'Lane',
      groupingFn: (item) => item.lane,
    };
    act(() => result.current.setGrouping(grouping));
    act(() => result.current.setGrouping(null));
    expect(result.current.grouping).toBeNull();
  });
});
