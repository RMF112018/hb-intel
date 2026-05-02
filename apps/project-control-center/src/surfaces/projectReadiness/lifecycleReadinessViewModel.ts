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
  LifecycleReadinessEvidencePolicy,
  LifecycleReadinessExceptionCode,
  LifecycleReadinessExternalReferenceSystem,
  LifecycleReadinessFamily,
  LifecycleReadinessGateId,
  LifecycleReadinessItemTypeId,
  LifecycleReadinessOwnershipClassification,
  LifecycleReadinessPhaseId,
  LifecycleReadinessRecurrenceCadence,
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
  readonly cardState: PccCardState;
  readonly families: readonly IPccLifecycleFamilyCardViewModel[];
  readonly domains: readonly IPccLifecycleDomainCardViewModel[];
}

// ---------------------------------------------------------------------------
// Readiness signals — display-only posture markers derived purely from
// existing record-backed fields (status, posture, blockerState, severity,
// dueDateUtc, evidenceLink, evidencePolicy, exceptionCode, family,
// approvalCheckpointReference, relatedPriorityActionId, defaultGateImpact,
// externalReferences). The 7 kinds prepare future Priority Actions and
// Approvals/Checkpoints integration without authorizing any execution.
// ---------------------------------------------------------------------------

export type PccLifecycleReadinessSignalKind =
  | 'blocked'
  | 'overdue'
  | 'missing-evidence'
  | 'failed-safety'
  | 'gate-blocking'
  | 'awaiting-approval'
  | 'external-reference-issue';

export interface IPccLifecycleSignalBucketViewModel {
  readonly kind: PccLifecycleReadinessSignalKind;
  readonly label: string;
  readonly itemCount: number;
  readonly itemIds: readonly string[];
}

export interface IPccLifecycleApprovalPostureViewModel {
  readonly projectItemId: string;
  readonly templateItemId: string;
  readonly title: string;
  readonly approvalCheckpointReference: string;
  readonly status: LifecycleReadinessStatus;
  readonly family: LifecycleReadinessFamily;
}

export interface IPccLifecyclePriorityActionPromotionViewModel {
  readonly projectItemId: string;
  readonly templateItemId: string;
  readonly relatedPriorityActionId: string;
  readonly title: string;
  readonly family: LifecycleReadinessFamily;
}

export interface IPccLifecycleReadinessSignalsViewModel {
  readonly cardState: PccCardState;
  readonly buckets: readonly IPccLifecycleSignalBucketViewModel[];
  readonly approvalPosture: readonly IPccLifecycleApprovalPostureViewModel[];
  readonly priorityActionPromotions: readonly IPccLifecyclePriorityActionPromotionViewModel[];
  readonly handoffCaption: string;
  readonly noExecutionCaption: string;
}

// ---------------------------------------------------------------------------
// Unified item-detail view-model — populated for every list-bearing item
// (My Actions, Blockers, Future Closeout). Every field is record-backed:
// `undefined` means the underlying record did not populate the field, and
// the surface must render an honest placeholder (e.g. `Not listed` / `—`).
// ---------------------------------------------------------------------------

export interface IPccLifecycleItemExternalReferenceDetailViewModel {
  readonly system: LifecycleReadinessExternalReferenceSystem;
  readonly referenceLabel: string;
  /** Captured for honest text rendering only. Never rendered as a hyperlink. */
  readonly referenceUrlText?: string;
}

export interface IPccLifecycleItemDetailViewModel {
  readonly templateItemId: string;
  readonly projectItemId?: string;

  // Identity / classification
  readonly normalizedTitle: string;
  readonly family: LifecycleReadinessFamily;
  readonly familyLabel: string;
  readonly itemType: LifecycleReadinessItemTypeId;
  readonly criticality: LifecycleReadinessCriticality;
  readonly riskTags: readonly string[];
  readonly activeByDefault: boolean;
  readonly classificationNotes?: string;

  // Source traceability (from `sourceTrace`)
  readonly sourceFamily: LifecycleReadinessFamily;
  readonly sourceFile: string;
  readonly sourceSection: string;
  readonly sourcePage: number;
  readonly sourceItemKey: string;
  readonly exactItemText: string;
  readonly sourceTraceabilityRequirement: string;
  readonly sourceDetails?: string;
  readonly responseOptions?: string;

  // Lifecycle / domain mapping
  readonly lifecyclePhase: LifecycleReadinessPhaseId;
  readonly phaseLabel: string;
  readonly readinessDomain: LifecycleReadinessDomainId;
  readonly domainLabel: string;
  readonly defaultGateImpact: readonly LifecycleReadinessGateId[];

  // Ownership / accountability
  readonly defaultOwnerPersona: PccPersona;
  readonly defaultReviewerPersona?: PccPersona;
  readonly ownershipClassification: LifecycleReadinessOwnershipClassification;

  // Project instance state (undefined when no project item exists)
  readonly status?: LifecycleReadinessStatus;
  readonly posture?: ProjectReadinessPosture;
  readonly severity?: ProjectReadinessSeverity;
  readonly blockerState?: ProjectReadinessBlockerState;
  readonly confidence?: ProjectReadinessConfidenceState;
  readonly ownerPersona?: PccPersona;
  readonly reviewerPersona?: PccPersona;
  readonly dueDateUtc?: string;
  readonly completedAtUtc?: string;
  readonly completedByPersona?: PccPersona;
  readonly lastUpdatedAtUtc?: string;
  readonly lastActorPersona?: PccPersona;

  // Reasons (display-only signals)
  readonly notApplicableReason?: string;
  readonly deferredReason?: string;
  readonly blockedReason?: string;
  readonly projectOverrideNotes?: string;
  readonly exceptionCode?: LifecycleReadinessExceptionCode;

  // Evidence posture (text-only; URL never rendered as a link)
  readonly evidencePolicy: LifecycleReadinessEvidencePolicy;
  readonly evidenceState?: ProjectReadinessEvidenceState;
  readonly evidenceReferenceLabel?: string;
  readonly evidenceDocumentControlSourceId?: string;
  readonly evidenceExternalReferenceLabel?: string;
  readonly evidenceExternalReferenceUrlText?: string;

  // External references
  readonly externalReferences: readonly IPccLifecycleItemExternalReferenceDetailViewModel[];

  // Recurrence
  readonly recurrenceCadence?: LifecycleReadinessRecurrenceCadence;
  readonly recurrenceTriggerEvent?: string;

  // Approval / priority promotion
  readonly approvalCheckpointReference?: string;
  readonly relatedPriorityActionId?: string;

  // Posture markers consumed by the surface
  readonly isCloseoutFromDayOne: boolean; // family === 'closeout' && activeByDefault
  readonly isFutureCloseoutExposure: boolean; // itemType === 'future-closeout-exposure'
  readonly isSafetyFailedState: boolean; // family === 'safety' && status === 'failed'

  // Readiness signals derived from this item's records (display-only).
  readonly signals: readonly PccLifecycleReadinessSignalKind[];
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
  readonly detail: IPccLifecycleItemDetailViewModel;
}

export interface IPccLifecycleMyActionsViewModel {
  readonly cardState: PccCardState;
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
  readonly detail: IPccLifecycleItemDetailViewModel;
}

export interface IPccLifecycleBlockersViewModel {
  readonly cardState: PccCardState;
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
  readonly cardState: PccCardState;
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
  readonly detail: IPccLifecycleItemDetailViewModel;
}

export interface IPccLifecycleFutureCloseoutViewModel {
  readonly cardState: PccCardState;
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
      readonly signals: IPccLifecycleReadinessSignalsViewModel;
    }
  | { readonly status: 'error' };
