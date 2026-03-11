import { useCallback } from 'react';
import { useDraft } from '@hbc/session-state';
import type { IHandoffContextNote, IBicOwner } from '../types/IWorkflowHandoff';

export interface IComposerDraftState {
  contextNotes: IHandoffContextNote[];
  recipientOverride: IBicOwner | null;
}

const COMPOSER_DRAFT_TTL_HOURS = 24;

export function useComposerDraft(sourceRecordId: string) {
  const { value, save, clear } = useDraft<IComposerDraftState>(
    `handoff:${sourceRecordId}`,
  );

  const saveComposerState = useCallback(
    (state: IComposerDraftState) => save(state, COMPOSER_DRAFT_TTL_HOURS),
    [save],
  );

  return {
    savedDraft: value,
    saveComposerState,
    clearComposerDraft: clear,
  };
}
