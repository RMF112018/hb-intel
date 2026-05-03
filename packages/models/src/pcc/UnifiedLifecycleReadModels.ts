/**
 * PCC Unified Lifecycle read-model DTO contracts.
 *
 * Type-only aggregation DTOs that package Prompt 1 unified lifecycle records
 * into read-model shapes consumable by backend/SPFx boundaries later.
 *
 * @module pcc/UnifiedLifecycleReadModels
 */

import type {
  CrossProjectReference,
  LifecycleContextReference,
  LifecycleGateSignal,
  ProjectAssumptionRecord,
  ProjectDecisionRecord,
  ProjectKnowledgeReference,
  ProjectLifecycleEvent,
  ProjectMemoryRecord,
  ProjectStageLens,
  ProjectStageTransitionCheckpoint,
  ProjectTraceabilityEdge,
  UnifiedSearchAskHbiResponse,
  WarrantyTraceRecord,
} from './UnifiedLifecycle.js';

export interface PccProjectLifecycleTimelineReadModel {
  readonly events: readonly ProjectLifecycleEvent[];
  readonly checkpoints: readonly ProjectStageTransitionCheckpoint[];
  readonly gateSignals: readonly LifecycleGateSignal[];
  readonly contextReferences: readonly LifecycleContextReference[];
}

export interface PccProjectMemoryReadModel {
  readonly records: readonly ProjectMemoryRecord[];
  readonly decisions: readonly ProjectDecisionRecord[];
  readonly assumptions: readonly ProjectAssumptionRecord[];
}

export interface PccProjectLensesReadModel {
  readonly stageLenses: readonly ProjectStageLens[];
}

export interface PccProjectTraceabilityReadModel {
  readonly edges: readonly ProjectTraceabilityEdge[];
  readonly relatedLifecycleEvents: readonly ProjectLifecycleEvent[];
  readonly relatedMemoryRecords: readonly ProjectMemoryRecord[];
}

export interface PccWarrantyTraceReadModel {
  readonly traces: readonly WarrantyTraceRecord[];
}

export interface PccCrossProjectKnowledgeReadModel {
  readonly crossProjectReferences: readonly CrossProjectReference[];
  readonly knowledgeReferences: readonly ProjectKnowledgeReference[];
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
