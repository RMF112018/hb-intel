/**
 * PCC Shared Procore Data Layer Contracts.
 *
 * Phase 3 / Wave 13 / Prompt 13C. Pure TypeScript model contracts for
 * the cross-cutting Procore data-layer foundation consumed by Wave
 * 4-13 modules and the future Wave 13D backend mock provider. No
 * runtime behavior, no I/O, no clients, no providers, no external
 * system imports. The module exposes:
 *   - Subject-area registry (18 Procore subject areas with explicit
 *     `writebackAllowed: false` MVP posture);
 *   - Source-state and sync-state vocabularies (covering
 *     mapping-missing, permission-denied, tool-disabled, stale,
 *     rate-limited, endpoint-deprecated, object-inaccessible,
 *     backend-unavailable, source-unavailable, plus `available` happy
 *     path);
 *   - Source-lineage contract;
 *   - Object-link contract with deterministic dedupe key;
 *   - Curated-summary contract;
 *   - Derived-signal contract with 11 cross-module category families
 *     (priority-action, readiness-impact, risk-exposure-signal,
 *     workflow-ball-in-court, evidence-link, document-currency-signal,
 *     financial-exposure-signal, quality-safety-exception,
 *     field-execution-gap, subcontractor-performance-signal,
 *     hbi-grounding-citation);
 *   - Sync-health entry + read-model envelope payload registered as a
 *     typed FUTURE SEAM under `PccReadModelResponseMap['procore-sync-health']`;
 *   - Five pure helpers (freshness-band wrapper, signal-actionable
 *     predicate, object-link dedupe-key builder, source-status mapper,
 *     error-message redactor).
 *
 * The freshness-band vocabulary is sourced from Wave 13B
 * (`PCC_PROCORE_PROJECT_MAPPING_FRESHNESS_BANDS`) and re-exported here
 * under the canonical shared name `PCC_PROCORE_FRESHNESS_BANDS` to
 * avoid duplicate vocabulary.
 *
 * Authority:
 *   - docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-13/procore-data-layer-roadmap-update/
 *     (active execution authority for Wave 13A-13F)
 *
 * Locked decisions:
 *   - All subject areas declare `writebackAllowed: false` and a
 *     `writePosture` of either `'blocked'` or `'not-authorized'`. PCC
 *     never writes back into Procore in MVP.
 *   - Budget and other financial subject areas are reference / exposure
 *     surfaces only and are never accounting truth. PCC does not derive
 *     accounting-correct totals from Procore data.
 *   - The `'procore-sync-health'` envelope key is a typed FUTURE SEAM.
 *     This module does not introduce backend routes, SPFx clients,
 *     fetch calls, mounted surfaces, or route constants.
 *   - Procore project mapping (Wave 13B) is the single source of truth
 *     for project-to-Procore mapping. This module does not redefine it;
 *     consumers compose 13B's `PccProcoreProjectMapping` with these
 *     subject-area surfaces.
 *
 * Guardrails:
 *   - No live Procore HTTP, no SDK adoption, no write-back, no Sage
 *     posting, no SharePoint or Graph runtime, no binary mirror, no
 *     secrets, no tenant URLs, no live UPNs.
 *   - All helpers are pure and deterministic; clocks are caller-supplied
 *     via `Date` parameters, never read from `Date.now()`.
 *
 * @module pcc/PccProcoreDataLayer
 */

import {
  PCC_PROCORE_PROJECT_MAPPING_FRESHNESS_BANDS,
  derivePccProcoreMappingFreshnessBand,
  type PccProcoreProjectMappingFreshnessBand,
  type PccProcoreProjectMappingFreshnessBoundsDays,
} from './PccProcoreProjectMapping.js';
import type { PccReadModelSourceStatus } from './PccReadModels.js';

// ---------------------------------------------------------------------------
// Subject areas (18). Every area declares a write posture and an explicit
// `writebackAllowed: false` MVP boundary.
// ---------------------------------------------------------------------------

export const PCC_PROCORE_SUBJECT_AREA_IDS = [
  'projects',
  'companies',
  'directories',
  'rfis',
  'submittals',
  'observations',
  'punch',
  'daily-logs',
  'drawings',
  'specifications',
  'photos',
  'inspections',
  'documents',
  'commitments',
  'change-events',
  'change-orders',
  'vendors',
  'budget',
] as const;
export type PccProcoreSubjectAreaId = (typeof PCC_PROCORE_SUBJECT_AREA_IDS)[number];

export const PCC_PROCORE_SUBJECT_AREA_READ_POSTURES = [
  'read-only-mvp',
  'read-only-future',
  'reference-only',
] as const;
export type PccProcoreSubjectAreaReadPosture =
  (typeof PCC_PROCORE_SUBJECT_AREA_READ_POSTURES)[number];

export const PCC_PROCORE_SUBJECT_AREA_WRITE_POSTURES = ['blocked', 'not-authorized'] as const;
export type PccProcoreSubjectAreaWritePosture =
  (typeof PCC_PROCORE_SUBJECT_AREA_WRITE_POSTURES)[number];

export const PCC_PROCORE_SUBJECT_AREA_CLASSIFICATIONS = [
  'general',
  'directory',
  'evidence',
  'inspection-record',
  'financial-reference',
] as const;
export type PccProcoreSubjectAreaClassification =
  (typeof PCC_PROCORE_SUBJECT_AREA_CLASSIFICATIONS)[number];

export interface PccProcoreSubjectArea {
  readonly id: PccProcoreSubjectAreaId;
  readonly displayName: string;
  readonly procoreEntityName: string;
  readonly readPosture: PccProcoreSubjectAreaReadPosture;
  readonly writePosture: PccProcoreSubjectAreaWritePosture;
  readonly writebackAllowed: false;
  readonly classification: PccProcoreSubjectAreaClassification;
  readonly notes?: string;
}

export type PccProcoreSubjectAreaRegistry = Readonly<
  Record<PccProcoreSubjectAreaId, PccProcoreSubjectArea>
>;

export const PCC_PROCORE_SUBJECT_AREA_REGISTRY: PccProcoreSubjectAreaRegistry = {
  projects: {
    id: 'projects',
    displayName: 'Projects',
    procoreEntityName: 'Project',
    readPosture: 'read-only-mvp',
    writePosture: 'blocked',
    writebackAllowed: false,
    classification: 'general',
    notes: 'Project mapping authority lives in Wave 13B PccProcoreProjectMapping.',
  },
  companies: {
    id: 'companies',
    displayName: 'Companies',
    procoreEntityName: 'Company',
    readPosture: 'read-only-mvp',
    writePosture: 'blocked',
    writebackAllowed: false,
    classification: 'directory',
  },
  directories: {
    id: 'directories',
    displayName: 'Directory',
    procoreEntityName: 'Directory User',
    readPosture: 'read-only-mvp',
    writePosture: 'not-authorized',
    writebackAllowed: false,
    classification: 'directory',
    notes:
      'Compared against PCC team-access for mismatch categorization. PCC never auto-grants SharePoint access from this surface.',
  },
  rfis: {
    id: 'rfis',
    displayName: 'RFIs',
    procoreEntityName: 'Request for Information',
    readPosture: 'read-only-mvp',
    writePosture: 'blocked',
    writebackAllowed: false,
    classification: 'general',
  },
  submittals: {
    id: 'submittals',
    displayName: 'Submittals',
    procoreEntityName: 'Submittal',
    readPosture: 'read-only-mvp',
    writePosture: 'blocked',
    writebackAllowed: false,
    classification: 'general',
  },
  observations: {
    id: 'observations',
    displayName: 'Observations',
    procoreEntityName: 'Observation',
    readPosture: 'read-only-mvp',
    writePosture: 'blocked',
    writebackAllowed: false,
    classification: 'general',
  },
  punch: {
    id: 'punch',
    displayName: 'Punch List',
    procoreEntityName: 'Punch Item',
    readPosture: 'read-only-mvp',
    writePosture: 'blocked',
    writebackAllowed: false,
    classification: 'general',
  },
  'daily-logs': {
    id: 'daily-logs',
    displayName: 'Daily Logs',
    procoreEntityName: 'Daily Log',
    readPosture: 'read-only-mvp',
    writePosture: 'blocked',
    writebackAllowed: false,
    classification: 'general',
  },
  drawings: {
    id: 'drawings',
    displayName: 'Drawings',
    procoreEntityName: 'Drawing',
    readPosture: 'read-only-mvp',
    writePosture: 'blocked',
    writebackAllowed: false,
    classification: 'evidence',
    notes: 'Metadata and object links only. No binary mirror, no SharePoint copy.',
  },
  specifications: {
    id: 'specifications',
    displayName: 'Specifications',
    procoreEntityName: 'Specification Section',
    readPosture: 'read-only-mvp',
    writePosture: 'blocked',
    writebackAllowed: false,
    classification: 'evidence',
    notes: 'Metadata and object links only. No binary mirror.',
  },
  photos: {
    id: 'photos',
    displayName: 'Photos',
    procoreEntityName: 'Photo',
    readPosture: 'read-only-mvp',
    writePosture: 'blocked',
    writebackAllowed: false,
    classification: 'evidence',
    notes: 'Metadata and object links only. No binary mirror.',
  },
  inspections: {
    id: 'inspections',
    displayName: 'Inspections',
    procoreEntityName: 'Inspection',
    readPosture: 'read-only-mvp',
    writePosture: 'blocked',
    writebackAllowed: false,
    classification: 'inspection-record',
    notes:
      'Procore inspection records remain Procore-owned. PCC Permit & Inspection Control Center retains ownership of permit log and required-inspection log.',
  },
  documents: {
    id: 'documents',
    displayName: 'Documents',
    procoreEntityName: 'Document',
    readPosture: 'read-only-mvp',
    writePosture: 'blocked',
    writebackAllowed: false,
    classification: 'evidence',
    notes: 'Metadata and object links only. No binary mirror.',
  },
  commitments: {
    id: 'commitments',
    displayName: 'Commitments',
    procoreEntityName: 'Commitment',
    readPosture: 'read-only-mvp',
    writePosture: 'blocked',
    writebackAllowed: false,
    classification: 'financial-reference',
    notes: 'Reference / exposure only. Not accounting truth.',
  },
  'change-events': {
    id: 'change-events',
    displayName: 'Change Events',
    procoreEntityName: 'Change Event',
    readPosture: 'read-only-mvp',
    writePosture: 'blocked',
    writebackAllowed: false,
    classification: 'financial-reference',
    notes: 'Reference / exposure only. Not accounting truth.',
  },
  'change-orders': {
    id: 'change-orders',
    displayName: 'Change Orders',
    procoreEntityName: 'Change Order',
    readPosture: 'read-only-mvp',
    writePosture: 'blocked',
    writebackAllowed: false,
    classification: 'financial-reference',
    notes: 'Reference / exposure only. Not accounting truth.',
  },
  vendors: {
    id: 'vendors',
    displayName: 'Vendors',
    procoreEntityName: 'Vendor',
    readPosture: 'read-only-mvp',
    writePosture: 'blocked',
    writebackAllowed: false,
    classification: 'directory',
  },
  budget: {
    id: 'budget',
    displayName: 'Budget',
    procoreEntityName: 'Budget Line',
    readPosture: 'read-only-mvp',
    writePosture: 'blocked',
    writebackAllowed: false,
    classification: 'financial-reference',
    notes:
      'Reference / exposure only. Budget surfaces are not accounting truth and never derive payment, posting, or financial-determination outcomes.',
  },
};

// ---------------------------------------------------------------------------
// Source-state vocabulary covering the happy path plus 9 degraded modes.
// ---------------------------------------------------------------------------

export const PCC_PROCORE_SOURCE_STATES = [
  'available',
  'mapping-missing',
  'permission-denied',
  'tool-disabled',
  'stale',
  'rate-limited',
  'endpoint-deprecated',
  'object-inaccessible',
  'backend-unavailable',
  'source-unavailable',
] as const;
export type PccProcoreSourceState = (typeof PCC_PROCORE_SOURCE_STATES)[number];

// ---------------------------------------------------------------------------
// Sync-state vocabulary.
// ---------------------------------------------------------------------------

export const PCC_PROCORE_SYNC_STATES = [
  'never-synced',
  'syncing',
  'synced-fresh',
  'synced-stale',
  'sync-degraded',
  'sync-failed',
  'sync-disabled',
] as const;
export type PccProcoreSyncState = (typeof PCC_PROCORE_SYNC_STATES)[number];

// ---------------------------------------------------------------------------
// Freshness-band vocabulary — re-exported from Wave 13B as the canonical
// shared name. Single source of truth.
// ---------------------------------------------------------------------------

export const PCC_PROCORE_FRESHNESS_BANDS = PCC_PROCORE_PROJECT_MAPPING_FRESHNESS_BANDS;
export type PccProcoreFreshnessBand = PccProcoreProjectMappingFreshnessBand;

// ---------------------------------------------------------------------------
// Source-lineage refresh triggers and contract.
// ---------------------------------------------------------------------------

export const PCC_PROCORE_SOURCE_REFRESH_TRIGGERS = [
  'manual',
  'scheduled',
  'on-mapping-confirmed',
  'on-priority-action-eval',
  'on-readiness-eval',
] as const;
export type PccProcoreSourceRefreshTrigger = (typeof PCC_PROCORE_SOURCE_REFRESH_TRIGGERS)[number];

export interface PccProcoreSourceLineage {
  readonly subjectArea: PccProcoreSubjectAreaId;
  readonly procoreCompanyId: string;
  readonly procoreObjectId: string;
  readonly procoreObjectType: string;
  readonly capturedAtUtc: string;
  readonly refreshTrigger: PccProcoreSourceRefreshTrigger;
  readonly sourceEndpointVersion?: string;
  readonly owningProvider?: string;
}

// ---------------------------------------------------------------------------
// Object link contract with deterministic dedupe key.
// ---------------------------------------------------------------------------

export interface PccProcoreObjectLink {
  readonly id: string;
  readonly subjectArea: PccProcoreSubjectAreaId;
  readonly procoreCompanyId: string;
  readonly procoreObjectId: string;
  readonly procoreObjectKey?: string;
  readonly displayLabel: string;
  readonly sourceLineage: PccProcoreSourceLineage;
  readonly dedupeKey: string;
}

export const PCC_PROCORE_FIELD_MUTABILITY_CLASSES = [
  'pcc-system-derived',
  'pcc-editable-with-audit',
  'procore-readonly',
  'admin-only',
  'calculated-readonly',
] as const;
export type PccProcoreFieldMutabilityClass = (typeof PCC_PROCORE_FIELD_MUTABILITY_CLASSES)[number];

type PccProcoreObjectLinkMutabilityMap = Readonly<
  Record<keyof PccProcoreObjectLink, PccProcoreFieldMutabilityClass>
>;

export const PCC_PROCORE_OBJECT_LINK_FIELD_MUTABILITY = {
  id: 'admin-only',
  subjectArea: 'admin-only',
  procoreCompanyId: 'procore-readonly',
  procoreObjectId: 'procore-readonly',
  procoreObjectKey: 'procore-readonly',
  displayLabel: 'pcc-system-derived',
  sourceLineage: 'admin-only',
  dedupeKey: 'calculated-readonly',
} as const satisfies PccProcoreObjectLinkMutabilityMap;

// ---------------------------------------------------------------------------
// Curated summary contract.
// ---------------------------------------------------------------------------

export interface PccProcoreCuratedSummary {
  readonly id: string;
  readonly subjectArea: PccProcoreSubjectAreaId;
  readonly objectLinkId: string;
  readonly summaryText: string;
  readonly summarizedFields: readonly string[];
  readonly sourceLineage: PccProcoreSourceLineage;
  readonly evaluatedAtUtc: string;
}

type PccProcoreCuratedSummaryMutabilityMap = Readonly<
  Record<keyof PccProcoreCuratedSummary, PccProcoreFieldMutabilityClass>
>;

export const PCC_PROCORE_CURATED_SUMMARY_FIELD_MUTABILITY = {
  id: 'admin-only',
  subjectArea: 'admin-only',
  objectLinkId: 'admin-only',
  summaryText: 'pcc-system-derived',
  summarizedFields: 'pcc-system-derived',
  sourceLineage: 'admin-only',
  evaluatedAtUtc: 'pcc-system-derived',
} as const satisfies PccProcoreCuratedSummaryMutabilityMap;

// ---------------------------------------------------------------------------
// Derived-signal contract (categories + kinds + severity).
// ---------------------------------------------------------------------------

export const PCC_PROCORE_DERIVED_SIGNAL_CATEGORIES = [
  'priority-action',
  'readiness-impact',
  'risk-exposure-signal',
  'workflow-ball-in-court',
  'evidence-link',
  'document-currency-signal',
  'financial-exposure-signal',
  'quality-safety-exception',
  'field-execution-gap',
  'subcontractor-performance-signal',
  'hbi-grounding-citation',
] as const;
export type PccProcoreDerivedSignalCategory =
  (typeof PCC_PROCORE_DERIVED_SIGNAL_CATEGORIES)[number];

export const PCC_PROCORE_DERIVED_SIGNAL_KINDS = [
  'open-rfi-overdue',
  'submittal-overdue',
  'observation-open',
  'punch-open',
  'missing-daily-log',
  'stale-drawing',
  'unmapped-project',
  'directory-mismatch',
  'commitment-amount-mismatch',
  'change-order-pending',
  'budget-variance-exposure',
  'vendor-performance-degraded',
  'photo-evidence-missing',
  'inspection-failed',
  'document-currency-stale',
  'hbi-grounding-citation',
] as const;
export type PccProcoreDerivedSignalKind = (typeof PCC_PROCORE_DERIVED_SIGNAL_KINDS)[number];

export const PCC_PROCORE_DERIVED_SIGNAL_KIND_TO_CATEGORY: Readonly<
  Record<PccProcoreDerivedSignalKind, PccProcoreDerivedSignalCategory>
> = {
  'open-rfi-overdue': 'priority-action',
  'submittal-overdue': 'priority-action',
  'observation-open': 'quality-safety-exception',
  'punch-open': 'field-execution-gap',
  'missing-daily-log': 'field-execution-gap',
  'stale-drawing': 'document-currency-signal',
  'unmapped-project': 'readiness-impact',
  'directory-mismatch': 'workflow-ball-in-court',
  'commitment-amount-mismatch': 'financial-exposure-signal',
  'change-order-pending': 'financial-exposure-signal',
  'budget-variance-exposure': 'financial-exposure-signal',
  'vendor-performance-degraded': 'subcontractor-performance-signal',
  'photo-evidence-missing': 'evidence-link',
  'inspection-failed': 'risk-exposure-signal',
  'document-currency-stale': 'document-currency-signal',
  'hbi-grounding-citation': 'hbi-grounding-citation',
};

export const PCC_PROCORE_DERIVED_SIGNAL_SEVERITIES = ['info', 'attention', 'critical'] as const;
export type PccProcoreDerivedSignalSeverity =
  (typeof PCC_PROCORE_DERIVED_SIGNAL_SEVERITIES)[number];

export interface PccProcoreDerivedSignal {
  readonly id: string;
  readonly subjectArea: PccProcoreSubjectAreaId;
  readonly signalKind: PccProcoreDerivedSignalKind;
  readonly category: PccProcoreDerivedSignalCategory;
  readonly severity: PccProcoreDerivedSignalSeverity;
  readonly summary: string;
  readonly sourceLineage: PccProcoreSourceLineage;
  readonly evaluatedAtUtc: string;
  readonly objectLinkId?: string;
  readonly hbiGroundingCitationId?: string;
}

type PccProcoreDerivedSignalMutabilityMap = Readonly<
  Record<keyof PccProcoreDerivedSignal, PccProcoreFieldMutabilityClass>
>;

export const PCC_PROCORE_DERIVED_SIGNAL_FIELD_MUTABILITY = {
  id: 'admin-only',
  subjectArea: 'admin-only',
  signalKind: 'pcc-system-derived',
  category: 'calculated-readonly',
  severity: 'pcc-system-derived',
  summary: 'pcc-system-derived',
  sourceLineage: 'admin-only',
  evaluatedAtUtc: 'pcc-system-derived',
  objectLinkId: 'pcc-system-derived',
  hbiGroundingCitationId: 'pcc-system-derived',
} as const satisfies PccProcoreDerivedSignalMutabilityMap;

// ---------------------------------------------------------------------------
// Sync-health entry and read-model envelope payload (typed FUTURE SEAM).
// ---------------------------------------------------------------------------

export interface PccProcoreSyncHealthEntry {
  readonly subjectArea: PccProcoreSubjectAreaId;
  readonly syncState: PccProcoreSyncState;
  readonly sourceState: PccProcoreSourceState;
  readonly freshnessBand: PccProcoreFreshnessBand;
  readonly lastIngestedAtUtc?: string;
  readonly openObjectCount: number;
  readonly derivedSignalCount: number;
  /**
   * Already-redacted error messages. Operators must run incoming
   * provider error strings through `redactProcoreSyncErrorMessage`
   * before storing them here. Defense-in-depth fixture safety only;
   * normal data flow does not contain secrets.
   */
  readonly errors: readonly string[];
}

type PccProcoreSyncHealthEntryMutabilityMap = Readonly<
  Record<keyof PccProcoreSyncHealthEntry, PccProcoreFieldMutabilityClass>
>;

export const PCC_PROCORE_SYNC_HEALTH_ENTRY_FIELD_MUTABILITY = {
  subjectArea: 'admin-only',
  syncState: 'pcc-system-derived',
  sourceState: 'pcc-system-derived',
  freshnessBand: 'calculated-readonly',
  lastIngestedAtUtc: 'pcc-system-derived',
  openObjectCount: 'pcc-system-derived',
  derivedSignalCount: 'pcc-system-derived',
  errors: 'pcc-system-derived',
} as const satisfies PccProcoreSyncHealthEntryMutabilityMap;

export interface PccProcoreDataLayerModuleIdentity {
  readonly moduleId: 'procore-sync-health';
  readonly displayName: 'Procore Data Layer Sync Health';
  readonly subtitle: 'Subject Areas, Object Links, Curated Summaries, and Derived Signals';
  readonly governance: 'pcc-procore-data-layer-authority';
  readonly mvpTier: 'MVP';
}

export interface PccProcoreDataLayerSourcePosture {
  readonly sourceStatus: PccReadModelSourceStatus;
  readonly evaluatedAtUtc?: string;
  readonly pendingHumanReviewCount: number;
}

export interface PccProcoreSyncHealthReadModel {
  readonly moduleIdentity: PccProcoreDataLayerModuleIdentity;
  readonly subjectAreas: readonly PccProcoreSubjectArea[];
  readonly syncHealthEntries: readonly PccProcoreSyncHealthEntry[];
  readonly sourceLineages: readonly PccProcoreSourceLineage[];
  readonly objectLinks: readonly PccProcoreObjectLink[];
  readonly curatedSummaries: readonly PccProcoreCuratedSummary[];
  readonly derivedSignals: readonly PccProcoreDerivedSignal[];
  readonly ownershipNote: 'PCC owns mapping and curation; Procore remains canonical for Procore-native records. No write-back. Budget and other financial subject areas are reference-only and not accounting truth.';
  readonly sourcePosture: PccProcoreDataLayerSourcePosture;
}

// ---------------------------------------------------------------------------
// Pure helpers.
// ---------------------------------------------------------------------------

/**
 * Generic Procore freshness-band derivation. Thin wrapper that delegates
 * to Wave 13B's `derivePccProcoreMappingFreshnessBand` so the band
 * vocabulary, default bounds, and unknown-input semantics stay in lock
 * step. Both `nowUtc` and `lastIngestedAtUtc` are caller-supplied; this
 * helper never reads a clock.
 */
export function deriveProcoreFreshnessBand(
  nowUtc: Date,
  lastIngestedAtUtc: string | undefined,
  bounds?: PccProcoreProjectMappingFreshnessBoundsDays,
): PccProcoreFreshnessBand {
  return derivePccProcoreMappingFreshnessBand(nowUtc, lastIngestedAtUtc, bounds);
}

/**
 * A derived signal is actionable when its severity is `'attention'` or
 * `'critical'` AND its source lineage carries non-empty Procore
 * identifiers. Severity `'info'` signals are informational only.
 */
export function isProcoreSignalActionable(signal: PccProcoreDerivedSignal): boolean {
  if (signal.severity !== 'attention' && signal.severity !== 'critical') {
    return false;
  }
  if (
    !signal.sourceLineage.procoreCompanyId ||
    signal.sourceLineage.procoreCompanyId.trim().length === 0
  ) {
    return false;
  }
  if (
    !signal.sourceLineage.procoreObjectId ||
    signal.sourceLineage.procoreObjectId.trim().length === 0
  ) {
    return false;
  }
  return true;
}

/**
 * Deterministic dedupe key for a Procore object link. Same inputs always
 * produce the same key. Different inputs produce different keys. The
 * optional `procoreObjectKey` is included only when present, so links
 * with and without an object key never collide.
 */
export function buildProcoreObjectLinkDedupeKey(
  subjectArea: PccProcoreSubjectAreaId,
  procoreCompanyId: string,
  procoreObjectId: string,
  procoreObjectKey?: string,
): string {
  const base = `${subjectArea}:${procoreCompanyId}:${procoreObjectId}`;
  if (procoreObjectKey && procoreObjectKey.length > 0) {
    return `${base}:${procoreObjectKey}`;
  }
  return base;
}

/**
 * Maps a Procore-side source state to the existing PCC read-model
 * source-status vocabulary. Total over `PccProcoreSourceState`.
 */
export function mapProcoreSourceStatusToPccPreviewState(
  procoreSourceState: PccProcoreSourceState,
): PccReadModelSourceStatus {
  switch (procoreSourceState) {
    case 'available':
      return 'available';
    case 'mapping-missing':
      return 'missing-config';
    case 'permission-denied':
      return 'forbidden';
    case 'tool-disabled':
      return 'source-unavailable';
    case 'stale':
      return 'stale';
    case 'rate-limited':
      return 'source-unavailable';
    case 'endpoint-deprecated':
      return 'source-unavailable';
    case 'object-inaccessible':
      return 'forbidden';
    case 'backend-unavailable':
      return 'backend-unavailable';
    case 'source-unavailable':
      return 'source-unavailable';
  }
}

/**
 * Defense-in-depth display / fixture-safety helper. Strips URLs, UPNs,
 * and bearer-style or key-style fragments from a free-text error
 * message before the message is stored or rendered in PCC surfaces.
 *
 * Normal Procore data flow does not contain secrets, UPNs, or live
 * URLs — provider error strings should already be sanitized at the
 * ingestion boundary. This helper exists to backstop fixture safety
 * and accidental display of unsanitized provider strings; it is
 * deliberately conservative and never asserts that secrets are normal
 * data.
 */
export function redactProcoreSyncErrorMessage(message: string): string {
  if (typeof message !== 'string' || message.length === 0) {
    return '';
  }
  return message
    .replace(/https?:\/\/[^\s'"`<>]+/gi, '[redacted-url]')
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[redacted-upn]')
    .replace(/\b[Bb]earer\s+[A-Za-z0-9._\-+/=]+/g, 'Bearer [redacted-token]')
    .replace(
      /\b(api[_-]?key|access[_-]?token|refresh[_-]?token|secret|password)\s*[:=]\s*[^\s'"`<>]+/gi,
      (_match: string, label: string) => `${label}=[redacted-secret]`,
    );
}

// `'procore-sync-health'` is registered as a typed FUTURE SEAM in
// `PccReadModelResponseMap` (see `PccReadModels.ts`). This module does
// not introduce backend routes, SPFx clients, fetch calls, mounted
// surfaces, or route constants.
