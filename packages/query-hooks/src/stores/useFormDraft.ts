/**
 * useFormDraft — Page-level hook for form draft persistence
 * PH4B.8 §4b.8.2 + PH4B.15 §6 (HF-007) | Blueprint §2e | D-07
 *
 * Consumer-facing draft API for forms. This hook is the intended integration
 * surface while useFormDraftStore remains an internal state primitive.
 *
 * The hook stays decoupled from @hbc/ui-kit so ui-kit never depends on
 * query-hooks (prevents circular dependency between UI primitives and data state).
 *
 * Usage pattern (at the page level):
 * ```tsx
 * function EditRiskPage({ riskId }: { riskId: string }) {
 *   const { draft, saveDraft, clearDraft, hasDraft } = useFormDraft(`risk:${riskId}`);
 *   const [formData, setFormData] = useState(() => draft ?? initialValues);
 *
 *   return (
 *     <HbcForm
 *       onSubmit={() => { mutate(formData); clearDraft(); }}
 *       onDirtyChange={(dirty) => { if (dirty) saveDraft(formData); }}
 *     >
 *       ...
 *     </HbcForm>
 *   );
 * }
 * ```
 *
 * The hook is intentionally decoupled from HbcForm to avoid
 * @hbc/ui-kit depending on @hbc/query-hooks (circular dep).
 */
import { useCallback, useMemo } from 'react';
import { useFormDraftStore } from './useFormDraftStore.js';

export interface UseFormDraftReturn {
  /** Current draft data, or undefined if no draft exists */
  draft: Record<string, unknown> | undefined;
  /** Whether a draft exists for this formId */
  hasDraft: boolean;
  /** Save current form data as a draft */
  saveDraft: (data: Record<string, unknown>) => void;
  /** RHF-aligned helper alias: save current values as a draft */
  saveCurrentValues: (values: Record<string, unknown>) => void;
  /**
   * Restore draft into a baseline value object.
   *
   * This is useful for RHF `defaultValues` composition and non-RHF forms.
   */
  restoreDraftValues: <T extends Record<string, unknown>>(fallback: T) => T;
  /**
   * RHF-aligned helper to push draft values directly into `reset`.
   *
   * Returns true when a draft was applied, false when no draft existed.
   */
  restoreIntoReset: (reset: (values: Record<string, unknown>) => void) => boolean;
  /** Clear the draft (on submit or cancel) */
  clearDraft: () => void;
  /**
   * Wrap a submit handler and clear draft on success.
   *
   * Intended for RHF `handleSubmit(submitWithDraftClear(onSubmit))`.
   */
  submitWithDraftClear: <T extends Record<string, unknown>>(
    submit: (values: T) => void | Promise<void>,
  ) => (values: T) => Promise<void>;
}

/**
 * Hook for form draft auto-save/restore.
 *
 * @param formId - Unique identifier for the form, typically `"domain:entityId"`.
 *   Pass `undefined` to disable draft persistence.
 */
export function useFormDraft(formId: string | undefined): UseFormDraftReturn {
  const setDraft = useFormDraftStore((s) => s.setDraft);
  const getDraft = useFormDraftStore((s) => s.getDraft);
  const removeDraft = useFormDraftStore((s) => s.removeDraft);

  const draft = useMemo(
    () => (formId ? getDraft(formId) : undefined),
    [formId, getDraft],
  );

  const hasDraft = draft !== undefined;

  const saveDraft = useCallback(
    (data: Record<string, unknown>) => {
      if (formId) setDraft(formId, data);
    },
    [formId, setDraft],
  );

  const saveCurrentValues = useCallback(
    (values: Record<string, unknown>) => {
      saveDraft(values);
    },
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
    if (formId) removeDraft(formId);
  }, [formId, removeDraft]);

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
