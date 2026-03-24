/**
 * P3-E7-T05 Permits Workflow and Downstream Surfaces constants.
 */

import type {
  PermitActivityEventType,
  PermitAnnotatableRecordType,
  PermitHandoffScenario,
  PermitRelationshipType,
  PermitWorkQueueRuleId,
} from './enums.js';
import type {
  IPermitActivityEventConfig,
  IPermitAnnotationScope,
  IPermitBicNextMovePrompt,
  IPermitHandoffConfig,
  IPermitHealthMetricConfig,
  IPermitRelatedItemConfig,
  IPermitWorkQueueRuleConfig,
} from './types.js';

export const WORKFLOW_SCOPE = 'permits/workflow' as const;

// ── Enum Arrays ─────────────────────────────────────────────────────

export const PERMIT_ACTIVITY_EVENT_TYPES = [
  'PERMIT_APPLICATION_SUBMITTED', 'PERMIT_APPLICATION_APPROVED', 'PERMIT_APPLICATION_REJECTED',
  'PERMIT_ISSUED', 'PERMIT_STATUS_CHANGED', 'STOP_WORK_ISSUED', 'STOP_WORK_LIFTED',
  'VIOLATION_ISSUED', 'INSPECTION_VISIT_RECORDED', 'INSPECTION_CHECKPOINT_PASSED',
  'INSPECTION_CHECKPOINT_FAILED', 'DEFICIENCY_OPENED', 'DEFICIENCY_RESOLVED', 'DEFICIENCY_VERIFIED',
  'REQUIRED_INSPECTIONS_GENERATED', 'REQUIRED_INSPECTIONS_IMPORTED',
  'PERMIT_EXPIRATION_WARNING', 'PERMIT_EXPIRED', 'PERMIT_RENEWED', 'PERMIT_CLOSED', 'EVIDENCE_UPLOADED',
] as const satisfies ReadonlyArray<PermitActivityEventType>;

export const PERMIT_WORK_QUEUE_RULE_IDS = [
  'WQ-PRM-01', 'WQ-PRM-02', 'WQ-PRM-03', 'WQ-PRM-04', 'WQ-PRM-05',
  'WQ-PRM-06', 'WQ-PRM-07', 'WQ-PRM-08', 'WQ-PRM-09', 'WQ-PRM-10',
  'WQ-PRM-11', 'WQ-PRM-12', 'WQ-PRM-13', 'WQ-PRM-14', 'WQ-PRM-15',
] as const satisfies ReadonlyArray<PermitWorkQueueRuleId>;

export const PERMIT_RELATIONSHIP_TYPES = [
  'PERMIT_GATES_MILESTONE', 'PERMIT_IS_CONSTRAINT', 'PERMIT_FEE_LINE',
  'INSPECTION_PRECEDES_MILESTONE', 'CHECKPOINT_GATES_MILESTONE',
] as const satisfies ReadonlyArray<PermitRelationshipType>;

export const PERMIT_HANDOFF_SCENARIOS = [
  'SubmittedToJurisdiction', 'JurisdictionReturnsForInfo', 'InspectionScheduled',
  'DeficiencyAssigned', 'ResolutionForVerification', 'StopWorkResponse',
] as const satisfies ReadonlyArray<PermitHandoffScenario>;

export const PERMIT_ANNOTATABLE_RECORD_TYPES = [
  'IssuedPermit', 'InspectionVisit', 'InspectionDeficiency', 'RequiredInspectionCheckpoint',
] as const satisfies ReadonlyArray<PermitAnnotatableRecordType>;

// ── Activity Events (§1) ────────────────────────────────────────────

export const PERMIT_ACTIVITY_EVENT_CONFIGS: ReadonlyArray<IPermitActivityEventConfig> = [
  { eventType: 'PERMIT_APPLICATION_SUBMITTED', trigger: 'applicationStatus → SUBMITTED', additionalPayloadFields: ['applicationId', 'permitType', 'jurisdictionName'] },
  { eventType: 'PERMIT_APPLICATION_APPROVED', trigger: 'applicationStatus → APPROVED', additionalPayloadFields: ['applicationId', 'issuedPermitId', 'permitType'] },
  { eventType: 'PERMIT_APPLICATION_REJECTED', trigger: 'applicationStatus → REJECTED', additionalPayloadFields: ['applicationId', 'rejectionReason'] },
  { eventType: 'PERMIT_ISSUED', trigger: 'PermitLifecycleAction(ISSUED)', additionalPayloadFields: ['issuedPermitId', 'permitNumber', 'permitType', 'expirationDate'] },
  { eventType: 'PERMIT_STATUS_CHANGED', trigger: 'Any status-changing PermitLifecycleAction', additionalPayloadFields: ['actionType', 'previousStatus', 'newStatus', 'actionId'] },
  { eventType: 'STOP_WORK_ISSUED', trigger: 'PermitLifecycleAction(STOP_WORK_ISSUED)', additionalPayloadFields: ['issuedPermitId', 'permitNumber', 'notes'] },
  { eventType: 'STOP_WORK_LIFTED', trigger: 'PermitLifecycleAction(STOP_WORK_LIFTED)', additionalPayloadFields: ['issuedPermitId', 'permitNumber'] },
  { eventType: 'VIOLATION_ISSUED', trigger: 'PermitLifecycleAction(VIOLATION_ISSUED)', additionalPayloadFields: ['issuedPermitId', 'permitNumber', 'notes'] },
  { eventType: 'INSPECTION_VISIT_RECORDED', trigger: 'InspectionVisit.result set', additionalPayloadFields: ['visitId', 'linkedCheckpointId', 'result', 'followUpRequired'] },
  { eventType: 'INSPECTION_CHECKPOINT_PASSED', trigger: 'CheckpointResult → PASS', additionalPayloadFields: ['checkpointId', 'checkpointName', 'visitId'] },
  { eventType: 'INSPECTION_CHECKPOINT_FAILED', trigger: 'CheckpointResult → FAIL', additionalPayloadFields: ['checkpointId', 'checkpointName', 'visitId'] },
  { eventType: 'DEFICIENCY_OPENED', trigger: 'InspectionDeficiency created', additionalPayloadFields: ['deficiencyId', 'severity', 'description', 'visitId'] },
  { eventType: 'DEFICIENCY_RESOLVED', trigger: 'resolutionStatus → RESOLVED', additionalPayloadFields: ['deficiencyId', 'severity', 'resolvedByUserId'] },
  { eventType: 'DEFICIENCY_VERIFIED', trigger: 'resolutionStatus → VERIFIED_RESOLVED', additionalPayloadFields: ['deficiencyId', 'reinspectionVisitId'] },
  { eventType: 'REQUIRED_INSPECTIONS_GENERATED', trigger: 'Auto-gen from template', additionalPayloadFields: ['issuedPermitId', 'checkpointCount'] },
  { eventType: 'REQUIRED_INSPECTIONS_IMPORTED', trigger: 'xlsx import', additionalPayloadFields: ['issuedPermitId', 'checkpointCount', 'importedById'] },
  { eventType: 'PERMIT_EXPIRATION_WARNING', trigger: 'PermitLifecycleAction(EXPIRATION_WARNING)', additionalPayloadFields: ['issuedPermitId', 'expirationDate', 'daysToExpiration'] },
  { eventType: 'PERMIT_EXPIRED', trigger: 'PermitLifecycleAction(EXPIRED)', additionalPayloadFields: ['issuedPermitId', 'expirationDate'] },
  { eventType: 'PERMIT_RENEWED', trigger: 'PermitLifecycleAction(RENEWAL_APPROVED)', additionalPayloadFields: ['issuedPermitId', 'newExpirationDate', 'renewalDate'] },
  { eventType: 'PERMIT_CLOSED', trigger: 'PermitLifecycleAction(CLOSED)', additionalPayloadFields: ['issuedPermitId', 'permitNumber', 'closedDate'] },
  { eventType: 'EVIDENCE_UPLOADED', trigger: 'PermitEvidenceRecord created', additionalPayloadFields: ['evidenceId', 'evidenceType', 'fileName', 'linkedVisitId'] },
];

// ── Health Metrics (§2) ─────────────────────────────────────────────

export const PERMIT_PER_PERMIT_HEALTH_METRICS: ReadonlyArray<IPermitHealthMetricConfig> = [
  { metricKey: 'permitHealthTier', type: 'PermitHealthTier', description: 'CRITICAL | AT_RISK | NORMAL | CLOSED' },
  { metricKey: 'expirationRiskTier', type: 'ExpirationRiskTier', description: 'CRITICAL | HIGH | MEDIUM | LOW' },
  { metricKey: 'daysToExpiration', type: 'number', description: 'Days until expiration; negative if expired' },
  { metricKey: 'openHighDeficiencyCount', type: 'number', description: 'Count of open HIGH-severity deficiencies' },
  { metricKey: 'openMediumDeficiencyCount', type: 'number', description: 'Count of open MEDIUM-severity deficiencies' },
  { metricKey: 'openLowDeficiencyCount', type: 'number', description: 'Count of open LOW-severity deficiencies' },
  { metricKey: 'failedBlockingCheckpointCount', type: 'number', description: 'Count of FAIL checkpoints with isBlockingCloseout = true' },
  { metricKey: 'pendingCheckpointCount', type: 'number', description: 'Count of checkpoints with currentResult = PENDING' },
  { metricKey: 'passedCheckpointCount', type: 'number', description: 'Count of checkpoints with currentResult = PASS' },
  { metricKey: 'currentStatus', type: 'IssuedPermitStatus', description: 'Current permit operational status' },
  { metricKey: 'threadHealthTier', type: 'PermitHealthTier', description: 'Worst health tier across thread' },
];

export const PERMIT_PROJECT_AGGREGATE_METRICS: ReadonlyArray<IPermitHealthMetricConfig> = [
  { metricKey: 'criticalPermitCount', type: 'number', description: 'Permits with derivedHealthTier = CRITICAL' },
  { metricKey: 'atRiskPermitCount', type: 'number', description: 'Permits with derivedHealthTier = AT_RISK' },
  { metricKey: 'expiredPermitCount', type: 'number', description: 'Permits with currentStatus = EXPIRED' },
  { metricKey: 'stopWorkPermitCount', type: 'number', description: 'Permits with currentStatus = STOP_WORK' },
  { metricKey: 'expiringWithin30DaysCount', type: 'number', description: 'Active permits with expirationRiskTier = HIGH' },
  { metricKey: 'closedPermitCount', type: 'number', description: 'Permits with currentStatus = CLOSED' },
  { metricKey: 'activePermitCount', type: 'number', description: 'Permits with currentStatus = ACTIVE or ACTIVE_EXPIRING' },
];

// ── Work Queue Rules (§3) ──────────────────────────────────────────

export const PERMIT_WORK_QUEUE_RULES: ReadonlyArray<IPermitWorkQueueRuleConfig> = [
  { ruleId: 'WQ-PRM-01', trigger: 'expirationRiskTier → HIGH', itemType: 'Permit Expiring — Renewal Required', priority: 'HIGH', assignee: 'Permit accountableRole user', resolutionTrigger: 'RENEWAL_INITIATED or expirationRiskTier drops' },
  { ruleId: 'WQ-PRM-02', trigger: 'expirationRiskTier → CRITICAL', itemType: 'Permit EXPIRED — Immediate Action', priority: 'URGENT', assignee: 'Permit escalationOwnerId', resolutionTrigger: 'RENEWAL_APPROVED' },
  { ruleId: 'WQ-PRM-03', trigger: 'EXPIRATION_WARNING action created', itemType: 'Permit Expiring in 30 Days', priority: 'MEDIUM', assignee: 'currentResponsiblePartyId', resolutionTrigger: 'RENEWAL_INITIATED or expirationRiskTier drops' },
  { ruleId: 'WQ-PRM-04', trigger: 'Checkpoint CALLED_IN with no scheduled date after 5 days', itemType: 'Inspection Not Yet Scheduled', priority: 'MEDIUM', assignee: 'currentResponsiblePartyId', resolutionTrigger: 'Checkpoint scheduledDate set' },
  { ruleId: 'WQ-PRM-05', trigger: 'InspectionVisit.followUpRequired = true', itemType: 'Re-inspection Required', priority: 'HIGH', assignee: 'nextActionOwnerId or currentResponsiblePartyId', resolutionTrigger: 'New InspectionVisit created for checkpoint' },
  { ruleId: 'WQ-PRM-06', trigger: 'RequiredInspectionCheckpoint.result → FAIL', itemType: 'Failed Inspection — Action Required', priority: 'HIGH', assignee: 'currentResponsiblePartyId', resolutionTrigger: 'CheckpointResult → PASS' },
  { ruleId: 'WQ-PRM-07', trigger: 'Blocking checkpoint FAIL with no visit after 3 days', itemType: 'Blocked Closeout Checkpoint — Overdue', priority: 'HIGH', assignee: 'escalationOwnerId', resolutionTrigger: 'CheckpointResult → PASS' },
  { ruleId: 'WQ-PRM-08', trigger: 'Deficiency created with severity = HIGH', itemType: 'High-Severity Deficiency — Immediate Action', priority: 'URGENT', assignee: 'assignedToPartyId or currentResponsiblePartyId', resolutionTrigger: 'resolutionStatus → RESOLVED' },
  { ruleId: 'WQ-PRM-09', trigger: 'Deficiency created with severity = MEDIUM', itemType: 'Deficiency Logged — Action Required', priority: 'MEDIUM', assignee: 'assignedToPartyId', resolutionTrigger: 'resolutionStatus → RESOLVED' },
  { ruleId: 'WQ-PRM-10', trigger: 'Deficiency past dueDate', itemType: 'Deficiency Overdue', priority: 'HIGH', assignee: 'escalationOwnerId', resolutionTrigger: 'resolutionStatus → RESOLVED or WAIVED' },
  { ruleId: 'WQ-PRM-11', trigger: 'Deficiency RESOLVED requires inspector verification', itemType: 'Deficiency Resolution — Verify at Re-inspection', priority: 'MEDIUM', assignee: 'nextActionOwnerId', resolutionTrigger: 'resolutionStatus → VERIFIED_RESOLVED' },
  { ruleId: 'WQ-PRM-12', trigger: 'PermitLifecycleAction(STOP_WORK_ISSUED)', itemType: 'STOP WORK ORDER — Immediate Attention', priority: 'URGENT', assignee: 'escalationOwnerId', resolutionTrigger: 'STOP_WORK_LIFTED' },
  { ruleId: 'WQ-PRM-13', trigger: 'PermitLifecycleAction(VIOLATION_ISSUED)', itemType: 'Violation Notice Received', priority: 'HIGH', assignee: 'currentResponsiblePartyId', resolutionTrigger: 'VIOLATION_RESOLVED' },
  { ruleId: 'WQ-PRM-14', trigger: 'PermitLifecycleAction(requiresAcknowledgment = true)', itemType: 'Permit Action Requires Acknowledgment', priority: 'HIGH', assignee: 'nextActionOwnerId', resolutionTrigger: 'acknowledgedAt set' },
  { ruleId: 'WQ-PRM-15', trigger: 'Permit ISSUED — new permit activated', itemType: 'New Permit — Review and Assign Responsibility', priority: 'MEDIUM', assignee: 'Project Manager', resolutionTrigger: 'currentResponsiblePartyId assigned' },
];

// ── Related Items (§4) ──────────────────────────────────────────────

export const PERMIT_RELATED_ITEM_CONFIGS: ReadonlyArray<IPermitRelatedItemConfig> = [
  { source: 'IssuedPermit', target: 'Schedule milestone', relationshipType: 'PERMIT_GATES_MILESTONE', direction: 'Permit blocks milestone until active' },
  { source: 'IssuedPermit', target: 'Constraint record', relationshipType: 'PERMIT_IS_CONSTRAINT', direction: 'Permit status drives constraint state' },
  { source: 'IssuedPermit', target: 'Financial line item', relationshipType: 'PERMIT_FEE_LINE', direction: 'Permit fee amount linked to budget line' },
  { source: 'InspectionVisit', target: 'Schedule milestone', relationshipType: 'INSPECTION_PRECEDES_MILESTONE', direction: 'Inspection must pass before phase proceeds' },
  { source: 'RequiredInspectionCheckpoint', target: 'Schedule milestone', relationshipType: 'CHECKPOINT_GATES_MILESTONE', direction: 'Checkpoint pass gates phase completion' },
];

// ── Handoffs (§5) ───────────────────────────────────────────────────

export const PERMIT_HANDOFF_CONFIGS: ReadonlyArray<IPermitHandoffConfig> = [
  { scenario: 'SubmittedToJurisdiction', fromParty: 'GC Representative', toParty: 'Jurisdiction (external)', trigger: 'applicationStatus → SUBMITTED' },
  { scenario: 'JurisdictionReturnsForInfo', fromParty: 'Jurisdiction (external)', toParty: 'Project Manager', trigger: 'applicationStatus → ADDITIONAL_INFO_REQUIRED' },
  { scenario: 'InspectionScheduled', fromParty: 'Project Manager', toParty: 'Inspector', trigger: 'InspectionVisit created' },
  { scenario: 'DeficiencyAssigned', fromParty: 'Inspector (originator)', toParty: 'Site Supervisor', trigger: 'InspectionDeficiency.assignedToPartyId set' },
  { scenario: 'ResolutionForVerification', fromParty: 'Site Supervisor', toParty: 'Inspector', trigger: 'resolutionStatus → RESOLVED + requiresReinspection = true' },
  { scenario: 'StopWorkResponse', fromParty: 'Jurisdiction', toParty: 'Project Manager + Escalation Owner', trigger: 'PermitLifecycleAction(STOP_WORK_ISSUED)' },
];

// ── BIC Next Move (§6) ─────────────────────────────────────────────

export const PERMIT_BIC_NEXT_MOVE_PROMPTS: ReadonlyArray<IPermitBicNextMovePrompt> = [
  { condition: 'ACTIVE + checkpoint NOT_SCHEDULED', prompt: 'Call in [checkpointName] inspection', surface: 'Permit detail + work queue' },
  { condition: 'ACTIVE_EXPIRING', prompt: 'Start renewal process before [expirationDate]', surface: 'Permit list + permit detail' },
  { condition: 'STOP_WORK', prompt: 'Contact jurisdiction to resolve stop-work order', surface: 'Permit detail (banner)' },
  { condition: 'VIOLATION_ISSUED', prompt: 'Respond to violation notice — due [dueDate]', surface: 'Permit detail (banner)' },
  { condition: 'Open HIGH deficiency', prompt: 'Resolve deficiency: [description]', surface: 'Inspection log + permit detail' },
  { condition: 'followUpRequired = true on visit', prompt: 'Schedule re-inspection for [checkpointName]', surface: 'Permit detail' },
  { condition: 'All blocking checkpoints passed', prompt: 'Confirm closeout conditions and close permit', surface: 'Permit detail' },
];

// ── PER Annotation Scopes (§7) ──────────────────────────────────────

export const PERMIT_ANNOTATION_SCOPES: ReadonlyArray<IPermitAnnotationScope> = [
  { recordType: 'IssuedPermit', annotatableFields: ['*'] },
  { recordType: 'InspectionVisit', annotatableFields: ['result', 'inspectorNotes', 'followUpRequired', '*'] },
  { recordType: 'InspectionDeficiency', annotatableFields: ['description', 'severity', 'resolutionStatus', 'resolutionNotes'] },
  { recordType: 'RequiredInspectionCheckpoint', annotatableFields: ['currentResult', 'status', 'checkpointName'] },
];
