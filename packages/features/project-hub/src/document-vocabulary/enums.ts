/**
 * P3-J1 E5 document-vocabulary enumerations.
 * Source, authority, and restriction state vocabulary for document trust,
 * UI patterns, terminology guardrails, badge variants, and copy tone rules.
 */

// -- Document Trust State ---------------------------------------------------------

export type DocumentTrustState =
  | 'GOVERNED_PROJECT_FILE'
  | 'RESTRICTED_ITEM'
  | 'PREVIEW_AVAILABLE'
  | 'RAW_LIBRARY_LOCATION'
  | 'CANONICAL_AUTHORITATIVE'
  | 'NOT_AUTHORITATIVE_LINKED_COPY';

// -- UI Kit Document Pattern ------------------------------------------------------

export type UiKitDocumentPattern =
  | 'BADGE'
  | 'LIST_ROW'
  | 'PREVIEW_CARD'
  | 'EMPTY_STATE';

// -- Terminology Guardrail --------------------------------------------------------

export type TerminologyGuardrail =
  | 'NO_SHAREPOINT_INTERNALS'
  | 'PLAIN_LANGUAGE_REQUIRED'
  | 'NO_TECHNICAL_URL_EXPOSURE'
  | 'NO_LIBRARY_ID_DISPLAY';

// -- Document Badge Variant -------------------------------------------------------

export type DocumentBadgeVariant =
  | 'CANONICAL'
  | 'AUTHORITATIVE'
  | 'RESTRICTED'
  | 'PREVIEW'
  | 'RAW_FALLBACK'
  | 'LINKED_COPY';

// -- Copy Tone Rule ---------------------------------------------------------------

export type CopyToneRule =
  | 'USER_FRIENDLY'
  | 'TECHNICAL_HIDDEN'
  | 'ACTION_ORIENTED';
