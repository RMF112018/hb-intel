/**
 * P3-J1 E8 document-readiness-spikes constants.
 * Enum arrays, label maps, spike finding areas, telemetry definitions, handoff recommendations, contradiction register template.
 */

import type {
  ContradictionSeverity,
  DocumentTelemetryEvent,
  Phase5HandoffStatus,
  SpikeFindingArea,
} from './enums.js';
import type {
  IContradictionRegisterEntry,
  IPhase5HandoffRecommendation,
  ISpikeFindingMemo,
  ITelemetryEventDefinition,
} from './types.js';

// -- Enum Arrays --------------------------------------------------------------

export const SPIKE_FINDING_AREA_VALUES = [
  'REGISTRY_RESOLUTION',
  'AUTH_TOKEN_FLOW',
  'PREVIEW_FEASIBILITY',
  'HANDOFF_MECHANICS',
] as const satisfies ReadonlyArray<SpikeFindingArea>;

export const DOCUMENT_TELEMETRY_EVENT_VALUES = [
  'LAUNCH',
  'PREVIEW',
  'RAW_FALLBACK',
  'RESTRICTED_STUB_EXPOSURE',
  'NO_ACCESS_STATE',
] as const satisfies ReadonlyArray<DocumentTelemetryEvent>;

export const CONTRADICTION_SEVERITY_VALUES = [
  'BLOCKING',
  'SIGNIFICANT',
  'MINOR',
  'INFORMATIONAL',
] as const satisfies ReadonlyArray<ContradictionSeverity>;

export const PHASE_5_HANDOFF_STATUS_VALUES = [
  'RECOMMENDED',
  'CAUTION',
  'BLOCKED',
  'NOT_ASSESSED',
] as const satisfies ReadonlyArray<Phase5HandoffStatus>;

// -- Label Maps ---------------------------------------------------------------

export const SPIKE_FINDING_AREA_LABELS: Readonly<Record<SpikeFindingArea, string>> = {
  REGISTRY_RESOLUTION: 'Registry Resolution',
  AUTH_TOKEN_FLOW: 'Auth Token Flow',
  PREVIEW_FEASIBILITY: 'Preview Feasibility',
  HANDOFF_MECHANICS: 'Handoff Mechanics',
};

export const CONTRADICTION_SEVERITY_LABELS: Readonly<Record<ContradictionSeverity, string>> = {
  BLOCKING: 'Blocking',
  SIGNIFICANT: 'Significant',
  MINOR: 'Minor',
  INFORMATIONAL: 'Informational',
};

export const PHASE_5_HANDOFF_STATUS_LABELS: Readonly<Record<Phase5HandoffStatus, string>> = {
  RECOMMENDED: 'Recommended',
  CAUTION: 'Caution',
  BLOCKED: 'Blocked',
  NOT_ASSESSED: 'Not Assessed',
};

// -- Spike Finding Areas (4 rows with descriptions) ---------------------------

export const SPIKE_FINDING_AREAS: ReadonlyArray<ISpikeFindingMemo> = [
  {
    area: 'REGISTRY_RESOLUTION',
    finding: 'Document registry resolves library references to SharePoint document IDs without ambiguity',
    confidence: 'High',
    recommendation: 'Proceed with registry-based resolution as the primary lookup strategy',
    blockerIdentified: false,
  },
  {
    area: 'AUTH_TOKEN_FLOW',
    finding: 'Auth token acquisition for document access uses existing MSAL token cache with Graph scopes',
    confidence: 'High',
    recommendation: 'Leverage existing auth infrastructure — no new token flow required',
    blockerIdentified: false,
  },
  {
    area: 'PREVIEW_FEASIBILITY',
    finding: 'Preview rendering is feasible via abstract provider strategy with native-open fallback',
    confidence: 'High',
    recommendation: 'Adopt abstract preview provider with graceful fallback to native open',
    blockerIdentified: false,
  },
  {
    area: 'HANDOFF_MECHANICS',
    finding: 'Handoff from document module to SharePoint uses URL-based deep linking with context preservation',
    confidence: 'High',
    recommendation: 'Implement context-preserving deep link handoff with return-path memory',
    blockerIdentified: false,
  },
];

// -- Telemetry Event Definitions (5 rows) -------------------------------------

export const TELEMETRY_EVENT_DEFINITIONS: ReadonlyArray<ITelemetryEventDefinition> = [
  {
    event: 'LAUNCH',
    description: 'Document launch initiated by user action',
    triggerCondition: 'User clicks document open or launch action',
    dataPayload: ['documentId', 'launchSource', 'timestamp'],
  },
  {
    event: 'PREVIEW',
    description: 'Document preview rendered successfully',
    triggerCondition: 'Preview provider returns renderable content',
    dataPayload: ['documentId', 'providerStrategy', 'renderDurationMs'],
  },
  {
    event: 'RAW_FALLBACK',
    description: 'Preview unavailable — raw fallback download triggered',
    triggerCondition: 'Preview provider fails or returns unsupported format',
    dataPayload: ['documentId', 'fallbackReason', 'originalProvider'],
  },
  {
    event: 'RESTRICTED_STUB_EXPOSURE',
    description: 'Restricted document stub shown to user without content',
    triggerCondition: 'User lacks permission to view document content',
    dataPayload: ['documentId', 'restrictionType', 'userRole'],
  },
  {
    event: 'NO_ACCESS_STATE',
    description: 'No-access state displayed — user has no document permissions',
    triggerCondition: 'Authorization check returns no-access for all document actions',
    dataPayload: ['documentId', 'requestedAction', 'denialReason'],
  },
];

// -- Phase 5 Handoff Recommendations (4 rows — one per spike area) ------------

export const PHASE_5_HANDOFF_RECOMMENDATIONS: ReadonlyArray<IPhase5HandoffRecommendation> = [
  {
    area: 'REGISTRY_RESOLUTION',
    status: 'RECOMMENDED',
    recommendation: 'Registry resolution spike confirms lookup strategy is sound — proceed to Phase 5 implementation',
    prerequisitesRequired: ['Document registry schema finalized', 'SharePoint library mapping confirmed'],
    riskIfIgnored: 'Registry ambiguity could cause document mismatch in production',
  },
  {
    area: 'AUTH_TOKEN_FLOW',
    status: 'RECOMMENDED',
    recommendation: 'Auth token flow spike confirms MSAL integration is sufficient — proceed to Phase 5 implementation',
    prerequisitesRequired: ['Graph API scopes approved', 'Token cache strategy validated'],
    riskIfIgnored: 'Token acquisition failures could block document access silently',
  },
  {
    area: 'PREVIEW_FEASIBILITY',
    status: 'RECOMMENDED',
    recommendation: 'Preview feasibility spike confirms abstract provider is viable — proceed to Phase 5 implementation',
    prerequisitesRequired: ['Preview provider interface defined', 'Fallback behavior specified'],
    riskIfIgnored: 'Preview failures without fallback degrade user experience significantly',
  },
  {
    area: 'HANDOFF_MECHANICS',
    status: 'RECOMMENDED',
    recommendation: 'Handoff mechanics spike confirms deep-link strategy works — proceed to Phase 5 implementation',
    prerequisitesRequired: ['Deep link URL schema finalized', 'Return-path memory implemented'],
    riskIfIgnored: 'Context loss during handoff creates navigation confusion',
  },
];

// -- Contradiction Register Template (empty — ready for population) -----------

export const CONTRADICTION_REGISTER_TEMPLATE: ReadonlyArray<IContradictionRegisterEntry> = [];
