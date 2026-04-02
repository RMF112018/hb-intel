/**
 * Admin Control Plane — provisioning audit bridge.
 *
 * Bridges provisioning saga lifecycle events into the generalized admin
 * run/audit spine. This bridge is called from provisioning route handlers
 * and the saga orchestrator to write into the generalized stores alongside
 * existing provisioning-specific writes.
 *
 * Design:
 * - All bridge calls are fire-and-forget (non-blocking) — they must not
 *   fail the saga or provisioning operations.
 * - The bridge writes to both the admin run store and audit event store.
 * - The bridge does NOT modify existing provisioning writes — it is additive.
 * - The bridge uses the orchestration-bridge mapping functions to translate
 *   provisioning status to admin run envelopes.
 *
 * See: Phase 4 baseline (P4-02), provisioning bridge plan (P4-04)
 *
 * @module admin-control-plane/services
 */

import {
  AdminAuditEventType,
  AdminRunStatus,
  AdminDomain,
} from '@hbc/models/admin-control-plane';

import type {
  IAdminAuditRecord,
  IAdminActorContext,
} from '@hbc/models/admin-control-plane';

import type { IAdminRunService, IAdminAuditService } from './types.js';
import {
  mapProvisioningToRunEnvelope,
} from './orchestration-bridge.js';
import type { IProvisioningStatusSnapshot } from './orchestration-bridge.js';

/**
 * Event types the provisioning audit bridge can record.
 */
export type ProvisioningBridgeEvent =
  | 'saga.started'
  | 'saga.step.completed'
  | 'saga.step.failed'
  | 'saga.step5.deferred'
  | 'saga.completed'
  | 'saga.failed'
  | 'admin.retry'
  | 'admin.escalate'
  | 'admin.archive'
  | 'admin.acknowledge-escalation'
  | 'admin.force-state';

/**
 * Maps a provisioning bridge event to the appropriate admin audit event type.
 */
function mapEventType(event: ProvisioningBridgeEvent): AdminAuditEventType {
  switch (event) {
    case 'saga.started': return AdminAuditEventType.RunStarted;
    case 'saga.step.completed': return AdminAuditEventType.RunStarted; // Step progress logged as annotation
    case 'saga.step.failed': return AdminAuditEventType.RunFailed;
    case 'saga.step5.deferred': return AdminAuditEventType.RunStarted; // Deferral logged as annotation
    case 'saga.completed': return AdminAuditEventType.RunCompleted;
    case 'saga.failed': return AdminAuditEventType.RunFailed;
    case 'admin.retry': return AdminAuditEventType.RunRetried;
    case 'admin.escalate': return AdminAuditEventType.CheckpointEscalated;
    case 'admin.archive': return AdminAuditEventType.RunCancelled;
    case 'admin.acknowledge-escalation': return AdminAuditEventType.CheckpointDecided;
    case 'admin.force-state': return AdminAuditEventType.ConfigModified; // Override recorded as config-level event
  }
}

/**
 * Provisioning audit bridge.
 *
 * Provides fire-and-forget methods to write provisioning lifecycle events
 * into the generalized admin run/audit spine.
 */
export class ProvisioningAuditBridge {
  constructor(
    private readonly runService: IAdminRunService,
    private readonly auditService: IAdminAuditService,
  ) {}

  /**
   * Project a provisioning status snapshot into the generalized run store.
   *
   * Called after each saga step to keep the generalized run store in sync
   * with provisioning status. Uses the orchestration bridge mapping.
   *
   * Fire-and-forget — errors are logged but do not propagate.
   */
  async projectRunStatus(snapshot: IProvisioningStatusSnapshot): Promise<void> {
    try {
      const envelope = mapProvisioningToRunEnvelope(snapshot);
      // Use the run service to check if the run exists, then update or create
      const existing = await this.runService.getRun(envelope.runId);
      if (!existing) {
        // First projection — create via launch with a synthetic request
        await this.runService.launchRun(
          {
            actionKey: 'provisioning-rollout:site:create' as never,
            commandInput: { projectId: snapshot.projectId, projectName: snapshot.projectName },
            targetEntityId: snapshot.projectId,
          },
          envelope.initiatedBy,
        );
      }
      // Note: The generalized run store does not yet support direct upsert of
      // arbitrary envelopes (only launchRun creates). Full status sync requires
      // either a direct upsert method or a projection-on-read approach.
      // Phase 4 uses projection-on-read via the orchestration bridge mapping.
    } catch (err) {
      console.warn(
        `[ProvisioningAuditBridge] Non-critical: failed to project run status for ${snapshot.correlationId}`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  /**
   * Record a provisioning lifecycle event in the generalized audit store.
   *
   * Fire-and-forget — errors are logged but do not propagate.
   */
  async recordEvent(
    event: ProvisioningBridgeEvent,
    snapshot: IProvisioningStatusSnapshot,
    actor?: IAdminActorContext,
    details?: { stepNumber?: number; stepName?: string; error?: string; reason?: string },
  ): Promise<void> {
    try {
      const auditRecord: IAdminAuditRecord = {
        auditId: crypto.randomUUID(),
        eventType: mapEventType(event),
        timestamp: new Date().toISOString(),
        domain: AdminDomain.ProvisioningRollout,
        actionKey: 'provisioning-rollout:site:create' as never,
        runId: snapshot.correlationId,
        checkpointInstanceId: null,
        actor: actor ?? {
          upn: snapshot.triggeredBy,
          objectId: '',
          displayName: snapshot.triggeredBy,
          capturedAt: new Date().toISOString(),
        },
        rationale: details?.reason ? {
          reason: details.reason,
          externalReference: null,
          recordedAt: new Date().toISOString(),
          recordedBy: actor ?? {
            upn: snapshot.triggeredBy,
            objectId: '',
            displayName: snapshot.triggeredBy,
            capturedAt: new Date().toISOString(),
          },
        } : null,
        evidenceRef: null,
        configSnapshotRef: null,
        runStatusAtEvent: mapProvisioningStatusToAdminStatus(snapshot.overallStatus),
        summary: buildEventSummary(event, snapshot, details),
      };

      await this.auditService.recordEvent(auditRecord);
    } catch (err) {
      console.warn(
        `[ProvisioningAuditBridge] Non-critical: failed to record audit event ${event} for ${snapshot.correlationId}`,
        err instanceof Error ? err.message : err,
      );
    }
  }
}

/** Map provisioning status string to AdminRunStatus for audit context. */
function mapProvisioningStatusToAdminStatus(status: string): AdminRunStatus {
  switch (status) {
    case 'InProgress': return AdminRunStatus.Running;
    case 'Completed': case 'BaseComplete': return AdminRunStatus.Completed;
    case 'Failed': return AdminRunStatus.Failed;
    case 'WebPartsPending': return AdminRunStatus.PartiallyDeferred;
    default: return AdminRunStatus.Pending;
  }
}

/** Build a human-readable summary for the audit event. */
function buildEventSummary(
  event: ProvisioningBridgeEvent,
  snapshot: IProvisioningStatusSnapshot,
  details?: { stepNumber?: number; stepName?: string; error?: string; reason?: string },
): string {
  const project = `${snapshot.projectName} (${snapshot.projectId})`;
  switch (event) {
    case 'saga.started': return `Provisioning saga started for ${project}`;
    case 'saga.step.completed': return `Step ${details?.stepNumber ?? '?'} (${details?.stepName ?? '?'}) completed for ${project}`;
    case 'saga.step.failed': return `Step ${details?.stepNumber ?? '?'} (${details?.stepName ?? '?'}) failed for ${project}: ${details?.error ?? 'unknown'}`;
    case 'saga.step5.deferred': return `Step 5 (Install Web Parts) deferred to timer for ${project}`;
    case 'saga.completed': return `Provisioning saga completed successfully for ${project}`;
    case 'saga.failed': return `Provisioning saga failed for ${project}: ${details?.error ?? 'unknown'}`;
    case 'admin.retry': return `Admin retry initiated for ${project}`;
    case 'admin.escalate': return `Admin escalation for ${project}: ${details?.reason ?? ''}`;
    case 'admin.archive': return `Admin archived failed run for ${project}`;
    case 'admin.acknowledge-escalation': return `Admin acknowledged escalation for ${project}`;
    case 'admin.force-state': return `Admin force-state transition for ${project}: ${details?.reason ?? ''}`;
  }
}

/**
 * Create a ProvisioningAuditBridge from the admin service container services.
 *
 * Intended to be called from provisioning route handlers that need to
 * write into the generalized spine.
 */
export function createProvisioningAuditBridge(
  runService: IAdminRunService,
  auditService: IAdminAuditService,
): ProvisioningAuditBridge {
  return new ProvisioningAuditBridge(runService, auditService);
}
