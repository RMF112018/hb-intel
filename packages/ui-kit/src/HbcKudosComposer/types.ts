/**
 * HbcKudosComposer — public types and constants.
 *
 * Consumers of `@hbc/ui-kit/homepage` import these via the
 * HbcKudosComposer barrel; their names and shapes are part of the
 * shared UI-kit contract and must not change without a coordinated
 * migration of the consuming webparts.
 */

/**
 * Typed recipient bucket draft for the kudos composer. Phase-14 kudos/
 * Prompt-02 introduced this alongside the legacy `recipientNames`
 * string field so HB Kudos can build against the typed People Culture
 * Kudos schema (four recipient fields) while the transitional merged
 * People & Culture webpart keeps its existing text-mode composer.
 *
 * Convention:
 *   - `individualEmails` holds UPN strings resolved from the shared
 *     people picker. Writers resolve these via ensureUser to
 *     `IndividualRecipientsId` on `People Culture Kudos`.
 *   - `teamLabels`, `departmentLabels`, `projectGroupLabels` hold
 *     taxonomy labels. Writers resolve these once a term-store lookup
 *     is wired. Until then, consumers may pass them through as
 *     moderator hints on the item.
 */
export interface KudosComposerRecipientBucketsDraft {
  individualEmails: string[];
  teamLabels: string[];
  departmentLabels: string[];
  projectGroupLabels: string[];
}

export const EMPTY_KUDOS_COMPOSER_RECIPIENT_BUCKETS: KudosComposerRecipientBucketsDraft = {
  individualEmails: [],
  teamLabels: [],
  departmentLabels: [],
  projectGroupLabels: [],
};

/** Bucket kind discriminator used by the typed recipient chip input. */
export type KudosComposerRecipientBucketKind =
  | 'individualEmails'
  | 'teamLabels'
  | 'departmentLabels'
  | 'projectGroupLabels';

export interface KudosComposerDraft {
  /**
   * Legacy text recipient field. Kept as an explicit fallback so the
   * transitional merged People & Culture webpart continues to work
   * unchanged. New consumers should set `recipientsMode='typed'` and
   * populate `recipients` instead.
   */
  recipientNames: string;
  /** Typed recipient buckets — final-state shape for HB Kudos. */
  recipients?: KudosComposerRecipientBucketsDraft;
  /**
   * Maps UPN → display name for preview rendering. Populated by the
   * people picker bridge so the preview card shows human-readable
   * names instead of raw email addresses.
   */
  recipientDisplayMap?: Record<string, string>;
  /**
   * Maps UPN → photo URL for preview avatar rendering. Populated by
   * the people picker bridge so the preview card can show the
   * recipient's actual directory photo instead of initials-only.
   */
  recipientPhotoMap?: Record<string, string>;
  headline: string;
  excerpt: string;
  details: string;
}

export interface KudosComposerValidationErrors {
  recipientNames?: string;
  /** Typed-mode aggregate error (any bucket problem). */
  recipients?: string;
  headline?: string;
  excerpt?: string;
}

export type KudosComposerRecipientsMode = 'text' | 'typed';

// ---------------------------------------------------------------------------
// Flyout
// ---------------------------------------------------------------------------

export interface HbcKudosComposerActionProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface HbcKudosComposerFlyoutProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Optional sub-caption under the title in the gradient header. */
  subtitle?: string;
  children: React.ReactNode;
  /**
   * Primary action (warm gradient button). Shows "Sending…" when
   * `loading` is true. Preferred over the legacy `footer` slot.
   */
  primaryAction?: HbcKudosComposerActionProps;
  /** Secondary action (ghost button, typically "Cancel" / "Send Another"). */
  secondaryAction?: HbcKudosComposerActionProps;
  /** Legacy custom footer slot — retained for backward compatibility. */
  footer?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Form / preview / success / error
// ---------------------------------------------------------------------------

import type { PeopleSearchFn, PersonPhotoFn } from '../HbcPeoplePicker/types.js';

export interface HbcKudosComposerFormProps {
  draft: KudosComposerDraft;
  onDraftChange: (patch: Partial<KudosComposerDraft>) => void;
  errors?: KudosComposerValidationErrors;
  disabled?: boolean;
  /**
   * Recipient input mode. Defaults to `'text'` for backward compat
   * with the legacy merged People & Culture composer. The HB Kudos
   * webpart passes `'typed'` to render four explicit recipient
   * buckets aligned to the People Culture Kudos schema.
   */
  recipientsMode?: KudosComposerRecipientsMode;
  /**
   * People search adapter for the People bucket. When provided, the
   * individualEmails bucket renders as a true people picker with
   * search, selection, and chips instead of freeform text entry.
   */
  searchPeople?: PeopleSearchFn;
  /**
   * Photo retrieval adapter for avatar display in the people picker.
   */
  fetchPersonPhoto?: PersonPhotoFn;
}

export interface HbcKudosComposerPreviewProps {
  draft: KudosComposerDraft;
  submitterName?: string;
}

export interface HbcKudosComposerSuccessProps {
  title?: string;
  body?: string;
}

export interface HbcKudosComposerErrorProps {
  title?: string;
  body: string;
}
