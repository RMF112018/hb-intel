import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFocusMode } from '../useFocusMode.js';

describe('useFocusMode', () => {
  beforeEach(() => {
    localStorage.clear();
    // Default: fine pointer (desktop)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: query === '(pointer: coarse)' ? false : false,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  });

  afterEach(() => {
    // Restore default matchMedia stub
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
  });

  it('defaults to false on desktop (fine pointer)', () => {
    const { result } = renderHook(() => useFocusMode());
    expect(result.current.isAutoFocus).toBe(false);
  });

  it('toggleFocusMode flips and persists to localStorage', () => {
    const { result } = renderHook(() => useFocusMode());
    act(() => { result.current.toggleFocusMode(); });
    expect(result.current.isFocusMode).toBe(true);
    expect(localStorage.getItem('hbc-focus-mode-desktop')).toBe('true');
  });

  it('deactivate sets focus mode off', () => {
    localStorage.setItem('hbc-focus-mode-desktop', 'true');
    const { result } = renderHook(() => useFocusMode());
    act(() => { result.current.deactivate(); });
    expect(result.current.isFocusMode).toBe(false);
  });

  it('auto-activates on touch device', () => {
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
    const { result } = renderHook(() => useFocusMode());
    expect(result.current.isAutoFocus).toBe(true);
    expect(result.current.isFocusMode).toBe(true);
  });
});
