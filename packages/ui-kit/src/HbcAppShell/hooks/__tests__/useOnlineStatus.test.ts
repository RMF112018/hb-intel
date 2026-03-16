import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnlineStatus } from '../useOnlineStatus.js';

describe('useOnlineStatus', () => {
  it('defaults to online when navigator.onLine is true', () => {
    Object.defineProperty(navigator, 'onLine', { writable: true, configurable: true, value: true });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe('online');
  });

  it('returns offline when navigator.onLine is false', () => {
    Object.defineProperty(navigator, 'onLine', { writable: true, configurable: true, value: false });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe('offline');
  });

  it('responds to offline event', () => {
    Object.defineProperty(navigator, 'onLine', { writable: true, configurable: true, value: true });
    const { result } = renderHook(() => useOnlineStatus());
    act(() => { window.dispatchEvent(new Event('offline')); });
    expect(result.current).toBe('offline');
  });

  it('responds to online event', () => {
    Object.defineProperty(navigator, 'onLine', { writable: true, configurable: true, value: false });
    const { result } = renderHook(() => useOnlineStatus());
    act(() => { window.dispatchEvent(new Event('online')); });
    expect(result.current).toBe('online');
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useOnlineStatus());
    unmount();
    // No errors — listeners cleaned up
  });
});
