import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAdaptiveDensity } from '../useAdaptiveDensity.js';

describe('useAdaptiveDensity', () => {
  beforeEach(() => {
    localStorage.clear();
    // Default: fine pointer, wide desktop (>= 1440 for compact density)
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1500 });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false, // fine pointer
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  });

  it('defaults to compact on wide fine-pointer desktop (>= 1440)', () => {
    const { result } = renderHook(() => useAdaptiveDensity());
    expect(result.current.tier).toBe('compact');
  });

  it('returns standard on medium viewport with fine pointer', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1100 });
    const { result } = renderHook(() => useAdaptiveDensity());
    expect(result.current.tier).toBe('standard');
  });

  it('returns touch on coarse pointer + narrow viewport', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 800 });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: query === '(pointer: coarse)',
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
    const { result } = renderHook(() => useAdaptiveDensity());
    expect(result.current.tier).toBe('touch');
  });

  it('field mode defaults to touch tier', () => {
    const { result } = renderHook(() => useAdaptiveDensity({ isFieldMode: true }));
    expect(result.current.tier).toBe('touch');
  });

  it('manual override persists to localStorage', () => {
    const { result } = renderHook(() => useAdaptiveDensity({ toolId: 'test-tool' }));
    act(() => { result.current.setManualOverride('touch'); });
    expect(result.current.tier).toBe('touch');
    expect(localStorage.getItem('hbc-density-test-tool')).toBe('touch');
  });
});
