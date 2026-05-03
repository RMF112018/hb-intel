/**
 * Unified Lifecycle adapter seam — shared internal mappers.
 *
 * SHARED ADAPTER SEAM. NOT A ROUTED SURFACE.
 * Pure mappers consumed by the leaf adapters in this directory only.
 * No React, no client, no fetch.
 */

import type {
  PccCrossProjectReference,
  PccLifecycleGateSignal,
  PccProjectAssumptionRecord,
  PccProjectDecisionRecord,
  PccProjectKnowledgeReference,
  PccProjectLifecycleEvent,
  PccProjectMemoryRecord,
  PccProjectStageTransitionCheckpoint,
  PccProjectTraceabilityEdge,
  PccReadModelEnvelope,
  PccRelatedRecordCluster,
  PccSecurityPosture,
  PccWarrantyTraceRecord,
} from '@hbc/models/pcc';

import { toUnifiedLifecycleCardState } from './unifiedLifecycleCardState.js';
import type {
  IPccAssumptionVm,
  IPccCheckpointVm,
  IPccCrossProjectReferenceVm,
  IPccDecisionVm,
  IPccGateSignalVm,
  IPccKnowledgeReferenceVm,
  IPccLifecycleEventVm,
  IPccLifecyclePostureView,
  IPccMemoryNoteVm,
  IPccMemoryRecordVm,
  IPccRedactionView,
  IPccRelatedRecordClusterVm,
  IPccTraceabilityEdgeVm,
  IPccWarrantyTraceRowVm,
} from './unifiedLifecycleViewModel.js';

export function buildRedactionView(security: PccSecurityPosture): IPccRedactionView {
  return {
    classification: security.classification,
    redactionLevel: security.redactionLevel,
    redacted: security.redactionLevel === 'masked',
    withheld: security.redactionLevel === 'withheld',
    crossProjectAllowed: security.crossProjectAllowed,
    allowedPersonas: security.allowedPersonas,
  };
}

export function buildPosture<T>(
  envelope: PccReadModelEnvelope<T>,
): IPccLifecyclePostureView {
  return {
    sourceStatus: envelope.sourceStatus,
    cardState: toUnifiedLifecycleCardState(envelope.sourceStatus),
    projectId: envelope.projectId,
    viewerPersona: envelope.viewerPersona,
    generatedAtUtc: envelope.generatedAtUtc,
  };
}

export function mapTraceabilityEdge(edge: PccProjectTraceabilityEdge): IPccTraceabilityEdgeVm {
  return {
    edgeId: edge.edgeId,
    edgeType: edge.edgeType,
    direction: edge.direction,
    fromRecordId: edge.fromRecordId,
    fromRecordType: edge.fromRecordType,
    toRecordId: edge.toRecordId,
    toRecordType: edge.toRecordType,
    rationale: edge.rationale,
    confidence: edge.confidence,
    sourceLineage: edge.sourceLineage,
  };
}

export function mapRelatedRecordCluster(
  cluster: PccRelatedRecordCluster,
): IPccRelatedRecordClusterVm {
  return {
    clusterId: cluster.clusterId,
    rootRecordId: cluster.rootRecordId,
    rootRecordType: cluster.rootRecordType,
    relatedRecordIds: cluster.relatedRecordIds,
    edgeIds: cluster.edgeIds,
  };
}

export function mapLifecycleEvent(event: PccProjectLifecycleEvent): IPccLifecycleEventVm {
  return {
    eventId: event.eventId,
    projectId: event.projectId,
    eventType: event.eventType,
    status: event.status,
    lifecycleStage: event.lifecycleStage,
    projectStage: event.projectStage,
    summary: event.summary,
    recordedAtUtc: event.recordedAtUtc,
    recordedByPersona: event.recordedByPersona,
    checkpointId: event.checkpointId,
    evidenceLinks: event.evidenceLinks,
    contextReferences: event.contextReferences,
    traceabilityEdges: event.traceabilityEdges,
    sourceLineage: event.sourceLineage,
    redaction: buildRedactionView(event.security),
  };
}

export function mapCheckpoint(
  checkpoint: PccProjectStageTransitionCheckpoint,
): IPccCheckpointVm {
  return {
    checkpointId: checkpoint.checkpointId,
    lifecycleStage: checkpoint.lifecycleStage,
    projectStage: checkpoint.projectStage,
    status: checkpoint.status,
    ownerPersona: checkpoint.ownerPersona,
    dueAtUtc: checkpoint.dueAtUtc,
    gateSignals: checkpoint.gateSignals.map(mapGateSignal),
  };
}

export function mapGateSignal(signal: PccLifecycleGateSignal): IPccGateSignalVm {
  return {
    signalId: signal.signalId,
    gateId: signal.gateId,
    status: signal.status,
    rationale: signal.rationale,
    evidenceLinks: signal.evidenceLinks,
  };
}

function mapMemoryBase(
  record: PccProjectMemoryRecord,
): Omit<IPccMemoryNoteVm, 'recordType'> {
  return {
    memoryId: record.memoryId,
    projectId: record.projectId,
    status: record.status,
    summary: record.summary,
    lifecycleStage: record.lifecycleStage,
    projectStage: record.projectStage,
    recordedAtUtc: record.recordedAtUtc,
    authorPersona: record.authorPersona,
    evidenceLinks: record.evidenceLinks,
    sourceLineage: record.sourceLineage,
    redaction: buildRedactionView(record.security),
  };
}

export function mapMemoryRecord(record: PccProjectMemoryRecord): IPccMemoryRecordVm {
  if (record.recordType === 'decision') {
    const decision = record as PccProjectDecisionRecord;
    return {
      ...mapMemoryBase(record),
      recordType: 'decision',
      decision: decision.decision,
      impactStatement: decision.impactStatement,
    };
  }
  if (record.recordType === 'assumption') {
    const assumption = record as PccProjectAssumptionRecord;
    return {
      ...mapMemoryBase(record),
      recordType: 'assumption',
      assumption: assumption.assumption,
      validationPlan: assumption.validationPlan,
      targetValidationAtUtc: assumption.targetValidationAtUtc,
    };
  }
  return {
    ...mapMemoryBase(record),
    recordType: record.recordType as Exclude<
      PccProjectMemoryRecord['recordType'],
      'decision' | 'assumption'
    >,
  };
}

export function mapDecision(record: PccProjectDecisionRecord): IPccDecisionVm {
  return {
    ...mapMemoryBase(record),
    recordType: 'decision',
    decision: record.decision,
    impactStatement: record.impactStatement,
  };
}

export function mapAssumption(record: PccProjectAssumptionRecord): IPccAssumptionVm {
  return {
    ...mapMemoryBase(record),
    recordType: 'assumption',
    assumption: record.assumption,
    validationPlan: record.validationPlan,
    targetValidationAtUtc: record.targetValidationAtUtc,
  };
}

const UNRESOLVED_WARRANTY_STATUSES: readonly PccWarrantyTraceRecord['status'][] = [
  'insufficient-evidence',
  'unresolved-responsibility',
  'pending-evidence',
];

export function mapWarrantyTraceRow(record: PccWarrantyTraceRecord): IPccWarrantyTraceRowVm {
  return {
    warrantyTraceId: record.warrantyTraceId,
    projectId: record.projectId,
    status: record.status,
    issueSummary: record.issueSummary,
    estimateReferenceRecordId: record.estimateReferenceRecordId,
    scopeReferenceRecordId: record.scopeReferenceRecordId,
    relatedLifecycleEventIds: record.relatedLifecycleEventIds,
    relatedMemoryIds: record.relatedMemoryIds,
    traceabilityEdges: record.traceabilityEdges.map(mapTraceabilityEdge),
    evidenceLinks: record.evidenceLinks,
    recommendation: record.recommendation,
    redaction: buildRedactionView(record.security),
    isUnresolved: UNRESOLVED_WARRANTY_STATUSES.includes(record.status),
  };
}

export function mapCrossProjectReference(
  ref: PccCrossProjectReference,
): IPccCrossProjectReferenceVm {
  return {
    referenceId: ref.referenceId,
    fromProjectId: ref.fromProjectId,
    toProjectId: ref.toProjectId,
    reason: ref.reason,
    classification: ref.classification,
    referenceType: ref.referenceType,
    status: ref.status,
    eligibleLensTypes: ref.eligibleLensTypes,
    sourceLineage: ref.sourceLineage,
    redaction: buildRedactionView(ref.security),
  };
}

export function mapKnowledgeReference(
  ref: PccProjectKnowledgeReference,
): IPccKnowledgeReferenceVm {
  return {
    knowledgeId: ref.knowledgeId,
    projectId: ref.projectId,
    referenceType: ref.referenceType,
    title: ref.title,
    summary: ref.summary,
    tags: ref.tags,
    relatedCrossProjectReferences: ref.relatedCrossProjectReferences.map(mapCrossProjectReference),
    sourceLineage: ref.sourceLineage,
    redaction: buildRedactionView(ref.security),
  };
}
