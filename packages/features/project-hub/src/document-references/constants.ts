/**
 * P3-J1 E4 document-references constants.
 * Enum arrays, label maps, rendering rules, permission boundaries, required fields.
 */

import type {
  DocumentAuthorityState,
  DocumentAvailabilityState,
  DocumentReferenceType,
  DocumentRenderingContext,
  DocumentSourceType,
} from './enums.js';
import type {
  IDocumentPermissionBoundary,
  IDocumentRenderingRule,
} from './types.js';

// -- Enum Arrays ------------------------------------------------------------------

export const DOCUMENT_REFERENCE_TYPES = [
  'LINKED_PROJECT_RECORD',
  'RECORD_ATTACHMENT',
  'ZONE_ASSOCIATION',
  'RESTRICTED_PLACEHOLDER',
] as const satisfies ReadonlyArray<DocumentReferenceType>;

export const DOCUMENT_SOURCE_TYPES = [
  'SHAREPOINT_FILE',
  'PROCORE_DOCUMENT',
  'EXTERNAL_LINK',
  'UPLOADED_ATTACHMENT',
] as const satisfies ReadonlyArray<DocumentSourceType>;

export const DOCUMENT_AUTHORITY_STATES = [
  'CANONICAL',
  'AUTHORITATIVE',
  'NOT_AUTHORITATIVE',
  'LINKED_COPY',
  'UNKNOWN',
] as const satisfies ReadonlyArray<DocumentAuthorityState>;

export const DOCUMENT_AVAILABILITY_STATES = [
  'AVAILABLE',
  'RESTRICTED',
  'PREVIEW_ONLY',
  'NOT_AVAILABLE',
  'PENDING_ACCESS',
] as const satisfies ReadonlyArray<DocumentAvailabilityState>;

export const DOCUMENT_RENDERING_CONTEXTS = [
  'PROJECT_HUB_PANEL',
  'MODULE_RECORD_SIDEBAR',
  'RELATED_ITEMS_LIST',
  'SEARCH_RESULT',
] as const satisfies ReadonlyArray<DocumentRenderingContext>;

// -- Label Maps -------------------------------------------------------------------

export const DOCUMENT_REFERENCE_TYPE_LABELS: Readonly<Record<DocumentReferenceType, string>> = {
  LINKED_PROJECT_RECORD: 'Linked Project Record',
  RECORD_ATTACHMENT: 'Record Attachment',
  ZONE_ASSOCIATION: 'Zone Association',
  RESTRICTED_PLACEHOLDER: 'Restricted Placeholder',
};

export const DOCUMENT_SOURCE_TYPE_LABELS: Readonly<Record<DocumentSourceType, string>> = {
  SHAREPOINT_FILE: 'SharePoint File',
  PROCORE_DOCUMENT: 'Procore Document',
  EXTERNAL_LINK: 'External Link',
  UPLOADED_ATTACHMENT: 'Uploaded Attachment',
};

export const DOCUMENT_AUTHORITY_STATE_LABELS: Readonly<Record<DocumentAuthorityState, string>> = {
  CANONICAL: 'Canonical',
  AUTHORITATIVE: 'Authoritative',
  NOT_AUTHORITATIVE: 'Not Authoritative',
  LINKED_COPY: 'Linked Copy',
  UNKNOWN: 'Unknown',
};

export const DOCUMENT_AVAILABILITY_STATE_LABELS: Readonly<Record<DocumentAvailabilityState, string>> = {
  AVAILABLE: 'Available',
  RESTRICTED: 'Restricted',
  PREVIEW_ONLY: 'Preview Only',
  NOT_AVAILABLE: 'Not Available',
  PENDING_ACCESS: 'Pending Access',
};

export const DOCUMENT_RENDERING_CONTEXT_LABELS: Readonly<Record<DocumentRenderingContext, string>> = {
  PROJECT_HUB_PANEL: 'Project Hub Panel',
  MODULE_RECORD_SIDEBAR: 'Module Record Sidebar',
  RELATED_ITEMS_LIST: 'Related Items List',
  SEARCH_RESULT: 'Search Result',
};

// -- Rendering Rules --------------------------------------------------------------

export const DOCUMENT_RENDERING_RULES: ReadonlyArray<IDocumentRenderingRule> = [
  { ruleId: 'hub-panel-rule', renderingContext: 'PROJECT_HUB_PANEL', showAuthorityBadge: true, showAvailabilityIndicator: true, allowDirectNavigation: true, description: 'Full rendering with authority badge and availability indicator in Project Hub panel' },
  { ruleId: 'sidebar-rule', renderingContext: 'MODULE_RECORD_SIDEBAR', showAuthorityBadge: true, showAvailabilityIndicator: true, allowDirectNavigation: true, description: 'Full rendering with authority badge in module record sidebar' },
  { ruleId: 'related-items-rule', renderingContext: 'RELATED_ITEMS_LIST', showAuthorityBadge: false, showAvailabilityIndicator: true, allowDirectNavigation: true, description: 'Availability indicator without authority badge in related items list' },
  { ruleId: 'search-result-rule', renderingContext: 'SEARCH_RESULT', showAuthorityBadge: false, showAvailabilityIndicator: false, allowDirectNavigation: false, description: 'Minimal rendering without badges or direct navigation in search results' },
];

// -- Permission Boundaries --------------------------------------------------------

export const DOCUMENT_PERMISSION_BOUNDARIES: ReadonlyArray<IDocumentPermissionBoundary> = [
  { boundaryId: 'hub-panel-boundary', renderingContext: 'PROJECT_HUB_PANEL', preventsBroadPermissionLeakage: true, requiresExplicitGrant: true, description: 'Project Hub panel prevents broad permission leakage with explicit grant required' },
  { boundaryId: 'sidebar-boundary', renderingContext: 'MODULE_RECORD_SIDEBAR', preventsBroadPermissionLeakage: true, requiresExplicitGrant: true, description: 'Module record sidebar prevents broad permission leakage with explicit grant required' },
  { boundaryId: 'related-items-boundary', renderingContext: 'RELATED_ITEMS_LIST', preventsBroadPermissionLeakage: true, requiresExplicitGrant: true, description: 'Related items list prevents broad permission leakage with explicit grant required' },
  { boundaryId: 'search-result-boundary', renderingContext: 'SEARCH_RESULT', preventsBroadPermissionLeakage: true, requiresExplicitGrant: true, description: 'Search result prevents broad permission leakage with explicit grant required' },
];

// -- Required Fields --------------------------------------------------------------

export const RESTRICTED_STUB_REQUIRED_FIELDS: readonly string[] = [
  'stubId',
  'documentId',
  'referenceType',
  'availabilityState',
  'displayName',
  'restrictionReason',
];
