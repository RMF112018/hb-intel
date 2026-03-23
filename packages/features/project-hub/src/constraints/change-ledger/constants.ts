/**
 * P3-E6-T04 Change Ledger constants.
 * Contract-locked values for enumerations, transition rules, and governed defaults.
 */

import type {
  ChangeEventOrigin,
  ChangeEventStatus,
  ChangeIntegrationMode,
  ChangeLineItemType,
  CostConfidence,
  ProcoreSyncState,
} from './enums.js';

// ── Module Scope ────────────────────────────────────────────────────

export const CHANGE_LEDGER_SCOPE = 'constraints/change-ledger' as const;

// ── Status Enumerations (§4.4) ──────────────────────────────────────

export const CHANGE_EVENT_STATUSES = [
  'Identified',
  'UnderAnalysis',
  'PendingApproval',
  'Approved',
  'Rejected',
  'Closed',
  'Void',
  'Cancelled',
  'Superseded',
] as const satisfies ReadonlyArray<ChangeEventStatus>;

export const TERMINAL_CHANGE_EVENT_STATUSES = [
  'Closed',
  'Void',
  'Cancelled',
  'Superseded',
] as const satisfies ReadonlyArray<ChangeEventStatus>;

// ── Origin Enumeration (§4.5) ──────────────────────────────────────

export const CHANGE_EVENT_ORIGINS = [
  'SITE_CONDITION',
  'DESIGN_CHANGE',
  'OWNER_DIRECTIVE',
  'REGULATORY',
  'SCOPE_CLARIFICATION',
  'VALUE_ENGINEERING',
  'SCHEDULE_RECOVERY',
  'FORCE_MAJEURE',
  'SUBCONTRACTOR_REQUEST',
  'OTHER',
] as const satisfies ReadonlyArray<ChangeEventOrigin>;

// ── Line Item Types (§4.3) ─────────────────────────────────────────

export const CHANGE_LINE_ITEM_TYPES = [
  'Labor',
  'Material',
  'Equipment',
  'Subcontract',
  'Other',
] as const satisfies ReadonlyArray<ChangeLineItemType>;

// ── Integration Modes ───────────────────────────────────────────────

export const CHANGE_INTEGRATION_MODES = [
  'ManualNative',
  'IntegratedWithProcore',
] as const satisfies ReadonlyArray<ChangeIntegrationMode>;

// ── Procore Sync States ─────────────────────────────────────────────

export const PROCORE_SYNC_STATES = [
  'NotSynced',
  'SyncPending',
  'Synced',
  'ConflictRequiresReview',
] as const satisfies ReadonlyArray<ProcoreSyncState>;

// ── Cost Confidence Levels ──────────────────────────────────────────

export const COST_CONFIDENCE_LEVELS = [
  'Rough',
  'Ordered',
  'Definitive',
] as const satisfies ReadonlyArray<CostConfidence>;

// ── State Transition Map (§4.4) ─────────────────────────────────────

export const VALID_CHANGE_EVENT_TRANSITIONS: Readonly<Record<ChangeEventStatus, readonly ChangeEventStatus[]>> = {
  Identified: ['UnderAnalysis', 'PendingApproval', 'Void'],
  UnderAnalysis: ['PendingApproval', 'Void', 'Cancelled'],
  PendingApproval: ['Approved', 'Rejected', 'UnderAnalysis'],
  Approved: ['Closed', 'Void'],
  Rejected: ['UnderAnalysis', 'Void'],
  Closed: [],
  Void: [],
  Cancelled: [],
  Superseded: [],
};

// ── Immutable Fields (CE-01) ────────────────────────────────────────

export const CHANGE_EVENT_IMMUTABLE_FIELDS = [
  'changeEventId',
  'projectId',
  'changeEventNumber',
  'origin',
  'dateIdentified',
  'identifiedBy',
  'parentConstraintId',
  'createdAt',
  'createdBy',
] as const;

// ── Label Maps ──────────────────────────────────────────────────────

export const CHANGE_EVENT_STATUS_LABELS: Readonly<Record<ChangeEventStatus, string>> = {
  Identified: 'Identified',
  UnderAnalysis: 'Under Analysis',
  PendingApproval: 'Pending Approval',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Closed: 'Closed',
  Void: 'Void',
  Cancelled: 'Cancelled',
  Superseded: 'Superseded',
};

export const CHANGE_EVENT_ORIGIN_LABELS: Readonly<Record<ChangeEventOrigin, string>> = {
  SITE_CONDITION: 'Unforeseen or differing site condition',
  DESIGN_CHANGE: 'Design change, clarification, or coordination',
  OWNER_DIRECTIVE: 'Owner-directed change or instruction',
  REGULATORY: 'Regulatory or code-compliance requirement',
  SCOPE_CLARIFICATION: 'Scope gap or clarification from contract documents',
  VALUE_ENGINEERING: 'Owner-accepted value engineering proposal',
  SCHEDULE_RECOVERY: 'Change required for schedule recovery',
  FORCE_MAJEURE: 'Force majeure event consequence',
  SUBCONTRACTOR_REQUEST: 'Subcontractor-initiated change request',
  OTHER: 'Unclassified origin',
};

export const CHANGE_LINE_ITEM_TYPE_LABELS: Readonly<Record<ChangeLineItemType, string>> = {
  Labor: 'Labor',
  Material: 'Material',
  Equipment: 'Equipment',
  Subcontract: 'Subcontract',
  Other: 'Other',
};

export const PROCORE_SYNC_STATE_LABELS: Readonly<Record<ProcoreSyncState, string>> = {
  NotSynced: 'Not synced',
  SyncPending: 'Sync pending',
  Synced: 'Synced',
  ConflictRequiresReview: 'Conflict requires review',
};
