/**
 * Audit record for a write operation.
 *
 * Captures who performed what operation on which entity, with correlation
 * and idempotency tracking. Used by both frontend (data-access telemetry)
 * and backend (audit trail persistence).
 *
 * @example
 * ```ts
 * import type { IAuditRecord } from '@hbc/models';
 * ```
 */
export interface IAuditRecord {
  /** Unique audit record identifier. */
  id: string;
  /** Domain entity type (e.g., 'Lead', 'Project', 'Contract'). */
  entityType: string;
  /** Identifier of the affected entity. */
  entityId: string;
  /** Operation performed (e.g., 'create', 'update', 'delete'). */
  operation: string;
  /** UPN of the user who performed the operation. */
  performedBy: string;
  /** ISO-8601 timestamp when the operation was performed. */
  performedAt: string;
  /** Correlation ID linking related operations across services. */
  correlationId: string;
  /** Idempotency key if the write was idempotency-protected. */
  idempotencyKey?: string;
  /** Whether the operation succeeded or failed. */
  outcome: 'success' | 'failure';
  /** Error code if the operation failed (from HbcDataAccessError.code). */
  errorCode?: string;
}
