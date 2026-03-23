/**
 * SF23-T04 — Record submission hook.
 *
 * Orchestrates review/approval gates, submit transitions, retry state,
 * and handoff BIC creation.
 *
 * Governing: SF23-T04, L-02 (BIC ownership)
 */

import { useState, useCallback, useMemo } from 'react';
import type { IRecordFormState } from '../types/index.js';
import type { IRecordFormStorageAdapter } from '../storage/IRecordFormStorageAdapter.js';
import { transitionRecordFormStatus } from '../model/lifecycle.js';

export interface UseRecordSubmissionOptions {
  adapter: IRecordFormStorageAdapter;
  state: IRecordFormState;
}

export interface UseRecordSubmissionResult {
  canSubmit: boolean;
  isSubmitting: boolean;
  error: Error | null;
  submit: () => Promise<IRecordFormState>;
  retry: () => Promise<IRecordFormState>;
}

export function useRecordSubmission(
  options: UseRecordSubmissionOptions,
): UseRecordSubmissionResult {
  const { adapter, state } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const canSubmit = useMemo(() => {
    if (state.explanation.isBlocked) return false;
    if (state.validation.errorCount > 0) return false;
    const reviewBlocking = state.reviewSteps.some(s => s.blocking && s.status === 'pending');
    if (reviewBlocking) return false;
    return true;
  }, [state.explanation.isBlocked, state.validation.errorCount, state.reviewSteps]);

  const submit = useCallback(async (): Promise<IRecordFormState> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const submitting = transitionRecordFormStatus(state, 'submitting');
      await adapter.update(submitting.draft.draftId, submitting);

      const submitted = transitionRecordFormStatus(submitting, 'submitted');
      await adapter.update(submitted.draft.draftId, submitted);

      setIsSubmitting(false);
      return submitted;
    } catch (err) {
      const failed = transitionRecordFormStatus(state, 'failed');
      await adapter.update(failed.draft.draftId, failed).catch(() => {});
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      setIsSubmitting(false);
      return failed;
    }
  }, [adapter, state]);

  const retry = useCallback(async (): Promise<IRecordFormState> => {
    const retrying = transitionRecordFormStatus(state, 'dirty');
    await adapter.update(retrying.draft.draftId, retrying);
    return submit();
  }, [adapter, state, submit]);

  return {
    canSubmit,
    isSubmitting,
    error,
    submit,
    retry,
  };
}
