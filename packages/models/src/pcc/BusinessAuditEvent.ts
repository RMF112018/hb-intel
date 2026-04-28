/**
 * PCC business audit event.
 *
 * Distinct from the generic write-operation audit (`../audit/IAuditRecord.ts`):
 * `IAuditRecord` captures CRUD-style data-access telemetry, while
 * `IBusinessAuditEvent` describes business-meaningful workflow events for
 * PCC operability surfaces (e.g., "Site Health repair acknowledged",
 * "Approval checkpoint decided").
 *
 * Wave 1 surfaces only the read-model shape; consolidation with the existing
 * admin-control-plane audit shape, if appropriate, is deferred to a later ADR.
 */

import type { PccBusinessAuditEventId } from './types.js';
import type { PccPersona } from './PccUserRoles.js';
import type { SiteHealthSeverity } from './SiteHealth.js';

export interface IBusinessAuditEvent {
  id: PccBusinessAuditEventId;
  eventType: string;
  subjectType: string;
  subjectId: string;
  actorUpn: string;
  actorPersona?: PccPersona;
  /** ISO 8601 UTC. */
  occurredAtUtc: string;
  correlationId: string;
  severity?: SiteHealthSeverity;
  /** Short, non-PII summary suitable for audit lists. */
  payloadSummary?: string;
}
