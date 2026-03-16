import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUnsavedChangesBlocker } from '../useUnsavedChangesBlocker.js';

describe('useUnsavedChangesBlocker', () => {
  it('showPrompt is false initially', () => {
    const { result } = renderHook(() =>
      useUnsavedChangesBlocker({ isDirty: false }),
    );
    expect(result.current.showPrompt).toBe(false);
  });

  it('registers beforeunload when dirty', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    renderHook(() => useUnsavedChangesBlocker({ isDirty: true }));
    expect(addSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    addSpy.mockRestore();
  });

  it('does not register beforeunload when not dirty', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    renderHook(() => useUnsavedChangesBlocker({ isDirty: false }));
    const beforeunloadCalls = addSpy.mock.calls.filter(([e]) => e === 'beforeunload');
    expect(beforeunloadCalls).toHaveLength(0);
    addSpy.mockRestore();
  });

  it('confirmNavigation clears prompt', () => {
    const { result } = renderHook(() =>
      useUnsavedChangesBlocker({ isDirty: true }),
    );
    act(() => { result.current.setShowPrompt(true); });
    expect(result.current.showPrompt).toBe(true);
    act(() => { result.current.confirmNavigation(); });
    expect(result.current.showPrompt).toBe(false);
  });

  it('cancelNavigation clears prompt', () => {
    const { result } = renderHook(() =>
      useUnsavedChangesBlocker({ isDirty: true }),
    );
    act(() => { result.current.setShowPrompt(true); });
    act(() => { result.current.cancelNavigation(); });
    expect(result.current.showPrompt).toBe(false);
  });
});
