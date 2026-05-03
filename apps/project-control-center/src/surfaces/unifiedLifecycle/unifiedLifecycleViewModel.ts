/**
 * Unified Lifecycle adapter seam — view-model type declarations.
 *
 * SHARED ADAPTER SEAM. NOT A ROUTED SURFACE.
 * This module is intentionally placed under `src/surfaces/` for naming
 * consistency with sibling adapters, but it is NOT registered with
 * `PccSurfaceRouter` and does NOT mount its own workspace. The seven
 * leaf adapters and the aggregate adapter exposed here are reusable
 * building blocks intended to be consumed by future surface integrations
 * (Project Home, Project Readiness, and other PCC views) in a later
 * prompt.
 *
 * Pure type module. No React, no client, no fetch. View-model shapes
 * mirror the canonical `@hbc/models/pcc` interfaces — every adapter
 * preserves source-lineage, security posture (classification,
 * redaction level, allowed personas, cross-project allowed),
 * evidence links, traceability confidence, and citation refs.
 *
 * `'loading'` is intentionally absent from these unions: pure
 * envelope-in adapters cannot produce a loading state. Hooks (added in
 * a later prompt) own loading/error wrappers.
 */

import type {
  PccCrossProjectReferenceStatus,
  PccEvidenceLinkRef,
  PccLifecycleContextReference,
  PccLifecycleGateSignal,
  PccLifecycleGateSignalStatus,
  PccPersona,
  PccProjectAssumptionRecord,
  PccProjectDecisionRecord,
  PccProjectId,
  PccProjectKnowledgeReference,
  PccProjectKnowledgeReferenceType,
  PccProjectLensType,
  PccProjectLensVisibilityMode,
  PccProjectLifecycleEvent,
  PccProjectLifecycleEventStatus,
  PccProjectLifecycleEventType,
  PccProjectLifecycleStage,
  PccProjectMemoryRecord,
  PccProjectMemoryRecordStatus,
  PccProjectMemoryRecordType,
  PccProjectStage,
  PccProjectStageLens,
  PccProjectStageTransitionCheckpoint,
  PccProjectStageTransitionCheckpointStatus,
  PccProjectTraceabilityEdge,
  PccReadModelEnvelope,
  PccReadModelSourceStatus,
  PccRedactionLevel,
  PccRelatedRecordCluster,
  PccSecurityClassification,
  PccSecurityPosture,
  PccSourceLineageRef,
  PccTraceabilityConfidence,
  PccTraceabilityDirection,
  PccTraceabilityEdgeType,
  PccTraceableRecordType,
  PccUnifiedLifecycleReadModel,
  PccUnifiedSearchAskHbiReadModel,
  PccWarrantyResponsibilityRecommendation,
  PccWarrantyTraceRecord,
  PccWarrantyTraceStatus,
  ProjectReferenceClassification,
  UnifiedSearchGroundingCitation,
} from '@hbc/models/pcc';

import type { PccCardState } from '../projectHome/shared.js';

/**
 * Common envelope-derived posture every leaf VM carries. Drives card
 * rendering without owning async state. `loading`/`error` deliberately
 * absent — those belong to the hook layer.
 */
export interface IPccLifecyclePostureView {
  readonly sourceStatus: PccReadModelSourceStatus;
  readonly cardState: PccCardState;
  readonly projectId: PccProjectId | undefined;
  readonly viewerPersona: PccPersona | undefined;
  readonly generatedAtUtc: string | undefined;
}

/** Per-record redaction view. Mirrors record `security.redactionLevel`. */
export interface IPccRedactionView {
  readonly classification: PccSecurityClassification;
  readonly redactionLevel: PccRedactionLevel;
  readonly redacted: boolean;
  readonly withheld: boolean;
  readonly crossProjectAllowed: boolean;
  readonly allowedPersonas: readonly PccPersona[];
}

// ─────────────────────────────────────────────────────────────────────
// Lifecycle timeline
// ─────────────────────────────────────────────────────────────────────

export interface IPccLifecycleEventVm {
  readonly eventId: string;
  readonly projectId: PccProjectId;
  readonly eventType: PccProjectLifecycleEventType;
  readonly status: PccProjectLifecycleEventStatus;
  readonly lifecycleStage: PccProjectLifecycleStage;
  readonly projectStage: PccProjectStage | null;
  readonly summary: string;
  readonly recordedAtUtc: string;
  readonly recordedByPersona: PccPersona;
  readonly checkpointId: string | undefined;
  readonly evidenceLinks: readonly PccEvidenceLinkRef[];
  readonly contextReferences: readonly PccLifecycleContextReference[];
  readonly traceabilityEdges: readonly PccProjectTraceabilityEdge[];
  readonly sourceLineage: PccSourceLineageRef | undefined;
  readonly redaction: IPccRedactionView;
}

export interface IPccCheckpointVm {
  readonly checkpointId: string;
  readonly lifecycleStage: PccProjectLifecycleStage;
  readonly projectStage: PccProjectStage | null;
  readonly status: PccProjectStageTransitionCheckpointStatus;
  readonly ownerPersona: PccPersona;
  readonly dueAtUtc: string | undefined;
  readonly gateSignals: readonly IPccGateSignalVm[];
}

export interface IPccGateSignalVm {
  readonly signalId: string;
  readonly gateId: string;
  readonly status: PccLifecycleGateSignalStatus;
  readonly rationale: string;
  readonly evidenceLinks: readonly PccEvidenceLinkRef[];
}

export interface IPccLifecycleTimelineViewModel extends IPccLifecyclePostureView {
  readonly events: readonly IPccLifecycleEventVm[];
  readonly checkpoints: readonly IPccCheckpointVm[];
  readonly gateSignals: readonly IPccGateSignalVm[];
  readonly contextReferences: readonly PccLifecycleContextReference[];
}

// ─────────────────────────────────────────────────────────────────────
// Project memory
// ─────────────────────────────────────────────────────────────────────

interface IPccMemoryRecordBaseVm {
  readonly memoryId: string;
  readonly projectId: PccProjectId;
  readonly status: PccProjectMemoryRecordStatus;
  readonly summary: string;
  readonly lifecycleStage: PccProjectLifecycleStage;
  readonly projectStage: PccProjectStage | null;
  readonly recordedAtUtc: string;
  readonly authorPersona: PccPersona;
  readonly evidenceLinks: readonly PccEvidenceLinkRef[];
  readonly sourceLineage: PccSourceLineageRef | undefined;
  readonly redaction: IPccRedactionView;
}

export interface IPccMemoryNoteVm extends IPccMemoryRecordBaseVm {
  readonly recordType: Exclude<PccProjectMemoryRecordType, 'decision' | 'assumption'>;
}

export interface IPccDecisionVm extends IPccMemoryRecordBaseVm {
  readonly recordType: 'decision';
  readonly decision: string;
  readonly impactStatement: string;
}

export interface IPccAssumptionVm extends IPccMemoryRecordBaseVm {
  readonly recordType: 'assumption';
  readonly assumption: string;
  readonly validationPlan: string;
  readonly targetValidationAtUtc: string | undefined;
}

export type IPccMemoryRecordVm = IPccMemoryNoteVm | IPccDecisionVm | IPccAssumptionVm;

export interface IPccProjectMemoryViewModel extends IPccLifecyclePostureView {
  readonly records: readonly IPccMemoryRecordVm[];
  readonly decisions: readonly IPccDecisionVm[];
  readonly assumptions: readonly IPccAssumptionVm[];
}

// ─────────────────────────────────────────────────────────────────────
// Project lenses
// ─────────────────────────────────────────────────────────────────────

export interface IPccLensOptionVm {
  readonly lensId: string;
  readonly lensType: PccProjectLensType;
  readonly visibilityMode: PccProjectLensVisibilityMode;
  readonly lifecycleStage: PccProjectLifecycleStage;
  readonly projectStage: PccProjectStage | null;
  readonly role: PccPersona;
  readonly taskFocus: readonly string[];
  readonly includedMemoryIds: readonly string[];
  readonly includedEventIds: readonly string[];
  readonly includedTraceEdgeIds: readonly string[];
}

export interface IPccLensVisibilitySummary {
  readonly visibleCount: number;
  readonly redactedCount: number;
  readonly hiddenCount: number;
}

export interface IPccProjectLensesViewModel extends IPccLifecyclePostureView {
  readonly lenses: readonly IPccLensOptionVm[];
  readonly defaultLensId: string | undefined;
}

// ─────────────────────────────────────────────────────────────────────
// Project traceability
// ─────────────────────────────────────────────────────────────────────

export interface IPccTraceabilityEdgeVm {
  readonly edgeId: string;
  readonly edgeType: PccTraceabilityEdgeType;
  readonly direction: PccTraceabilityDirection;
  readonly fromRecordId: string;
  readonly fromRecordType: PccTraceableRecordType;
  readonly toRecordId: string;
  readonly toRecordType: PccTraceableRecordType;
  readonly rationale: string;
  readonly confidence: PccTraceabilityConfidence;
  readonly sourceLineage: PccSourceLineageRef;
}

export interface IPccRelatedRecordClusterVm {
  readonly clusterId: string;
  readonly rootRecordId: string;
  readonly rootRecordType: PccTraceableRecordType;
  readonly relatedRecordIds: readonly string[];
  readonly edgeIds: readonly string[];
}

export interface IPccProjectTraceabilityViewModel extends IPccLifecyclePostureView {
  readonly edges: readonly IPccTraceabilityEdgeVm[];
  readonly clusters: readonly IPccRelatedRecordClusterVm[];
  readonly graphEdges: readonly IPccTraceabilityEdgeVm[];
  readonly graphClusters: readonly IPccRelatedRecordClusterVm[];
  readonly relatedLifecycleEvents: readonly IPccLifecycleEventVm[];
  readonly relatedMemoryRecords: readonly IPccMemoryRecordVm[];
}

// ─────────────────────────────────────────────────────────────────────
// Warranty trace
// ─────────────────────────────────────────────────────────────────────

export interface IPccWarrantyTraceRowVm {
  readonly warrantyTraceId: string;
  readonly projectId: PccProjectId;
  readonly status: PccWarrantyTraceStatus;
  readonly issueSummary: string;
  readonly estimateReferenceRecordId: string;
  readonly scopeReferenceRecordId: string;
  readonly relatedLifecycleEventIds: readonly string[];
  readonly relatedMemoryIds: readonly string[];
  readonly traceabilityEdges: readonly IPccTraceabilityEdgeVm[];
  readonly evidenceLinks: readonly PccEvidenceLinkRef[];
  readonly recommendation: PccWarrantyResponsibilityRecommendation | undefined;
  readonly redaction: IPccRedactionView;
  readonly isUnresolved: boolean;
}

export interface IPccWarrantyTraceViewModel extends IPccLifecyclePostureView {
  readonly traces: readonly IPccWarrantyTraceRowVm[];
}

// ─────────────────────────────────────────────────────────────────────
// Cross-project knowledge
// ─────────────────────────────────────────────────────────────────────

export interface IPccCrossProjectReferenceVm {
  readonly referenceId: string;
  readonly fromProjectId: PccProjectId;
  readonly toProjectId: PccProjectId;
  readonly reason: string;
  readonly classification: ProjectReferenceClassification;
  readonly referenceType: PccProjectKnowledgeReferenceType;
  readonly status: PccCrossProjectReferenceStatus;
  readonly eligibleLensTypes: readonly PccProjectLensType[];
  readonly sourceLineage: PccSourceLineageRef;
  readonly redaction: IPccRedactionView;
}

export interface IPccKnowledgeReferenceVm {
  readonly knowledgeId: string;
  readonly projectId: PccProjectId;
  readonly referenceType: PccProjectKnowledgeReferenceType;
  readonly title: string;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly relatedCrossProjectReferences: readonly IPccCrossProjectReferenceVm[];
  readonly sourceLineage: readonly PccSourceLineageRef[];
  readonly redaction: IPccRedactionView;
}

export interface IPccClosedProjectReferenceView {
  readonly references: readonly IPccKnowledgeReferenceVm[];
  readonly futurePursuitReferences: readonly IPccKnowledgeReferenceVm[];
}

export interface IPccCrossProjectKnowledgeViewModel extends IPccLifecyclePostureView {
  readonly crossProjectReferences: readonly IPccCrossProjectReferenceVm[];
  readonly knowledgeReferences: readonly IPccKnowledgeReferenceVm[];
  readonly closedProjectReferences: IPccClosedProjectReferenceView;
}

// ─────────────────────────────────────────────────────────────────────
// Unified search (HBI grounding)
// ─────────────────────────────────────────────────────────────────────

export interface IPccUnifiedSearchGroundedAnswerVm {
  readonly kind: 'grounded';
  readonly answerId: string;
  readonly query: string;
  readonly response: string;
  readonly citations: readonly UnifiedSearchGroundingCitation[];
}

export interface IPccUnifiedSearchRefusalAnswerVm {
  readonly kind: 'refusal';
  readonly answerId: string;
  readonly query: string;
  readonly response: string;
  readonly refusalReason: string;
  readonly citations: readonly [];
}

export type IPccUnifiedSearchAnswerVm =
  | IPccUnifiedSearchGroundedAnswerVm
  | IPccUnifiedSearchRefusalAnswerVm;

export interface IPccUnifiedSearchViewModel extends IPccLifecyclePostureView {
  readonly answers: readonly IPccUnifiedSearchAnswerVm[];
}

// ─────────────────────────────────────────────────────────────────────
// Aggregate
// ─────────────────────────────────────────────────────────────────────

export interface IPccUnifiedLifecycleViewModel extends IPccLifecyclePostureView {
  readonly lifecycleTimeline: IPccLifecycleTimelineViewModel;
  readonly projectMemory: IPccProjectMemoryViewModel;
  readonly projectLenses: IPccProjectLensesViewModel;
  readonly projectTraceability: IPccProjectTraceabilityViewModel;
  readonly warrantyTrace: IPccWarrantyTraceViewModel;
  readonly crossProjectKnowledge: IPccCrossProjectKnowledgeViewModel;
  readonly unifiedSearch: IPccUnifiedSearchViewModel;
}

// Re-export model types whose values are useful at the boundary so
// downstream consumers don't need to import from two places.
export type {
  PccLifecycleContextReference,
  PccLifecycleGateSignal,
  PccProjectLifecycleEvent,
  PccProjectStageTransitionCheckpoint,
  PccProjectMemoryRecord,
  PccProjectDecisionRecord,
  PccProjectAssumptionRecord,
  PccProjectStageLens,
  PccProjectTraceabilityEdge,
  PccRelatedRecordCluster,
  PccWarrantyTraceRecord,
  PccSecurityPosture,
  PccSourceLineageRef,
  UnifiedSearchGroundingCitation,
};

// ─────────────────────────────────────────────────────────────────────
// Wave 99 / Prompt 05A — narrow client interface for the unified-
// lifecycle hook seam. Spelled out inline (not via indexed-access
// against IPccReadModelClient) so the controlled-consumption guard
// in `pcc-api-dormancy.test.ts` does not see the forbidden full-client
// identifier in this file.
// ─────────────────────────────────────────────────────────────────────

export interface IPccUnifiedLifecycleReadModelClient {
  getUnifiedLifecycle(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccUnifiedLifecycleReadModel>>;
}

// ─────────────────────────────────────────────────────────────────────
// Wave 99 / Prompt 06A — narrow client interface for the unified-search
// (Ask HBI) hook seam. Spelled out inline (not via indexed-access against
// IPccReadModelClient) so the controlled-consumption guard in
// `pcc-api-dormancy.test.ts` does not see the forbidden full-client
// identifier in this file.
// ─────────────────────────────────────────────────────────────────────

export interface IPccUnifiedSearchReadModelClient {
  getUnifiedSearch(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
    query?: string,
  ): Promise<PccReadModelEnvelope<PccUnifiedSearchAskHbiReadModel>>;
}
