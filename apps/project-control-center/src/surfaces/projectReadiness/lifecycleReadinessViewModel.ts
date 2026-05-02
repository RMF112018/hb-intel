/**
 * Project Lifecycle Readiness Center view-model contract (Phase 3 / Wave 9 / Prompt 05).
 *
 * Authoritative shape returned by `buildPccLifecycleReadinessViewModel`.
 * Covers the eight Wave 9 lifecycle-readiness regions consumed by the
 * Project Readiness surface: hero, lifecycle map, family / domain cards,
 * my readiness actions, blockers and exceptions, evidence readiness,
 * future closeout exposure, and source traceability.
 *
 * Region view-models are record-backed: every rendered field maps to a
 * field on `ILifecycleReadinessReadModel` (or to a derived count over
 * record-backed source data). No invented compliance scores, estimated
 * timelines, or editorial-only product labels.
 */

import type {
  IProjectReadinessBlockerSummary,
  IProjectReadinessEvidenceSummary,
  LifecycleReadinessCriticality,
  LifecycleReadinessDomainId,
  LifecycleReadinessExceptionCode,
  LifecycleReadinessFamily,
  LifecycleReadinessGateId,
  LifecycleReadinessPhaseId,
  LifecycleReadinessStatus,
  PccPersona,
  PccReadModelSourceStatus,
  ProjectReadinessBlockerState,
  ProjectReadinessConfidenceState,
  ProjectReadinessEvidenceState,
  ProjectReadinessPosture,
  ProjectReadinessSeverity,
} from '@hbc/models/pcc';
import type { PccCardState } from '../projectHome/shared.js';

// ---------------------------------------------------------------------------
// Hero — overall posture, active gate, blocker total, library scope
// ---------------------------------------------------------------------------

export interface IPccLifecycleReadinessHeroViewModel {
  readonly headlinePosture: ProjectReadinessPosture;
  readonly activeGate: LifecycleReadinessGateId | 'none';
  readonly activeGateLabel: string;
  readonly totalProjectItems: number;
  readonly totalOpenBlockers: number;
  readonly totalPendingEvidence: number;
  readonly libraryTotal: number;
  readonly readOnlyBadgeText: string;
  readonly noExecutionCaption: string;
}

// ---------------------------------------------------------------------------
// Lifecycle Map — phase rows (10 phases vocabulary; only some present in snapshot)
// ---------------------------------------------------------------------------

export interface IPccLifecycleMapPhaseViewModel {
  readonly phaseId: LifecycleReadinessPhaseId;
  readonly phaseLabel: string;
  readonly posture: ProjectReadinessPosture;
  readonly openBlockerCount: number;
  readonly pendingEvidenceCount: number;
  readonly criticalCount: number;
  readonly isInSnapshot: boolean;
}

export interface IPccLifecycleMapViewModel {
  readonly phases: readonly IPccLifecycleMapPhaseViewModel[];
  readonly summaryCaption: string;
}

// ---------------------------------------------------------------------------
// Family / Domain Cards
// ---------------------------------------------------------------------------

export interface IPccLifecycleFamilyCardViewModel {
  readonly family: LifecycleReadinessFamily;
  readonly familyLabel: string;
  readonly libraryCount: number;
  readonly instanceCount: number;
  readonly headlinePosture: ProjectReadinessPosture;
}

export interface IPccLifecycleDomainCardViewModel {
  readonly domainId: LifecycleReadinessDomainId;
  readonly domainLabel: string;
  readonly posture: ProjectReadinessPosture;
  readonly openBlockerCount: number;
  readonly pendingEvidenceCount: number;
  readonly confidence: ProjectReadinessConfidenceState;
}

export interface IPccLifecycleFamilyDomainsViewModel {
  readonly families: readonly IPccLifecycleFamilyCardViewModel[];
  readonly domains: readonly IPccLifecycleDomainCardViewModel[];
}

// ---------------------------------------------------------------------------
// My Readiness Actions — owner-filtered active items
// ---------------------------------------------------------------------------

export interface IPccLifecycleMyActionsItemViewModel {
  readonly projectItemId: string;
  readonly templateItemId: string;
  readonly title: string;
  readonly family: LifecycleReadinessFamily;
  readonly familyLabel: string;
  readonly phaseLabel: string;
  readonly status: LifecycleReadinessStatus;
  readonly criticality: LifecycleReadinessCriticality;
  readonly ownerPersona: PccPersona;
  readonly dueDateUtc?: string;
}

export interface IPccLifecycleMyActionsViewModel {
  readonly items: readonly IPccLifecycleMyActionsItemViewModel[];
  readonly captionText: string;
  readonly inertActionLabel: string;
  readonly viewerPersona?: PccPersona;
}

// ---------------------------------------------------------------------------
// Blockers & Exceptions
// ---------------------------------------------------------------------------

export interface IPccLifecycleBlockerBucketViewModel {
  readonly blockerState: ProjectReadinessBlockerState;
  readonly itemCount: number;
  readonly severityCounts: Readonly<Record<ProjectReadinessSeverity, number>>;
}

export interface IPccLifecycleBlockerItemViewModel {
  readonly projectItemId: string;
  readonly templateItemId: string;
  readonly title: string;
  readonly family: LifecycleReadinessFamily;
  readonly familyLabel: string;
  readonly severity: ProjectReadinessSeverity;
  readonly blockerState: ProjectReadinessBlockerState;
  readonly status: LifecycleReadinessStatus;
  readonly exceptionCode?: LifecycleReadinessExceptionCode;
}

export interface IPccLifecycleBlockersViewModel {
  readonly buckets: readonly IPccLifecycleBlockerBucketViewModel[];
  readonly items: readonly IPccLifecycleBlockerItemViewModel[];
  readonly summaryCaption: string;
  readonly rawBlockerSummary: readonly IProjectReadinessBlockerSummary[];
}

// ---------------------------------------------------------------------------
// Evidence Readiness
// ---------------------------------------------------------------------------

export interface IPccLifecycleEvidenceBucketViewModel {
  readonly evidenceState: ProjectReadinessEvidenceState;
  readonly itemCount: number;
  readonly documentControlSourceCount: number;
  readonly documentControlSourceIds: readonly string[];
}

export interface IPccLifecycleEvidenceViewModel {
  readonly buckets: readonly IPccLifecycleEvidenceBucketViewModel[];
  readonly documentControlReferenceCaption: string;
  readonly rawEvidenceSummary: readonly IProjectReadinessEvidenceSummary[];
}

// ---------------------------------------------------------------------------
// Future Closeout Exposure
// ---------------------------------------------------------------------------

export interface IPccLifecycleFutureCloseoutItemViewModel {
  readonly templateItemId: string;
  readonly title: string;
  readonly family: LifecycleReadinessFamily;
  readonly phaseLabel: string;
  readonly criticality: LifecycleReadinessCriticality;
  readonly hasProjectInstance: boolean;
  readonly projectStatus?: LifecycleReadinessStatus;
}

export interface IPccLifecycleFutureCloseoutViewModel {
  readonly items: readonly IPccLifecycleFutureCloseoutItemViewModel[];
  readonly captionText: string;
}

// ---------------------------------------------------------------------------
// Source Traceability
// ---------------------------------------------------------------------------

export interface IPccLifecycleSourceDocumentViewModel {
  readonly family: LifecycleReadinessFamily;
  readonly familyLabel: string;
  readonly sourceFile: string;
  readonly libraryCount: number;
}

export interface IPccLifecycleSourceTraceabilityViewModel {
  readonly libraryTotal: number;
  readonly familyTotals: readonly {
    readonly family: LifecycleReadinessFamily;
    readonly familyLabel: string;
    readonly count: number;
  }[];
  readonly sourceDocuments: readonly IPccLifecycleSourceDocumentViewModel[];
  readonly auditCaption: string;
}

// ---------------------------------------------------------------------------
// Surface union state
// ---------------------------------------------------------------------------

export type IPccLifecycleReadinessViewModel =
  | { readonly status: 'loading' }
  | {
      readonly status: 'preview';
      readonly cardState: PccCardState;
      readonly sourceStatus: PccReadModelSourceStatus;
      readonly hero: IPccLifecycleReadinessHeroViewModel;
      readonly lifecycleMap: IPccLifecycleMapViewModel;
      readonly familyDomains: IPccLifecycleFamilyDomainsViewModel;
      readonly myActions: IPccLifecycleMyActionsViewModel;
      readonly blockers: IPccLifecycleBlockersViewModel;
      readonly evidence: IPccLifecycleEvidenceViewModel;
      readonly futureCloseout: IPccLifecycleFutureCloseoutViewModel;
      readonly sourceTraceability: IPccLifecycleSourceTraceabilityViewModel;
    }
  | { readonly status: 'error' };
