/**
 * P3-J1 E3 document-entry constants.
 * CTA catalog, entry states, empty/no-access definitions, composition contracts.
 */

import type {
  DocumentCtaPath,
  DocumentEntryState,
  DocumentEmptyStateReason,
  DocumentNoAccessReason,
  DocumentCompositionSource,
} from './enums.js';
import type {
  IDocumentCtaDefinition,
  IDocumentEntryStateConfig,
  IDocumentEmptyStateDef,
  IDocumentNoAccessDef,
  IDocumentCompositionContract,
} from './types.js';

// -- Enum Arrays --------------------------------------------------------------

export const DOCUMENT_CTA_PATHS = [
  'OPEN_PROJECT_DOCUMENTS',
  'VIEW_BY_ZONE',
  'RAW_LIBRARY_FALLBACK',
  'RELATED_DOCUMENTS_FROM_RECORD',
  'PREVIEW_WHEN_SUPPORTED',
] as const satisfies ReadonlyArray<DocumentCtaPath>;

export const DOCUMENT_ENTRY_STATES = [
  'READY',
  'EMPTY',
  'NO_ACCESS',
  'LOADING',
  'ERROR',
] as const satisfies ReadonlyArray<DocumentEntryState>;

export const DOCUMENT_EMPTY_STATE_REASONS = [
  'NO_DOCUMENTS_IN_ZONE',
  'ZONE_NOT_CONFIGURED',
  'PROJECT_NOT_SETUP',
  'NO_MATCHING_RESULTS',
] as const satisfies ReadonlyArray<DocumentEmptyStateReason>;

export const DOCUMENT_NO_ACCESS_REASONS = [
  'PERMISSION_DENIED',
  'RESTRICTED_ZONE',
  'AUTH_REQUIRED',
  'EXTERNAL_USER',
] as const satisfies ReadonlyArray<DocumentNoAccessReason>;

export const DOCUMENT_COMPOSITION_SOURCES = [
  'UI_KIT_COMPONENT',
  'SHARED_SHELL_PATTERN',
  'PLATFORM_PRIMITIVE',
] as const satisfies ReadonlyArray<DocumentCompositionSource>;

// -- Label Maps ---------------------------------------------------------------

export const DOCUMENT_CTA_PATH_LABELS: Readonly<Record<DocumentCtaPath, string>> = {
  OPEN_PROJECT_DOCUMENTS: 'Open Project Documents',
  VIEW_BY_ZONE: 'View by Zone',
  RAW_LIBRARY_FALLBACK: 'Browse Library',
  RELATED_DOCUMENTS_FROM_RECORD: 'Related Documents',
  PREVIEW_WHEN_SUPPORTED: 'Preview',
};

export const DOCUMENT_ENTRY_STATE_LABELS: Readonly<Record<DocumentEntryState, string>> = {
  READY: 'Ready',
  EMPTY: 'Empty',
  NO_ACCESS: 'No Access',
  LOADING: 'Loading',
  ERROR: 'Error',
};

export const DOCUMENT_EMPTY_STATE_REASON_LABELS: Readonly<Record<DocumentEmptyStateReason, string>> = {
  NO_DOCUMENTS_IN_ZONE: 'No Documents in Zone',
  ZONE_NOT_CONFIGURED: 'Zone Not Configured',
  PROJECT_NOT_SETUP: 'Project Not Set Up',
  NO_MATCHING_RESULTS: 'No Matching Results',
};

// -- CTA Definitions ----------------------------------------------------------

export const DOCUMENT_CTA_DEFINITIONS: ReadonlyArray<IDocumentCtaDefinition> = [
  { ctaPath: 'OPEN_PROJECT_DOCUMENTS', displayLabel: 'Open Project Documents', description: 'Navigate to project-scoped document landing', routeType: 'PROJECT_SCOPED_LANDING', requiresZoneContext: false, requiresRecordContext: false },
  { ctaPath: 'VIEW_BY_ZONE', displayLabel: 'View by Zone', description: 'Navigate to specific project document zone', routeType: 'PROJECT_ZONE_LANDING', requiresZoneContext: true, requiresRecordContext: false },
  { ctaPath: 'RAW_LIBRARY_FALLBACK', displayLabel: 'Browse Library', description: 'Fallback to raw SharePoint library structure', routeType: 'RAW_LIBRARY_FALLBACK', requiresZoneContext: false, requiresRecordContext: false },
  { ctaPath: 'RELATED_DOCUMENTS_FROM_RECORD', displayLabel: 'Related Documents', description: 'View documents related to current record context', routeType: 'DIRECT_DOCUMENT_DEEP_LINK', requiresZoneContext: false, requiresRecordContext: true },
  { ctaPath: 'PREVIEW_WHEN_SUPPORTED', displayLabel: 'Preview', description: 'Preview document when preview provider is available', routeType: 'DIRECT_DOCUMENT_DEEP_LINK', requiresZoneContext: false, requiresRecordContext: true },
];

// -- Entry State Configs ------------------------------------------------------

export const DOCUMENT_ENTRY_STATE_CONFIGS: ReadonlyArray<IDocumentEntryStateConfig> = [
  { state: 'READY', displayMessage: 'Project documents are available', showCtaPaths: true, showZoneNav: true, fallbackAction: null },
  { state: 'EMPTY', displayMessage: 'No documents found', showCtaPaths: false, showZoneNav: false, fallbackAction: 'Show empty state with suggested action' },
  { state: 'NO_ACCESS', displayMessage: 'You do not have access to this document area', showCtaPaths: false, showZoneNav: false, fallbackAction: 'Show no-access state with contact information' },
  { state: 'LOADING', displayMessage: 'Loading documents...', showCtaPaths: false, showZoneNav: false, fallbackAction: null },
  { state: 'ERROR', displayMessage: 'Unable to load documents', showCtaPaths: false, showZoneNav: false, fallbackAction: 'Show error state with retry action' },
];

// -- Empty State Definitions --------------------------------------------------

export const DOCUMENT_EMPTY_STATE_DEFINITIONS: ReadonlyArray<IDocumentEmptyStateDef> = [
  { reason: 'NO_DOCUMENTS_IN_ZONE', title: 'No Documents Yet', description: 'This zone does not contain any documents yet.', suggestedAction: 'Upload documents to get started' },
  { reason: 'ZONE_NOT_CONFIGURED', title: 'Zone Not Configured', description: 'This document zone has not been configured for this project.', suggestedAction: 'Contact your project administrator' },
  { reason: 'PROJECT_NOT_SETUP', title: 'Documents Not Set Up', description: 'Document access has not been set up for this project.', suggestedAction: 'Contact your project administrator to set up document access' },
  { reason: 'NO_MATCHING_RESULTS', title: 'No Results', description: 'No documents match your current filter or search criteria.', suggestedAction: 'Clear filters or broaden your search' },
];

// -- No Access Definitions ----------------------------------------------------

export const DOCUMENT_NO_ACCESS_DEFINITIONS: ReadonlyArray<IDocumentNoAccessDef> = [
  { reason: 'PERMISSION_DENIED', title: 'Access Denied', description: 'You do not have permission to view documents in this area.', contactAction: 'Request access from your project administrator' },
  { reason: 'RESTRICTED_ZONE', title: 'Restricted Area', description: 'This document zone is restricted to authorized personnel.', contactAction: 'Contact the document zone owner for access' },
  { reason: 'AUTH_REQUIRED', title: 'Authentication Required', description: 'You need to sign in to access this document area.', contactAction: null },
  { reason: 'EXTERNAL_USER', title: 'External Access Not Available', description: 'Document access is not available for external users in this context.', contactAction: 'Contact your internal project contact' },
];

// -- Composition Contracts ----------------------------------------------------

export const DOCUMENT_COMPOSITION_CONTRACTS: ReadonlyArray<IDocumentCompositionContract> = [
  { contractId: 'ui-kit-composition', source: 'UI_KIT_COMPONENT', componentPattern: 'All document entry UI via @hbc/ui-kit components', noFeatureLocalDuplication: true, uiKitRequired: true },
  { contractId: 'shared-shell-pattern', source: 'SHARED_SHELL_PATTERN', componentPattern: 'Entry surface uses shared-shell language and interaction model', noFeatureLocalDuplication: true, uiKitRequired: true },
  { contractId: 'platform-primitive', source: 'PLATFORM_PRIMITIVE', componentPattern: 'Platform primitives from @hbc/shell for context and navigation', noFeatureLocalDuplication: true, uiKitRequired: true },
];
