/**
 * P3-E15-T10 Stage 9 Project QC Module schedule-handoffs TypeScript contracts.
 */

import type {
  QualityReadinessSignal,
  ScheduleRefType,
  HandoffTarget,
  HandoffContentType,
  BaselineVisibleSurface,
  ScheduleAwareRecordType,
  DeferredFieldCapability,
  HandoffLineagePreservation,
  ReadinessPublicationScope,
} from './enums.js';

// -- Schedule Context Ref -------------------------------------------------------

/** A read-only reference linking a QC record to an external schedule context. */
export interface IScheduleContextRef {
  readonly scheduleContextRefId: string;
  readonly owningRecordId: string;
  readonly owningRecordType: ScheduleAwareRecordType;
  readonly refType: ScheduleRefType;
  readonly scheduleRefId: string;
  readonly windowStartDate: string | null;
  readonly windowEndDate: string | null;
  readonly isReadOnly: boolean;
}

// -- Quality Readiness Publication ----------------------------------------------

/** Published readiness signal for a schedule-aware quality record. */
export interface IQualityReadinessPublication {
  readonly publicationId: string;
  readonly projectId: string;
  readonly sourceRecordId: string;
  readonly readinessSignal: QualityReadinessSignal;
  readonly scheduleContextRef: string | null;
  readonly milestoneRef: string | null;
  readonly windowRef: string | null;
  readonly publicationScope: ReadinessPublicationScope;
  readonly publishedAt: string;
  readonly supersededByPublicationId: string | null;
}

// -- Handoff Payload ------------------------------------------------------------

/** Assembled handoff payload for downstream lifecycle targets. */
export interface IHandoffPayload {
  readonly handoffPayloadId: string;
  readonly projectId: string;
  readonly target: HandoffTarget;
  readonly snapshotRef: string;
  readonly contentTypes: readonly HandoffContentType[];
  readonly lineagePreservation: HandoffLineagePreservation;
  readonly openIssueCount: number;
  readonly approvedDeviationCount: number;
  readonly evidenceRefCount: number;
  readonly unresolvableBlockerCount: number;
  readonly assembledAt: string;
}

// -- Closeout Handoff Content ---------------------------------------------------

/** Closeout-specific handoff content. */
export interface ICloseoutHandoffContent {
  readonly handoffContentId: string;
  readonly handoffPayloadId: string;
  readonly turnoverQualityBasis: string;
  readonly openIssueRefs: readonly string[];
  readonly approvedDeviationRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly externalApprovalRefs: readonly string[];
  readonly qualityReadinessPosture: QualityReadinessSignal;
}

// -- Startup Handoff Content ----------------------------------------------------

/** Startup-specific handoff content. */
export interface IStartupHandoffContent {
  readonly handoffContentId: string;
  readonly handoffPayloadId: string;
  readonly qualityPlanSectionRefs: readonly string[];
  readonly approvedExceptionRefs: readonly string[];
  readonly testWitnessResultRefs: readonly string[];
  readonly unresolvedQualityIssueRefs: readonly string[];
  readonly commissioningReadinessPosture: QualityReadinessSignal;
  readonly gateExpectationRefs: readonly string[];
}

// -- Warranty Handoff Content ---------------------------------------------------

/** Warranty-specific handoff content. */
export interface IWarrantyHandoffContent {
  readonly handoffContentId: string;
  readonly handoffPayloadId: string;
  readonly acceptedQualityBasis: string;
  readonly evidenceLineageRefs: readonly string[];
  readonly approvedDeviationWaiverRefs: readonly string[];
  readonly recurrenceHistoryRefs: readonly string[];
  readonly responsibleOrgHistoryRefs: readonly string[];
  readonly qualityPostureAtHandoff: QualityReadinessSignal;
}

// -- Site Controls Handoff Content ----------------------------------------------

/** Future site controls handoff content. */
export interface ISiteControlsHandoffContent {
  readonly handoffContentId: string;
  readonly handoffPayloadId: string;
  readonly fieldFacingControlExpectations: readonly string[];
  readonly unresolvedReadinessBlockerRefs: readonly string[];
  readonly advisoryDriftAlertRefs: readonly string[];
  readonly gateTestMockupWitnessExpectationRefs: readonly string[];
  readonly readinessPosture: QualityReadinessSignal;
  readonly isDeferredToPhase6: boolean;
}

// -- Baseline Visible Readiness Surface -----------------------------------------

/** A baseline-visible readiness surface exposed in Phase 3. */
export interface IBaselineVisibleReadinessSurface {
  readonly surfaceId: string;
  readonly projectId: string;
  readonly surface: BaselineVisibleSurface;
  readonly description: string;
  readonly currentReadinessSignal: QualityReadinessSignal;
  readonly lastEvaluatedAt: string;
}

// -- Deferred Field Capability Definition ---------------------------------------

/** Definition of a field capability deferred to a future phase. */
export interface IDeferredFieldCapabilityDef {
  readonly capability: DeferredFieldCapability;
  readonly description: string;
  readonly deferredTo: string;
  readonly rationale: string;
}
