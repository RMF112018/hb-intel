import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useMyWorkShellState } from './useMyWorkShellState.js';

describe('useMyWorkShellState — initial state', () => {
  it('defaults to my-work-home with no active module', () => {
    const { result } = renderHook(() => useMyWorkShellState());
    expect(result.current.activePrimarySurfaceId).toBe('my-work-home');
    expect(result.current.activeModuleId).toBeUndefined();
  });

  it('honors a valid initial primary surface', () => {
    const { result } = renderHook(() =>
      useMyWorkShellState({ activePrimarySurfaceId: 'my-work-home' }),
    );
    expect(result.current.activePrimarySurfaceId).toBe('my-work-home');
    expect(result.current.activeModuleId).toBeUndefined();
  });

  it('normalizes an invalid initial primary surface to my-work-home', () => {
    const { result } = renderHook(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useMyWorkShellState({ activePrimarySurfaceId: 'not-a-surface' as any }),
    );
    expect(result.current.activePrimarySurfaceId).toBe('my-work-home');
  });

  it('ignores an invalid initial module id', () => {
    const { result } = renderHook(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useMyWorkShellState({ activeModuleId: 'not-a-module' as any }),
    );
    expect(result.current.activeModuleId).toBeUndefined();
    expect(result.current.activePrimarySurfaceId).toBe('my-work-home');
  });

  it('derives the parent surface from a valid initial module id', () => {
    const { result } = renderHook(() =>
      useMyWorkShellState({ activeModuleId: 'adobe-sign-action-queue' }),
    );
    expect(result.current.activeModuleId).toBe('adobe-sign-action-queue');
    expect(result.current.activePrimarySurfaceId).toBe('my-work-home');
  });
});

describe('useMyWorkShellState — selectPrimarySurface', () => {
  it('clears any active module when re-selecting the primary surface', () => {
    const { result } = renderHook(() =>
      useMyWorkShellState({ activeModuleId: 'adobe-sign-action-queue' }),
    );
    expect(result.current.activeModuleId).toBe('adobe-sign-action-queue');

    act(() => result.current.selectPrimarySurface('my-work-home'));

    expect(result.current.activePrimarySurfaceId).toBe('my-work-home');
    expect(result.current.activeModuleId).toBeUndefined();
  });
});

describe('useMyWorkShellState — selectModule', () => {
  it('sets the module and keeps the parent surface as my-work-home', () => {
    const { result } = renderHook(() => useMyWorkShellState());

    act(() => result.current.selectModule('adobe-sign-action-queue'));

    expect(result.current.activeModuleId).toBe('adobe-sign-action-queue');
    expect(result.current.activePrimarySurfaceId).toBe('my-work-home');
  });

  it('is a no-op for an unknown module id', () => {
    const { result } = renderHook(() => useMyWorkShellState());
    const before = {
      activePrimarySurfaceId: result.current.activePrimarySurfaceId,
      activeModuleId: result.current.activeModuleId,
    };

    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result.current.selectModule('not-a-module' as any);
    });

    expect(result.current.activePrimarySurfaceId).toBe(before.activePrimarySurfaceId);
    expect(result.current.activeModuleId).toBe(before.activeModuleId);
  });
});

describe('useMyWorkShellState — clearActiveModule', () => {
  it('clears an active module', () => {
    const { result } = renderHook(() =>
      useMyWorkShellState({ activeModuleId: 'adobe-sign-action-queue' }),
    );

    act(() => result.current.clearActiveModule());

    expect(result.current.activeModuleId).toBeUndefined();
    expect(result.current.activePrimarySurfaceId).toBe('my-work-home');
  });

  it('is idempotent when no module is active', () => {
    const { result } = renderHook(() => useMyWorkShellState());
    const before = result.current.activeModuleId;

    act(() => result.current.clearActiveModule());

    expect(result.current.activeModuleId).toBe(before);
  });
});

describe('useMyWorkShellState — callback identity', () => {
  it('preserves callback identity across rerenders', () => {
    const { result, rerender } = renderHook(() => useMyWorkShellState());
    const captured = {
      selectPrimarySurface: result.current.selectPrimarySurface,
      selectModule: result.current.selectModule,
      clearActiveModule: result.current.clearActiveModule,
    };

    rerender();

    expect(result.current.selectPrimarySurface).toBe(captured.selectPrimarySurface);
    expect(result.current.selectModule).toBe(captured.selectModule);
    expect(result.current.clearActiveModule).toBe(captured.clearActiveModule);
  });
});
