/**
 * P3-J1 E5 document-vocabulary constants.
 * Enum arrays, label maps, trust state definitions, UI state matrix,
 * terminology guardrails, copy rules, and document state UI bindings.
 */

import type {
  CopyToneRule,
  DocumentBadgeVariant,
  DocumentTrustState,
  TerminologyGuardrail,
  UiKitDocumentPattern,
} from './enums.js';
import type {
  ICopyRule,
  IDocumentStateUiBinding,
  IDocumentTrustStateDef,
  ITerminologyGuardrailDef,
  IUiStateMatrixEntry,
} from './types.js';

// -- Enum Arrays ------------------------------------------------------------------

export const DOCUMENT_TRUST_STATES = [
  'GOVERNED_PROJECT_FILE',
  'RESTRICTED_ITEM',
  'PREVIEW_AVAILABLE',
  'RAW_LIBRARY_LOCATION',
  'CANONICAL_AUTHORITATIVE',
  'NOT_AUTHORITATIVE_LINKED_COPY',
] as const satisfies ReadonlyArray<DocumentTrustState>;

export const UI_KIT_DOCUMENT_PATTERNS = [
  'BADGE',
  'LIST_ROW',
  'PREVIEW_CARD',
  'EMPTY_STATE',
] as const satisfies ReadonlyArray<UiKitDocumentPattern>;

export const TERMINOLOGY_GUARDRAIL_VALUES = [
  'NO_SHAREPOINT_INTERNALS',
  'PLAIN_LANGUAGE_REQUIRED',
  'NO_TECHNICAL_URL_EXPOSURE',
  'NO_LIBRARY_ID_DISPLAY',
] as const satisfies ReadonlyArray<TerminologyGuardrail>;

export const DOCUMENT_BADGE_VARIANTS = [
  'CANONICAL',
  'AUTHORITATIVE',
  'RESTRICTED',
  'PREVIEW',
  'RAW_FALLBACK',
  'LINKED_COPY',
] as const satisfies ReadonlyArray<DocumentBadgeVariant>;

export const COPY_TONE_RULES = [
  'USER_FRIENDLY',
  'TECHNICAL_HIDDEN',
  'ACTION_ORIENTED',
] as const satisfies ReadonlyArray<CopyToneRule>;

// -- Label Maps -------------------------------------------------------------------

export const DOCUMENT_TRUST_STATE_LABELS: Readonly<Record<DocumentTrustState, string>> = {
  GOVERNED_PROJECT_FILE: 'Governed Project File',
  RESTRICTED_ITEM: 'Restricted Item',
  PREVIEW_AVAILABLE: 'Preview Available',
  RAW_LIBRARY_LOCATION: 'Raw Library Location',
  CANONICAL_AUTHORITATIVE: 'Canonical Authoritative',
  NOT_AUTHORITATIVE_LINKED_COPY: 'Not Authoritative Linked Copy',
};

export const UI_KIT_DOCUMENT_PATTERN_LABELS: Readonly<Record<UiKitDocumentPattern, string>> = {
  BADGE: 'Badge',
  LIST_ROW: 'List Row',
  PREVIEW_CARD: 'Preview Card',
  EMPTY_STATE: 'Empty State',
};

export const TERMINOLOGY_GUARDRAIL_LABELS: Readonly<Record<TerminologyGuardrail, string>> = {
  NO_SHAREPOINT_INTERNALS: 'No SharePoint Internals',
  PLAIN_LANGUAGE_REQUIRED: 'Plain Language Required',
  NO_TECHNICAL_URL_EXPOSURE: 'No Technical URL Exposure',
  NO_LIBRARY_ID_DISPLAY: 'No Library ID Display',
};

export const DOCUMENT_BADGE_VARIANT_LABELS: Readonly<Record<DocumentBadgeVariant, string>> = {
  CANONICAL: 'Canonical',
  AUTHORITATIVE: 'Authoritative',
  RESTRICTED: 'Restricted',
  PREVIEW: 'Preview',
  RAW_FALLBACK: 'Raw Fallback',
  LINKED_COPY: 'Linked Copy',
};

export const COPY_TONE_RULE_LABELS: Readonly<Record<CopyToneRule, string>> = {
  USER_FRIENDLY: 'User Friendly',
  TECHNICAL_HIDDEN: 'Technical Hidden',
  ACTION_ORIENTED: 'Action Oriented',
};

// -- Trust State Definitions ------------------------------------------------------

export const DOCUMENT_TRUST_STATE_DEFINITIONS: ReadonlyArray<IDocumentTrustStateDef> = [
  { trustState: 'GOVERNED_PROJECT_FILE', badgeVariant: 'CANONICAL', label: 'Governed Project File', description: 'File governed by project document management with full authority', isAuthoritative: true, isRestricted: false },
  { trustState: 'RESTRICTED_ITEM', badgeVariant: 'RESTRICTED', label: 'Restricted Item', description: 'Item with access restrictions preventing full visibility', isAuthoritative: false, isRestricted: true },
  { trustState: 'PREVIEW_AVAILABLE', badgeVariant: 'PREVIEW', label: 'Preview Available', description: 'Document available for preview but not yet fully governed', isAuthoritative: false, isRestricted: false },
  { trustState: 'RAW_LIBRARY_LOCATION', badgeVariant: 'RAW_FALLBACK', label: 'Raw Library Location', description: 'Document located in raw library without governance overlay', isAuthoritative: false, isRestricted: false },
  { trustState: 'CANONICAL_AUTHORITATIVE', badgeVariant: 'AUTHORITATIVE', label: 'Canonical Authoritative', description: 'Canonical document with full authoritative status', isAuthoritative: true, isRestricted: false },
  { trustState: 'NOT_AUTHORITATIVE_LINKED_COPY', badgeVariant: 'LINKED_COPY', label: 'Not Authoritative Linked Copy', description: 'Linked copy without authoritative status', isAuthoritative: false, isRestricted: false },
];

// -- UI State Matrix (6 trust states x 4 UI patterns = 24 rows) ------------------

export const UI_STATE_MATRIX: ReadonlyArray<IUiStateMatrixEntry> = [
  // GOVERNED_PROJECT_FILE
  { trustState: 'GOVERNED_PROJECT_FILE', uiPattern: 'BADGE', badgeVariant: 'CANONICAL', showPreviewAction: false, description: 'Canonical badge for governed project file' },
  { trustState: 'GOVERNED_PROJECT_FILE', uiPattern: 'LIST_ROW', badgeVariant: 'CANONICAL', showPreviewAction: true, description: 'List row with canonical badge and preview for governed file' },
  { trustState: 'GOVERNED_PROJECT_FILE', uiPattern: 'PREVIEW_CARD', badgeVariant: 'CANONICAL', showPreviewAction: true, description: 'Preview card with canonical badge for governed file' },
  { trustState: 'GOVERNED_PROJECT_FILE', uiPattern: 'EMPTY_STATE', badgeVariant: 'CANONICAL', showPreviewAction: false, description: 'Empty state placeholder for governed file context' },
  // RESTRICTED_ITEM
  { trustState: 'RESTRICTED_ITEM', uiPattern: 'BADGE', badgeVariant: 'RESTRICTED', showPreviewAction: false, description: 'Restricted badge for access-limited item' },
  { trustState: 'RESTRICTED_ITEM', uiPattern: 'LIST_ROW', badgeVariant: 'RESTRICTED', showPreviewAction: false, description: 'List row with restricted badge and no preview' },
  { trustState: 'RESTRICTED_ITEM', uiPattern: 'PREVIEW_CARD', badgeVariant: 'RESTRICTED', showPreviewAction: false, description: 'Preview card with restricted badge and no preview action' },
  { trustState: 'RESTRICTED_ITEM', uiPattern: 'EMPTY_STATE', badgeVariant: 'RESTRICTED', showPreviewAction: false, description: 'Empty state placeholder for restricted item context' },
  // PREVIEW_AVAILABLE
  { trustState: 'PREVIEW_AVAILABLE', uiPattern: 'BADGE', badgeVariant: 'PREVIEW', showPreviewAction: false, description: 'Preview badge for preview-available document' },
  { trustState: 'PREVIEW_AVAILABLE', uiPattern: 'LIST_ROW', badgeVariant: 'PREVIEW', showPreviewAction: true, description: 'List row with preview badge and preview action' },
  { trustState: 'PREVIEW_AVAILABLE', uiPattern: 'PREVIEW_CARD', badgeVariant: 'PREVIEW', showPreviewAction: true, description: 'Preview card with preview badge and preview action' },
  { trustState: 'PREVIEW_AVAILABLE', uiPattern: 'EMPTY_STATE', badgeVariant: 'PREVIEW', showPreviewAction: false, description: 'Empty state placeholder for preview-available context' },
  // RAW_LIBRARY_LOCATION
  { trustState: 'RAW_LIBRARY_LOCATION', uiPattern: 'BADGE', badgeVariant: 'RAW_FALLBACK', showPreviewAction: false, description: 'Raw fallback badge for library location' },
  { trustState: 'RAW_LIBRARY_LOCATION', uiPattern: 'LIST_ROW', badgeVariant: 'RAW_FALLBACK', showPreviewAction: true, description: 'List row with raw fallback badge and preview' },
  { trustState: 'RAW_LIBRARY_LOCATION', uiPattern: 'PREVIEW_CARD', badgeVariant: 'RAW_FALLBACK', showPreviewAction: true, description: 'Preview card with raw fallback badge and preview' },
  { trustState: 'RAW_LIBRARY_LOCATION', uiPattern: 'EMPTY_STATE', badgeVariant: 'RAW_FALLBACK', showPreviewAction: false, description: 'Empty state placeholder for raw library context' },
  // CANONICAL_AUTHORITATIVE
  { trustState: 'CANONICAL_AUTHORITATIVE', uiPattern: 'BADGE', badgeVariant: 'AUTHORITATIVE', showPreviewAction: false, description: 'Authoritative badge for canonical document' },
  { trustState: 'CANONICAL_AUTHORITATIVE', uiPattern: 'LIST_ROW', badgeVariant: 'AUTHORITATIVE', showPreviewAction: true, description: 'List row with authoritative badge and preview' },
  { trustState: 'CANONICAL_AUTHORITATIVE', uiPattern: 'PREVIEW_CARD', badgeVariant: 'AUTHORITATIVE', showPreviewAction: true, description: 'Preview card with authoritative badge and preview' },
  { trustState: 'CANONICAL_AUTHORITATIVE', uiPattern: 'EMPTY_STATE', badgeVariant: 'AUTHORITATIVE', showPreviewAction: false, description: 'Empty state placeholder for canonical authoritative context' },
  // NOT_AUTHORITATIVE_LINKED_COPY
  { trustState: 'NOT_AUTHORITATIVE_LINKED_COPY', uiPattern: 'BADGE', badgeVariant: 'LINKED_COPY', showPreviewAction: false, description: 'Linked copy badge for non-authoritative document' },
  { trustState: 'NOT_AUTHORITATIVE_LINKED_COPY', uiPattern: 'LIST_ROW', badgeVariant: 'LINKED_COPY', showPreviewAction: true, description: 'List row with linked copy badge and preview' },
  { trustState: 'NOT_AUTHORITATIVE_LINKED_COPY', uiPattern: 'PREVIEW_CARD', badgeVariant: 'LINKED_COPY', showPreviewAction: true, description: 'Preview card with linked copy badge and preview' },
  { trustState: 'NOT_AUTHORITATIVE_LINKED_COPY', uiPattern: 'EMPTY_STATE', badgeVariant: 'LINKED_COPY', showPreviewAction: false, description: 'Empty state placeholder for linked copy context' },
];

// -- Terminology Guardrails -------------------------------------------------------

export const TERMINOLOGY_GUARDRAILS: ReadonlyArray<ITerminologyGuardrailDef> = [
  { guardrail: 'NO_SHAREPOINT_INTERNALS', label: 'No SharePoint Internals', description: 'SharePoint internal terminology must not be exposed to users', violationTerms: ['sharepoint', 'spsite', 'spweb', 'splist', 'spfolder'] },
  { guardrail: 'PLAIN_LANGUAGE_REQUIRED', label: 'Plain Language Required', description: 'All user-facing text must use plain language', violationTerms: [] },
  { guardrail: 'NO_TECHNICAL_URL_EXPOSURE', label: 'No Technical URL Exposure', description: 'Technical URLs and internal paths must not be shown to users', violationTerms: ['_api/', '_layouts/', 'sites/', '/_vti_bin/'] },
  { guardrail: 'NO_LIBRARY_ID_DISPLAY', label: 'No Library ID Display', description: 'Internal library IDs must not be displayed to users', violationTerms: ['library-id', 'libraryid', 'list-id', 'listid'] },
];

// -- Copy Rules -------------------------------------------------------------------

export const COPY_RULES: ReadonlyArray<ICopyRule> = [
  { toneRule: 'USER_FRIENDLY', label: 'User Friendly', description: 'Copy must be written in plain, approachable language for end users' },
  { toneRule: 'TECHNICAL_HIDDEN', label: 'Technical Hidden', description: 'Technical details must be hidden from user-facing surfaces' },
  { toneRule: 'ACTION_ORIENTED', label: 'Action Oriented', description: 'Copy should guide users toward actionable next steps' },
];

// -- Document State UI Bindings ---------------------------------------------------

export const DOCUMENT_STATE_UI_BINDINGS: ReadonlyArray<IDocumentStateUiBinding> = [
  { authorityState: 'CANONICAL', availabilityState: 'AVAILABLE', resolvedTrustState: 'CANONICAL_AUTHORITATIVE', description: 'Canonical and available resolves to canonical authoritative' },
  { authorityState: 'AUTHORITATIVE', availabilityState: 'AVAILABLE', resolvedTrustState: 'GOVERNED_PROJECT_FILE', description: 'Authoritative and available resolves to governed project file' },
  { authorityState: 'CANONICAL', availabilityState: 'RESTRICTED', resolvedTrustState: 'RESTRICTED_ITEM', description: 'Canonical but restricted resolves to restricted item' },
  { authorityState: 'AUTHORITATIVE', availabilityState: 'RESTRICTED', resolvedTrustState: 'RESTRICTED_ITEM', description: 'Authoritative but restricted resolves to restricted item' },
  { authorityState: 'NOT_AUTHORITATIVE', availabilityState: 'AVAILABLE', resolvedTrustState: 'NOT_AUTHORITATIVE_LINKED_COPY', description: 'Not authoritative but available resolves to linked copy' },
  { authorityState: 'LINKED_COPY', availabilityState: 'AVAILABLE', resolvedTrustState: 'NOT_AUTHORITATIVE_LINKED_COPY', description: 'Linked copy and available resolves to linked copy trust state' },
  { authorityState: 'NOT_AUTHORITATIVE', availabilityState: 'RESTRICTED', resolvedTrustState: 'RESTRICTED_ITEM', description: 'Not authoritative and restricted resolves to restricted item' },
  { authorityState: 'LINKED_COPY', availabilityState: 'RESTRICTED', resolvedTrustState: 'RESTRICTED_ITEM', description: 'Linked copy and restricted resolves to restricted item' },
  { authorityState: 'UNKNOWN', availabilityState: 'AVAILABLE', resolvedTrustState: 'RAW_LIBRARY_LOCATION', description: 'Unknown authority and available resolves to raw library location' },
  { authorityState: 'CANONICAL', availabilityState: 'PREVIEW_ONLY', resolvedTrustState: 'PREVIEW_AVAILABLE', description: 'Canonical but preview-only resolves to preview available' },
  { authorityState: 'AUTHORITATIVE', availabilityState: 'PREVIEW_ONLY', resolvedTrustState: 'PREVIEW_AVAILABLE', description: 'Authoritative but preview-only resolves to preview available' },
  { authorityState: 'UNKNOWN', availabilityState: 'RESTRICTED', resolvedTrustState: 'RESTRICTED_ITEM', description: 'Unknown authority and restricted resolves to restricted item' },
];
