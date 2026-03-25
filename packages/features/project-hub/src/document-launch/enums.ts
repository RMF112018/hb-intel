/**
 * P3-J1 E1 document-launch enumerations.
 * Route types, launch contexts, deep-link resolution, lane behaviors, ownership.
 */

// -- Document Route Type ----------------------------------------------------------

export type DocumentRouteType =
  | 'PROJECT_SCOPED_LANDING'
  | 'PROJECT_ZONE_LANDING'
  | 'DIRECT_DOCUMENT_DEEP_LINK'
  | 'RAW_LIBRARY_FALLBACK'
  | 'GLOBAL_DOCUMENTS_ESCAPE';

// -- Launch Context Source --------------------------------------------------------

export type LaunchContextSource =
  | 'PROJECT_HUB_NAV'
  | 'RELATED_ITEMS_PANEL'
  | 'MODULE_RECORD_LINK'
  | 'SEARCH_RESULT'
  | 'NOTIFICATION_LINK'
  | 'DIRECT_URL';

// -- Document Deep Link Resolution ------------------------------------------------

export type DocumentDeepLinkResolution =
  | 'RESOLVED_TO_DOCUMENT'
  | 'RESOLVED_TO_ZONE'
  | 'FALLBACK_TO_LIBRARY'
  | 'NOT_FOUND'
  | 'PERMISSION_DENIED';

// -- Application Lane For Documents -----------------------------------------------

export type ApplicationLaneForDocuments = 'PWA' | 'SPFX';

// -- Document Route Ownership -----------------------------------------------------

export type DocumentRouteOwnership = 'PROJECT_HUB_OWNED' | 'SHARED_SHELL_FUTURE' | 'SPFX_COMPANION';
