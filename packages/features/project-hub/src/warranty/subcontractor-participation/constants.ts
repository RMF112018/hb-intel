/**
 * P3-E14-T10 Stage 6 Project Warranty Module subcontractor-participation constants.
 */

import type {
  ExternalCollaborationDeferral,
  SubAcknowledgmentStatus,
  SubcontractorEntryChannel,
  SubDisputeOutcome,
  SubWorkQueueEventType,
  WarrantyEvidenceTypeT06,
  WarrantyResolutionTypeT06,
} from './enums.js';
import type {
  IAcknowledgmentSlaDef,
  IAcknowledgmentTransition,
  IDisputeResolutionPathDef,
  IExternalCollaborationDeferralDef,
  ISubWorkQueueEventDef,
} from './types.js';

// -- Enum Arrays ----------------------------------------------------------------

export const SUBCONTRACTOR_ENTRY_CHANNELS = ['PmOnBehalf', 'DirectSubcontractor'] as const satisfies ReadonlyArray<SubcontractorEntryChannel>;
export const SUB_ACKNOWLEDGMENT_STATUSES = ['Pending', 'Acknowledged', 'ScopeAccepted', 'ScopeDisputed', 'DisputeResolved'] as const satisfies ReadonlyArray<SubAcknowledgmentStatus>;
export const SUB_DISPUTE_OUTCOMES = ['UpheldSubcontractorNotResponsible', 'RejectedSubcontractorRemains', 'Reassigned', 'EscalatedToPX'] as const satisfies ReadonlyArray<SubDisputeOutcome>;
export const WARRANTY_EVIDENCE_TYPES_T06 = ['PhotoBefore', 'PhotoAfter', 'VideoDocumentation', 'MaterialSpec', 'SubcontractorReport', 'InspectionReport', 'ManufacturerResponse', 'Other'] as const satisfies ReadonlyArray<WarrantyEvidenceTypeT06>;
export const WARRANTY_RESOLUTION_TYPES_T06 = ['Corrected', 'Credited', 'Voided', 'NotWarrantyScope'] as const satisfies ReadonlyArray<WarrantyResolutionTypeT06>;
export const SUB_WORK_QUEUE_EVENT_TYPES = [
  'CASE_ASSIGNED_TO_SUB', 'ACKNOWLEDGMENT_SLA_REMINDER', 'ACKNOWLEDGMENT_SLA_ESCALATION',
  'SCOPE_DISPUTED', 'DISPUTE_UNRESOLVED_ESCALATION', 'COMPLETION_DECLARED_VERIFICATION_PENDING',
  'VERIFICATION_FAILED', 'BACK_CHARGE_ADVISORY_FLAGGED',
] as const satisfies ReadonlyArray<SubWorkQueueEventType>;
export const EXTERNAL_COLLABORATION_DEFERRALS = [
  'SUB_PORTAL_LOGIN', 'DIRECT_CASE_NOTIFICATION', 'DIRECT_ACKNOWLEDGMENT_ENTRY',
  'DIRECT_EVIDENCE_UPLOAD', 'SUB_DUE_DATE_DASHBOARD', 'MULTI_SUB_PORTFOLIO_VIEW',
  'DIGITAL_PUNCH_LIST_INTEGRATION',
] as const satisfies ReadonlyArray<ExternalCollaborationDeferral>;

// -- Label Maps -----------------------------------------------------------------

export const SUB_ACKNOWLEDGMENT_STATUS_LABELS: Readonly<Record<SubAcknowledgmentStatus, string>> = {
  Pending: 'Pending', Acknowledged: 'Acknowledged',
  ScopeAccepted: 'Scope Accepted', ScopeDisputed: 'Scope Disputed', DisputeResolved: 'Dispute Resolved',
};
export const WARRANTY_EVIDENCE_TYPE_T06_LABELS: Readonly<Record<WarrantyEvidenceTypeT06, string>> = {
  PhotoBefore: 'Photo (Before)', PhotoAfter: 'Photo (After)',
  VideoDocumentation: 'Video Documentation', MaterialSpec: 'Material Specification',
  SubcontractorReport: 'Subcontractor Report', InspectionReport: 'Inspection Report',
  ManufacturerResponse: 'Manufacturer Response', Other: 'Other',
};
export const WARRANTY_RESOLUTION_TYPE_T06_LABELS: Readonly<Record<WarrantyResolutionTypeT06, string>> = {
  Corrected: 'Corrected', Credited: 'Credited', Voided: 'Voided', NotWarrantyScope: 'Not Warranty Scope',
};

// -- Acknowledgment Transitions (T06 §3.2) -----------------------------------

export const ACKNOWLEDGMENT_TRANSITIONS: ReadonlyArray<IAcknowledgmentTransition> = [
  { from: null, to: 'Pending', actor: 'System', guard: 'Case transitions to Assigned' },
  { from: 'Pending', to: 'Acknowledged', actor: 'PM / WARRANTY_MANAGER', guard: 'PM records sub confirmed receipt' },
  { from: 'Acknowledged', to: 'ScopeAccepted', actor: 'PM / WARRANTY_MANAGER', guard: 'PM records sub accepts scope' },
  { from: 'Acknowledged', to: 'ScopeDisputed', actor: 'PM / WARRANTY_MANAGER', guard: 'PM records sub disputes scope; disputeRationale required' },
  { from: 'ScopeDisputed', to: 'DisputeResolved', actor: 'PX / PM', guard: 'disputeOutcome + pmDisputeResponse required' },
];

// -- Dispute Resolution Paths (T06 §4.2) -------------------------------------

export const DISPUTE_RESOLUTION_PATHS: ReadonlyArray<IDisputeResolutionPathDef> = [
  { outcome: 'UpheldSubcontractorNotResponsible', caseEffect: 'Case returned to Open or PendingCoverageDecision', nextAction: 'PM selects new responsible party or closes as not covered' },
  { outcome: 'RejectedSubcontractorRemains', caseEffect: 'Case remains Assigned to original sub', nextAction: 'PM re-engages sub; acknowledgment remains ScopeDisputed until sub proceeds or is re-assigned' },
  { outcome: 'Reassigned', caseEffect: 'Existing assignment superseded; new assignment created', nextAction: 'PM assigns new sub; new acknowledgment cycle starts' },
  { outcome: 'EscalatedToPX', caseEffect: 'PX takes decision authority', nextAction: 'PX outcome recorded as pmDisputeResponse; case route follows PX decision' },
];

// -- Acknowledgment SLA Thresholds (T06 §3.3) --------------------------------

export const ACKNOWLEDGMENT_SLA_THRESHOLDS: ReadonlyArray<IAcknowledgmentSlaDef> = [
  { tier: 'Standard', reminderThresholdBD: 5, escalationThresholdBD: 10 },
  { tier: 'Expedited', reminderThresholdBD: 2, escalationThresholdBD: 4 },
];

// -- Sub Work Queue Events (T06 §8.3) ----------------------------------------

export const SUB_WORK_QUEUE_EVENT_DEFINITIONS: ReadonlyArray<ISubWorkQueueEventDef> = [
  { eventType: 'CASE_ASSIGNED_TO_SUB', workQueueItem: 'Contact sub and confirm acknowledgment', assignee: 'PM' },
  { eventType: 'ACKNOWLEDGMENT_SLA_REMINDER', workQueueItem: 'Sub acknowledgment not confirmed (n BD)', assignee: 'PM' },
  { eventType: 'ACKNOWLEDGMENT_SLA_ESCALATION', workQueueItem: 'Sub acknowledgment overdue', assignee: 'PX' },
  { eventType: 'SCOPE_DISPUTED', workQueueItem: 'Resolve sub scope dispute', assignee: 'PM' },
  { eventType: 'DISPUTE_UNRESOLVED_ESCALATION', workQueueItem: 'Sub dispute unresolved', assignee: 'PX' },
  { eventType: 'COMPLETION_DECLARED_VERIFICATION_PENDING', workQueueItem: 'Schedule verification inspection', assignee: 'PM / WARRANTY_MANAGER' },
  { eventType: 'VERIFICATION_FAILED', workQueueItem: 'Re-engage sub for re-correction', assignee: 'PM' },
  { eventType: 'BACK_CHARGE_ADVISORY_FLAGGED', workQueueItem: 'Review back-charge potential', assignee: 'PX' },
];

// -- External Collaboration Deferrals (T06 §9) --------------------------------

export const EXTERNAL_COLLABORATION_DEFERRAL_DEFINITIONS: ReadonlyArray<IExternalCollaborationDeferralDef> = [
  { capability: 'SUB_PORTAL_LOGIN', reasonDeferred: 'EXT_SUB role does not exist in @hbc/auth', layer2Requirement: 'Add EXT_SUB role to @hbc/auth' },
  { capability: 'DIRECT_CASE_NOTIFICATION', reasonDeferred: 'No sub contact model or routing in Phase 3', layer2Requirement: 'Sub contact model + notification routing' },
  { capability: 'DIRECT_ACKNOWLEDGMENT_ENTRY', reasonDeferred: 'Portal access is prerequisite', layer2Requirement: 'Depends on sub portal login' },
  { capability: 'DIRECT_EVIDENCE_UPLOAD', reasonDeferred: 'Requires sub portal with file upload', layer2Requirement: 'Depends on sub portal login' },
  { capability: 'SUB_DUE_DATE_DASHBOARD', reasonDeferred: 'Requires sub portal', layer2Requirement: 'Depends on sub portal login' },
  { capability: 'MULTI_SUB_PORTFOLIO_VIEW', reasonDeferred: 'Not relevant to single-case model in Phase 3', layer2Requirement: 'May be added for large GC sub-management scenarios' },
  { capability: 'DIGITAL_PUNCH_LIST_INTEGRATION', reasonDeferred: 'Punch-list is Closeout/Startup concern', layer2Requirement: 'Punch-list items convert to warranty cases at turnover per T03 §3' },
];
