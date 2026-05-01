/**
 * PCC Project Lifecycle Readiness Center — shared model contracts.
 *
 * Phase 3 / Wave 9 / Prompt 02. Type-only contracts that consume the
 * Wave 8 Project Readiness Module Framework primitives (source lineage,
 * posture, severity, blocker state, confidence, evidence state) and add
 * lifecycle-readiness-specific vocabularies (phases, domains, item types,
 * criticality, statuses, exception codes, gates, evidence policies,
 * ownership classifications, external-reference systems, recurrence
 * cadences) plus template-vs-instance separation.
 *
 * Authority:
 *   - docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/Project_Lifecycle_Readiness_Center_Target_Architecture.md
 *   - docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/Project_Lifecycle_Readiness_Center_Item_Library_Crosswalk.md
 *   - docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/Wave_9_Implementation_Gate.md
 *   - docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/checklist-definition-files/03_Default_Item_Library.json
 *
 * No runtime behavior, no I/O. External-reference vocabularies are
 * reference-only — Wave 9 introduces no runtime clients, fetches, SDKs,
 * API calls, or writeback. PccReadModelResponseMap registration is
 * deferred to Wave 9 / Prompt 03.
 *
 * @module pcc/LifecycleReadiness
 */

import type { PccPersona } from './PccUserRoles.js';
import type {
  IProjectReadinessBlockerSummary,
  IProjectReadinessEvidenceSummary,
  IProjectReadinessSourceLineage,
  ProjectReadinessBlockerState,
  ProjectReadinessConfidenceState,
  ProjectReadinessEvidenceState,
  ProjectReadinessPosture,
  ProjectReadinessSeverity,
} from './ProjectReadinessFramework.js';

// ---------------------------------------------------------------------------
// Source families (3) — startup, safety, closeout. Tokens match the
// canonical default item library JSON/CSV `family` field.
// ---------------------------------------------------------------------------

export const LIFECYCLE_READINESS_FAMILIES = ['startup', 'safety', 'closeout'] as const;
export type LifecycleReadinessFamily = (typeof LIFECYCLE_READINESS_FAMILIES)[number];

// Canonical source library cardinality — locked by the Wave 9
// Implementation Gate (157 total, 55 startup, 32 safety, 70 closeout).

export const LIFECYCLE_READINESS_LIBRARY_TOTAL = 157 as const;

export const LIFECYCLE_READINESS_LIBRARY_FAMILY_COUNTS = {
  startup: 55,
  safety: 32,
  closeout: 70,
} as const satisfies Record<LifecycleReadinessFamily, number>;

// ---------------------------------------------------------------------------
// Lifecycle phases (10).
// ---------------------------------------------------------------------------

export const LIFECYCLE_READINESS_PHASES = [
  'contract-review',
  'startup-readiness',
  'mobilization-readiness',
  'permit-ahj-readiness',
  'safety-readiness',
  'active-construction-controls',
  'pre-co-readiness',
  'turnover-readiness',
  'post-turnover-closeout',
  'warranty-lessons-learned',
] as const;
export type LifecycleReadinessPhaseId = (typeof LIFECYCLE_READINESS_PHASES)[number];

// ---------------------------------------------------------------------------
// Readiness domains (12).
// ---------------------------------------------------------------------------

export const LIFECYCLE_READINESS_DOMAINS = [
  'contract-commercial',
  'financial-accounting',
  'systems-setup',
  'documents-records',
  'insurance-risk',
  'schedule-planning',
  'safety-qaqc',
  'field-mobilization',
  'permit-ahj',
  'owner-turnover',
  'closeout-compliance',
  'knowledge-performance',
] as const;
export type LifecycleReadinessDomainId = (typeof LIFECYCLE_READINESS_DOMAINS)[number];

// ---------------------------------------------------------------------------
// Item types (10).
// ---------------------------------------------------------------------------

export const LIFECYCLE_READINESS_ITEM_TYPES = [
  'verification',
  'evidence-required',
  'date-capture',
  'approval-checkpoint',
  'external-system-reference',
  'risk-control',
  'recurring-inspection',
  'document-tracking',
  'future-closeout-exposure',
  'reference-only',
] as const;
export type LifecycleReadinessItemTypeId = (typeof LIFECYCLE_READINESS_ITEM_TYPES)[number];

// ---------------------------------------------------------------------------
// Criticality levels (5).
// ---------------------------------------------------------------------------

export const LIFECYCLE_READINESS_CRITICALITY_LEVELS = [
  'critical',
  'high',
  'medium',
  'low',
  'informational',
] as const;
export type LifecycleReadinessCriticality =
  (typeof LIFECYCLE_READINESS_CRITICALITY_LEVELS)[number];

// ---------------------------------------------------------------------------
// Project-instance statuses (12). Distinct from Wave 8
// `PROJECT_READINESS_STATUSES` (9). Wave 9 introduces needs-evidence,
// returned, failed, and waived; uses `returned` rather than Wave 8's
// `rejected` semantics.
// ---------------------------------------------------------------------------

export const LIFECYCLE_READINESS_STATUSES = [
  'not-started',
  'in-progress',
  'blocked',
  'needs-evidence',
  'needs-review',
  'approved',
  'returned',
  'complete',
  'failed',
  'deferred',
  'not-applicable',
  'waived',
] as const;
export type LifecycleReadinessStatus = (typeof LIFECYCLE_READINESS_STATUSES)[number];

// ---------------------------------------------------------------------------
// Exception codes (10).
// ---------------------------------------------------------------------------

export const LIFECYCLE_READINESS_EXCEPTION_CODES = [
  'blocked-by-owner',
  'blocked-by-ahj',
  'blocked-by-subcontractor',
  'blocked-by-design-team',
  'awaiting-internal-approval',
  'awaiting-external-system-setup',
  'evidence-missing',
  'failed-safety-check',
  'statutory-deadline-risk',
  'ready-for-review',
] as const;
export type LifecycleReadinessExceptionCode =
  (typeof LIFECYCLE_READINESS_EXCEPTION_CODES)[number];

// ---------------------------------------------------------------------------
// Recommended gates (9).
// ---------------------------------------------------------------------------

export const LIFECYCLE_READINESS_GATES = [
  'contract-review-ready',
  'startup-ready',
  'mobilization-ready',
  'safety-ready',
  'permit-ahj-ready',
  'pre-co-ready',
  'turnover-ready',
  'financial-closeout-ready',
  'project-closeout-complete',
] as const;
export type LifecycleReadinessGateId = (typeof LIFECYCLE_READINESS_GATES)[number];

// ---------------------------------------------------------------------------
// Evidence policies (6).
// ---------------------------------------------------------------------------

export const LIFECYCLE_READINESS_EVIDENCE_POLICIES = [
  'none',
  'optional',
  'required-before-complete',
  'required-before-approval',
  'conditional',
  'external-reference-only',
] as const;
export type LifecycleReadinessEvidencePolicy =
  (typeof LIFECYCLE_READINESS_EVIDENCE_POLICIES)[number];

// ---------------------------------------------------------------------------
// Ownership classifications (4).
// ---------------------------------------------------------------------------

export const LIFECYCLE_READINESS_OWNERSHIP_CLASSIFICATIONS = [
  'owned',
  'linked',
  'external-reference',
  'deferred',
] as const;
export type LifecycleReadinessOwnershipClassification =
  (typeof LIFECYCLE_READINESS_OWNERSHIP_CLASSIFICATIONS)[number];

// ---------------------------------------------------------------------------
// External-reference systems (9). Reference-only — no runtime clients,
// fetches, SDKs, API calls, or writeback. Used to label cross-system
// pointers operators may follow manually.
// ---------------------------------------------------------------------------

export const LIFECYCLE_READINESS_EXTERNAL_REFERENCE_SYSTEMS = [
  'sharepoint',
  'procore',
  'sage',
  'outlook',
  'ahj-utility',
  'document-crunch',
  'adobe-sign',
  'manual',
  'other',
] as const;
export type LifecycleReadinessExternalReferenceSystem =
  (typeof LIFECYCLE_READINESS_EXTERNAL_REFERENCE_SYSTEMS)[number];

// ---------------------------------------------------------------------------
// Recurrence cadences (5) for safety / inspection / recurring-control
// items.
// ---------------------------------------------------------------------------

export const LIFECYCLE_READINESS_RECURRENCE_CADENCES = [
  'per-shift',
  'daily',
  'weekly',
  'monthly',
  'per-event',
] as const;
export type LifecycleReadinessRecurrenceCadence =
  (typeof LIFECYCLE_READINESS_RECURRENCE_CADENCES)[number];

// ---------------------------------------------------------------------------
// Source traceability — preserves the canonical JSON item-library shape
// so items can be cited back to the originating PDF / section / item
// number.
// ---------------------------------------------------------------------------

export interface ILifecycleReadinessSourceTrace {
  readonly family: LifecycleReadinessFamily;
  readonly sourceFile: string;
  readonly page: number;
  readonly section: string;
  readonly sourceId: string;
  readonly sourceItemId: string;
  readonly itemKey: string;
  readonly exactItemText: string;
  readonly details?: string;
  readonly responseOptions?: string;
  readonly sourceTraceabilityRequirement: string;
}

// ---------------------------------------------------------------------------
// Evidence link (reference-only). Wave 9 does not upload evidence; HB
// Document Control remains the source-of-record.
// ---------------------------------------------------------------------------

export interface ILifecycleReadinessEvidenceLink {
  readonly policy: LifecycleReadinessEvidencePolicy;
  readonly evidenceState: ProjectReadinessEvidenceState;
  readonly referenceLabel?: string;
  readonly documentControlSourceId?: string;
  readonly externalReferenceLabel?: string;
  readonly externalReferenceUrl?: string;
}

// ---------------------------------------------------------------------------
// External system reference (reference-only).
// ---------------------------------------------------------------------------

export interface ILifecycleReadinessExternalReference {
  readonly system: LifecycleReadinessExternalReferenceSystem;
  readonly referenceLabel: string;
  readonly referenceUrl?: string;
}

// ---------------------------------------------------------------------------
// Recurrence specification for recurring/safety items.
// ---------------------------------------------------------------------------

export interface ILifecycleReadinessRecurrence {
  readonly cadence: LifecycleReadinessRecurrenceCadence;
  readonly triggerEvent?: string;
}

// ---------------------------------------------------------------------------
// Template item (immutable master). Mirrors target-architecture § 12.1.
// Reuses Wave 8 source-lineage so framework consumers see a uniform
// lineage shape.
// ---------------------------------------------------------------------------

export interface ILifecycleReadinessTemplateItem {
  readonly templateItemId: string;
  readonly family: LifecycleReadinessFamily;
  readonly normalizedTitle: string;
  readonly sourceTrace: ILifecycleReadinessSourceTrace;
  readonly lifecyclePhase: LifecycleReadinessPhaseId;
  readonly readinessDomain: LifecycleReadinessDomainId;
  readonly itemType: LifecycleReadinessItemTypeId;
  readonly criticality: LifecycleReadinessCriticality;
  readonly riskTags: readonly string[];
  readonly defaultOwnerPersona: PccPersona;
  readonly defaultReviewerPersona?: PccPersona;
  readonly ownershipClassification: LifecycleReadinessOwnershipClassification;
  readonly evidencePolicy: LifecycleReadinessEvidencePolicy;
  readonly evidenceLink?: ILifecycleReadinessEvidenceLink;
  readonly recurrence?: ILifecycleReadinessRecurrence;
  readonly externalReferences: readonly ILifecycleReadinessExternalReference[];
  readonly defaultGateImpact: readonly LifecycleReadinessGateId[];
  readonly activeByDefault: boolean;
  readonly classificationNotes?: string;
  readonly sourceLineage: IProjectReadinessSourceLineage;
}

// ---------------------------------------------------------------------------
// Project instance (mutable per project). Mirrors target-architecture
// § 12.2. Reuses Wave 8 posture / severity / blocker / confidence /
// evidence-state vocabulary.
// ---------------------------------------------------------------------------

export interface ILifecycleReadinessProjectItem {
  readonly projectItemId: string;
  readonly projectId: string;
  readonly templateItemId: string;
  readonly family: LifecycleReadinessFamily;
  readonly status: LifecycleReadinessStatus;
  readonly ownerPersona: PccPersona;
  readonly reviewerPersona?: PccPersona;
  readonly dueDateUtc?: string;
  readonly completedAtUtc?: string;
  readonly completedByPersona?: PccPersona;
  readonly notApplicableReason?: string;
  readonly deferredReason?: string;
  readonly blockedReason?: string;
  readonly exceptionCode?: LifecycleReadinessExceptionCode;
  readonly evidenceLink?: ILifecycleReadinessEvidenceLink;
  readonly approvalCheckpointReference?: string;
  readonly relatedPriorityActionId?: string;
  readonly posture: ProjectReadinessPosture;
  readonly severity: ProjectReadinessSeverity;
  readonly blockerState: ProjectReadinessBlockerState;
  readonly confidence: ProjectReadinessConfidenceState;
  readonly lastUpdatedAtUtc: string;
  readonly lastActorPersona?: PccPersona;
  readonly projectOverrideNotes?: string;
}

// ---------------------------------------------------------------------------
// Roll-ups.
// ---------------------------------------------------------------------------

export interface ILifecycleReadinessGateSummary {
  readonly gateId: LifecycleReadinessGateId;
  readonly projectItemIds: readonly string[];
  readonly posture: ProjectReadinessPosture;
  readonly openBlockerCount: number;
  readonly pendingEvidenceCount: number;
  readonly criticalCount: number;
}

export interface ILifecycleReadinessDomainSummary {
  readonly domain: LifecycleReadinessDomainId;
  readonly projectItemIds: readonly string[];
  readonly posture: ProjectReadinessPosture;
  readonly openBlockerCount: number;
  readonly pendingEvidenceCount: number;
  readonly confidence: ProjectReadinessConfidenceState;
}

export interface ILifecycleReadinessPhaseSummary {
  readonly phase: LifecycleReadinessPhaseId;
  readonly projectItemIds: readonly string[];
  readonly posture: ProjectReadinessPosture;
  readonly openBlockerCount: number;
  readonly pendingEvidenceCount: number;
  readonly criticalCount: number;
}

export interface ILifecycleReadinessSourceLibraryMetadata {
  readonly total: number;
  readonly familyCounts: Readonly<Record<LifecycleReadinessFamily, number>>;
  readonly sourceDocuments: readonly {
    readonly family: LifecycleReadinessFamily;
    readonly sourceFile: string;
  }[];
}

export interface ILifecycleReadinessSummary {
  readonly totalProjectItems: number;
  readonly statusCounts: Readonly<Record<LifecycleReadinessStatus, number>>;
  readonly headlinePosture: ProjectReadinessPosture;
}

// ---------------------------------------------------------------------------
// Read-model payload. Prompt 03 will register a route in
// `PccReadModelResponseMap`; this prompt does not modify the response
// map.
// ---------------------------------------------------------------------------

export interface ILifecycleReadinessReadModel {
  readonly summary: ILifecycleReadinessSummary;
  readonly templateLibraryMetadata: ILifecycleReadinessSourceLibraryMetadata;
  readonly sampleTemplateItems: readonly ILifecycleReadinessTemplateItem[];
  readonly sampleProjectItems: readonly ILifecycleReadinessProjectItem[];
  readonly gates: readonly ILifecycleReadinessGateSummary[];
  readonly domains: readonly ILifecycleReadinessDomainSummary[];
  readonly phases: readonly ILifecycleReadinessPhaseSummary[];
  readonly evidenceSummary: readonly IProjectReadinessEvidenceSummary[];
  readonly blockerSummary: readonly IProjectReadinessBlockerSummary[];
}

export type PccLifecycleReadinessReadModel = ILifecycleReadinessReadModel;
