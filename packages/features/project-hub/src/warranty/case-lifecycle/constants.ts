/**
 * P3-E14-T10 Stage 4 Project Warranty Module case-lifecycle constants.
 * State transitions, next move, SLA, escalation, blocking, audit.
 */

import type {
  WarrantyAuditEventType,
  WarrantyCaseBlockingReason,
  WarrantyCaseTransitionActor,
  WarrantyEscalationTrigger,
  WarrantyNextMoveOwner,
  WarrantySlaTier,
  WarrantySlaWindow,
} from './enums.js';
import type {
  IWarrantyAuditEventDef,
  IWarrantyCaseTransition,
  IWarrantyEscalationTriggerDef,
  IWarrantyNextMoveDef,
  IWarrantySlaTierDef,
  IWarrantySlaWindowDef,
} from './types.js';

// -- Enum Arrays ----------------------------------------------------------------

export const WARRANTY_SLA_TIERS = ['Standard', 'Expedited'] as const satisfies ReadonlyArray<WarrantySlaTier>;
export const WARRANTY_SLA_WINDOWS = ['Response', 'Repair', 'Verification'] as const satisfies ReadonlyArray<WarrantySlaWindow>;
export const WARRANTY_CASE_BLOCKING_REASONS = [
  'OwnerAccessRequired', 'OwnerDecisionPending', 'OwnerInformationRequired',
  'WeatherOrSeasonalConstraint', 'MaterialLeadTime', 'PermitRequired', 'Other',
] as const satisfies ReadonlyArray<WarrantyCaseBlockingReason>;
export const WARRANTY_ESCALATION_TRIGGERS = [
  'RESPONSE_SLA_APPROACHING', 'RESPONSE_SLA_OVERDUE', 'RESPONSE_SLA_OVERDUE_5BD',
  'REPAIR_SLA_APPROACHING', 'REPAIR_SLA_OVERDUE', 'REPAIR_SLA_OVERDUE_10BD',
  'VERIFICATION_SLA_APPROACHING', 'VERIFICATION_SLA_OVERDUE',
  'COVERAGE_EXPIRING_30D', 'COVERAGE_EXPIRED_OPEN_30D',
  'AWAITING_OWNER_14D', 'AWAITING_OWNER_30D',
] as const satisfies ReadonlyArray<WarrantyEscalationTrigger>;
export const WARRANTY_AUDIT_EVENT_TYPES = [
  'STATE_TRANSITION', 'COVERAGE_DECISION_MADE', 'COVERAGE_DECISION_SUPERSEDED',
  'ACKNOWLEDGMENT_RECORDED', 'SCOPE_DISPUTE_RESOLVED', 'SLA_EXTENSION_GRANTED',
  'VERIFICATION_FAILURE', 'CASE_REOPENED', 'BACK_CHARGE_ADVISORY_PUBLISHED',
  'RESOLUTION_RECORD_CREATED', 'CASE_VOIDED',
] as const satisfies ReadonlyArray<WarrantyAuditEventType>;

// -- Label Maps -----------------------------------------------------------------

export const WARRANTY_SLA_TIER_LABELS: Readonly<Record<WarrantySlaTier, string>> = {
  Standard: 'Standard', Expedited: 'Expedited',
};
export const WARRANTY_BLOCKING_REASON_LABELS: Readonly<Record<WarrantyCaseBlockingReason, string>> = {
  OwnerAccessRequired: 'Owner Access Required', OwnerDecisionPending: 'Owner Decision Pending',
  OwnerInformationRequired: 'Owner Information Required',
  WeatherOrSeasonalConstraint: 'Weather or Seasonal Constraint',
  MaterialLeadTime: 'Material Lead Time', PermitRequired: 'Permit Required', Other: 'Other',
};

// -- State Transition Table (T04 §3.2) ----------------------------------------

export const WARRANTY_CASE_TRANSITIONS: ReadonlyArray<IWarrantyCaseTransition> = [
  { from: 'Open', to: 'PendingCoverageDecision', actor: 'PM_WARRANTY_MANAGER', guardCondition: 'Coverage evaluation initiated' },
  { from: 'Open', to: 'Voided', actor: 'PM_PX', guardCondition: 'Rationale required' },
  { from: 'PendingCoverageDecision', to: 'NotCovered', actor: 'PM_WARRANTY_MANAGER', guardCondition: 'Coverage decision: out of scope; rationale required' },
  { from: 'PendingCoverageDecision', to: 'Denied', actor: 'PM_WARRANTY_MANAGER', guardCondition: 'Coverage decision: not a warranty claim; rationale required' },
  { from: 'PendingCoverageDecision', to: 'Duplicate', actor: 'PM_WARRANTY_MANAGER', guardCondition: 'Duplicate confirmed; canonical case ID required' },
  { from: 'PendingCoverageDecision', to: 'Assigned', actor: 'PM_WARRANTY_MANAGER', guardCondition: 'Coverage confirmed; responsiblePartyId required' },
  { from: 'PendingCoverageDecision', to: 'Voided', actor: 'PM_PX', guardCondition: 'Rationale required' },
  { from: 'Assigned', to: 'AwaitingSubcontractor', actor: 'PM_WARRANTY_MANAGER', guardCondition: 'Acknowledgment request sent; slaResponseDeadline set' },
  { from: 'Assigned', to: 'InProgress', actor: 'PM_WARRANTY_MANAGER', guardCondition: 'GC or internal assignment; skips ack flow' },
  { from: 'Assigned', to: 'Voided', actor: 'PM_PX', guardCondition: 'Rationale required' },
  { from: 'AwaitingSubcontractor', to: 'AwaitingOwner', actor: 'PM_WARRANTY_MANAGER', guardCondition: 'Owner action required; blocking reason documented' },
  { from: 'AwaitingSubcontractor', to: 'Scheduled', actor: 'PM_WARRANTY_MANAGER', guardCondition: 'Sub acknowledged; visit scheduled' },
  { from: 'AwaitingSubcontractor', to: 'InProgress', actor: 'PM_WARRANTY_MANAGER', guardCondition: 'Work begins without formal scheduling' },
  { from: 'AwaitingSubcontractor', to: 'Assigned', actor: 'PM_WARRANTY_MANAGER', guardCondition: 'Reassignment after scope dispute or non-response' },
  { from: 'AwaitingOwner', to: 'AwaitingSubcontractor', actor: 'PM_WARRANTY_MANAGER', guardCondition: 'Owner unblocked; returning to sub response path' },
  { from: 'AwaitingOwner', to: 'Scheduled', actor: 'PM_WARRANTY_MANAGER', guardCondition: 'Owner unblocked; visit scheduled directly' },
  { from: 'AwaitingOwner', to: 'Voided', actor: 'PM_PX', guardCondition: 'Rationale required' },
  { from: 'Scheduled', to: 'InProgress', actor: 'PM_WARRANTY_MANAGER', guardCondition: 'Work has begun' },
  { from: 'Scheduled', to: 'AwaitingSubcontractor', actor: 'PM_WARRANTY_MANAGER', guardCondition: 'Visit cancelled; back to sub coordination' },
  { from: 'Scheduled', to: 'Voided', actor: 'PM_PX', guardCondition: 'Rationale required' },
  { from: 'InProgress', to: 'Corrected', actor: 'PM_WARRANTY_MANAGER', guardCondition: 'Sub declares work complete' },
  { from: 'InProgress', to: 'Voided', actor: 'PM_PX', guardCondition: 'Rationale required' },
  { from: 'Corrected', to: 'PendingVerification', actor: 'PM_WARRANTY_MANAGER', guardCondition: 'Verification visit scheduled' },
  { from: 'Corrected', to: 'InProgress', actor: 'PM_WARRANTY_MANAGER', guardCondition: 'PM rejects declaration; work must restart' },
  { from: 'Corrected', to: 'Voided', actor: 'PM_PX', guardCondition: 'Rationale required' },
  { from: 'PendingVerification', to: 'Verified', actor: 'PM_WARRANTY_MANAGER', guardCondition: 'PM confirms correction satisfactory' },
  { from: 'PendingVerification', to: 'InProgress', actor: 'PM_WARRANTY_MANAGER', guardCondition: 'Verification fails; work restarts' },
  { from: 'PendingVerification', to: 'Voided', actor: 'PM_PX', guardCondition: 'Rationale required' },
  { from: 'Verified', to: 'Closed', actor: 'PM_WARRANTY_MANAGER', guardCondition: 'WarrantyCaseResolutionRecord created (immutable)' },
  { from: 'Verified', to: 'Voided', actor: 'PM_PX', guardCondition: 'Rationale required (unusual path)' },
  { from: 'Closed', to: 'Reopened', actor: 'PX', guardCondition: 'Defect recurrence confirmed; reason documented' },
  { from: 'Reopened', to: 'Assigned', actor: 'PM_WARRANTY_MANAGER', guardCondition: 'Treated as new assignment cycle' },
  { from: 'Reopened', to: 'Voided', actor: 'PM_PX', guardCondition: 'Rationale required' },
];

// -- Next Move Definitions (T04 §4) -------------------------------------------

export const WARRANTY_NEXT_MOVE_DEFINITIONS: ReadonlyArray<IWarrantyNextMoveDef> = [
  { status: 'Open', nextMove: 'Initiate coverage evaluation', owner: 'PM', workQueueRoutedTo: 'PM' },
  { status: 'PendingCoverageDecision', nextMove: 'Make coverage determination', owner: 'PM', workQueueRoutedTo: 'PM' },
  { status: 'Assigned', nextMove: 'Send acknowledgment request to sub', owner: 'PM', workQueueRoutedTo: 'PM' },
  { status: 'AwaitingSubcontractor', nextMove: 'Record sub response', owner: 'SUB_VIA_PM', workQueueRoutedTo: 'PM' },
  { status: 'AwaitingOwner', nextMove: 'Resolve owner blocking item', owner: 'OWNER_VIA_PM', workQueueRoutedTo: 'PM' },
  { status: 'Scheduled', nextMove: 'Confirm visit completion; log outcome', owner: 'PM', workQueueRoutedTo: 'PM' },
  { status: 'InProgress', nextMove: 'Record sub correction declaration', owner: 'SUB_VIA_PM', workQueueRoutedTo: 'PM' },
  { status: 'Corrected', nextMove: 'Schedule PM verification visit', owner: 'PM', workQueueRoutedTo: 'PM' },
  { status: 'PendingVerification', nextMove: 'Conduct verification; record outcome', owner: 'PM', workQueueRoutedTo: 'PM' },
  { status: 'Verified', nextMove: 'Create resolution record and close', owner: 'PM', workQueueRoutedTo: 'PM' },
  { status: 'Reopened', nextMove: 'Assess and assign for repeat repair', owner: 'PM', workQueueRoutedTo: 'PM' },
];

// -- SLA Tier Definitions (T04 §5.1) ------------------------------------------

export const WARRANTY_SLA_TIER_DEFINITIONS: ReadonlyArray<IWarrantySlaTierDef> = [
  { tier: 'Standard', trigger: 'Default for all new cases where isUrgent = false' },
  { tier: 'Expedited', trigger: 'PM flags isUrgent = true (safety implications, high-profile, PX-escalated)' },
];

// -- SLA Window Definitions (T04 §5.2) ----------------------------------------

export const WARRANTY_SLA_WINDOW_DEFINITIONS: ReadonlyArray<IWarrantySlaWindowDef> = [
  { window: 'Response', standardDays: 5, expeditedDays: 2, startsWhen: 'Case transitions to AwaitingSubcontractor', appliesToField: 'slaResponseDeadline' },
  { window: 'Repair', standardDays: 30, expeditedDays: 10, startsWhen: 'Sub acknowledges scope (ScopeAccepted)', appliesToField: 'slaRepairDeadline' },
  { window: 'Verification', standardDays: 5, expeditedDays: 2, startsWhen: 'Case transitions to Corrected', appliesToField: 'slaVerificationDeadline' },
];

// -- Escalation Definitions (T04 §6.1) ----------------------------------------

export const WARRANTY_ESCALATION_TRIGGER_DEFINITIONS: ReadonlyArray<IWarrantyEscalationTriggerDef> = [
  { trigger: 'RESPONSE_SLA_APPROACHING', action: 'Work Queue advisory: sub acknowledgment due in N days', routedTo: 'PM' },
  { trigger: 'RESPONSE_SLA_OVERDUE', action: 'Work Queue escalation: sub has not acknowledged — N days overdue', routedTo: 'PM' },
  { trigger: 'RESPONSE_SLA_OVERDUE_5BD', action: 'Work Queue escalation to PX; Health spine signal', routedTo: 'PM + PX' },
  { trigger: 'REPAIR_SLA_APPROACHING', action: 'Work Queue advisory: repair deadline approaching', routedTo: 'PM' },
  { trigger: 'REPAIR_SLA_OVERDUE', action: 'Work Queue escalation: repair SLA exceeded', routedTo: 'PM' },
  { trigger: 'REPAIR_SLA_OVERDUE_10BD', action: 'Work Queue escalation to PX; back-charge advisory auto-surfaced', routedTo: 'PM + PX' },
  { trigger: 'VERIFICATION_SLA_APPROACHING', action: 'Work Queue advisory', routedTo: 'PM' },
  { trigger: 'VERIFICATION_SLA_OVERDUE', action: 'Work Queue escalation', routedTo: 'PM' },
  { trigger: 'COVERAGE_EXPIRING_30D', action: 'Work Queue advisory: coverage expiring with open cases', routedTo: 'PM' },
  { trigger: 'COVERAGE_EXPIRED_OPEN_30D', action: 'Work Queue escalation: coverage expired, open cases > 30 days', routedTo: 'PM + PX' },
  { trigger: 'AWAITING_OWNER_14D', action: 'Work Queue advisory: owner-blocked case — consider alternate path', routedTo: 'PM' },
  { trigger: 'AWAITING_OWNER_30D', action: 'PX escalation advisory', routedTo: 'PM + PX' },
];

// -- Audit Event Definitions (T04 §12) ----------------------------------------

export const WARRANTY_AUDIT_EVENT_DEFINITIONS: ReadonlyArray<IWarrantyAuditEventDef> = [
  { eventType: 'STATE_TRANSITION', requirement: 'Actor + timestamp + prior state + new state' },
  { eventType: 'COVERAGE_DECISION_MADE', requirement: 'Decision outcome + rationale + actor + timestamp' },
  { eventType: 'COVERAGE_DECISION_SUPERSEDED', requirement: 'Original decision reference + new decision + revision note' },
  { eventType: 'ACKNOWLEDGMENT_RECORDED', requirement: 'Scope position + actor (PM on behalf) + timestamp' },
  { eventType: 'SCOPE_DISPUTE_RESOLVED', requirement: 'Dispute outcome + PM/PX rationale + timestamp' },
  { eventType: 'SLA_EXTENSION_GRANTED', requirement: 'Prior deadline + new deadline + PX ID + reason + timestamp' },
  { eventType: 'VERIFICATION_FAILURE', requirement: 'Deficiency notes + actor + timestamp + rejection evidence reference' },
  { eventType: 'CASE_REOPENED', requirement: 'Prior resolution record ID + re-open reason + PX ID + timestamp' },
  { eventType: 'BACK_CHARGE_ADVISORY_PUBLISHED', requirement: 'Advisory notes + actor + timestamp + Financial advisory ID' },
  { eventType: 'RESOLUTION_RECORD_CREATED', requirement: 'Outcome + all resolution fields (immutable snapshot)' },
  { eventType: 'CASE_VOIDED', requirement: 'Rationale + actor + timestamp' },
];

// -- SLA Approaching Threshold Default ----------------------------------------
export const WARRANTY_SLA_APPROACHING_THRESHOLD_DAYS = 5;
