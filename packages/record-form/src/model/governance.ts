/**
 * SF23-T03 — Governance audit trail helpers.
 *
 * Every record lifecycle action produces an immutable audit entry.
 *
 * Governing: SF23-T03, L-02 (BIC ownership), L-06 (provenance)
 */

/** Auditable record form lifecycle actions. */
export type RecordFormAuditAction =
  | 'session-created'
  | 'draft-saved'
  | 'draft-restored'
  | 'draft-discarded'
  | 'submit-started'
  | 'submit-complete'
  | 'submit-failed'
  | 'retry-initiated'
  | 'review-approved'
  | 'review-rejected';

/** Immutable audit trail entry. */
export interface IRecordFormAuditEntry {
  /** Unique entry identifier. */
  entryId: string;
  /** Draft ID this entry belongs to. */
  draftId: string;
  /** Lifecycle action. */
  action: RecordFormAuditAction;
  /** UPN of the acting user. */
  performedByUpn: string;
  /** ISO 8601 timestamp. */
  performedAtIso: string;
  /** Optional detail. */
  detail: string | null;
}

/**
 * Create an immutable audit trail entry.
 */
export function createRecordFormAuditEntry(
  draftId: string,
  action: RecordFormAuditAction,
  performedByUpn: string,
  detail?: string | null,
  now?: Date,
): IRecordFormAuditEntry {
  return {
    entryId: crypto.randomUUID(),
    draftId,
    action,
    performedByUpn,
    performedAtIso: (now ?? new Date()).toISOString(),
    detail: detail ?? null,
  };
}
