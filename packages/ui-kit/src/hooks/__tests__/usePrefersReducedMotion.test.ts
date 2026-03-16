import { describe, it, expect, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePrefersReducedMotion } from '../usePrefersReducedMotion.js';

describe('usePrefersReducedMotion', () => {
  let changeHandler: ((e: { matches: boolean }) => void) | null = null;

  afterEach(() => {
    // Restore default stub from setup.ts
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
    changeHandler = null;
  });

  it('returns false by default', () => {
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns true when media query matches', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: () => ({
        matches: true,
        media: '(prefers-reduced-motion: reduce)',
        addEventListener: (_: string, handler: (e: { matches: boolean }) => void) => { changeHandler = handler; },
        removeEventListener: () => {},
      }),
    });
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it('responds to change events', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: () => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        addEventListener: (_: string, handler: (e: { matches: boolean }) => void) => { changeHandler = handler; },
        removeEventListener: () => {},
      }),
    });
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);

    act(() => { changeHandler?.({ matches: true }); });
    expect(result.current).toBe(true);
  });
});
