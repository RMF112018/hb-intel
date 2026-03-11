import { useCallback, useMemo } from 'react';
import { useDraft } from '@hbc/session-state';
import type { UseFormDraftReturn } from './useFormDraft.js';

const DRAFT_TTL_HOURS = 72;

export function useFormDraftPersisted(
  formId: string | undefined,
): UseFormDraftReturn {
  const draftKey = formId ? `form:${formId}` : undefined;
  const { value, save, clear } = useDraft<Record<string, unknown>>(
    draftKey ?? '__disabled__',
  );

  const draft = formId ? (value ?? undefined) : undefined;
  const hasDraft = draft !== undefined;

  const saveDraft = useCallback(
    (data: Record<string, unknown>) => {
      if (formId) save(data, DRAFT_TTL_HOURS);
    },
    [formId, save],
  );

  const saveCurrentValues = useCallback(
    (values: Record<string, unknown>) => saveDraft(values),
    [saveDraft],
  );

  const restoreDraftValues = useCallback(
    <T extends Record<string, unknown>>(fallback: T): T => {
      if (!draft) return fallback;
      return { ...fallback, ...draft };
    },
    [draft],
  );

  const restoreIntoReset = useCallback(
    (reset: (values: Record<string, unknown>) => void): boolean => {
      if (!draft) return false;
      reset(draft);
      return true;
    },
    [draft],
  );

  const clearDraft = useCallback(() => {
    if (formId) clear();
  }, [formId, clear]);

  const submitWithDraftClear = useCallback(
    <T extends Record<string, unknown>>(
      submit: (values: T) => void | Promise<void>,
    ) =>
      async (values: T): Promise<void> => {
        await submit(values);
        clearDraft();
      },
    [clearDraft],
  );

  return {
    draft,
    hasDraft,
    saveDraft,
    saveCurrentValues,
    restoreDraftValues,
    restoreIntoReset,
    clearDraft,
    submitWithDraftClear,
  };
}
