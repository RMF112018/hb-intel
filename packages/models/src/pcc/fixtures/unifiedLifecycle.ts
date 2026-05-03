import type {
  PccCrossProjectReference,
  PccLifecycleContextReference,
  PccLifecycleGateSignal,
  PccObligationTraceRecord,
  PccProjectAssumptionRecord,
  PccProjectDecisionRecord,
  PccProjectKnowledgeReference,
  PccProjectLifecycleEvent,
  PccProjectMemoryRecord,
  PccProjectStageLens,
  PccProjectStageTransitionCheckpoint,
  PccProjectTraceabilityEdge,
  PccRelatedRecordCluster,
  PccSecurityPosture,
  PccSourceLineageRef,
  PccTraceabilityGraphReadModel,
  PccVendorProductTraceRecord,
  PccWarrantyTraceRecord,
  UnifiedSearchAskHbiResponse,
  PccEvidenceLinkRef,
} from '../UnifiedLifecycle.js';
import type { PccProjectId } from '../types.js';

const SAMPLE_PROJECT_ID = 'p-ul-1001' as PccProjectId;
const SAMPLE_REFERENCE_PROJECT_ID = 'p-ul-2007' as PccProjectId;

const LINEAGE_SCOPE: PccSourceLineageRef = {
  sourceSystem: 'procore',
  sourceEntityType: 'scope-package',
  sourceRecordId: 'SCOPE-1001',
  sourceUrl: 'https://example.invalid/procore/scope/SCOPE-1001',
  capturedAtUtc: '2026-03-01T12:00:00Z',
};

const LINEAGE_ESTIMATE: PccSourceLineageRef = {
  sourceSystem: 'sage',
  sourceEntityType: 'estimate-line-item',
  sourceRecordId: 'EST-2001',
  sourceUrl: 'https://example.invalid/sage/estimate/EST-2001',
  capturedAtUtc: '2026-03-02T12:00:00Z',
};

const LINEAGE_SUBMITTAL: PccSourceLineageRef = {
  sourceSystem: 'sharepoint',
  sourceEntityType: 'submittal',
  sourceRecordId: 'SUB-5003',
  sourceUrl: 'https://example.invalid/sites/pcc/submittals/SUB-5003',
  capturedAtUtc: '2026-04-02T12:00:00Z',
};

const EVIDENCE_ESTIMATE: PccEvidenceLinkRef = {
  evidenceId: 'EVID-EST-2001',
  label: 'Estimate line item and qualifier notes',
  sourceLineage: LINEAGE_ESTIMATE,
  required: true,
};

const EVIDENCE_INSTALL: PccEvidenceLinkRef = {
  evidenceId: 'EVID-INSP-3001',
  label: 'Installation and inspection packet',
  sourceLineage: {
    sourceSystem: 'procore',
    sourceEntityType: 'inspection',
    sourceRecordId: 'INSP-3001',
    sourceUrl: 'https://example.invalid/procore/inspection/INSP-3001',
    capturedAtUtc: '2026-05-01T09:00:00Z',
  },
  required: true,
};

const EVIDENCE_WARRANTY: PccEvidenceLinkRef = {
  evidenceId: 'EVID-WARR-TERM-1',
  label: 'Warranty term excerpt and turnover signoff',
  sourceLineage: {
    sourceSystem: 'sharepoint',
    sourceEntityType: 'closeout-document',
    sourceRecordId: 'CLOSE-9001',
    sourceUrl: 'https://example.invalid/sites/pcc/closeout/CLOSE-9001',
    capturedAtUtc: '2026-05-02T11:00:00Z',
  },
  required: true,
};

const SECURITY_STANDARD: PccSecurityPosture = {
  classification: 'project-internal',
  allowedPersonas: ['project-manager', 'project-accounting', 'superintendent'],
  redactionLevel: 'none',
  crossProjectAllowed: false,
};

const SECURITY_EXEC: PccSecurityPosture = {
  classification: 'restricted',
  allowedPersonas: ['project-executive', 'executive-oversight'],
  redactionLevel: 'masked',
  crossProjectAllowed: false,
};

const SECURITY_EXEC_NOTE: PccSecurityPosture = {
  classification: 'restricted',
  allowedPersonas: ['project-executive', 'executive-oversight', 'pcc-admin'],
  redactionLevel: 'masked',
  crossProjectAllowed: false,
};

const SECURITY_PURSUIT_NOTE: PccSecurityPosture = {
  classification: 'need-to-know',
  allowedPersonas: [
    'estimating-coordinator',
    'lead-estimator',
    'estimator',
    'chief-estimator',
    'director-of-preconstruction',
  ],
  redactionLevel: 'masked',
  crossProjectAllowed: false,
};

export const SAMPLE_LIFECYCLE_CONTEXT_REFERENCE: PccLifecycleContextReference = {
  contextId: 'CTX-1001',
  lifecycleStage: 'closeout',
  projectStage: 'closeout',
  workCenterId: 'closeout-warranty',
  workflowModuleId: 'closeout-turnover',
  ownershipPosture: 'source-system-reference',
  sourceLineage: LINEAGE_SCOPE,
  security: SECURITY_STANDARD,
};

export const SAMPLE_LIFECYCLE_GATE_SIGNAL: PccLifecycleGateSignal = {
  signalId: 'SIG-1001',
  gateId: 'turnover-ready',
  status: 'pass',
  rationale: 'Owner walkthrough accepted with no unresolved blockers.',
  evidenceLinks: [EVIDENCE_WARRANTY],
};

export const SAMPLE_STAGE_TRANSITION_CHECKPOINT: PccProjectStageTransitionCheckpoint = {
  checkpointId: 'CP-1001',
  lifecycleStage: 'closeout',
  projectStage: 'closeout',
  status: 'ready-for-review',
  ownerPersona: 'project-manager',
  dueAtUtc: '2026-05-01T17:00:00Z',
  gateSignals: [SAMPLE_LIFECYCLE_GATE_SIGNAL],
};

export const SAMPLE_PROJECT_LIFECYCLE_EVENTS: readonly PccProjectLifecycleEvent[] = [
  {
    eventId: 'LCE-1000',
    projectId: SAMPLE_PROJECT_ID,
    eventType: 'stage-transition',
    status: 'accepted',
    lifecycleStage: 'pursuit-go-no-go',
    projectStage: 'lead',
    summary: 'Pursuit advanced after go/no-go decision.',
    recordedAtUtc: '2026-02-01T10:00:00Z',
    recordedByPersona: 'project-executive',
    contextReferences: [],
    traceabilityEdges: [],
    evidenceLinks: [EVIDENCE_ESTIMATE],
    ownershipPosture: 'source-system-reference',
    sourceLineage: LINEAGE_ESTIMATE,
    security: SECURITY_EXEC,
  },
  {
    eventId: 'LCE-1001',
    projectId: SAMPLE_PROJECT_ID,
    eventType: 'decision',
    status: 'accepted',
    lifecycleStage: 'estimating',
    projectStage: 'estimating',
    summary: 'Envelope option selected from alternate estimates.',
    recordedAtUtc: '2026-03-10T11:00:00Z',
    recordedByPersona: 'project-manager',
    contextReferences: [SAMPLE_LIFECYCLE_CONTEXT_REFERENCE],
    traceabilityEdges: [],
    evidenceLinks: [EVIDENCE_ESTIMATE],
    ownershipPosture: 'source-system-reference',
    sourceLineage: LINEAGE_ESTIMATE,
    security: SECURITY_STANDARD,
  },
  {
    eventId: 'LCE-1002',
    projectId: SAMPLE_PROJECT_ID,
    eventType: 'warranty-signal',
    status: 'active',
    lifecycleStage: 'warranty',
    projectStage: 'warranty',
    summary: 'Warranty claim opened for facade leak pattern.',
    recordedAtUtc: '2026-06-01T09:30:00Z',
    recordedByPersona: 'project-manager',
    checkpointId: SAMPLE_STAGE_TRANSITION_CHECKPOINT.checkpointId,
    contextReferences: [SAMPLE_LIFECYCLE_CONTEXT_REFERENCE],
    traceabilityEdges: [],
    evidenceLinks: [EVIDENCE_INSTALL],
    ownershipPosture: 'source-system-reference',
    sourceLineage: LINEAGE_SUBMITTAL,
    security: SECURITY_STANDARD,
  },
];

export const SAMPLE_PROJECT_LIFECYCLE_EVENT = SAMPLE_PROJECT_LIFECYCLE_EVENTS[1]!;

export const SAMPLE_PROJECT_MEMORY_RECORD: PccProjectMemoryRecord = {
  memoryId: 'MEM-1001',
  projectId: SAMPLE_PROJECT_ID,
  recordType: 'lesson-learned',
  status: 'validated',
  summary: 'Closeout handoff posture stabilized after final punch completion.',
  lifecycleStage: 'closeout',
  projectStage: 'closeout',
  recordedAtUtc: '2026-05-01T18:05:00Z',
  authorPersona: 'project-manager',
  ownershipPosture: 'pcc-native',
  evidenceLinks: [EVIDENCE_WARRANTY],
  security: SECURITY_STANDARD,
};

export const SAMPLE_PROJECT_DECISION_RECORD: PccProjectDecisionRecord = {
  ...SAMPLE_PROJECT_MEMORY_RECORD,
  memoryId: 'DEC-1001',
  recordType: 'decision',
  decision: 'Proceed with Option B facade transition assembly.',
  impactStatement: 'Enables warranty period start with complete evidence package.',
};

export const SAMPLE_PROJECT_ASSUMPTION_RECORDS: readonly PccProjectAssumptionRecord[] = [
  {
    ...SAMPLE_PROJECT_MEMORY_RECORD,
    memoryId: 'ASM-OPEN',
    recordType: 'assumption',
    status: 'open',
    lifecycleStage: 'estimating',
    projectStage: 'estimating',
    assumption: 'Estimated install durations remain valid through mobilization.',
    validationPlan: 'Validate against first two weeks of production data.',
  },
  {
    ...SAMPLE_PROJECT_MEMORY_RECORD,
    memoryId: 'ASM-VAL',
    recordType: 'assumption',
    status: 'validated',
    lifecycleStage: 'active-construction',
    projectStage: 'active_construction',
    assumption: 'Facade sequencing can hold with planned crew mix.',
    validationPlan: 'Track weekly earned-value and productivity variance.',
  },
  {
    ...SAMPLE_PROJECT_MEMORY_RECORD,
    memoryId: 'ASM-INV',
    recordType: 'assumption',
    status: 'invalidated',
    lifecycleStage: 'active-construction',
    projectStage: 'active_construction',
    assumption: 'Zero weather delay in facade install windows.',
    validationPlan: 'Use weather-adjusted productivity baseline.',
  },
  {
    ...SAMPLE_PROJECT_MEMORY_RECORD,
    memoryId: 'ASM-SUP',
    recordType: 'assumption',
    status: 'superseded',
    lifecycleStage: 'preconstruction',
    projectStage: 'preconstruction',
    assumption: 'Original product lead time holds from bid day.',
    validationPlan: 'Superseded by approved substitution timeline.',
  },
  {
    ...SAMPLE_PROJECT_MEMORY_RECORD,
    memoryId: 'ASM-CTA',
    recordType: 'assumption',
    status: 'converted-to-action',
    lifecycleStage: 'active-construction',
    projectStage: 'active_construction',
    assumption: 'Inspection hold points are still acceptable as planned.',
    validationPlan: 'Converted to action: increase onsite QA review cadence.',
  },
];

export const SAMPLE_PROJECT_ASSUMPTION_RECORD = SAMPLE_PROJECT_ASSUMPTION_RECORDS[0]!;

export const SAMPLE_EXECUTIVE_NOTE_RECORD: PccProjectMemoryRecord = {
  memoryId: 'MEM-EXEC-1001',
  projectId: SAMPLE_PROJECT_ID,
  recordType: 'executive-note',
  status: 'open',
  summary: 'Executive context note for closeout posture review.',
  lifecycleStage: 'closeout',
  projectStage: 'closeout',
  recordedAtUtc: '2026-05-04T08:00:00Z',
  authorPersona: 'project-executive',
  ownershipPosture: 'pcc-native',
  evidenceLinks: [EVIDENCE_WARRANTY],
  security: SECURITY_EXEC_NOTE,
};

export const SAMPLE_PURSUIT_NOTE_RECORD: PccProjectMemoryRecord = {
  memoryId: 'MEM-PURSUIT-1001',
  projectId: SAMPLE_PROJECT_ID,
  recordType: 'pursuit-note',
  status: 'open',
  summary: 'Pursuit assumption note tied to estimating handoff.',
  lifecycleStage: 'estimating',
  projectStage: 'estimating',
  recordedAtUtc: '2026-02-15T10:30:00Z',
  authorPersona: 'lead-estimator',
  ownershipPosture: 'pcc-native',
  evidenceLinks: [EVIDENCE_ESTIMATE],
  security: SECURITY_PURSUIT_NOTE,
};

export const SAMPLE_PROJECT_STAGE_LENS: PccProjectStageLens = {
  lensId: 'LENS-1001',
  lensType: 'operations',
  visibilityMode: 'active-work',
  lifecycleStage: 'active-construction',
  projectStage: 'active_construction',
  role: 'project-manager',
  taskFocus: ['cost controls', 'quality verification', 'handoff continuity'],
  includedMemoryIds: [
    SAMPLE_PROJECT_MEMORY_RECORD.memoryId,
    SAMPLE_PROJECT_DECISION_RECORD.memoryId,
  ],
  includedEventIds: SAMPLE_PROJECT_LIFECYCLE_EVENTS.map((e) => e.eventId),
  includedTraceEdgeIds: ['TRACE-EST-1', 'TRACE-WARR-1'],
};

export const SAMPLE_PROJECT_TRACEABILITY_EDGES: readonly PccProjectTraceabilityEdge[] = [
  {
    edgeId: 'TRACE-EST-1',
    edgeType: 'derived-from',
    direction: 'forward',
    fromRecordId: 'EST-2001',
    fromRecordType: 'estimate-line-item',
    toRecordId: 'COM-7002',
    toRecordType: 'commitment',
    rationale: 'Commitment issued from approved estimate package.',
    confidence: 'verified',
    sourceLineage: LINEAGE_ESTIMATE,
  },
  {
    edgeId: 'TRACE-WARR-1',
    edgeType: 'warranted-by',
    direction: 'backward',
    fromRecordId: 'WARR-CLM-3001',
    fromRecordType: 'warranty-claim',
    toRecordId: 'CLOSE-9001',
    toRecordType: 'closeout-document',
    rationale: 'Claim references turnover warranty documents.',
    confidence: 'high',
    sourceLineage: LINEAGE_SUBMITTAL,
  },
];

export const SAMPLE_RELATED_RECORD_CLUSTER: PccRelatedRecordCluster = {
  clusterId: 'CLUSTER-1001',
  rootRecordId: 'WARR-CLM-3001',
  rootRecordType: 'warranty-claim',
  relatedRecordIds: ['EST-2001', 'COM-7002', 'SUB-5003', 'CLOSE-9001'],
  edgeIds: SAMPLE_PROJECT_TRACEABILITY_EDGES.map((e) => e.edgeId),
};

export const SAMPLE_TRACEABILITY_GRAPH_READ_MODEL: PccTraceabilityGraphReadModel = {
  edges: SAMPLE_PROJECT_TRACEABILITY_EDGES,
  clusters: [SAMPLE_RELATED_RECORD_CLUSTER],
};

export const SAMPLE_OBLIGATION_TRACE_RECORD: PccObligationTraceRecord = {
  obligationTraceId: 'OBL-1001',
  projectId: SAMPLE_PROJECT_ID,
  scopeReferenceRecordId: 'SCOPE-1001',
  estimateReferenceRecordId: 'EST-2001',
  commitmentRecordId: 'COM-7002',
  warrantyTermSummary: '5-year envelope water-intrusion remediation obligation.',
  sourceLineage: [LINEAGE_SCOPE, LINEAGE_ESTIMATE],
  evidenceLinks: [EVIDENCE_ESTIMATE, EVIDENCE_WARRANTY],
  security: SECURITY_STANDARD,
};

export const SAMPLE_VENDOR_PRODUCT_TRACE_RECORD: PccVendorProductTraceRecord = {
  vendorProductTraceId: 'VPT-1001',
  projectId: SAMPLE_PROJECT_ID,
  vendorRecordId: 'VEN-112',
  subcontractorRecordId: 'SUBC-224',
  productMaterialRecordId: 'MAT-778',
  submittalRecordId: 'SUB-5003',
  closeoutRecordId: 'CLOSE-9001',
  installationInspectionRecordIds: ['INSP-3001'],
  sourceLineage: [LINEAGE_SUBMITTAL],
  evidenceLinks: [EVIDENCE_INSTALL, EVIDENCE_WARRANTY],
  security: SECURITY_STANDARD,
};

export const SAMPLE_WARRANTY_TRACE_RECORD: PccWarrantyTraceRecord = {
  warrantyTraceId: 'WAR-1001',
  projectId: SAMPLE_PROJECT_ID,
  status: 'responsibility-recommended',
  issueSummary: 'Facade leak observed after turnover in unit stack B.',
  estimateReferenceRecordId: 'EST-2001',
  scopeReferenceRecordId: 'SCOPE-1001',
  obligationTrace: SAMPLE_OBLIGATION_TRACE_RECORD,
  vendorProductTrace: SAMPLE_VENDOR_PRODUCT_TRACE_RECORD,
  relatedLifecycleEventIds: ['LCE-1002'],
  relatedMemoryIds: [
    SAMPLE_PROJECT_DECISION_RECORD.memoryId,
    SAMPLE_PROJECT_ASSUMPTION_RECORD.memoryId,
  ],
  traceabilityEdges: SAMPLE_PROJECT_TRACEABILITY_EDGES,
  evidenceLinks: [EVIDENCE_INSTALL, EVIDENCE_WARRANTY],
  recommendation: {
    recommendedResponsibleRecordId: 'SUBC-224',
    recommendedResponsibleType: 'subcontractor',
    confidence: 'high',
    evidenceLinkIds: [EVIDENCE_INSTALL.evidenceId, EVIDENCE_WARRANTY.evidenceId],
  },
  security: SECURITY_STANDARD,
};

export const SAMPLE_WARRANTY_TRACE_INSUFFICIENT_EVIDENCE_RECORD: PccWarrantyTraceRecord = {
  ...SAMPLE_WARRANTY_TRACE_RECORD,
  warrantyTraceId: 'WAR-1002',
  status: 'insufficient-evidence',
  issueSummary: 'Intermittent moisture noted with no verified install sequence lineage.',
  recommendation: undefined,
  evidenceLinks: [EVIDENCE_WARRANTY],
};

export const SAMPLE_CROSS_PROJECT_REFERENCE: PccCrossProjectReference = {
  referenceId: 'XREF-1001',
  fromProjectId: SAMPLE_PROJECT_ID,
  toProjectId: SAMPLE_REFERENCE_PROJECT_ID,
  reason: 'Compare warranty remediation strategy with a similar envelope condition.',
  classification: 'cross-project',
  referenceType: 'warranty-pattern',
  status: 'approved',
  eligibleLensTypes: ['warranty', 'future-pursuit-reference'],
  sourceLineage: LINEAGE_SCOPE,
  security: {
    ...SECURITY_STANDARD,
    classification: 'need-to-know',
    redactionLevel: 'masked',
    crossProjectAllowed: true,
  },
};

export const SAMPLE_RESTRICTED_CROSS_PROJECT_REFERENCE: PccCrossProjectReference = {
  ...SAMPLE_CROSS_PROJECT_REFERENCE,
  referenceId: 'XREF-1002',
  status: 'restricted',
  security: {
    ...SAMPLE_CROSS_PROJECT_REFERENCE.security,
    redactionLevel: 'withheld',
  },
};

export const SAMPLE_PROJECT_KNOWLEDGE_REFERENCE: PccProjectKnowledgeReference = {
  knowledgeId: 'KNW-1001',
  projectId: SAMPLE_PROJECT_ID,
  referenceType: 'lesson-learned',
  title: 'Facade transition sealant lessons',
  summary: 'Capture turnover-to-warranty sealant verification requirements.',
  tags: ['warranty', 'closeout', 'facade'],
  relatedCrossProjectReferences: [
    SAMPLE_CROSS_PROJECT_REFERENCE,
    SAMPLE_RESTRICTED_CROSS_PROJECT_REFERENCE,
  ],
  sourceLineage: [LINEAGE_SCOPE, LINEAGE_SUBMITTAL],
  security: SAMPLE_CROSS_PROJECT_REFERENCE.security,
};

export const SAMPLE_FUTURE_PURSUIT_KNOWLEDGE_REFERENCE: PccProjectKnowledgeReference = {
  ...SAMPLE_PROJECT_KNOWLEDGE_REFERENCE,
  knowledgeId: 'KNW-2001',
  referenceType: 'pursuit-reference',
  title: 'Closed project envelope warranty pattern for future pursuits',
  summary: 'Use closed-project leak root-cause pattern in pursuit risk screening.',
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
      sourceLineage: LINEAGE_SUBMITTAL,
      evidenceLinkId: EVIDENCE_WARRANTY.evidenceId,
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
  refusalReason: 'insufficient-evidence',
};
