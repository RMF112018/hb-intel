/**
 * P3-J1 E1 document-launch constants.
 * Route catalog, redirect rules, lane behaviors, required fields.
 */

import type {
  ApplicationLaneForDocuments,
  DocumentDeepLinkResolution,
  DocumentRouteOwnership,
  DocumentRouteType,
  LaunchContextSource,
} from './enums.js';
import type {
  IDocumentLaneBehavior,
  IDocumentRedirectRule,
  IDocumentRouteContract,
} from './types.js';

// -- Enum Arrays ------------------------------------------------------------------

export const DOCUMENT_ROUTE_TYPES = [
  'PROJECT_SCOPED_LANDING',
  'PROJECT_ZONE_LANDING',
  'DIRECT_DOCUMENT_DEEP_LINK',
  'RAW_LIBRARY_FALLBACK',
  'GLOBAL_DOCUMENTS_ESCAPE',
] as const satisfies ReadonlyArray<DocumentRouteType>;

export const LAUNCH_CONTEXT_SOURCES = [
  'PROJECT_HUB_NAV',
  'RELATED_ITEMS_PANEL',
  'MODULE_RECORD_LINK',
  'SEARCH_RESULT',
  'NOTIFICATION_LINK',
  'DIRECT_URL',
] as const satisfies ReadonlyArray<LaunchContextSource>;

export const DOCUMENT_DEEP_LINK_RESOLUTIONS = [
  'RESOLVED_TO_DOCUMENT',
  'RESOLVED_TO_ZONE',
  'FALLBACK_TO_LIBRARY',
  'NOT_FOUND',
  'PERMISSION_DENIED',
] as const satisfies ReadonlyArray<DocumentDeepLinkResolution>;

export const APPLICATION_LANES_FOR_DOCUMENTS = [
  'PWA',
  'SPFX',
] as const satisfies ReadonlyArray<ApplicationLaneForDocuments>;

export const DOCUMENT_ROUTE_OWNERSHIPS = [
  'PROJECT_HUB_OWNED',
  'SHARED_SHELL_FUTURE',
  'SPFX_COMPANION',
] as const satisfies ReadonlyArray<DocumentRouteOwnership>;

// -- Label Maps -------------------------------------------------------------------

export const DOCUMENT_ROUTE_TYPE_LABELS: Readonly<Record<DocumentRouteType, string>> = {
  PROJECT_SCOPED_LANDING: 'Project-Scoped Landing',
  PROJECT_ZONE_LANDING: 'Project Zone Landing',
  DIRECT_DOCUMENT_DEEP_LINK: 'Direct Document Deep Link',
  RAW_LIBRARY_FALLBACK: 'Raw Library Fallback',
  GLOBAL_DOCUMENTS_ESCAPE: 'Global Documents Escape',
};

export const DOCUMENT_DEEP_LINK_RESOLUTION_LABELS: Readonly<Record<DocumentDeepLinkResolution, string>> = {
  RESOLVED_TO_DOCUMENT: 'Resolved to Document',
  RESOLVED_TO_ZONE: 'Resolved to Zone',
  FALLBACK_TO_LIBRARY: 'Fallback to Library',
  NOT_FOUND: 'Not Found',
  PERMISSION_DENIED: 'Permission Denied',
};

export const DOCUMENT_ROUTE_OWNERSHIP_LABELS: Readonly<Record<DocumentRouteOwnership, string>> = {
  PROJECT_HUB_OWNED: 'Project Hub Owned',
  SHARED_SHELL_FUTURE: 'Shared Shell (Future)',
  SPFX_COMPANION: 'SPFx Companion',
};

// -- Route Contracts --------------------------------------------------------------

export const DOCUMENT_ROUTE_CONTRACTS: ReadonlyArray<IDocumentRouteContract> = [
  { routeType: 'PROJECT_SCOPED_LANDING', routePattern: '/project-hub/{projectId}/documents', description: 'Project-scoped document landing page', requiresProjectContext: true, supportsDeepLink: false, ownership: 'PROJECT_HUB_OWNED' },
  { routeType: 'PROJECT_ZONE_LANDING', routePattern: '/project-hub/{projectId}/documents/zone/{zoneId}', description: 'Project zone-specific document landing', requiresProjectContext: true, supportsDeepLink: false, ownership: 'PROJECT_HUB_OWNED' },
  { routeType: 'DIRECT_DOCUMENT_DEEP_LINK', routePattern: '/project-hub/{projectId}/documents/doc/{documentId}', description: 'Direct deep link to specific document', requiresProjectContext: true, supportsDeepLink: true, ownership: 'PROJECT_HUB_OWNED' },
  { routeType: 'RAW_LIBRARY_FALLBACK', routePattern: '/project-hub/{projectId}/documents/library', description: 'Raw SharePoint library fallback (not primary contract)', requiresProjectContext: true, supportsDeepLink: false, ownership: 'PROJECT_HUB_OWNED' },
  { routeType: 'GLOBAL_DOCUMENTS_ESCAPE', routePattern: '/documents', description: 'Escape hatch to future Global Documents (Phase 5)', requiresProjectContext: false, supportsDeepLink: false, ownership: 'SHARED_SHELL_FUTURE' },
];

// -- Redirect Rules ---------------------------------------------------------------

export const DOCUMENT_REDIRECT_RULES: ReadonlyArray<IDocumentRedirectRule> = [
  { ruleId: 'raw-sharepoint-redirect', fromPattern: 'https://*.sharepoint.com/sites/*/Shared Documents/*', toRouteType: 'RAW_LIBRARY_FALLBACK', preservesContext: true, description: 'Raw SharePoint library URL redirects to fallback route with context preservation' },
  { ruleId: 'unknown-document-fallback', fromPattern: '/project-hub/{projectId}/documents/doc/{unknownId}', toRouteType: 'RAW_LIBRARY_FALLBACK', preservesContext: true, description: 'Unknown document ID falls back to library view' },
  { ruleId: 'no-project-context-escape', fromPattern: '/documents', toRouteType: 'GLOBAL_DOCUMENTS_ESCAPE', preservesContext: false, description: 'No project context routes to Global Documents escape hatch' },
];

// -- Lane Behaviors ---------------------------------------------------------------

export const DOCUMENT_LANE_BEHAVIORS: ReadonlyArray<IDocumentLaneBehavior> = [
  { lane: 'PWA', supportsProjectScopedLanding: true, supportsDirectDeepLink: true, fallbackBehavior: 'Show library view within PWA shell' },
  { lane: 'SPFX', supportsProjectScopedLanding: true, supportsDirectDeepLink: false, fallbackBehavior: 'Launch to PWA for deep-link resolution' },
];

// -- Required Fields --------------------------------------------------------------

export const LAUNCH_STATE_REQUIRED_FIELDS: readonly string[] = ['projectId', 'sourceRoute', 'routeType'];
