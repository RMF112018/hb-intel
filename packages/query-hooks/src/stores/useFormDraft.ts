/**
 * useFormDraft — Page-level hook for form draft persistence
 * PH4B.8 §4b.8.2 | Blueprint §2e | D-07
 *
 * Wraps useFormDraftStore to provide a simple API for auto-saving
 * and restoring form drafts keyed by a formId.
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
  /** Clear the draft (on submit or cancel) */
  clearDraft: () => void;
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

  const clearDraft = useCallback(() => {
    if (formId) removeDraft(formId);
  }, [formId, removeDraft]);

  return { draft, hasDraft, saveDraft, clearDraft };
}
