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
 *
 * Phase 3 / Wave 1 / Prompt 04 adds project context (`projectId`), structured
 * source context (`sourceContext`), and before/after summaries. Existing
 * fields are unchanged. `subjectType` / `subjectId` continue to play the
 * "entity type" / "entity id" role specified by the prompt; no duplicate
 * `entityType` / `entityId` fields are introduced.
 */

import type { PccBusinessAuditEventId, PccProjectId } from './types.js';
import type { PccPersona } from './PccUserRoles.js';
import type { SiteHealthSeverity } from './SiteHealth.js';
import type { WorkflowModuleId } from './WorkflowModules.js';
import type { PccMvpSurfaceId } from './PccMvpSurfaces.js';

export const BUSINESS_AUDIT_SOURCE_CONTEXT_TYPES = [
  'workflow-module',
  'mvp-surface',
] as const;

export type BusinessAuditSourceContextType =
  (typeof BUSINESS_AUDIT_SOURCE_CONTEXT_TYPES)[number];

/**
 * Tagged union for the originating PCC source of a business audit event.
 * Using a tagged union prevents semantic drift from conflating a workflow
 * module id and an MVP surface id under one flat type. Future source types
 * (e.g., `'external-system'`, `'site-health-check'`) can extend the
 * discriminator without renaming the field.
 */
export type BusinessAuditSourceContext =
  | { type: 'workflow-module'; id: WorkflowModuleId }
  | { type: 'mvp-surface'; id: PccMvpSurfaceId };

export interface IBusinessAuditEvent {
  id: PccBusinessAuditEventId;
  eventType: string;
  /** Entity type the event is anchored to (e.g., 'WorkflowItem', 'ApprovalCheckpoint'). */
  subjectType: string;
  /** Entity identifier the event is anchored to. */
  subjectId: string;
  actorUpn: string;
  actorPersona?: PccPersona;
  /** ISO 8601 UTC. */
  occurredAtUtc: string;
  correlationId: string;
  severity?: SiteHealthSeverity;
  /** Short, non-PII summary suitable for audit lists. */
  payloadSummary?: string;
  /** Project anchor; optional because some events are tenant-scoped. */
  projectId?: PccProjectId;
  /** Originating PCC module or MVP surface for the event. */
  sourceContext?: BusinessAuditSourceContext;
  /** Short, non-PII description of the pre-event state. */
  beforeSummary?: string;
  /** Short, non-PII description of the post-event state. */
  afterSummary?: string;
}
