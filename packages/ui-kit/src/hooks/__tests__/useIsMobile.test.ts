import { describe, it, expect, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '../useIsMobile.js';

describe('useIsMobile', () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: originalInnerWidth });
  });

  it('returns true when width <= 767', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 767 });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('returns false when width > 767', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('responds to resize events', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toBe(true);
  });

  it('defaults to false for SSR (window exists in jsdom but test the pattern)', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1200 });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });
});
