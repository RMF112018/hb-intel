/**
 * PCC Unified Lifecycle contracts.
 *
 * Rich model contracts for lifecycle continuity, memory, lenses,
 * traceability, warranty posture, cross-project knowledge reuse, and
 * grounded ask-HBI responses.
 *
 * @module pcc/UnifiedLifecycle
 */

import type { PccProjectStage } from './PccProjectEnums.js';
import type { PccPersona } from './PccUserRoles.js';
import type { PccProjectId } from './types.js';

export const PCC_PROJECT_LIFECYCLE_STAGES = [
  'lead-pursuit',
  'pursuit-go-no-go',
  'estimating',
  'preconstruction',
  'project-setup',
  'active-construction',
  'closeout',
  'warranty',
  'archive',
  'future-reference',
] as const;
export type PccProjectLifecycleStage = (typeof PCC_PROJECT_LIFECYCLE_STAGES)[number];

export const PCC_LIFECYCLE_STAGE_PROJECT_STAGE_MAP: Readonly<
  Record<PccProjectLifecycleStage, PccProjectStage | null>
> = {
  'lead-pursuit': 'lead',
  'pursuit-go-no-go': 'lead',
  estimating: 'estimating',
  preconstruction: 'preconstruction',
  'project-setup': 'preconstruction',
  'active-construction': 'active_construction',
  closeout: 'closeout',
  warranty: 'warranty',
  archive: null,
  'future-reference': null,
} as const;

export const PCC_LIFECYCLE_EVENT_TYPES = [
  'stage-transition',
  'decision',
  'assumption',
  'readiness-gate',
  'external-system-milestone',
  'evidence-capture',
  'risk-constraint-signal',
  'warranty-signal',
  'knowledge-reuse-signal',
] as const;
export type PccProjectLifecycleEventType = (typeof PCC_LIFECYCLE_EVENT_TYPES)[number];

export const PCC_LIFECYCLE_EVENT_STATUSES = [
  'draft',
  'active',
  'pending-review',
  'accepted',
  'superseded',
  'archived',
] as const;
export type PccProjectLifecycleEventStatus = (typeof PCC_LIFECYCLE_EVENT_STATUSES)[number];

export const PCC_LIFECYCLE_CHECKPOINT_STATUSES = [
  'not-started',
  'in-progress',
  'blocked',
  'ready-for-review',
  'complete',
] as const;
export type PccProjectStageTransitionCheckpointStatus =
  (typeof PCC_LIFECYCLE_CHECKPOINT_STATUSES)[number];

export const PCC_LIFECYCLE_GATE_SIGNAL_STATUSES = ['pass', 'watch', 'fail'] as const;
export type PccLifecycleGateSignalStatus = (typeof PCC_LIFECYCLE_GATE_SIGNAL_STATUSES)[number];

export const PCC_MEMORY_RECORD_TYPES = [
  'decision',
  'assumption',
  'obligation',
  'risk',
  'constraint',
  'vendor-selection',
  'product-selection',
  'estimate-reference',
  'scope-reference',
  'change-reference',
  'inspection-reference',
  'closeout-reference',
  'warranty-reference',
  'lesson-learned',
  'executive-note',
  'pursuit-note',
] as const;
export type PccProjectMemoryRecordType = (typeof PCC_MEMORY_RECORD_TYPES)[number];

export const PCC_MEMORY_RECORD_STATUSES = [
  'open',
  'validated',
  'invalidated',
  'superseded',
  'converted-to-action',
  'archived',
] as const;
export type PccProjectMemoryRecordStatus = (typeof PCC_MEMORY_RECORD_STATUSES)[number];

export const PCC_PROJECT_LENS_TYPES = [
  'estimating',
  'preconstruction',
  'operations',
  'field',
  'accounting',
  'closeout',
  'warranty',
  'executive',
  'admin',
  'future-pursuit-reference',
] as const;
export type PccProjectLensType = (typeof PCC_PROJECT_LENS_TYPES)[number];

export const PCC_PROJECT_LENS_VISIBILITY_MODES = [
  'active-work',
  'historical-context',
  'read-only-reference',
  'restricted',
  'redacted-summary',
  'hidden',
] as const;
export type PccProjectLensVisibilityMode = (typeof PCC_PROJECT_LENS_VISIBILITY_MODES)[number];

export const PCC_TRACEABLE_RECORD_TYPES = [
  'estimate-line-item',
  'estimate-assembly',
  'bid-package',
  'scope-package',
  'subcontractor-bid',
  'commitment',
  'purchase-order',
  'vendor',
  'subcontractor',
  'product-material',
  'submittal',
  'rfi',
  'asi-ccd-change-event',
  'inspection',
  'constraint',
  'responsibility-matrix-item',
  'punch-item',
  'closeout-document',
  'warranty-claim',
  'lesson-learned',
  'project-memory-record',
  'lifecycle-event',
] as const;
export type PccTraceableRecordType = (typeof PCC_TRACEABLE_RECORD_TYPES)[number];

export const PCC_TRACEABILITY_EDGE_TYPES = [
  'derived-from',
  'references',
  'satisfies',
  'supersedes',
  'caused-by',
  'contributed-to',
  'approved-by',
  'installed-by',
  'warranted-by',
  'assigned-to',
  'closed-by',
  'reused-by',
  'comparable-to',
  'supported-by',
] as const;
export type PccTraceabilityEdgeType = (typeof PCC_TRACEABILITY_EDGE_TYPES)[number];

export const PCC_TRACEABILITY_DIRECTIONS = ['forward', 'backward', 'bidirectional'] as const;
export type PccTraceabilityDirection = (typeof PCC_TRACEABILITY_DIRECTIONS)[number];

export const PCC_TRACEABILITY_CONFIDENCE = ['low', 'medium', 'high', 'verified'] as const;
export type PccTraceabilityConfidence = (typeof PCC_TRACEABILITY_CONFIDENCE)[number];

export const PCC_WARRANTY_TRACE_STATUSES = [
  'insufficient-evidence',
  'unresolved-responsibility',
  'pending-evidence',
  'responsibility-recommended',
  'responsibility-confirmed',
  'resolved',
  'closed',
] as const;
export type PccWarrantyTraceStatus = (typeof PCC_WARRANTY_TRACE_STATUSES)[number];

export const PCC_PROJECT_KNOWLEDGE_REFERENCE_TYPES = [
  'comparable-project',
  'comparable-scope',
  'vendor-performance',
  'product-performance',
  'estimate-variance',
  'warranty-pattern',
  'lesson-learned',
  'risk-pattern',
  'constructability-note',
  'pursuit-reference',
] as const;
export type PccProjectKnowledgeReferenceType =
  (typeof PCC_PROJECT_KNOWLEDGE_REFERENCE_TYPES)[number];

export const PCC_CROSS_PROJECT_REFERENCE_STATUSES = [
  'candidate',
  'approved',
  'restricted',
  'redacted',
  'archived',
  'rejected',
] as const;
export type PccCrossProjectReferenceStatus = (typeof PCC_CROSS_PROJECT_REFERENCE_STATUSES)[number];

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

export const PCC_RECORD_OWNERSHIP_POSTURES = ['source-system-reference', 'pcc-native'] as const;
export type PccRecordOwnershipPosture = (typeof PCC_RECORD_OWNERSHIP_POSTURES)[number];

export const PCC_HBI_REFUSAL_REASONS = [
  'insufficient-evidence',
  'permission-restricted',
  'out-of-scope',
  'cross-project-not-authorized',
  'responsibility-conclusion-not-supported',
] as const;
export type PccHbiRefusalReason = (typeof PCC_HBI_REFUSAL_REASONS)[number];

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

export interface PccRoleStageLensDefinition {
  readonly lensType: PccProjectLensType;
  readonly visibilityMode: PccProjectLensVisibilityMode;
  readonly eligiblePersonas: readonly PccPersona[];
}

export interface PccLifecycleContextReference {
  readonly contextId: string;
  readonly lifecycleStage: PccProjectLifecycleStage;
  readonly projectStage: PccProjectStage | null;
  readonly workCenterId?: string;
  readonly workflowModuleId?: string;
  readonly ownershipPosture: PccRecordOwnershipPosture;
  readonly sourceLineage?: PccSourceLineageRef;
  readonly security: PccSecurityPosture;
}

export interface PccLifecycleGateSignal {
  readonly signalId: string;
  readonly gateId: string;
  readonly status: PccLifecycleGateSignalStatus;
  readonly rationale: string;
  readonly evidenceLinks: readonly PccEvidenceLinkRef[];
}

export interface PccProjectStageTransitionCheckpoint {
  readonly checkpointId: string;
  readonly lifecycleStage: PccProjectLifecycleStage;
  readonly projectStage: PccProjectStage | null;
  readonly status: PccProjectStageTransitionCheckpointStatus;
  readonly ownerPersona: PccPersona;
  readonly dueAtUtc?: string;
  readonly gateSignals: readonly PccLifecycleGateSignal[];
}

export interface PccProjectTraceabilityEdge {
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

export interface PccProjectLifecycleEvent {
  readonly eventId: string;
  readonly projectId: PccProjectId;
  readonly eventType: PccProjectLifecycleEventType;
  readonly status: PccProjectLifecycleEventStatus;
  readonly lifecycleStage: PccProjectLifecycleStage;
  readonly projectStage: PccProjectStage | null;
  readonly summary: string;
  readonly recordedAtUtc: string;
  readonly recordedByPersona: PccPersona;
  readonly checkpointId?: string;
  readonly contextReferences: readonly PccLifecycleContextReference[];
  readonly traceabilityEdges: readonly PccProjectTraceabilityEdge[];
  readonly evidenceLinks: readonly PccEvidenceLinkRef[];
  readonly ownershipPosture: PccRecordOwnershipPosture;
  readonly sourceLineage?: PccSourceLineageRef;
  readonly security: PccSecurityPosture;
}

export interface PccProjectMemoryRecord {
  readonly memoryId: string;
  readonly projectId: PccProjectId;
  readonly recordType: PccProjectMemoryRecordType;
  readonly status: PccProjectMemoryRecordStatus;
  readonly summary: string;
  readonly lifecycleStage: PccProjectLifecycleStage;
  readonly projectStage: PccProjectStage | null;
  readonly recordedAtUtc: string;
  readonly authorPersona: PccPersona;
  readonly ownershipPosture: PccRecordOwnershipPosture;
  readonly sourceLineage?: PccSourceLineageRef;
  readonly evidenceLinks: readonly PccEvidenceLinkRef[];
  readonly security: PccSecurityPosture;
}

export interface PccProjectDecisionRecord extends PccProjectMemoryRecord {
  readonly recordType: 'decision';
  readonly decision: string;
  readonly impactStatement: string;
}

export interface PccProjectAssumptionRecord extends PccProjectMemoryRecord {
  readonly recordType: 'assumption';
  readonly assumption: string;
  readonly validationPlan: string;
  readonly targetValidationAtUtc?: string;
}

export interface PccProjectStageLens {
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

export interface PccRelatedRecordCluster {
  readonly clusterId: string;
  readonly rootRecordId: string;
  readonly rootRecordType: PccTraceableRecordType;
  readonly relatedRecordIds: readonly string[];
  readonly edgeIds: readonly string[];
}

export interface PccObligationTraceRecord {
  readonly obligationTraceId: string;
  readonly projectId: PccProjectId;
  readonly scopeReferenceRecordId: string;
  readonly estimateReferenceRecordId: string;
  readonly commitmentRecordId: string;
  readonly warrantyTermSummary: string;
  readonly sourceLineage: readonly PccSourceLineageRef[];
  readonly evidenceLinks: readonly PccEvidenceLinkRef[];
  readonly security: PccSecurityPosture;
}

export interface PccVendorProductTraceRecord {
  readonly vendorProductTraceId: string;
  readonly projectId: PccProjectId;
  readonly vendorRecordId: string;
  readonly subcontractorRecordId: string;
  readonly productMaterialRecordId: string;
  readonly submittalRecordId: string;
  readonly closeoutRecordId: string;
  readonly installationInspectionRecordIds: readonly string[];
  readonly sourceLineage: readonly PccSourceLineageRef[];
  readonly evidenceLinks: readonly PccEvidenceLinkRef[];
  readonly security: PccSecurityPosture;
}

export interface PccWarrantyResponsibilityRecommendation {
  readonly recommendedResponsibleRecordId: string;
  readonly recommendedResponsibleType: 'vendor' | 'subcontractor' | 'manufacturer';
  readonly confidence: PccTraceabilityConfidence;
  readonly evidenceLinkIds: readonly string[];
}

export interface PccWarrantyTraceRecord {
  readonly warrantyTraceId: string;
  readonly projectId: PccProjectId;
  readonly status: PccWarrantyTraceStatus;
  readonly issueSummary: string;
  readonly estimateReferenceRecordId: string;
  readonly scopeReferenceRecordId: string;
  readonly obligationTrace: PccObligationTraceRecord;
  readonly vendorProductTrace: PccVendorProductTraceRecord;
  readonly relatedLifecycleEventIds: readonly string[];
  readonly relatedMemoryIds: readonly string[];
  readonly traceabilityEdges: readonly PccProjectTraceabilityEdge[];
  readonly evidenceLinks: readonly PccEvidenceLinkRef[];
  readonly recommendation?: PccWarrantyResponsibilityRecommendation;
  readonly security: PccSecurityPosture;
}

export interface PccCrossProjectReference {
  readonly referenceId: string;
  readonly fromProjectId: PccProjectId;
  readonly toProjectId: PccProjectId;
  readonly reason: string;
  readonly classification: ProjectReferenceClassification;
  readonly referenceType: PccProjectKnowledgeReferenceType;
  readonly status: PccCrossProjectReferenceStatus;
  readonly eligibleLensTypes: readonly PccProjectLensType[];
  readonly sourceLineage: PccSourceLineageRef;
  readonly security: PccSecurityPosture;
}

export interface PccProjectKnowledgeReference {
  readonly knowledgeId: string;
  readonly projectId: PccProjectId;
  readonly referenceType: PccProjectKnowledgeReferenceType;
  readonly title: string;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly relatedCrossProjectReferences: readonly PccCrossProjectReference[];
  readonly sourceLineage: readonly PccSourceLineageRef[];
  readonly security: PccSecurityPosture;
}

export interface PccLifecycleTimelineReadModel {
  readonly events: readonly PccProjectLifecycleEvent[];
  readonly checkpoints: readonly PccProjectStageTransitionCheckpoint[];
  readonly gateSignals: readonly PccLifecycleGateSignal[];
  readonly contextReferences: readonly PccLifecycleContextReference[];
}

export interface PccProjectMemorySummaryReadModel {
  readonly records: readonly PccProjectMemoryRecord[];
  readonly decisions: readonly PccProjectDecisionRecord[];
  readonly assumptions: readonly PccProjectAssumptionRecord[];
}

export interface PccProjectLensReadModel {
  readonly stageLenses: readonly PccProjectStageLens[];
  readonly roleLensDefinitions: readonly PccRoleStageLensDefinition[];
}

export interface PccTraceabilityGraphReadModel {
  readonly edges: readonly PccProjectTraceabilityEdge[];
  readonly clusters: readonly PccRelatedRecordCluster[];
}

export interface PccClosedProjectReferenceReadModel {
  readonly references: readonly PccProjectKnowledgeReference[];
  readonly futurePursuitReferences: readonly PccProjectKnowledgeReference[];
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
  readonly refusalReason: PccHbiRefusalReason;
}

export type UnifiedSearchAskHbiResponse = UnifiedSearchGroundedAnswer | UnifiedSearchRefusal;

// Compatibility exports from Prompt 1/2 names.
export type ProjectLifecycleEventType = PccProjectLifecycleEventType;
export type ProjectStageTransitionCheckpointStatus = PccProjectStageTransitionCheckpointStatus;
export type LifecycleGateSignalStatus = PccLifecycleGateSignalStatus;
export type ProjectTraceabilityEdgeType = PccTraceabilityEdgeType;
export type WarrantyTraceStatus = PccWarrantyTraceStatus;
export type LifecycleContextReference = PccLifecycleContextReference;
export type ProjectStageTransitionCheckpoint = PccProjectStageTransitionCheckpoint;
export type LifecycleGateSignal = PccLifecycleGateSignal;
export type ProjectLifecycleEvent = PccProjectLifecycleEvent;
export type ProjectMemoryRecord = PccProjectMemoryRecord;
export type ProjectDecisionRecord = PccProjectDecisionRecord;
export type ProjectAssumptionRecord = PccProjectAssumptionRecord;
export type ProjectStageLens = PccProjectStageLens;
export type ProjectTraceabilityEdge = PccProjectTraceabilityEdge;
export type WarrantyTraceRecord = PccWarrantyTraceRecord;
export type CrossProjectReference = PccCrossProjectReference;
export type ProjectKnowledgeReference = PccProjectKnowledgeReference;
