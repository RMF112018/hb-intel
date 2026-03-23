/**
 * P3-E6-T04 Change Ledger enumerations.
 * String literal union types for all governed value sets.
 */

// ── Change Event Status Lifecycle (§4.4) ────────────────────────────

/** Canonical HB Intel change event status. Terminal: Closed, Void, Cancelled, Superseded. */
export type ChangeEventStatus =
  | 'Identified'
  | 'UnderAnalysis'
  | 'PendingApproval'
  | 'Approved'
  | 'Rejected'
  | 'Closed'
  | 'Void'
  | 'Cancelled'
  | 'Superseded';

// ── Change Event Origin (§4.5) ──────────────────────────────────────

/** Governed change event origin type. Immutable after creation. */
export type ChangeEventOrigin =
  | 'SITE_CONDITION'
  | 'DESIGN_CHANGE'
  | 'OWNER_DIRECTIVE'
  | 'REGULATORY'
  | 'SCOPE_CLARIFICATION'
  | 'VALUE_ENGINEERING'
  | 'SCHEDULE_RECOVERY'
  | 'FORCE_MAJEURE'
  | 'SUBCONTRACTOR_REQUEST'
  | 'OTHER';

// ── Change Line Item Type (§4.3) ────────────────────────────────────

/** Governed line item cost type. */
export type ChangeLineItemType =
  | 'Labor'
  | 'Material'
  | 'Equipment'
  | 'Subcontract'
  | 'Other';

// ── Integration Mode ────────────────────────────────────────────────

/** Governs which fields are active for write operations. */
export type ChangeIntegrationMode =
  | 'ManualNative'
  | 'IntegratedWithProcore';

// ── Procore Sync State (§4.6) ───────────────────────────────────────

/** Sync lifecycle state for Procore integration. */
export type ProcoreSyncState =
  | 'NotSynced'
  | 'SyncPending'
  | 'Synced'
  | 'ConflictRequiresReview';

// ── Cost Confidence (reuse QuantificationConfidence concept) ────────

/** Confidence in cost estimate. */
export type CostConfidence =
  | 'Rough'
  | 'Ordered'
  | 'Definitive';
