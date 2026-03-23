/**
 * SF24-T03 — Governance audit trail helpers.
 *
 * Every export lifecycle action (request, render, retry, dismiss, download,
 * review) produces an immutable audit entry. Entries are append-only and
 * non-destructive — dismissed or superseded exports remain traceable.
 *
 * Governing: SF24-T03, L-02 (BIC ownership), L-06 (provenance)
 */

// ── Audit Types ──────────────────────────────────────────────────────────

/** Auditable export lifecycle actions. */
export type ExportAuditAction =
  | 'request-created'
  | 'render-started'
  | 'render-complete'
  | 'render-failed'
  | 'retry-initiated'
  | 'dismissed'
  | 'downloaded'
  | 'review-approved'
  | 'review-rejected'
  | 'restored';

/** Immutable audit trail entry for an export request. */
export interface IExportAuditEntry {
  /** Unique entry identifier. */
  entryId: string;
  /** Export request ID this entry belongs to. */
  requestId: string;
  /** Lifecycle action that occurred. */
  action: ExportAuditAction;
  /** UPN of the user who performed the action. */
  performedByUpn: string;
  /** ISO 8601 timestamp of the action. */
  performedAtIso: string;
  /** Optional detail or reason for the action (null if not provided). */
  detail: string | null;
}

// ── Factory ──────────────────────────────────────────────────────────────

/**
 * Create an immutable audit trail entry.
 *
 * @param requestId - Export request this entry belongs to.
 * @param action - Lifecycle action that occurred.
 * @param performedByUpn - UPN of the acting user.
 * @param detail - Optional detail string.
 * @param now - Optional injectable timestamp for testing.
 * @returns A new IExportAuditEntry.
 */
export function createAuditEntry(
  requestId: string,
  action: ExportAuditAction,
  performedByUpn: string,
  detail?: string | null,
  now?: Date,
): IExportAuditEntry {
  return {
    entryId: crypto.randomUUID(),
    requestId,
    action,
    performedByUpn,
    performedAtIso: (now ?? new Date()).toISOString(),
    detail: detail ?? null,
  };
}
