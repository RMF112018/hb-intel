/**
 * P3-E13-T08 Stage 4 Subcontract Execution Readiness Module exception-governance constants.
 * Exception packets, approvals, delegation rules, global precedent.
 */

import type {
  ApprovalActionOutcome,
  ApprovalSequencingMode,
  ApprovalSlotRole,
  ApprovalSlotStatus,
  DelegationReason,
  ExceptionIterationStatus,
  PrecedentPublicationStatus,
} from './enums.js';
import type {
  IApprovalSlotRoleDef,
  IAuditPreservationRequirement,
  IPrecedentProhibition,
} from './types.js';

// -- Enum Arrays ----------------------------------------------------------------

export const EXCEPTION_ITERATION_STATUSES = [
  'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'REJECTED', 'WITHDRAWN',
] as const satisfies ReadonlyArray<ExceptionIterationStatus>;

export const APPROVAL_SLOT_STATUSES = [
  'PENDING', 'APPROVED', 'REJECTED', 'RETURNED', 'DELEGATED',
] as const satisfies ReadonlyArray<ApprovalSlotStatus>;

export const APPROVAL_ACTION_OUTCOMES = [
  'APPROVED', 'REJECTED', 'RETURNED', 'DEFERRED',
] as const satisfies ReadonlyArray<ApprovalActionOutcome>;

export const APPROVAL_SLOT_ROLES = [
  'PX', 'CFO', 'COMPLIANCE_MANAGER', 'SPECIALIST',
] as const satisfies ReadonlyArray<ApprovalSlotRole>;

export const APPROVAL_SEQUENCING_MODES = [
  'PARALLEL', 'ORDERED',
] as const satisfies ReadonlyArray<ApprovalSequencingMode>;

export const PRECEDENT_PUBLICATION_STATUSES = [
  'NOT_PUBLISHED', 'PUBLISHED', 'REVOKED',
] as const satisfies ReadonlyArray<PrecedentPublicationStatus>;

export const DELEGATION_REASONS = [
  'UNAVAILABLE', 'AUTHORITY_TRANSFER', 'SPECIALIST_REDIRECT', 'OTHER',
] as const satisfies ReadonlyArray<DelegationReason>;

// -- Label Maps -----------------------------------------------------------------

export const EXCEPTION_ITERATION_STATUS_LABELS: Readonly<Record<ExceptionIterationStatus, string>> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

export const APPROVAL_SLOT_STATUS_LABELS: Readonly<Record<ApprovalSlotStatus, string>> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  RETURNED: 'Returned',
  DELEGATED: 'Delegated',
};

export const APPROVAL_ACTION_OUTCOME_LABELS: Readonly<Record<ApprovalActionOutcome, string>> = {
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  RETURNED: 'Returned',
  DEFERRED: 'Deferred',
};

export const APPROVAL_SLOT_ROLE_LABELS: Readonly<Record<ApprovalSlotRole, string>> = {
  PX: 'PX',
  CFO: 'CFO',
  COMPLIANCE_MANAGER: 'Compliance Manager',
  SPECIALIST: 'Specialist',
};

export const PRECEDENT_PUBLICATION_STATUS_LABELS: Readonly<Record<PrecedentPublicationStatus, string>> = {
  NOT_PUBLISHED: 'Not Published',
  PUBLISHED: 'Published',
  REVOKED: 'Revoked',
};

export const DELEGATION_REASON_LABELS: Readonly<Record<DelegationReason, string>> = {
  UNAVAILABLE: 'Unavailable',
  AUTHORITY_TRANSFER: 'Authority Transfer',
  SPECIALIST_REDIRECT: 'Specialist Redirect',
  OTHER: 'Other',
};

// -- Required Approval Authorities (T04 §5.2) ---------------------------------

export const REQUIRED_APPROVAL_AUTHORITIES: ReadonlyArray<IApprovalSlotRoleDef> = [
  { role: 'PX', description: 'Portfolio Executive — required for business-risk exception approvals', requiredByDefault: true },
  { role: 'CFO', description: 'Chief Financial Officer — required for financial-risk exception approvals', requiredByDefault: true },
  { role: 'COMPLIANCE_MANAGER', description: 'Compliance Manager — required for compliance-risk exception approvals', requiredByDefault: true },
  { role: 'SPECIALIST', description: 'Specialist — policy may define additional specialist or risk slots', requiredByDefault: false },
];

// -- Immutability Governing Rules (T04 §2.1) ----------------------------------

export const IMMUTABILITY_GOVERNING_RULES = [
  'Submitted content must never be edited in place',
  'Any revision produces a new iteration',
  'Approval actions are tied to a specific iteration',
  'The exception header cannot be treated as the mutable approval record',
] as const;

// -- Delegation Governing Rules (T04 §4.2) ------------------------------------

export const DELEGATION_GOVERNING_RULES = [
  'The original required approval slot remains constant',
  'Delegation does not create a new slot type',
  'Delegation does not erase the original assignee',
  'The audit trail must survive across later iterations',
] as const;

// -- Precedent Publication Prohibitions (T04 §6.2) ----------------------------

export const PRECEDENT_PROHIBITIONS: ReadonlyArray<IPrecedentProhibition> = [
  { prohibition: 'AUTOMATIC_FUTURE_APPROVAL', description: 'Publication does not mean automatic future approval' },
  { prohibition: 'AUTOMATIC_SATISFACTION', description: 'Publication does not mean automatic satisfaction of future readiness items' },
  { prohibition: 'BYPASS_LOCAL_EVALUATION', description: 'Publication does not mean bypass of local specialist evaluation' },
  { prohibition: 'BYPASS_LOCAL_DECISION', description: 'Publication does not mean bypass of local readiness decision issuance' },
];

// -- Audit Preservation Requirements (T04 §7) ---------------------------------

export const AUDIT_PRESERVATION_REQUIREMENTS: ReadonlyArray<IAuditPreservationRequirement> = [
  { requirement: 'Item links' },
  { requirement: 'Iteration snapshots' },
  { requirement: 'Slot definitions' },
  { requirement: 'All slot actions' },
  { requirement: 'Delegation history' },
  { requirement: 'Precedent publication lineage' },
];

// -- Terminal Iteration Statuses -----------------------------------------------

/** Iteration statuses that are terminal (no further edits). */
export const TERMINAL_ITERATION_STATUSES = [
  'SUBMITTED', 'UNDER_REVIEW', 'REJECTED', 'WITHDRAWN',
] as const satisfies ReadonlyArray<ExceptionIterationStatus>;

/** Slot statuses that represent a completed action. */
export const TERMINAL_SLOT_STATUSES = [
  'APPROVED', 'REJECTED', 'RETURNED',
] as const satisfies ReadonlyArray<ApprovalSlotStatus>;
