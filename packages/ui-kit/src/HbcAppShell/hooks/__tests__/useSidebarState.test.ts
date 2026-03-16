import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSidebarState } from '../useSidebarState.js';

describe('useSidebarState', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1280 });
  });

  it('defaults to collapsed', () => {
    const { result } = renderHook(() => useSidebarState());
    expect(result.current.isExpanded).toBe(false);
  });

  it('toggle persists to localStorage', () => {
    const { result } = renderHook(() => useSidebarState());
    act(() => { result.current.toggle(); });
    expect(result.current.isExpanded).toBe(true);
    expect(localStorage.getItem('hbc-sidebar-state')).toBe('expanded');
  });

  it('reads initial state from localStorage', () => {
    localStorage.setItem('hbc-sidebar-state', 'expanded');
    const { result } = renderHook(() => useSidebarState());
    expect(result.current.isExpanded).toBe(true);
  });

  it('detects mobile on narrow viewport', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 800 });
    const { result } = renderHook(() => useSidebarState());
    expect(result.current.isMobile).toBe(true);
  });
});
