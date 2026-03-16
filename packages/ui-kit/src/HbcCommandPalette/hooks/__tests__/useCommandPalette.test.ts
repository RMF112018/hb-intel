import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCommandPalette } from '../useCommandPalette.js';

describe('useCommandPalette', () => {
  it('starts closed', () => {
    const { result } = renderHook(() => useCommandPalette());
    expect(result.current.isOpen).toBe(false);
  });

  it('open sets isOpen to true', () => {
    const { result } = renderHook(() => useCommandPalette());
    act(() => { result.current.open(); });
    expect(result.current.isOpen).toBe(true);
  });

  it('toggle flips isOpen', () => {
    const { result } = renderHook(() => useCommandPalette());
    act(() => { result.current.toggle(); });
    expect(result.current.isOpen).toBe(true);
    act(() => { result.current.toggle(); });
    expect(result.current.isOpen).toBe(false);
  });
});
