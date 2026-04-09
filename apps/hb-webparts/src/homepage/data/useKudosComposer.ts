/**
 * Kudos Composer state hook.
 *
 * Manages draft form state, validation, and submission lifecycle for
 * the People & Culture Kudos Composer flyout. Submit is wired to a
 * pluggable async callback so the data layer remains decoupled.
 *
 * Wave 01 follow-on: the draft and validation-errors shapes now live in
 * `@hbc/ui-kit/homepage` (shared with `HbcKudosComposerForm` /
 * `HbcKudosComposerPreview`). They are re-exported from this module so
 * existing webpart imports continue to work without churn.
 */
import { useState, useCallback, useMemo } from 'react';
import {
  EMPTY_KUDOS_COMPOSER_RECIPIENT_BUCKETS,
  type KudosComposerDraft as SharedKudosComposerDraft,
  type KudosComposerRecipientsMode,
  type KudosComposerValidationErrors as SharedKudosComposerValidationErrors,
} from '@hbc/ui-kit/homepage';

/* ── Types ─────────────────────────────────────────────────────── */

export type ComposerStatus = 'idle' | 'editing' | 'submitting' | 'success' | 'error';

export type KudosComposerDraft = SharedKudosComposerDraft;
export type KudosComposerValidationErrors = SharedKudosComposerValidationErrors;

/** Basic RFC-5322 lite email check for the typed composer. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function buildEmptyDraft(mode: KudosComposerRecipientsMode): KudosComposerDraft {
  if (mode === 'typed') {
    return {
      recipientNames: '',
      recipients: { ...EMPTY_KUDOS_COMPOSER_RECIPIENT_BUCKETS },
      headline: '',
      excerpt: '',
      details: '',
    };
  }
  return {
    recipientNames: '',
    headline: '',
    excerpt: '',
    details: '',
  };
}

const NO_ERRORS: KudosComposerValidationErrors = {};

/* ── Validation ────────────────────────────────────────────────── */

function validate(
  draft: KudosComposerDraft,
  mode: KudosComposerRecipientsMode,
): KudosComposerValidationErrors {
  const errors: KudosComposerValidationErrors = {};

  if (mode === 'typed') {
    const buckets = draft.recipients ?? EMPTY_KUDOS_COMPOSER_RECIPIENT_BUCKETS;
    if (buckets.individualEmails.length === 0) {
      errors.recipients = 'Add at least one individual recipient email';
    } else {
      const invalid = buckets.individualEmails.find((email) => !EMAIL_RE.test(email.trim()));
      if (invalid) {
        errors.recipients = `"${invalid}" does not look like a valid email address`;
      }
    }
  } else {
    const names = draft.recipientNames.trim();
    if (!names) {
      errors.recipientNames = 'At least one recipient is required';
    }
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

function isDraftDirty(draft: KudosComposerDraft, mode: KudosComposerRecipientsMode): boolean {
  if (
    draft.headline.trim() !== '' ||
    draft.excerpt.trim() !== '' ||
    draft.details.trim() !== ''
  ) {
    return true;
  }
  if (mode === 'typed') {
    const buckets = draft.recipients ?? EMPTY_KUDOS_COMPOSER_RECIPIENT_BUCKETS;
    return (
      buckets.individualEmails.length > 0 ||
      buckets.teamLabels.length > 0 ||
      buckets.departmentLabels.length > 0 ||
      buckets.projectGroupLabels.length > 0
    );
  }
  return draft.recipientNames.trim() !== '';
}

/* ── Hook ──────────────────────────────────────────────────────── */

export interface UseKudosComposerOptions {
  /**
   * Recipient collection mode. Defaults to `'text'` for backward-compat
   * with the transitional merged People & Culture webpart. The HB Kudos
   * webpart passes `'typed'` to validate typed recipient buckets.
   */
  recipientsMode?: KudosComposerRecipientsMode;
}

export function useKudosComposer(
  onSubmit?: SubmitFn,
  options: UseKudosComposerOptions = {},
): UseKudosComposerResult {
  const recipientsMode: KudosComposerRecipientsMode = options.recipientsMode ?? 'text';
  const EMPTY_DRAFT = useMemo(() => buildEmptyDraft(recipientsMode), [recipientsMode]);
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<ComposerStatus>('idle');
  const [draft, setDraft] = useState<KudosComposerDraft>(() => buildEmptyDraft(recipientsMode));
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
    const errors = validate(draft, recipientsMode);
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
  }, [draft, onSubmit, recipientsMode]);

  const state = useMemo<KudosComposerState>(() => ({
    isOpen,
    status,
    draft,
    validationErrors,
    submitError,
    isDirty: isDraftDirty(draft, recipientsMode),
  }), [isOpen, status, draft, validationErrors, submitError, recipientsMode]);

  const actions = useMemo<KudosComposerActions>(() => ({
    open,
    close,
    reset,
    updateDraft,
    submit,
  }), [open, close, reset, updateDraft, submit]);

  return { state, actions };
}
