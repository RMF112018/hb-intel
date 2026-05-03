import type {
  CrossProjectReference,
  LifecycleContextReference,
  LifecycleGateSignal,
  PccEvidenceLinkRef,
  PccSecurityPosture,
  PccSourceLineageRef,
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
} from '../UnifiedLifecycle.js';
import type { PccProjectId } from '../types.js';

const SAMPLE_PROJECT_ID = 'p-ul-1001' as PccProjectId;
const SAMPLE_REFERENCE_PROJECT_ID = 'p-ul-2007' as PccProjectId;

const SAMPLE_SOURCE_LINEAGE: PccSourceLineageRef = {
  sourceSystem: 'sharepoint',
  sourceEntityType: 'list-item',
  sourceRecordId: 'SRC-1001',
  sourceUrl: 'https://example.invalid/sites/pcc/records/SRC-1001',
  capturedAtUtc: '2026-04-01T14:00:00Z',
};

const SAMPLE_EVIDENCE: PccEvidenceLinkRef = {
  evidenceId: 'EVID-1001',
  label: 'Closeout checklist sign-off',
  sourceLineage: SAMPLE_SOURCE_LINEAGE,
  required: true,
};

const SAMPLE_SECURITY: PccSecurityPosture = {
  classification: 'project-internal',
  allowedPersonas: ['project-manager', 'project-executive', 'project-accounting'],
  redactionLevel: 'none',
  crossProjectAllowed: false,
};

const SAMPLE_EDGE: ProjectTraceabilityEdge = {
  edgeId: 'TRACE-1001',
  edgeType: 'supported-by',
  fromRecordId: 'DEC-1001',
  toRecordId: 'EVID-1001',
  rationale: 'Decision is justified by signed evidence.',
  sourceLineage: SAMPLE_SOURCE_LINEAGE,
};

export const SAMPLE_LIFECYCLE_CONTEXT_REFERENCE: LifecycleContextReference = {
  contextId: 'CTX-1001',
  stage: 'closeout',
  workCenterId: 'closeout-warranty',
  workflowModuleId: 'closeout-turnover',
  sourceLineage: SAMPLE_SOURCE_LINEAGE,
  security: SAMPLE_SECURITY,
};

export const SAMPLE_LIFECYCLE_GATE_SIGNAL: LifecycleGateSignal = {
  signalId: 'SIG-1001',
  gateId: 'turnover-ready',
  status: 'pass',
  rationale: 'Owner walkthrough accepted with no unresolved blockers.',
  evidenceLinks: [SAMPLE_EVIDENCE],
};

export const SAMPLE_STAGE_TRANSITION_CHECKPOINT: ProjectStageTransitionCheckpoint = {
  checkpointId: 'CP-1001',
  stage: 'closeout',
  status: 'ready-for-review',
  ownerPersona: 'project-manager',
  dueAtUtc: '2026-05-01T17:00:00Z',
  gateSignals: [SAMPLE_LIFECYCLE_GATE_SIGNAL],
};

export const SAMPLE_PROJECT_LIFECYCLE_EVENT: ProjectLifecycleEvent = {
  eventId: 'LCE-1001',
  projectId: SAMPLE_PROJECT_ID,
  eventType: 'checkpoint-closed',
  stage: 'closeout',
  recordedAtUtc: '2026-05-01T18:00:00Z',
  recordedByPersona: 'project-manager',
  checkpointId: SAMPLE_STAGE_TRANSITION_CHECKPOINT.checkpointId,
  contextReferences: [SAMPLE_LIFECYCLE_CONTEXT_REFERENCE],
  traceabilityEdges: [SAMPLE_EDGE],
  evidenceLinks: [SAMPLE_EVIDENCE],
  security: SAMPLE_SECURITY,
};

export const SAMPLE_PROJECT_MEMORY_RECORD: ProjectMemoryRecord = {
  memoryId: 'MEM-1001',
  projectId: SAMPLE_PROJECT_ID,
  summary: 'Closeout handoff posture stabilized after final punch completion.',
  stage: 'closeout',
  recordedAtUtc: '2026-05-01T18:05:00Z',
  authorPersona: 'project-manager',
  sourceLineage: SAMPLE_SOURCE_LINEAGE,
  evidenceLinks: [SAMPLE_EVIDENCE],
  security: SAMPLE_SECURITY,
};

export const SAMPLE_PROJECT_DECISION_RECORD: ProjectDecisionRecord = {
  ...SAMPLE_PROJECT_MEMORY_RECORD,
  memoryId: 'DEC-1001',
  memoryKind: 'decision',
  decision: 'Proceed to turnover documentation release.',
  impactStatement: 'Enables warranty period start with complete evidence package.',
};

export const SAMPLE_PROJECT_ASSUMPTION_RECORD: ProjectAssumptionRecord = {
  ...SAMPLE_PROJECT_MEMORY_RECORD,
  memoryId: 'ASM-1001',
  memoryKind: 'assumption',
  assumption: 'Final owner approvals will remain valid through certificate issuance.',
  validationPlan: 'Reconfirm approvals before warranty walk kickoff.',
  targetValidationAtUtc: '2026-05-10T15:00:00Z',
};

export const SAMPLE_PROJECT_STAGE_LENS: ProjectStageLens = {
  lensId: 'LENS-1001',
  stage: 'closeout',
  role: 'project-manager',
  taskFocus: ['turnover package', 'warranty kickoff', 'evidence completeness'],
  includedMemoryIds: [SAMPLE_PROJECT_MEMORY_RECORD.memoryId, SAMPLE_PROJECT_DECISION_RECORD.memoryId],
  includedEventIds: [SAMPLE_PROJECT_LIFECYCLE_EVENT.eventId],
  includedTraceEdgeIds: [SAMPLE_EDGE.edgeId],
};

export const SAMPLE_WARRANTY_TRACE_RECORD: WarrantyTraceRecord = {
  warrantyTraceId: 'WAR-1001',
  projectId: SAMPLE_PROJECT_ID,
  status: 'investigating',
  issueSummary: 'Facade leak observed after turnover in unit stack B.',
  relatedLifecycleEventIds: [SAMPLE_PROJECT_LIFECYCLE_EVENT.eventId],
  relatedMemoryIds: [SAMPLE_PROJECT_DECISION_RECORD.memoryId, SAMPLE_PROJECT_ASSUMPTION_RECORD.memoryId],
  traceabilityEdges: [SAMPLE_EDGE],
  evidenceLinks: [SAMPLE_EVIDENCE],
  security: SAMPLE_SECURITY,
};

export const SAMPLE_CROSS_PROJECT_REFERENCE: CrossProjectReference = {
  referenceId: 'XREF-1001',
  fromProjectId: SAMPLE_PROJECT_ID,
  toProjectId: SAMPLE_REFERENCE_PROJECT_ID,
  reason: 'Compare warranty remediation strategy with a similar envelope condition.',
  classification: 'cross-project',
  sourceLineage: SAMPLE_SOURCE_LINEAGE,
  security: {
    ...SAMPLE_SECURITY,
    classification: 'need-to-know',
    crossProjectAllowed: true,
  },
};

export const SAMPLE_PROJECT_KNOWLEDGE_REFERENCE: ProjectKnowledgeReference = {
  knowledgeId: 'KNW-1001',
  projectId: SAMPLE_PROJECT_ID,
  title: 'Facade transition sealant lessons',
  summary: 'Capture turnover-to-warranty sealant verification requirements.',
  tags: ['warranty', 'closeout', 'facade'],
  relatedCrossProjectReferences: [SAMPLE_CROSS_PROJECT_REFERENCE],
  sourceLineage: [SAMPLE_SOURCE_LINEAGE],
  security: SAMPLE_CROSS_PROJECT_REFERENCE.security,
};

export const SAMPLE_UNIFIED_SEARCH_GROUNDED_RESPONSE: UnifiedSearchAskHbiResponse = {
  answerId: 'ASK-1001',
  query: 'What evidence supports warranty readiness for facade transitions?',
  response:
    'Warranty readiness is supported by closeout sign-off evidence and lifecycle checkpoint closure.',
  grounded: true,
  citations: [
    {
      citationId: 'CIT-1001',
      recordType: 'warranty-trace',
      recordId: SAMPLE_WARRANTY_TRACE_RECORD.warrantyTraceId,
      sourceLineage: SAMPLE_SOURCE_LINEAGE,
      evidenceLinkId: SAMPLE_EVIDENCE.evidenceId,
      excerpt: 'Closeout checklist sign-off confirms turnover evidence completeness.',
    },
  ],
  refused: false,
};

export const SAMPLE_UNIFIED_SEARCH_REFUSAL_RESPONSE: UnifiedSearchAskHbiResponse = {
  answerId: 'ASK-1002',
  query: 'Who should I blame for this claim?',
  response: 'Unable to answer without grounded and permission-allowed source lineage.',
  grounded: false,
  citations: [],
  refused: true,
  refusalReason: 'missing-grounded-lineage',
};
