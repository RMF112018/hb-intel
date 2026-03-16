import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMinDisplayTime } from '../useMinDisplayTime.js';

describe('useMinDisplayTime', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('returns false when not loading', () => {
    const { result } = renderHook(() => useMinDisplayTime(false, 300));
    expect(result.current).toBe(false);
  });

  it('returns true when loading', () => {
    const { result } = renderHook(() => useMinDisplayTime(true, 300));
    expect(result.current).toBe(true);
  });

  it('stays true for minMs after loading ends', () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) => useMinDisplayTime(isLoading, 300),
      { initialProps: { isLoading: true } },
    );
    expect(result.current).toBe(true);

    // Stop loading
    rerender({ isLoading: false });
    // Should still be true (minimum display time not elapsed)
    expect(result.current).toBe(true);

    // Advance past minimum time
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe(false);
  });

  it('cleans up timer on unmount', () => {
    const { result, rerender, unmount } = renderHook(
      ({ isLoading }) => useMinDisplayTime(isLoading, 300),
      { initialProps: { isLoading: true } },
    );
    rerender({ isLoading: false });
    unmount();
    // No errors thrown — timer cleaned up
    act(() => { vi.advanceTimersByTime(500); });
  });
});
