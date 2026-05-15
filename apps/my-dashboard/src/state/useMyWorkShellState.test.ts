import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useMyWorkShellState } from './useMyWorkShellState.js';

describe('useMyWorkShellState — initial state', () => {
  it('defaults to my-work-home', () => {
    const { result } = renderHook(() => useMyWorkShellState());
    expect(result.current.activePrimarySurfaceId).toBe('my-work-home');
  });

  it('honors a valid initial primary surface', () => {
    const { result } = renderHook(() =>
      useMyWorkShellState({ activePrimarySurfaceId: 'my-work-home' }),
    );
    expect(result.current.activePrimarySurfaceId).toBe('my-work-home');
  });

  it('normalizes an invalid initial primary surface to my-work-home', () => {
    const { result } = renderHook(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useMyWorkShellState({ activePrimarySurfaceId: 'not-a-surface' as any }),
    );
    expect(result.current.activePrimarySurfaceId).toBe('my-work-home');
  });
});

describe('useMyWorkShellState — selectPrimarySurface', () => {
  it('sets the primary surface to a valid id', () => {
    const { result } = renderHook(() => useMyWorkShellState());

    act(() => result.current.selectPrimarySurface('my-work-home'));

    expect(result.current.activePrimarySurfaceId).toBe('my-work-home');
  });
});

describe('useMyWorkShellState — callback identity', () => {
  it('preserves callback identity across rerenders', () => {
    const { result, rerender } = renderHook(() => useMyWorkShellState());
    const captured = result.current.selectPrimarySurface;

    rerender();

    expect(result.current.selectPrimarySurface).toBe(captured);
  });
});
