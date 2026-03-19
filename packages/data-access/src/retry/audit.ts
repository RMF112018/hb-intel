/**
 * P1-D1 Task 3.2: Audit record interface for write operations.
 *
 * Provides a canonical shape for recording write outcomes in domains that
 * require an audit trail (Lead, Project, Estimating). Consumers use this
 * interface to build audit log entries that may be persisted to Azure Table
 * Storage or forwarded to Application Insights as custom events.
 *
 * The `failureReason` field uses `WriteFailureReason` from write-safe-error.ts
 * so consuming code can surface structured failure reasons in both audit logs
 * and telemetry without duplicating the classification logic.
 */

import type { WriteFailureReason } from './write-safe-error.js';

/**
 * A structured record of a write operation outcome.
 *
 * @example
 * ```ts
 * const record: IAuditRecord = {
 *   operation: 'create',
 *   domain: 'leads',
 *   entityId: 42,
 *   userId: 'jane.doe@hbc.com',
 *   timestamp: new Date().toISOString(),
 *   payload: { name: 'Acme Corp' },
 *   outcome: 'success',
 * };
 * ```
 */
export interface IAuditRecord {
  /** Semantic operation name (e.g., 'create', 'update', 'delete'). */
  operation: string;
  /** Domain area that owns the entity (e.g., 'leads', 'projects'). */
  domain: string;
  /** Primary key of the affected entity. */
  entityId: string | number;
  /** UPN or user ID of the actor performing the operation. */
  userId: string;
  /** ISO 8601 timestamp of when the operation completed (or failed). */
  timestamp: string;
  /** Optional sanitized payload that was submitted. */
  payload?: unknown;
  /** Whether the write succeeded or failed. */
  outcome: 'success' | 'failure';
  /** Structured failure reason — present only when `outcome === 'failure'`. */
  failureReason?: WriteFailureReason;
}
