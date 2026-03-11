import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useComposerDraft } from '../hooks/useComposerDraft';
import type { IComposerDraftState } from '../hooks/useComposerDraft';

const mockSave = vi.fn();
const mockClear = vi.fn();
let mockValue: IComposerDraftState | null = null;

vi.mock('@hbc/session-state', () => ({
  useDraft: (key: string) => {
    // Verify correct key pattern
    expect(key).toMatch(/^handoff:/);
    return { value: mockValue, save: mockSave, clear: mockClear };
  },
}));

const draftState: IComposerDraftState = {
  contextNotes: [
    {
      noteId: 'n-1',
      category: 'Key Decision',
      body: 'Test note',
      author: { userId: 'u-1', displayName: 'User One', role: 'PM' },
      createdAt: '2026-03-11T00:00:00.000Z',
    },
  ],
  recipientOverride: null,
};

describe('useComposerDraft', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValue = null;
  });

  it('savedDraft is null when no draft exists', () => {
    const { result } = renderHook(() => useComposerDraft('rec-1'));
    expect(result.current.savedDraft).toBeNull();
  });

  it('saveComposerState calls save with TTL 24', () => {
    const { result } = renderHook(() => useComposerDraft('rec-1'));

    act(() => {
      result.current.saveComposerState(draftState);
    });

    expect(mockSave).toHaveBeenCalledWith(draftState, 24);
  });

  it('clearComposerDraft calls through to clear', () => {
    const { result } = renderHook(() => useComposerDraft('rec-1'));

    act(() => {
      result.current.clearComposerDraft();
    });

    expect(mockClear).toHaveBeenCalled();
  });

  it('returns saved draft when one exists', () => {
    mockValue = draftState;
    const { result } = renderHook(() => useComposerDraft('rec-1'));

    expect(result.current.savedDraft).toEqual(draftState);
  });
});
