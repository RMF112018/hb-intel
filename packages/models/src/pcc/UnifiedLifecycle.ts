/**
 * PCC Unified Lifecycle contracts.
 *
 * Prompt 1 scope: type-only contracts and vocabularies that preserve a
 * single project operating layer while allowing role/stage/task lenses over
 * shared project truth.
 *
 * @module pcc/UnifiedLifecycle
 */

import type { PccPersona } from './PccUserRoles.js';
import type { PccProjectId } from './types.js';
import type { PccProjectStage } from './PccProjectEnums.js';

export const PCC_LIFECYCLE_EVENT_TYPES = [
  'checkpoint-opened',
  'checkpoint-closed',
  'decision-recorded',
  'assumption-recorded',
  'risk-raised',
  'handoff-completed',
  'warranty-issue-linked',
  'knowledge-captured',
] as const;
export type ProjectLifecycleEventType = (typeof PCC_LIFECYCLE_EVENT_TYPES)[number];

export const PCC_LIFECYCLE_CHECKPOINT_STATUSES = [
  'not-started',
  'in-progress',
  'blocked',
  'ready-for-review',
  'complete',
] as const;
export type ProjectStageTransitionCheckpointStatus =
  (typeof PCC_LIFECYCLE_CHECKPOINT_STATUSES)[number];

export const PCC_LIFECYCLE_GATE_SIGNAL_STATUSES = ['pass', 'watch', 'fail'] as const;
export type LifecycleGateSignalStatus = (typeof PCC_LIFECYCLE_GATE_SIGNAL_STATUSES)[number];

export const PCC_TRACEABILITY_EDGE_TYPES = [
  'derived-from',
  'supported-by',
  'constrains',
  'fulfills',
  'relates-to',
] as const;
export type ProjectTraceabilityEdgeType = (typeof PCC_TRACEABILITY_EDGE_TYPES)[number];

export const PCC_WARRANTY_TRACE_STATUSES = [
  'identified',
  'investigating',
  'pending-evidence',
  'resolved',
  'closed',
] as const;
export type WarrantyTraceStatus = (typeof PCC_WARRANTY_TRACE_STATUSES)[number];

export const PCC_REFERENCE_CLASSIFICATIONS = [
  'project-local',
  'cross-project',
  'enterprise-knowledge',
] as const;
export type ProjectReferenceClassification = (typeof PCC_REFERENCE_CLASSIFICATIONS)[number];

export const PCC_REDACTION_LEVELS = ['none', 'masked', 'withheld'] as const;
export type PccRedactionLevel = (typeof PCC_REDACTION_LEVELS)[number];

export const PCC_SECURITY_CLASSIFICATIONS = [
  'project-internal',
  'need-to-know',
  'restricted',
  'privileged',
] as const;
export type PccSecurityClassification = (typeof PCC_SECURITY_CLASSIFICATIONS)[number];

export interface PccSourceLineageRef {
  readonly sourceSystem: string;
  readonly sourceEntityType: string;
  readonly sourceRecordId: string;
  readonly sourceUrl?: string;
  readonly capturedAtUtc: string;
}

export interface PccEvidenceLinkRef {
  readonly evidenceId: string;
  readonly label: string;
  readonly sourceLineage: PccSourceLineageRef;
  readonly required: boolean;
}

export interface PccSecurityPosture {
  readonly classification: PccSecurityClassification;
  readonly allowedPersonas: readonly PccPersona[];
  readonly redactionLevel: PccRedactionLevel;
  readonly crossProjectAllowed: boolean;
}

export interface LifecycleContextReference {
  readonly contextId: string;
  readonly stage: PccProjectStage;
  readonly workCenterId?: string;
  readonly workflowModuleId?: string;
  readonly sourceLineage: PccSourceLineageRef;
  readonly security: PccSecurityPosture;
}

export interface ProjectStageTransitionCheckpoint {
  readonly checkpointId: string;
  readonly stage: PccProjectStage;
  readonly status: ProjectStageTransitionCheckpointStatus;
  readonly ownerPersona: PccPersona;
  readonly dueAtUtc?: string;
  readonly gateSignals: readonly LifecycleGateSignal[];
}

export interface LifecycleGateSignal {
  readonly signalId: string;
  readonly gateId: string;
  readonly status: LifecycleGateSignalStatus;
  readonly rationale: string;
  readonly evidenceLinks: readonly PccEvidenceLinkRef[];
}

export interface ProjectLifecycleEvent {
  readonly eventId: string;
  readonly projectId: PccProjectId;
  readonly eventType: ProjectLifecycleEventType;
  readonly stage: PccProjectStage;
  readonly recordedAtUtc: string;
  readonly recordedByPersona: PccPersona;
  readonly checkpointId?: string;
  readonly contextReferences: readonly LifecycleContextReference[];
  readonly traceabilityEdges: readonly ProjectTraceabilityEdge[];
  readonly evidenceLinks: readonly PccEvidenceLinkRef[];
  readonly security: PccSecurityPosture;
}

export interface ProjectMemoryRecord {
  readonly memoryId: string;
  readonly projectId: PccProjectId;
  readonly summary: string;
  readonly stage: PccProjectStage;
  readonly recordedAtUtc: string;
  readonly authorPersona: PccPersona;
  readonly sourceLineage: PccSourceLineageRef;
  readonly evidenceLinks: readonly PccEvidenceLinkRef[];
  readonly security: PccSecurityPosture;
}

export interface ProjectDecisionRecord extends ProjectMemoryRecord {
  readonly memoryKind: 'decision';
  readonly decision: string;
  readonly impactStatement: string;
}

export interface ProjectAssumptionRecord extends ProjectMemoryRecord {
  readonly memoryKind: 'assumption';
  readonly assumption: string;
  readonly validationPlan: string;
  readonly targetValidationAtUtc?: string;
}

export interface ProjectStageLens {
  readonly lensId: string;
  readonly stage: PccProjectStage;
  readonly role: PccPersona;
  readonly taskFocus: readonly string[];
  readonly includedMemoryIds: readonly string[];
  readonly includedEventIds: readonly string[];
  readonly includedTraceEdgeIds: readonly string[];
}

export interface ProjectTraceabilityEdge {
  readonly edgeId: string;
  readonly edgeType: ProjectTraceabilityEdgeType;
  readonly fromRecordId: string;
  readonly toRecordId: string;
  readonly rationale: string;
  readonly sourceLineage: PccSourceLineageRef;
}

export interface WarrantyTraceRecord {
  readonly warrantyTraceId: string;
  readonly projectId: PccProjectId;
  readonly status: WarrantyTraceStatus;
  readonly issueSummary: string;
  readonly relatedLifecycleEventIds: readonly string[];
  readonly relatedMemoryIds: readonly string[];
  readonly traceabilityEdges: readonly ProjectTraceabilityEdge[];
  readonly evidenceLinks: readonly PccEvidenceLinkRef[];
  readonly security: PccSecurityPosture;
}

export interface CrossProjectReference {
  readonly referenceId: string;
  readonly fromProjectId: PccProjectId;
  readonly toProjectId: PccProjectId;
  readonly reason: string;
  readonly classification: ProjectReferenceClassification;
  readonly sourceLineage: PccSourceLineageRef;
  readonly security: PccSecurityPosture;
}

export interface ProjectKnowledgeReference {
  readonly knowledgeId: string;
  readonly projectId: PccProjectId;
  readonly title: string;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly relatedCrossProjectReferences: readonly CrossProjectReference[];
  readonly sourceLineage: readonly PccSourceLineageRef[];
  readonly security: PccSecurityPosture;
}

export interface UnifiedSearchGroundingCitation {
  readonly citationId: string;
  readonly recordType:
    | 'lifecycle-event'
    | 'memory'
    | 'decision'
    | 'assumption'
    | 'warranty-trace'
    | 'knowledge-reference';
  readonly recordId: string;
  readonly sourceLineage: PccSourceLineageRef;
  readonly evidenceLinkId?: string;
  readonly excerpt: string;
}

export interface UnifiedSearchGroundedAnswer {
  readonly answerId: string;
  readonly query: string;
  readonly response: string;
  readonly grounded: true;
  readonly citations: readonly UnifiedSearchGroundingCitation[];
  readonly refused: false;
}

export interface UnifiedSearchRefusal {
  readonly answerId: string;
  readonly query: string;
  readonly response: string;
  readonly grounded: false;
  readonly citations: readonly [];
  readonly refused: true;
  readonly refusalReason: string;
}

export type UnifiedSearchAskHbiResponse = UnifiedSearchGroundedAnswer | UnifiedSearchRefusal;
