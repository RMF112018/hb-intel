/**
 * SF25-T03 — Governance audit trail.
 *
 * Governing: SF25-T03, L-02, L-06
 */

export type PublishAuditAction =
  | 'request-created'
  | 'readiness-checked'
  | 'approved'
  | 'rejected'
  | 'publish-started'
  | 'publish-complete'
  | 'publish-failed'
  | 'superseded'
  | 'revoked'
  | 'acknowledged';

export interface IPublishAuditEntry {
  entryId: string;
  publishRequestId: string;
  action: PublishAuditAction;
  performedByUpn: string;
  performedAtIso: string;
  detail: string | null;
}

export function createPublishAuditEntry(
  publishRequestId: string, action: PublishAuditAction, performedByUpn: string,
  detail?: string | null, now?: Date,
): IPublishAuditEntry {
  return {
    entryId: crypto.randomUUID(),
    publishRequestId,
    action,
    performedByUpn,
    performedAtIso: (now ?? new Date()).toISOString(),
    detail: detail ?? null,
  };
}
