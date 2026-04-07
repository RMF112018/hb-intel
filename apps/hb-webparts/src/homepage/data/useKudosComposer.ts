/**
 * Kudos Composer state hook.
 *
 * Manages draft form state, validation, and submission lifecycle for
 * the People & Culture Kudos Composer flyout. Submit is wired to a
 * pluggable async callback so the data layer remains decoupled.
 */
import { useState, useCallback, useMemo } from 'react';

/* ── Types ─────────────────────────────────────────────────────── */

export type ComposerStatus = 'idle' | 'editing' | 'submitting' | 'success' | 'error';

export interface KudosComposerDraft {
  recipientNames: string;
  headline: string;
  excerpt: string;
  details: string;
}

export interface KudosComposerValidationErrors {
  recipientNames?: string;
  headline?: string;
  excerpt?: string;
}

export type SubmitFn = (draft: KudosComposerDraft) => Promise<void>;

export interface KudosComposerState {
  isOpen: boolean;
  status: ComposerStatus;
  draft: KudosComposerDraft;
  validationErrors: KudosComposerValidationErrors;
  submitError: string | undefined;
  isDirty: boolean;
}

export interface KudosComposerActions {
  open: () => void;
  close: () => void;
  reset: () => void;
  updateDraft: (patch: Partial<KudosComposerDraft>) => void;
  submit: () => Promise<void>;
}

export interface UseKudosComposerResult {
  state: KudosComposerState;
  actions: KudosComposerActions;
}

/* ── Constants ─────────────────────────────────────────────────── */

const EMPTY_DRAFT: KudosComposerDraft = {
  recipientNames: '',
  headline: '',
  excerpt: '',
  details: '',
};

const NO_ERRORS: KudosComposerValidationErrors = {};

/* ── Validation ────────────────────────────────────────────────── */

function validate(draft: KudosComposerDraft): KudosComposerValidationErrors {
  const errors: KudosComposerValidationErrors = {};

  const names = draft.recipientNames.trim();
  if (!names) {
    errors.recipientNames = 'At least one recipient is required';
  }

  if (!draft.headline.trim()) {
    errors.headline = 'A headline is required';
  } else if (draft.headline.trim().length > 120) {
    errors.headline = 'Headline must be 120 characters or fewer';
  }

  if (!draft.excerpt.trim()) {
    errors.excerpt = 'A message is required';
  }

  return errors;
}

function hasErrors(errors: KudosComposerValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

function isDraftDirty(draft: KudosComposerDraft): boolean {
  return draft.recipientNames.trim() !== ''
    || draft.headline.trim() !== ''
    || draft.excerpt.trim() !== ''
    || draft.details.trim() !== '';
}

/* ── Hook ──────────────────────────────────────────────────────── */

export function useKudosComposer(onSubmit?: SubmitFn): UseKudosComposerResult {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<ComposerStatus>('idle');
  const [draft, setDraft] = useState<KudosComposerDraft>(EMPTY_DRAFT);
  const [validationErrors, setValidationErrors] = useState<KudosComposerValidationErrors>(NO_ERRORS);
  const [submitError, setSubmitError] = useState<string | undefined>();

  const open = useCallback(() => {
    setIsOpen(true);
    setStatus('editing');
    setSubmitError(undefined);
  }, []);

  const reset = useCallback(() => {
    setDraft(EMPTY_DRAFT);
    setValidationErrors(NO_ERRORS);
    setSubmitError(undefined);
    setStatus('editing');
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setStatus('idle');
    setDraft(EMPTY_DRAFT);
    setValidationErrors(NO_ERRORS);
    setSubmitError(undefined);
  }, []);

  const updateDraft = useCallback((patch: Partial<KudosComposerDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    // Clear field-level errors for changed fields
    setValidationErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch)) {
        delete next[key as keyof KudosComposerValidationErrors];
      }
      return next;
    });
    setSubmitError(undefined);
  }, []);

  const submit = useCallback(async () => {
    const errors = validate(draft);
    setValidationErrors(errors);
    if (hasErrors(errors)) return;

    setStatus('submitting');
    setSubmitError(undefined);

    try {
      if (onSubmit) {
        await onSubmit(draft);
      }
      setStatus('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit kudos';
      setSubmitError(message);
      setStatus('error');
    }
  }, [draft, onSubmit]);

  const state = useMemo<KudosComposerState>(() => ({
    isOpen,
    status,
    draft,
    validationErrors,
    submitError,
    isDirty: isDraftDirty(draft),
  }), [isOpen, status, draft, validationErrors, submitError]);

  const actions = useMemo<KudosComposerActions>(() => ({
    open,
    close,
    reset,
    updateDraft,
    submit,
  }), [open, close, reset, updateDraft, submit]);

  return { state, actions };
}
