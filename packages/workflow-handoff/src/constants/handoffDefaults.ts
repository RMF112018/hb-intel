// ─────────────────────────────────────────────────────────────────────────────
// SharePoint list and API constants (D-01)
// ─────────────────────────────────────────────────────────────────────────────

export const HANDOFF_LIST_TITLE = 'HBC_HandoffPackages';
export const HANDOFF_API_BASE = '/api/workflow-handoff';

/**
 * Maximum inline JSON size for sourceSnapshot (D-01).
 * Packages exceeding this are stored as Azure Blob files; HandoffApi handles
 * the routing transparently — consistent with @hbc/versioned-record D-02.
 */
export const HANDOFF_SNAPSHOT_INLINE_MAX_BYTES = 260_000; // ~255KB

// ─────────────────────────────────────────────────────────────────────────────
// TanStack Query stale times
// ─────────────────────────────────────────────────────────────────────────────

/** Inbox refreshes every 90 seconds — balances freshness against API load */
export const HANDOFF_INBOX_STALE_TIME_MS = 90_000;

/** Status polling stale time for outbound handoff tracking */
export const HANDOFF_STATUS_STALE_TIME_MS = 30_000;

/** Refetch interval for outbound handoff in 'sent' or 'received' state (active polling) */
export const HANDOFF_STATUS_REFETCH_INTERVAL_MS = 30_000;

// ─────────────────────────────────────────────────────────────────────────────
// Status display labels and color tokens (D-08)
// ─────────────────────────────────────────────────────────────────────────────

export const handoffStatusLabel: Record<string, string> = {
  draft: 'Handoff Draft',
  sent: 'Awaiting Acknowledgment',
  received: 'Viewed by Recipient',
  acknowledged: 'Handoff Acknowledged',
  rejected: 'Handoff Rejected — Revision Required',
};

export const handoffStatusColorClass: Record<string, string> = {
  draft: 'grey',
  sent: 'blue',
  received: 'blue',
  acknowledged: 'green',
  rejected: 'red',
};

// ─────────────────────────────────────────────────────────────────────────────
// Note category display config
// ─────────────────────────────────────────────────────────────────────────────

export const noteCategoryColorClass: Record<string, string> = {
  'Key Decision': 'blue',
  'Open Item': 'amber',
  'Risk': 'red',
  'General': 'grey',
};
