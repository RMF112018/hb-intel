/**
 * P3-E15-T10 Stage 5 Project QC Module issues-actions constants.
 */

import type {
  IssueOriginationMode,
  ClosureAuthorityType,
  WorkQueuePublicationState,
  WorkQueueSourceType,
  RootCauseQualification,
  RootCauseRequiredReason,
  EscalationTrigger,
  IssuePriorityBand,
  IssueActionRelationship,
  WorkQueuePublicationEvent,
} from './enums.js';

// -- Enum Arrays --------------------------------------------------------------

export const ISSUE_ORIGINATION_MODES = [
  'FINDING_ORIGIN', 'GATE_ORIGIN', 'AD_HOC_ORIGIN',
] as const satisfies ReadonlyArray<IssueOriginationMode>;

export const CLOSURE_AUTHORITY_TYPES = [
  'VERIFIER_CLOSE', 'SELF_CLOSE_PROHIBITED',
] as const satisfies ReadonlyArray<ClosureAuthorityType>;

export const WORK_QUEUE_PUBLICATION_STATES = [
  'CREATED', 'ASSIGNED', 'REVIEWER_NEEDED', 'ESCALATED', 'RESOLVED', 'CLEARED',
] as const satisfies ReadonlyArray<WorkQueuePublicationState>;

export const WORK_QUEUE_SOURCE_TYPES = [
  'QC_ISSUE', 'CORRECTIVE_ACTION',
] as const satisfies ReadonlyArray<WorkQueueSourceType>;

export const ROOT_CAUSE_QUALIFICATIONS = [
  'REQUIRED', 'NOT_REQUIRED',
] as const satisfies ReadonlyArray<RootCauseQualification>;

export const ROOT_CAUSE_REQUIRED_REASONS = [
  'SEVERITY_EXCEEDS_THRESHOLD', 'ISSUE_REOPENED', 'RECURRENCE_PATTERN',
  'MULTI_WORK_PACKAGE', 'MULTI_ORGANIZATION', 'MATERIALLY_AFFECTS_READINESS',
] as const satisfies ReadonlyArray<RootCauseRequiredReason>;

export const ESCALATION_TRIGGERS = [
  'OVERDUE', 'READINESS_IMPACT', 'REPEATED_REOPEN',
  'VERIFIER_NOT_DESIGNATED', 'EXTERNAL_APPROVAL_GAP', 'RECURRENCE_PATTERN_DETECTED',
] as const satisfies ReadonlyArray<EscalationTrigger>;

export const ISSUE_PRIORITY_BANDS = [
  'CRITICAL', 'HIGH', 'STANDARD', 'LOW',
] as const satisfies ReadonlyArray<IssuePriorityBand>;

export const ISSUE_ACTION_RELATIONSHIPS = [
  'PARENT_ISSUE', 'CHILD_ACTION',
] as const satisfies ReadonlyArray<IssueActionRelationship>;

export const WORK_QUEUE_PUBLICATION_EVENTS = [
  'ISSUE_CREATED', 'ISSUE_ASSIGNED', 'ACTION_ASSIGNED',
  'MOVED_TO_READY_FOR_REVIEW', 'VERIFIED_CLOSED', 'ESCALATED', 'REOPENED',
] as const satisfies ReadonlyArray<WorkQueuePublicationEvent>;

// -- Label Maps ---------------------------------------------------------------

export const QC_ISSUE_PRIORITY_BAND_LABELS: Readonly<Record<IssuePriorityBand, string>> = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  STANDARD: 'Standard',
  LOW: 'Low',
};

export const QC_ESCALATION_TRIGGER_LABELS: Readonly<Record<EscalationTrigger, string>> = {
  OVERDUE: 'Overdue',
  READINESS_IMPACT: 'Readiness Impact',
  REPEATED_REOPEN: 'Repeated Reopen',
  VERIFIER_NOT_DESIGNATED: 'Verifier Not Designated',
  EXTERNAL_APPROVAL_GAP: 'External Approval Gap',
  RECURRENCE_PATTERN_DETECTED: 'Recurrence Pattern Detected',
};

export const QC_WORK_QUEUE_PUBLICATION_STATE_LABELS: Readonly<Record<WorkQueuePublicationState, string>> = {
  CREATED: 'Created',
  ASSIGNED: 'Assigned',
  REVIEWER_NEEDED: 'Reviewer Needed',
  ESCALATED: 'Escalated',
  RESOLVED: 'Resolved',
  CLEARED: 'Cleared',
};

export const QC_ROOT_CAUSE_QUALIFICATION_LABELS: Readonly<Record<RootCauseQualification, string>> = {
  REQUIRED: 'Required',
  NOT_REQUIRED: 'Not Required',
};

// -- Definition Arrays --------------------------------------------------------

export const ISSUE_ORIGINATION_REQUIRED_REFS: ReadonlyArray<{ mode: IssueOriginationMode; requiredFields: readonly string[] }> = [
  { mode: 'FINDING_ORIGIN', requiredFields: ['reviewPackageId', 'findingId', 'affectedRequirementRefs'] },
  { mode: 'GATE_ORIGIN', requiredFields: ['workPackageQualityPlanId', 'controlGateRequirementId', 'gateType', 'failedCriterion'] },
  { mode: 'AD_HOC_ORIGIN', requiredFields: ['observerUserId', 'observationRationale', 'projectProvenance'] },
] as const;

export const WORK_QUEUE_PUBLICATION_EVENT_MAP: ReadonlyArray<{ event: WorkQueuePublicationEvent; resultState: WorkQueuePublicationState }> = [
  { event: 'ISSUE_CREATED', resultState: 'CREATED' },
  { event: 'ISSUE_ASSIGNED', resultState: 'ASSIGNED' },
  { event: 'ACTION_ASSIGNED', resultState: 'ASSIGNED' },
  { event: 'MOVED_TO_READY_FOR_REVIEW', resultState: 'REVIEWER_NEEDED' },
  { event: 'VERIFIED_CLOSED', resultState: 'RESOLVED' },
  { event: 'ESCALATED', resultState: 'ESCALATED' },
  { event: 'REOPENED', resultState: 'CREATED' },
] as const;

export const ROOT_CAUSE_REQUIRED_CONDITIONS: ReadonlyArray<{ reason: RootCauseRequiredReason; description: string }> = [
  { reason: 'SEVERITY_EXCEEDS_THRESHOLD', description: 'Issue severity exceeds the root cause analysis threshold' },
  { reason: 'ISSUE_REOPENED', description: 'Issue was reopened after prior closure' },
  { reason: 'RECURRENCE_PATTERN', description: 'Recurrence pattern detected across issues' },
  { reason: 'MULTI_WORK_PACKAGE', description: 'Issue spans multiple work packages' },
  { reason: 'MULTI_ORGANIZATION', description: 'Issue involves multiple responsible organizations' },
  { reason: 'MATERIALLY_AFFECTS_READINESS', description: 'Issue materially affects project readiness' },
] as const;

export const ESCALATION_TRIGGER_DEFINITIONS: ReadonlyArray<{ trigger: EscalationTrigger; description: string }> = [
  { trigger: 'OVERDUE', description: 'Issue or action has exceeded its SLA due date' },
  { trigger: 'READINESS_IMPACT', description: 'Issue materially impacts project readiness posture' },
  { trigger: 'REPEATED_REOPEN', description: 'Issue has been reopened multiple times' },
  { trigger: 'VERIFIER_NOT_DESIGNATED', description: 'No authorized verifier has been designated' },
  { trigger: 'EXTERNAL_APPROVAL_GAP', description: 'External approval dependency remains unresolved' },
  { trigger: 'RECURRENCE_PATTERN_DETECTED', description: 'Pattern of recurring issues detected across work packages' },
] as const;

export const CLOSURE_AUTHORITY_RULES: ReadonlyArray<{ rule: string; enforcement: string }> = [
  { rule: 'Responsible party cannot close issues or actions', enforcement: 'System-enforced separation of duties' },
  { rule: 'Only authorized reviewer/verifier confirms verified-closed', enforcement: 'Role-based closure gate' },
  { rule: 'Verifier eligibility is centrally governed per T02 §4.1', enforcement: 'Governed verifier designation registry' },
] as const;
