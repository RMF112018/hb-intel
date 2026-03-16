import { describe, it, expect, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsTablet } from '../useIsTablet.js';

describe('useIsTablet', () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: originalInnerWidth });
  });

  it('returns true when width <= 1023', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1023 });
    const { result } = renderHook(() => useIsTablet());
    expect(result.current).toBe(true);
  });

  it('returns false when width > 1023', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    const { result } = renderHook(() => useIsTablet());
    expect(result.current).toBe(false);
  });

  it('responds to resize events', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    const { result } = renderHook(() => useIsTablet());
    expect(result.current).toBe(false);

    act(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 800 });
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toBe(true);
  });

  it('defaults to false at large width', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1920 });
    const { result } = renderHook(() => useIsTablet());
    expect(result.current).toBe(false);
  });
});
