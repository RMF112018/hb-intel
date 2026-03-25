/**
 * P3-J1 E4 document-references enumerations.
 * Related-item document references, restricted stubs, rendering rules, permission boundaries.
 */

// -- Document Reference Type ------------------------------------------------------

export type DocumentReferenceType =
  | 'LINKED_PROJECT_RECORD'
  | 'RECORD_ATTACHMENT'
  | 'ZONE_ASSOCIATION'
  | 'RESTRICTED_PLACEHOLDER';

// -- Document Source Type ---------------------------------------------------------

export type DocumentSourceType =
  | 'SHAREPOINT_FILE'
  | 'PROCORE_DOCUMENT'
  | 'EXTERNAL_LINK'
  | 'UPLOADED_ATTACHMENT';

// -- Document Authority State -----------------------------------------------------

export type DocumentAuthorityState =
  | 'CANONICAL'
  | 'AUTHORITATIVE'
  | 'NOT_AUTHORITATIVE'
  | 'LINKED_COPY'
  | 'UNKNOWN';

// -- Document Availability State --------------------------------------------------

export type DocumentAvailabilityState =
  | 'AVAILABLE'
  | 'RESTRICTED'
  | 'PREVIEW_ONLY'
  | 'NOT_AVAILABLE'
  | 'PENDING_ACCESS';

// -- Document Rendering Context ---------------------------------------------------

export type DocumentRenderingContext =
  | 'PROJECT_HUB_PANEL'
  | 'MODULE_RECORD_SIDEBAR'
  | 'RELATED_ITEMS_LIST'
  | 'SEARCH_RESULT';
