/**
 * P3-E7-T03 Permits Lifecycle constants.
 */

import type { PermitApplicationStatus, IssuedPermitStatus, PermitLifecycleActionType } from '../records/enums.js';
import type {
  IPermitApplicationEditRule,
  IPermitApplicationTransitionRule,
  IPermitLifecycleActionTransitionRule,
  ISystemDrivenTransition,
} from './types.js';

export const LIFECYCLE_SCOPE = 'permits/lifecycle' as const;

// ── Application Transitions (§2.2) ──────────────────────────────────

export const VALID_APPLICATION_TRANSITIONS: ReadonlyArray<IPermitApplicationTransitionRule> = [
  { from: 'DRAFT', to: 'SUBMITTED', trigger: 'User action: submit application', requiredFields: ['submittedById', 'applicationDate'] },
  { from: 'SUBMITTED', to: 'UNDER_REVIEW', trigger: 'System or manual: jurisdiction acknowledged', requiredFields: [] },
  { from: 'UNDER_REVIEW', to: 'ADDITIONAL_INFO_REQUIRED', trigger: 'Manual: jurisdiction requests info', requiredFields: ['notes'] },
  { from: 'ADDITIONAL_INFO_REQUIRED', to: 'UNDER_REVIEW', trigger: 'Manual: additional info provided', requiredFields: [] },
  { from: 'UNDER_REVIEW', to: 'APPROVED', trigger: 'Manual: jurisdiction approved', requiredFields: ['jurisdictionResponseDate'] },
  { from: 'UNDER_REVIEW', to: 'REJECTED', trigger: 'Manual: jurisdiction denied', requiredFields: ['rejectionReason'] },
  { from: '*', to: 'WITHDRAWN', trigger: 'User action: withdraw application', requiredFields: ['notes'] },
];

export const TERMINAL_APPLICATION_STATUSES = [
  'APPROVED', 'REJECTED', 'WITHDRAWN',
] as const satisfies ReadonlyArray<PermitApplicationStatus>;

// ── Issued Permit Lifecycle Action Transitions (§3.2) ───────────────

export const LIFECYCLE_ACTION_TRANSITION_TABLE: ReadonlyArray<IPermitLifecycleActionTransitionRule> = [
  { actionType: 'ISSUED', previousStatus: '*', newStatus: 'ACTIVE', notesRequired: false, ackRequired: false },
  { actionType: 'ACTIVATED', previousStatus: 'ACTIVE', newStatus: 'SAME', notesRequired: false, ackRequired: false },
  { actionType: 'INSPECTION_PASSED', previousStatus: '*', newStatus: 'SAME', notesRequired: false, ackRequired: false },
  { actionType: 'INSPECTION_FAILED', previousStatus: '*', newStatus: 'SAME', notesRequired: true, ackRequired: false },
  { actionType: 'DEFICIENCY_OPENED', previousStatus: '*', newStatus: 'SAME', notesRequired: true, ackRequired: false },
  { actionType: 'DEFICIENCY_RESOLVED', previousStatus: '*', newStatus: 'SAME', notesRequired: true, ackRequired: true },
  { actionType: 'STOP_WORK_ISSUED', previousStatus: '*', newStatus: 'STOP_WORK', notesRequired: true, ackRequired: true },
  { actionType: 'STOP_WORK_LIFTED', previousStatus: 'STOP_WORK', newStatus: 'ACTIVE', notesRequired: true, ackRequired: true },
  { actionType: 'VIOLATION_ISSUED', previousStatus: '*', newStatus: 'VIOLATION_ISSUED', notesRequired: true, ackRequired: true },
  { actionType: 'VIOLATION_RESOLVED', previousStatus: 'VIOLATION_ISSUED', newStatus: 'ACTIVE', notesRequired: true, ackRequired: false },
  { actionType: 'SUSPENSION_ISSUED', previousStatus: '*', newStatus: 'SUSPENDED', notesRequired: true, ackRequired: true },
  { actionType: 'SUSPENSION_LIFTED', previousStatus: 'SUSPENDED', newStatus: 'ACTIVE', notesRequired: true, ackRequired: false },
  { actionType: 'RENEWAL_INITIATED', previousStatus: '*', newStatus: 'RENEWAL_IN_PROGRESS', notesRequired: false, ackRequired: false },
  { actionType: 'RENEWAL_APPROVED', previousStatus: 'RENEWAL_IN_PROGRESS', newStatus: 'RENEWED', notesRequired: false, ackRequired: false },
  { actionType: 'RENEWAL_DENIED', previousStatus: 'RENEWAL_IN_PROGRESS', newStatus: 'EXPIRED', notesRequired: true, ackRequired: false },
  { actionType: 'EXPIRED', previousStatus: '*', newStatus: 'EXPIRED', notesRequired: false, ackRequired: false },
  { actionType: 'REVOKED', previousStatus: '*', newStatus: 'REVOKED', notesRequired: true, ackRequired: true },
  { actionType: 'CLOSED', previousStatus: 'ACTIVE', newStatus: 'CLOSED', notesRequired: false, ackRequired: false },
  { actionType: 'CORRECTION_ISSUED', previousStatus: '*', newStatus: 'SAME', notesRequired: true, ackRequired: false },
  { actionType: 'EXPIRATION_WARNING', previousStatus: '*', newStatus: 'ACTIVE_EXPIRING', notesRequired: false, ackRequired: false },
];

export const TERMINAL_ISSUED_PERMIT_STATUSES = [
  'EXPIRED', 'REVOKED', 'CLOSED',
] as const satisfies ReadonlyArray<IssuedPermitStatus>;

// ── Notes/Ack Required Action Types ─────────────────────────────────

export const NOTES_REQUIRED_ACTION_TYPES: ReadonlyArray<PermitLifecycleActionType> =
  LIFECYCLE_ACTION_TRANSITION_TABLE.filter((r) => r.notesRequired).map((r) => r.actionType);

export const ACK_REQUIRED_ACTION_TYPES: ReadonlyArray<PermitLifecycleActionType> =
  LIFECYCLE_ACTION_TRANSITION_TABLE.filter((r) => r.ackRequired).map((r) => r.actionType);

// ── System-Driven Transitions (§3.3) ────────────────────────────────

export const SYSTEM_DRIVEN_TRANSITIONS: ReadonlyArray<ISystemDrivenTransition> = [
  { trigger: 'Daily expiration sweep', actionType: 'EXPIRATION_WARNING', condition: 'daysToExpiration ≤ 30 and currentStatus = ACTIVE' },
  { trigger: 'Daily expiration sweep', actionType: 'EXPIRED', condition: 'expirationDate < today and status not terminal' },
  { trigger: 'All required checkpoints pass', actionType: 'CLOSED', condition: 'All isBlockingCloseout = true checkpoints have currentResult = PASS' },
];

// ── Application Edit Rules (§5.1) ───────────────────────────────────

export const APPLICATION_EDIT_RULES: ReadonlyArray<IPermitApplicationEditRule> = [
  { status: 'DRAFT', whoMayEdit: ['Creator', 'ProjectManager'] },
  { status: 'SUBMITTED', whoMayEdit: ['ProjectManager (limited fields)'] },
  { status: 'UNDER_REVIEW', whoMayEdit: ['Read-only except notes'] },
  { status: 'ADDITIONAL_INFO_REQUIRED', whoMayEdit: ['ProjectManager'] },
  { status: 'APPROVED', whoMayEdit: [] },
  { status: 'REJECTED', whoMayEdit: [] },
  { status: 'WITHDRAWN', whoMayEdit: [] },
];

// ── Required Fields by Application Transition (§5.2) ────────────────

export const APPLICATION_REQUIRED_FIELDS: Readonly<Record<string, readonly string[]>> = {
  SUBMITTED: ['submittedById', 'applicationDate', 'permitType', 'jurisdictionName', 'jurisdictionContact.contactName'],
  APPROVED: ['jurisdictionResponseDate'],
  REJECTED: ['jurisdictionResponseDate', 'rejectionReason'],
};
