/**
 * P3-J1 E3 document-entry enumerations.
 * CTA paths, entry states, empty/no-access reasons, composition sources.
 */

// -- Document CTA Path -------------------------------------------------------

export type DocumentCtaPath =
  | 'OPEN_PROJECT_DOCUMENTS'
  | 'VIEW_BY_ZONE'
  | 'RAW_LIBRARY_FALLBACK'
  | 'RELATED_DOCUMENTS_FROM_RECORD'
  | 'PREVIEW_WHEN_SUPPORTED';

// -- Document Entry State ----------------------------------------------------

export type DocumentEntryState = 'READY' | 'EMPTY' | 'NO_ACCESS' | 'LOADING' | 'ERROR';

// -- Document Empty State Reason ---------------------------------------------

export type DocumentEmptyStateReason =
  | 'NO_DOCUMENTS_IN_ZONE'
  | 'ZONE_NOT_CONFIGURED'
  | 'PROJECT_NOT_SETUP'
  | 'NO_MATCHING_RESULTS';

// -- Document No Access Reason -----------------------------------------------

export type DocumentNoAccessReason =
  | 'PERMISSION_DENIED'
  | 'RESTRICTED_ZONE'
  | 'AUTH_REQUIRED'
  | 'EXTERNAL_USER';

// -- Document Composition Source ----------------------------------------------

export type DocumentCompositionSource = 'UI_KIT_COMPONENT' | 'SHARED_SHELL_PATTERN' | 'PLATFORM_PRIMITIVE';
