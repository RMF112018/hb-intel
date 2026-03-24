/**
 * P3-E14-T10 Stage 4 Project Warranty Module case-lifecycle enumerations.
 * State machine, SLA tiers/windows, escalation, blocking, audit.
 */

// -- SLA Tier (T04 §5.1) -----------------------------------------------------
export type WarrantySlaTier = 'Standard' | 'Expedited';

// -- SLA Window (T04 §5.2) ---------------------------------------------------
export type WarrantySlaWindow = 'Response' | 'Repair' | 'Verification';

// -- Blocking Reason (T04 §8) ------------------------------------------------
export type WarrantyCaseBlockingReason =
  | 'OwnerAccessRequired' | 'OwnerDecisionPending' | 'OwnerInformationRequired'
  | 'WeatherOrSeasonalConstraint' | 'MaterialLeadTime' | 'PermitRequired' | 'Other';

// -- Transition Actor (T04 §3.2) ---------------------------------------------
export type WarrantyCaseTransitionActor = 'PM_WARRANTY_MANAGER' | 'PX' | 'PM_PX';

// -- Next Move Owner (T04 §4) ------------------------------------------------
export type WarrantyNextMoveOwner = 'PM' | 'SUB_VIA_PM' | 'OWNER_VIA_PM';

// -- Escalation Trigger (T04 §6.1) -------------------------------------------
export type WarrantyEscalationTrigger =
  | 'RESPONSE_SLA_APPROACHING' | 'RESPONSE_SLA_OVERDUE' | 'RESPONSE_SLA_OVERDUE_5BD'
  | 'REPAIR_SLA_APPROACHING' | 'REPAIR_SLA_OVERDUE' | 'REPAIR_SLA_OVERDUE_10BD'
  | 'VERIFICATION_SLA_APPROACHING' | 'VERIFICATION_SLA_OVERDUE'
  | 'COVERAGE_EXPIRING_30D' | 'COVERAGE_EXPIRED_OPEN_30D'
  | 'AWAITING_OWNER_14D' | 'AWAITING_OWNER_30D';

// -- Audit Event Type (T04 §12) -----------------------------------------------
export type WarrantyAuditEventType =
  | 'STATE_TRANSITION' | 'COVERAGE_DECISION_MADE' | 'COVERAGE_DECISION_SUPERSEDED'
  | 'ACKNOWLEDGMENT_RECORDED' | 'SCOPE_DISPUTE_RESOLVED' | 'SLA_EXTENSION_GRANTED'
  | 'VERIFICATION_FAILURE' | 'CASE_REOPENED' | 'BACK_CHARGE_ADVISORY_PUBLISHED'
  | 'RESOLUTION_RECORD_CREATED' | 'CASE_VOIDED';
