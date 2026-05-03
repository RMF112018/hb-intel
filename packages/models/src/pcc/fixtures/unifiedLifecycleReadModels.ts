import type { PccReadModelEnvelope } from '../PccReadModels.js';
import type {
  PccCrossProjectKnowledgeReadModel,
  PccProjectLensesReadModel,
  PccProjectLifecycleTimelineReadModel,
  PccProjectMemoryReadModel,
  PccProjectTraceabilityReadModel,
  PccUnifiedLifecycleReadModel,
  PccUnifiedSearchAskHbiReadModel,
  PccWarrantyTraceReadModel,
} from '../UnifiedLifecycleReadModels.js';
import type { PccProjectId } from '../types.js';
import {
  SAMPLE_CROSS_PROJECT_REFERENCE,
  SAMPLE_LIFECYCLE_CONTEXT_REFERENCE,
  SAMPLE_LIFECYCLE_GATE_SIGNAL,
  SAMPLE_PROJECT_ASSUMPTION_RECORD,
  SAMPLE_PROJECT_DECISION_RECORD,
  SAMPLE_PROJECT_KNOWLEDGE_REFERENCE,
  SAMPLE_PROJECT_LIFECYCLE_EVENT,
  SAMPLE_PROJECT_MEMORY_RECORD,
  SAMPLE_PROJECT_STAGE_LENS,
  SAMPLE_STAGE_TRANSITION_CHECKPOINT,
  SAMPLE_UNIFIED_SEARCH_GROUNDED_RESPONSE,
  SAMPLE_UNIFIED_SEARCH_REFUSAL_RESPONSE,
  SAMPLE_WARRANTY_TRACE_RECORD,
} from './unifiedLifecycle.js';

const PROJECT_ID = 'p-ul-1001' as PccProjectId;

export const SAMPLE_PROJECT_LIFECYCLE_TIMELINE_READ_MODEL: PccProjectLifecycleTimelineReadModel = {
  events: [SAMPLE_PROJECT_LIFECYCLE_EVENT],
  checkpoints: [SAMPLE_STAGE_TRANSITION_CHECKPOINT],
  gateSignals: [SAMPLE_LIFECYCLE_GATE_SIGNAL],
  contextReferences: [SAMPLE_LIFECYCLE_CONTEXT_REFERENCE],
};

export const SAMPLE_PROJECT_MEMORY_READ_MODEL: PccProjectMemoryReadModel = {
  records: [SAMPLE_PROJECT_MEMORY_RECORD, SAMPLE_PROJECT_DECISION_RECORD, SAMPLE_PROJECT_ASSUMPTION_RECORD],
  decisions: [SAMPLE_PROJECT_DECISION_RECORD],
  assumptions: [SAMPLE_PROJECT_ASSUMPTION_RECORD],
};

export const SAMPLE_PROJECT_LENSES_READ_MODEL: PccProjectLensesReadModel = {
  stageLenses: [SAMPLE_PROJECT_STAGE_LENS],
};

export const SAMPLE_PROJECT_TRACEABILITY_READ_MODEL: PccProjectTraceabilityReadModel = {
  edges: SAMPLE_PROJECT_LIFECYCLE_EVENT.traceabilityEdges,
  relatedLifecycleEvents: [SAMPLE_PROJECT_LIFECYCLE_EVENT],
  relatedMemoryRecords: [SAMPLE_PROJECT_DECISION_RECORD, SAMPLE_PROJECT_ASSUMPTION_RECORD],
};

export const SAMPLE_WARRANTY_TRACE_READ_MODEL: PccWarrantyTraceReadModel = {
  traces: [SAMPLE_WARRANTY_TRACE_RECORD],
};

export const SAMPLE_CROSS_PROJECT_KNOWLEDGE_READ_MODEL: PccCrossProjectKnowledgeReadModel = {
  crossProjectReferences: [SAMPLE_CROSS_PROJECT_REFERENCE],
  knowledgeReferences: [SAMPLE_PROJECT_KNOWLEDGE_REFERENCE],
};

export const SAMPLE_UNIFIED_SEARCH_ASK_HBI_READ_MODEL: PccUnifiedSearchAskHbiReadModel = {
  responses: [SAMPLE_UNIFIED_SEARCH_GROUNDED_RESPONSE, SAMPLE_UNIFIED_SEARCH_REFUSAL_RESPONSE],
};

export const SAMPLE_UNIFIED_LIFECYCLE_READ_MODEL: PccUnifiedLifecycleReadModel = {
  lifecycleTimeline: SAMPLE_PROJECT_LIFECYCLE_TIMELINE_READ_MODEL,
  projectMemory: SAMPLE_PROJECT_MEMORY_READ_MODEL,
  projectLenses: SAMPLE_PROJECT_LENSES_READ_MODEL,
  projectTraceability: SAMPLE_PROJECT_TRACEABILITY_READ_MODEL,
  warrantyTrace: SAMPLE_WARRANTY_TRACE_READ_MODEL,
  crossProjectKnowledge: SAMPLE_CROSS_PROJECT_KNOWLEDGE_READ_MODEL,
  unifiedSearch: SAMPLE_UNIFIED_SEARCH_ASK_HBI_READ_MODEL,
};

export const SAMPLE_UNIFIED_LIFECYCLE_ENVELOPE: PccReadModelEnvelope<PccUnifiedLifecycleReadModel> = {
  projectId: PROJECT_ID,
  mode: 'fixture',
  sourceStatus: 'available',
  readOnly: true,
  viewerPersona: 'project-manager',
  warnings: [],
  generatedAtUtc: '2026-05-03T12:00:00Z',
  data: SAMPLE_UNIFIED_LIFECYCLE_READ_MODEL,
};

export const SAMPLE_PROJECT_MEMORY_ENVELOPE: PccReadModelEnvelope<PccProjectMemoryReadModel> = {
  projectId: PROJECT_ID,
  mode: 'fixture',
  sourceStatus: 'available',
  readOnly: true,
  viewerPersona: 'project-manager',
  warnings: [],
  generatedAtUtc: '2026-05-03T12:00:00Z',
  data: SAMPLE_PROJECT_MEMORY_READ_MODEL,
};

export const SAMPLE_PROJECT_LENSES_ENVELOPE: PccReadModelEnvelope<PccProjectLensesReadModel> = {
  projectId: PROJECT_ID,
  mode: 'fixture',
  sourceStatus: 'available',
  readOnly: true,
  viewerPersona: 'project-executive',
  warnings: [],
  generatedAtUtc: '2026-05-03T12:00:00Z',
  data: SAMPLE_PROJECT_LENSES_READ_MODEL,
};

export const SAMPLE_PROJECT_TRACEABILITY_ENVELOPE: PccReadModelEnvelope<PccProjectTraceabilityReadModel> = {
  projectId: PROJECT_ID,
  mode: 'fixture',
  sourceStatus: 'available',
  readOnly: true,
  viewerPersona: 'project-manager',
  warnings: [],
  generatedAtUtc: '2026-05-03T12:00:00Z',
  data: SAMPLE_PROJECT_TRACEABILITY_READ_MODEL,
};

export const SAMPLE_WARRANTY_TRACE_ENVELOPE: PccReadModelEnvelope<PccWarrantyTraceReadModel> = {
  projectId: PROJECT_ID,
  mode: 'fixture',
  sourceStatus: 'available',
  readOnly: true,
  viewerPersona: 'project-manager',
  warnings: [],
  generatedAtUtc: '2026-05-03T12:00:00Z',
  data: SAMPLE_WARRANTY_TRACE_READ_MODEL,
};

export const SAMPLE_CROSS_PROJECT_KNOWLEDGE_ENVELOPE: PccReadModelEnvelope<PccCrossProjectKnowledgeReadModel> =
  {
    projectId: PROJECT_ID,
    mode: 'fixture',
    sourceStatus: 'available',
    readOnly: true,
    viewerPersona: 'project-executive',
    warnings: [],
    generatedAtUtc: '2026-05-03T12:00:00Z',
    data: SAMPLE_CROSS_PROJECT_KNOWLEDGE_READ_MODEL,
  };

export const SAMPLE_UNIFIED_SEARCH_ENVELOPE: PccReadModelEnvelope<PccUnifiedSearchAskHbiReadModel> = {
  projectId: PROJECT_ID,
  mode: 'fixture',
  sourceStatus: 'available',
  readOnly: true,
  viewerPersona: 'project-manager',
  warnings: [],
  generatedAtUtc: '2026-05-03T12:00:00Z',
  data: SAMPLE_UNIFIED_SEARCH_ASK_HBI_READ_MODEL,
};

export const SAMPLE_PROJECT_LIFECYCLE_TIMELINE_ENVELOPE: PccReadModelEnvelope<PccProjectLifecycleTimelineReadModel> =
  {
    projectId: PROJECT_ID,
    mode: 'fixture',
    sourceStatus: 'available',
    readOnly: true,
    viewerPersona: 'project-manager',
    warnings: [],
    generatedAtUtc: '2026-05-03T12:00:00Z',
    data: SAMPLE_PROJECT_LIFECYCLE_TIMELINE_READ_MODEL,
  };
