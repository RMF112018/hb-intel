/**
 * PCC Unified Lifecycle read-model DTO contracts.
 *
 * Type-only aggregation DTOs that package Prompt 1 unified lifecycle records
 * into read-model shapes consumable by backend/SPFx boundaries later.
 *
 * @module pcc/UnifiedLifecycleReadModels
 */

import type {
  PccClosedProjectReferenceReadModel,
  PccCrossProjectReference,
  PccLifecycleContextReference,
  PccLifecycleGateSignal,
  PccProjectAssumptionRecord,
  PccProjectDecisionRecord,
  PccProjectKnowledgeReference,
  PccProjectLifecycleEvent,
  PccProjectMemoryRecord,
  PccProjectStageLens,
  PccProjectStageTransitionCheckpoint,
  PccProjectTraceabilityEdge,
  PccRelatedRecordCluster,
  PccTraceabilityGraphReadModel,
  UnifiedSearchAskHbiResponse,
  PccWarrantyTraceRecord,
} from './UnifiedLifecycle.js';

export interface PccProjectLifecycleTimelineReadModel {
  readonly events: readonly PccProjectLifecycleEvent[];
  readonly checkpoints: readonly PccProjectStageTransitionCheckpoint[];
  readonly gateSignals: readonly PccLifecycleGateSignal[];
  readonly contextReferences: readonly PccLifecycleContextReference[];
}

export interface PccProjectMemoryReadModel {
  readonly records: readonly PccProjectMemoryRecord[];
  readonly decisions: readonly PccProjectDecisionRecord[];
  readonly assumptions: readonly PccProjectAssumptionRecord[];
}

export interface PccProjectLensesReadModel {
  readonly stageLenses: readonly PccProjectStageLens[];
}

export interface PccProjectTraceabilityReadModel {
  readonly edges: readonly PccProjectTraceabilityEdge[];
  readonly clusters: readonly PccRelatedRecordCluster[];
  readonly graph: PccTraceabilityGraphReadModel;
  readonly relatedLifecycleEvents: readonly PccProjectLifecycleEvent[];
  readonly relatedMemoryRecords: readonly PccProjectMemoryRecord[];
}

export interface PccWarrantyTraceReadModel {
  readonly traces: readonly PccWarrantyTraceRecord[];
}

export interface PccCrossProjectKnowledgeReadModel {
  readonly crossProjectReferences: readonly PccCrossProjectReference[];
  readonly knowledgeReferences: readonly PccProjectKnowledgeReference[];
  readonly closedProjectReferences: PccClosedProjectReferenceReadModel;
}

export interface PccUnifiedSearchAskHbiReadModel {
  readonly responses: readonly UnifiedSearchAskHbiResponse[];
}

export interface PccUnifiedLifecycleReadModel {
  readonly lifecycleTimeline: PccProjectLifecycleTimelineReadModel;
  readonly projectMemory: PccProjectMemoryReadModel;
  readonly projectLenses: PccProjectLensesReadModel;
  readonly projectTraceability: PccProjectTraceabilityReadModel;
  readonly warrantyTrace: PccWarrantyTraceReadModel;
  readonly crossProjectKnowledge: PccCrossProjectKnowledgeReadModel;
  readonly unifiedSearch: PccUnifiedSearchAskHbiReadModel;
}
