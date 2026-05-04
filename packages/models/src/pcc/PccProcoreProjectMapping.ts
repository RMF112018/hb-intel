/**
 * PCC HB Central Projects Registry and Procore Mapping Contract.
 *
 * Phase 3 / Wave 13 / Prompt 13B. Pure TypeScript model contracts.
 * No runtime behavior, no I/O, no clients, no providers, no external
 * system imports. The module exposes:
 *   - HB Central `Projects` registry-context types (read-only mirror of
 *     the Projects list fields, by their internal SharePoint field
 *     names);
 *   - the canonical `PccProcoreProjectMapping` discriminated union keyed
 *     on mapping state;
 *   - field-mutability classification, owner-role vocabulary, freshness
 *     band vocabulary, remediation-hint vocabulary;
 *   - deterministic pure helpers for transition checks, freshness
 *     derivation, and the legacy-procore-hint boundary;
 *   - a read-model envelope payload (`PccProcoreProjectMappingReadModel`)
 *     registered as a typed future seam in `PccReadModelResponseMap`.
 *
 * Authority:
 *   - docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-13/procore-data-layer-roadmap-update/
 *     (active execution authority for Wave 13A-13F)
 *   - docs/reference/sharepoint/list-schemas/hbcentral/lists/projects.md
 *     (HB Central Projects list canonical schema)
 *
 * Locked decisions:
 *   - PCC owns the canonical project-to-Procore mapping. HB Central
 *     `Projects` is the registry context; its `procoreProject` text
 *     field is captured as `legacyProcoreHint` and is informative only.
 *   - `legacyProcoreHint` alone never satisfies a confirmed canonical
 *     mapping. Confirmed mappings require structured
 *     `procoreCompanyId` + `procoreProjectId` plus an owner.
 *   - The read-model envelope key `'procore-project-mapping'` is a
 *     typed future seam. This module does not introduce backend routes,
 *     SPFx clients, fetch calls, mounted surfaces, or route constants.
 *
 * Guardrails:
 *   - No live Procore HTTP, no SDK adoption, no write-back, no Sage
 *     posting, no SharePoint or Graph runtime, no binary mirror, no
 *     secrets, no tenant URLs, no live UPNs.
 *   - All helpers are pure and deterministic; clocks are injected via a
 *     `Date` parameter, never read from `Date.now()`.
 *
 * @module pcc/PccProcoreProjectMapping
 */

import type { PccReadModelSourceStatus } from './PccReadModels.js';
import type { PccProjectStage } from './PccProjectEnums.js';
import type { PccProjectId, PccProjectNumber, PccSiteUrl } from './types.js';

// ---------------------------------------------------------------------------
// Mapping state vocabulary.
// ---------------------------------------------------------------------------

export const PCC_PROCORE_PROJECT_MAPPING_STATES = [
  'unmapped',
  'mapping-proposed',
  'mapping-confirmed',
  'mapping-stale',
  'mapping-conflict',
  'mapping-archived',
] as const;
export type PccProcoreProjectMappingState = (typeof PCC_PROCORE_PROJECT_MAPPING_STATES)[number];

export const PCC_PROCORE_PROJECT_MAPPING_TERMINAL_STATES = ['mapping-archived'] as const;
export type PccProcoreProjectMappingTerminalState =
  (typeof PCC_PROCORE_PROJECT_MAPPING_TERMINAL_STATES)[number];

export const PCC_PROCORE_PROJECT_MAPPING_ALLOWED_TRANSITIONS: Readonly<
  Record<PccProcoreProjectMappingState, readonly PccProcoreProjectMappingState[]>
> = {
  unmapped: ['mapping-proposed', 'mapping-archived'],
  'mapping-proposed': ['mapping-confirmed', 'mapping-conflict', 'mapping-archived', 'unmapped'],
  'mapping-confirmed': [
    'mapping-stale',
    'mapping-conflict',
    'mapping-archived',
    'mapping-confirmed',
  ],
  'mapping-stale': ['mapping-confirmed', 'mapping-conflict', 'mapping-archived'],
  'mapping-conflict': ['mapping-confirmed', 'mapping-archived', 'unmapped'],
  'mapping-archived': [],
};

// ---------------------------------------------------------------------------
// Owner role, freshness band, remediation hint vocabularies.
// ---------------------------------------------------------------------------

export const PCC_PROCORE_PROJECT_MAPPING_OWNER_ROLES = [
  'project-manager-primary',
  'project-executive-fallback',
  'integration-admin-remediation',
  'inherited-from-registry',
] as const;
export type PccProcoreProjectMappingOwnerRole =
  (typeof PCC_PROCORE_PROJECT_MAPPING_OWNER_ROLES)[number];

export const PCC_PROCORE_PROJECT_MAPPING_FRESHNESS_BANDS = [
  'fresh',
  'recent',
  'stale',
  'expired',
  'unknown',
] as const;
export type PccProcoreProjectMappingFreshnessBand =
  (typeof PCC_PROCORE_PROJECT_MAPPING_FRESHNESS_BANDS)[number];

/**
 * Remediation-hint codes are advisory labels surfaced to operators when a
 * mapping is in a degraded state. They do not authorize any runtime
 * action; downstream prompts (13D backend, 13E SPFx) decide how to display
 * them.
 */
export const PCC_PROCORE_PROJECT_MAPPING_REMEDIATION_HINTS = [
  'request-pm-confirmation',
  'request-px-fallback-confirmation',
  'request-integration-admin-review',
  'reconfirm-mapping',
  'investigate-conflicting-procore-records',
  'archive-and-restart-mapping',
] as const;
export type PccProcoreProjectMappingRemediationHint =
  (typeof PCC_PROCORE_PROJECT_MAPPING_REMEDIATION_HINTS)[number];

// ---------------------------------------------------------------------------
// Field mutability classes.
// ---------------------------------------------------------------------------

export const PCC_PROCORE_PROJECT_MAPPING_FIELD_MUTABILITY_CLASSES = [
  'pcc-editable-with-audit',
  'pcc-system-derived',
  'hbcentral-registry-readonly',
  'procore-readonly',
  'admin-only',
  'calculated-readonly',
] as const;
export type PccProcoreProjectMappingFieldMutabilityClass =
  (typeof PCC_PROCORE_PROJECT_MAPPING_FIELD_MUTABILITY_CLASSES)[number];

// ---------------------------------------------------------------------------
// HB Central Projects registry context.
//
// Registry context is a read-only mirror of the canonical HB Central
// `Projects` list fields used to identify a project. It is never
// mutated by PCC; values flow inbound from the registry only.
// ---------------------------------------------------------------------------

export const PCC_HBCENTRAL_PROJECTS_REGISTRY_FIELD_INTERNAL_NAMES = {
  pccProjectId: 'field_1',
  projectNumber: 'field_2',
  projectName: 'field_3',
  projectLocation: 'field_4',
  projectType: 'field_5',
  projectStage: 'field_6',
  siteUrl: 'field_23',
  projectManagerUpn: 'projectManagerUpn',
  projectExecutiveUpn: 'projectExecutiveUpn',
  legacyProcoreHint: 'procoreProject',
} as const;
export type PccHbCentralProjectsRegistryFieldInternalName =
  (typeof PCC_HBCENTRAL_PROJECTS_REGISTRY_FIELD_INTERNAL_NAMES)[keyof typeof PCC_HBCENTRAL_PROJECTS_REGISTRY_FIELD_INTERNAL_NAMES];
export type PccHbCentralProjectsRegistryLogicalFieldName =
  keyof typeof PCC_HBCENTRAL_PROJECTS_REGISTRY_FIELD_INTERNAL_NAMES;

export interface PccHbCentralProjectsRegistryContext {
  readonly hbCentralListItemId: string;
  readonly pccProjectId: PccProjectId;
  readonly projectNumber: PccProjectNumber;
  readonly projectName: string;
  readonly projectLocation?: string;
  readonly projectType?: string;
  readonly projectStage?: PccProjectStage;
  readonly siteUrl?: PccSiteUrl;
  readonly projectManagerUpn?: string;
  readonly projectExecutiveUpn?: string;
  /**
   * Mirror of HB Central `Projects.procoreProject` (unstructured single
   * line of text). Captured for traceability only. This value alone is
   * never sufficient to satisfy a confirmed canonical mapping.
   */
  readonly legacyProcoreHint: string | null;
}

// ---------------------------------------------------------------------------
// Indexing / query recommendations.
//
// These describe how the production HB Central Projects list should be
// indexed and queried by downstream backend mock or live providers when
// resolving a mapping. They are a documentation contract only; no
// runtime registers them.
// ---------------------------------------------------------------------------

export const PCC_PROCORE_PROJECT_MAPPING_QUERY_FILTER_SHAPES = [
  'equals',
  'starts-with',
  'ends-with',
  'in-set',
  'is-null',
  'is-not-null',
] as const;
export type PccProcoreProjectMappingQueryFilterShape =
  (typeof PCC_PROCORE_PROJECT_MAPPING_QUERY_FILTER_SHAPES)[number];

export const PCC_PROCORE_PROJECT_MAPPING_QUERY_CARDINALITY_HINTS = [
  'high',
  'medium',
  'low',
] as const;
export type PccProcoreProjectMappingQueryCardinalityHint =
  (typeof PCC_PROCORE_PROJECT_MAPPING_QUERY_CARDINALITY_HINTS)[number];

export interface PccHbCentralProjectsRegistryQueryRecommendation {
  readonly recommendationId: string;
  readonly purpose: string;
  readonly logicalFieldNames: readonly PccHbCentralProjectsRegistryLogicalFieldName[];
  readonly internalFieldNames: readonly PccHbCentralProjectsRegistryFieldInternalName[];
  readonly filterShape: PccProcoreProjectMappingQueryFilterShape;
  readonly cardinalityHint: PccProcoreProjectMappingQueryCardinalityHint;
  readonly indexRecommended: boolean;
  readonly notes?: string;
}

// ---------------------------------------------------------------------------
// Common mapping fields shared by every variant.
// ---------------------------------------------------------------------------

export interface PccProcoreProjectMappingCommonFields {
  readonly id: string;
  readonly pccProjectId: PccProjectId;
  readonly hbCentralListItemId: string;
  readonly registryContextSnapshot: PccHbCentralProjectsRegistryContext;
  /**
   * Mirrored from `registryContextSnapshot.legacyProcoreHint`. Surfaced
   * at the mapping root for query convenience. Never canonical.
   */
  readonly legacyProcoreHint: string | null;
  readonly createdAtUtc: string;
  readonly updatedAtUtc: string;
  readonly auditTrailRefs: readonly string[];
}

// ---------------------------------------------------------------------------
// State-specific mapping variants (discriminated on `state`).
// ---------------------------------------------------------------------------

export interface PccProcoreProjectMappingUnmapped extends PccProcoreProjectMappingCommonFields {
  readonly state: 'unmapped';
}

export interface PccProcoreProjectMappingProposed extends PccProcoreProjectMappingCommonFields {
  readonly state: 'mapping-proposed';
  readonly proposedProcoreCompanyId: string;
  readonly proposedProcoreProjectId: string;
  readonly proposedAtUtc: string;
  readonly proposedByOwnerRole: PccProcoreProjectMappingOwnerRole;
  readonly proposedByOwnerUpn: string;
}

export interface PccProcoreProjectMappingConfirmed extends PccProcoreProjectMappingCommonFields {
  readonly state: 'mapping-confirmed';
  readonly procoreCompanyId: string;
  readonly procoreProjectId: string;
  readonly confirmedAtUtc: string;
  readonly confirmedByOwnerRole: PccProcoreProjectMappingOwnerRole;
  readonly confirmedByOwnerUpn: string;
  readonly lastConfirmedAtUtc: string;
  readonly freshnessBand: PccProcoreProjectMappingFreshnessBand;
}

export interface PccProcoreProjectMappingStale extends PccProcoreProjectMappingCommonFields {
  readonly state: 'mapping-stale';
  readonly procoreCompanyId: string;
  readonly procoreProjectId: string;
  readonly lastConfirmedAtUtc: string;
  readonly freshnessBand: 'stale' | 'expired';
  readonly staleReason: string;
}

export interface PccProcoreProjectMappingConflict extends PccProcoreProjectMappingCommonFields {
  readonly state: 'mapping-conflict';
  readonly conflictingProcoreCompanyIds: readonly string[];
  readonly conflictingProcoreProjectIds: readonly string[];
  readonly conflictReason: string;
  readonly conflictDetectedAtUtc: string;
  readonly remediationHint: PccProcoreProjectMappingRemediationHint;
}

export interface PccProcoreProjectMappingArchived extends PccProcoreProjectMappingCommonFields {
  readonly state: 'mapping-archived';
  readonly archivedAtUtc: string;
  readonly archiveReason: string;
  readonly priorState: Exclude<PccProcoreProjectMappingState, 'mapping-archived'>;
  readonly priorProcoreCompanyId?: string;
  readonly priorProcoreProjectId?: string;
}

export type PccProcoreProjectMapping =
  | PccProcoreProjectMappingUnmapped
  | PccProcoreProjectMappingProposed
  | PccProcoreProjectMappingConfirmed
  | PccProcoreProjectMappingStale
  | PccProcoreProjectMappingConflict
  | PccProcoreProjectMappingArchived;

// ---------------------------------------------------------------------------
// Field mutability map. Exhaustive over the union of all field names
// across every variant via `satisfies`.
// ---------------------------------------------------------------------------

type DistributiveKeyof<T> = T extends unknown ? keyof T : never;

export type PccProcoreProjectMappingFieldName = DistributiveKeyof<PccProcoreProjectMapping>;

type PccProcoreProjectMappingMutabilityMap = Readonly<
  Record<PccProcoreProjectMappingFieldName, PccProcoreProjectMappingFieldMutabilityClass>
>;

export const PCC_PROCORE_PROJECT_MAPPING_FIELD_MUTABILITY = {
  // Common fields
  id: 'admin-only',
  pccProjectId: 'admin-only',
  hbCentralListItemId: 'hbcentral-registry-readonly',
  registryContextSnapshot: 'hbcentral-registry-readonly',
  legacyProcoreHint: 'hbcentral-registry-readonly',
  createdAtUtc: 'pcc-system-derived',
  updatedAtUtc: 'pcc-system-derived',
  auditTrailRefs: 'pcc-system-derived',
  state: 'pcc-editable-with-audit',
  // Proposed
  proposedProcoreCompanyId: 'pcc-editable-with-audit',
  proposedProcoreProjectId: 'pcc-editable-with-audit',
  proposedAtUtc: 'pcc-system-derived',
  proposedByOwnerRole: 'pcc-editable-with-audit',
  proposedByOwnerUpn: 'pcc-editable-with-audit',
  // Confirmed
  procoreCompanyId: 'pcc-editable-with-audit',
  procoreProjectId: 'pcc-editable-with-audit',
  confirmedAtUtc: 'pcc-system-derived',
  confirmedByOwnerRole: 'pcc-editable-with-audit',
  confirmedByOwnerUpn: 'pcc-editable-with-audit',
  lastConfirmedAtUtc: 'pcc-system-derived',
  freshnessBand: 'calculated-readonly',
  // Stale
  staleReason: 'pcc-system-derived',
  // Conflict
  conflictingProcoreCompanyIds: 'pcc-system-derived',
  conflictingProcoreProjectIds: 'pcc-system-derived',
  conflictReason: 'pcc-system-derived',
  conflictDetectedAtUtc: 'pcc-system-derived',
  remediationHint: 'pcc-system-derived',
  // Archived
  archivedAtUtc: 'pcc-system-derived',
  archiveReason: 'pcc-editable-with-audit',
  priorState: 'pcc-system-derived',
  priorProcoreCompanyId: 'pcc-system-derived',
  priorProcoreProjectId: 'pcc-system-derived',
} as const satisfies PccProcoreProjectMappingMutabilityMap;

// ---------------------------------------------------------------------------
// Module identity carried in the read-model envelope.
// ---------------------------------------------------------------------------

export interface PccProcoreProjectMappingModuleIdentity {
  readonly moduleId: 'procore-project-mapping';
  readonly displayName: 'Procore Project Mapping';
  readonly subtitle: 'HB Central Projects Registry Context';
  readonly governance: 'pcc-mapping-authority';
  readonly mvpTier: 'MVP';
}

// ---------------------------------------------------------------------------
// Source posture and read-model envelope payload.
// ---------------------------------------------------------------------------

export interface PccProcoreProjectMappingSourcePosture {
  readonly sourceStatus: PccReadModelSourceStatus;
  readonly evaluatedAtUtc?: string;
  readonly pendingHumanReviewCount: number;
}

export interface PccProcoreProjectMappingReadModel {
  readonly moduleIdentity: PccProcoreProjectMappingModuleIdentity;
  readonly mappings: readonly PccProcoreProjectMapping[];
  readonly registryContexts: readonly PccHbCentralProjectsRegistryContext[];
  readonly registryFieldInternalNames: typeof PCC_HBCENTRAL_PROJECTS_REGISTRY_FIELD_INTERNAL_NAMES;
  readonly queryRecommendations: readonly PccHbCentralProjectsRegistryQueryRecommendation[];
  /**
   * Static literal recording the ownership boundary. PCC owns the mapping;
   * `legacyProcoreHint` is informative only and never canonical.
   */
  readonly ownershipNote: 'PCC owns mapping; legacyProcoreHint is informative only and never canonical.';
  readonly sourcePosture: PccProcoreProjectMappingSourcePosture;
}

// ---------------------------------------------------------------------------
// Pure helpers. No I/O, no side effects, no clock reads.
// ---------------------------------------------------------------------------

export function isPccProcoreProjectMappingTransitionAllowed(
  from: PccProcoreProjectMappingState,
  to: PccProcoreProjectMappingState,
): boolean {
  return PCC_PROCORE_PROJECT_MAPPING_ALLOWED_TRANSITIONS[from].includes(to);
}

export interface PccProcoreProjectMappingTransitionGuardOptions {
  readonly reason?: string;
  readonly archiveReason?: string;
}

export function assertPccProcoreProjectMappingTransition(
  from: PccProcoreProjectMappingState,
  to: PccProcoreProjectMappingState,
  opts: PccProcoreProjectMappingTransitionGuardOptions = {},
): void {
  if (!isPccProcoreProjectMappingTransitionAllowed(from, to)) {
    throw new Error(`pcc procore project mapping transition not allowed: ${from} -> ${to}`);
  }
  if (to === 'mapping-archived') {
    if (!opts.archiveReason || opts.archiveReason.trim().length === 0) {
      throw new Error('mapping-archived transition requires an archiveReason');
    }
  }
  if (to === 'mapping-conflict') {
    if (!opts.reason || opts.reason.trim().length === 0) {
      throw new Error('mapping-conflict transition requires a reason');
    }
  }
}

export interface PccProcoreProjectMappingFreshnessBoundsDays {
  readonly freshUpToDays: number;
  readonly recentUpToDays: number;
  readonly staleUpToDays: number;
}

export const PCC_PROCORE_PROJECT_MAPPING_DEFAULT_FRESHNESS_BOUNDS_DAYS: PccProcoreProjectMappingFreshnessBoundsDays =
  {
    freshUpToDays: 30,
    recentUpToDays: 90,
    staleUpToDays: 180,
  };

const MILLIS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Pure freshness-band derivation. Both `nowUtc` and `lastConfirmedAtUtc`
 * are caller-supplied; this function never reads a clock. Returns
 * `'unknown'` when `lastConfirmedAtUtc` is missing, unparseable, or
 * resolves to a moment after `nowUtc`.
 */
export function derivePccProcoreMappingFreshnessBand(
  nowUtc: Date,
  lastConfirmedAtUtc: string | undefined,
  bounds: PccProcoreProjectMappingFreshnessBoundsDays = PCC_PROCORE_PROJECT_MAPPING_DEFAULT_FRESHNESS_BOUNDS_DAYS,
): PccProcoreProjectMappingFreshnessBand {
  if (!lastConfirmedAtUtc || lastConfirmedAtUtc.trim().length === 0) {
    return 'unknown';
  }
  const last = Date.parse(lastConfirmedAtUtc);
  if (Number.isNaN(last)) return 'unknown';
  const ageMs = nowUtc.getTime() - last;
  if (ageMs < 0) return 'unknown';
  const ageDays = ageMs / MILLIS_PER_DAY;
  if (ageDays <= bounds.freshUpToDays) return 'fresh';
  if (ageDays <= bounds.recentUpToDays) return 'recent';
  if (ageDays <= bounds.staleUpToDays) return 'stale';
  return 'expired';
}

/**
 * Validates that a mapping respects the legacy-procore-hint boundary:
 * a confirmed mapping requires structured `procoreCompanyId` +
 * `procoreProjectId`. The `legacyProcoreHint` value never substitutes
 * for either. The discriminated union enforces this at compile time;
 * this helper provides a runtime safety net for fixtures and untyped
 * inputs.
 */
export function validatePccProcoreProjectMappingLegacyHintBoundary(
  mapping: PccProcoreProjectMapping,
): void {
  if (mapping.state === 'mapping-confirmed') {
    if (!mapping.procoreCompanyId || mapping.procoreCompanyId.trim().length === 0) {
      throw new Error(
        'mapping-confirmed requires a structured procoreCompanyId; legacyProcoreHint alone is insufficient',
      );
    }
    if (!mapping.procoreProjectId || mapping.procoreProjectId.trim().length === 0) {
      throw new Error(
        'mapping-confirmed requires a structured procoreProjectId; legacyProcoreHint alone is insufficient',
      );
    }
  }
  if (mapping.state === 'mapping-stale') {
    if (
      !mapping.procoreCompanyId ||
      mapping.procoreCompanyId.trim().length === 0 ||
      !mapping.procoreProjectId ||
      mapping.procoreProjectId.trim().length === 0
    ) {
      throw new Error(
        'mapping-stale requires structured procore identifiers preserved from a prior confirmed mapping',
      );
    }
  }
}

// `'procore-project-mapping'` is registered as a typed future seam in
// `PccReadModelResponseMap` (see `PccReadModels.ts`). This module does
// not introduce backend routes, SPFx clients, fetch calls, mounted
// surfaces, or route constants.
