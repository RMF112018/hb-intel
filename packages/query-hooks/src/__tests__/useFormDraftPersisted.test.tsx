import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useFormDraftPersisted } from '../stores/useFormDraftPersisted';

const mockSave = vi.fn();
const mockClear = vi.fn();
let mockValue: Record<string, unknown> | null = null;

vi.mock('@hbc/session-state', () => ({
  useDraft: (_key: string) => ({
    value: mockValue,
    save: mockSave,
    clear: mockClear,
  }),
}));

describe('useFormDraftPersisted', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValue = null;
  });

  it('draft is undefined when no draft exists', () => {
    const { result } = renderHook(() => useFormDraftPersisted('form-1'));
    expect(result.current.draft).toBeUndefined();
  });

  it('saveDraft calls through to session-state save with TTL 72', () => {
    const { result } = renderHook(() => useFormDraftPersisted('form-1'));

    act(() => {
      result.current.saveDraft({ field: 'value' });
    });

    expect(mockSave).toHaveBeenCalledWith({ field: 'value' }, 72);
  });

  it('clearDraft calls through to session-state clear', () => {
    const { result } = renderHook(() => useFormDraftPersisted('form-1'));

    act(() => {
      result.current.clearDraft();
    });

    expect(mockClear).toHaveBeenCalled();
  });

  it('hasDraft reflects presence of saved value', () => {
    mockValue = { field: 'saved' };
    const { result } = renderHook(() => useFormDraftPersisted('form-1'));
    expect(result.current.hasDraft).toBe(true);
  });

  it('submitWithDraftClear clears draft after successful submit', async () => {
    const submitFn = vi.fn();
    const { result } = renderHook(() => useFormDraftPersisted('form-1'));

    const wrapped = result.current.submitWithDraftClear(submitFn);
    await act(async () => {
      await wrapped({ name: 'test' });
    });

    expect(submitFn).toHaveBeenCalledWith({ name: 'test' });
    expect(mockClear).toHaveBeenCalled();
  });

  it('disabled when formId is undefined — saveDraft and clearDraft are no-ops', () => {
    const { result } = renderHook(() => useFormDraftPersisted(undefined));

    act(() => {
      result.current.saveDraft({ field: 'value' });
    });
    expect(mockSave).not.toHaveBeenCalled();

    act(() => {
      result.current.clearDraft();
    });
    expect(mockClear).not.toHaveBeenCalled();

    expect(result.current.draft).toBeUndefined();
  });

  it('restoreDraftValues merges draft over fallback', () => {
    mockValue = { name: 'draft-name', extra: 'field' };
    const { result } = renderHook(() => useFormDraftPersisted('form-1'));

    const restored = result.current.restoreDraftValues({ name: 'fallback', age: 30 });
    expect(restored).toEqual({ name: 'draft-name', age: 30, extra: 'field' });
  });

  it('restoreIntoReset pushes draft into reset function', () => {
    mockValue = { name: 'draft-name' };
    const resetFn = vi.fn();
    const { result } = renderHook(() => useFormDraftPersisted('form-1'));

    const applied = result.current.restoreIntoReset(resetFn);
    expect(applied).toBe(true);
    expect(resetFn).toHaveBeenCalledWith({ name: 'draft-name' });
  });
});
