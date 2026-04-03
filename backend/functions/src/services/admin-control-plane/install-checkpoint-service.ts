/**
 * P6-06: Install checkpoint lifecycle service.
 *
 * Manages the checkpoint approve/reject/cancel flow for install runs.
 * Checkpoint state is the run envelope's status field (AwaitingApproval);
 * decisions are recorded as audit events with evidence. No separate
 * checkpoint persistence store — the audit service is the durable record.
 */

import {
  AdminRunStatus,
  AdminAuditEventType,
  AdminDomain,
  InstallStepId,
  INSTALL_ACTION_KEYS,
} from '@hbc/models/admin-control-plane';
import type {
  IAdminActorContext,
  IAdminRunEnvelope,
  IAdminCheckpointDecisionResponse,
} from '@hbc/models/admin-control-plane';
import type {
  IAdminRunService,
  IAdminAuditService,
} from './types.js';
import { INSTALL_STEP_CATALOG } from './install-orchestrator.js';

// ─── Checkpoint Instruction Blocks ─────────────────────────────────────────────

export interface CheckpointInstructions {
  /** What the operator needs to do */
  readonly instructions: string;
  /** URL to the external system (if constructible) */
  readonly externalUrl: string | null;
  /** How the operator should verify the action was completed */
  readonly verificationHint: string;
  /** What risk exists if the operator proceeds without completing the action */
  readonly riskWarning: string;
  /** What happens next if the operator approves */
  readonly resumeBehavior: string;
}

const CHECKPOINT_INSTRUCTIONS: Record<string, CheckpointInstructions> = {
  [InstallStepId.GrantApiPermissions]: {
    instructions:
      'Navigate to Entra admin portal → App registrations → Select the HB Intel app registration → ' +
      'API permissions → Click "Grant admin consent for [tenant]". ' +
      'This grants the application permissions required for Graph API operations.',
    externalUrl: 'https://entra.microsoft.com/#view/Microsoft_AAD_RegisteredApps',
    verificationHint:
      'The Status column should show "Granted" for all listed permissions. ' +
      'If any permission shows "Not granted", the consent was not completed.',
    riskWarning:
      'If you approve without granting consent, subsequent steps that require Graph API access ' +
      '(group creation, permission assignments) will fail.',
    resumeBehavior:
      'The install will continue with SPFx package upload, SharePoint API access request, ' +
      'hub site configuration, and post-install verification.',
  },
  [InstallStepId.RequestSharePointApiAccess]: {
    instructions:
      'Navigate to SharePoint admin center → API access → ' +
      'Find the pending request for HB Intel and click "Approve". ' +
      'This grants the SPFx app permission to call backend APIs.',
    externalUrl: null,
    verificationHint:
      'The request should show "Approved" status in the API access list. ' +
      'If the request is still "Pending", the approval was not completed.',
    riskWarning:
      'If you approve without completing the SharePoint API access approval, ' +
      'the SPFx web parts will not be able to communicate with the backend.',
    resumeBehavior:
      'The install will continue with hub site configuration and post-install verification.',
  },
};

/**
 * Returns the operator instruction block for a checkpoint step.
 * Returns null if the step is not a checkpoint step.
 */
export function getCheckpointInstructions(stepId: string): CheckpointInstructions | null {
  return CHECKPOINT_INSTRUCTIONS[stepId] ?? null;
}

// ─── Decision Processing ───────────────────────────────────────────────────────

/** Terminal statuses that cannot receive checkpoint decisions. */
const TERMINAL_STATUSES = new Set([
  AdminRunStatus.Completed,
  AdminRunStatus.Failed,
  AdminRunStatus.Cancelled,
]);

export interface CheckpointDecisionResult {
  readonly success: boolean;
  readonly response: IAdminCheckpointDecisionResponse;
  readonly error?: string;
}

/**
 * Process a checkpoint decision (approve or reject) for an install run.
 *
 * - Validates the run is in AwaitingApproval state
 * - Records a CheckpointDecided audit event
 * - On approve: the caller should resume the orchestrator
 * - On reject: records the run as failed
 */
export async function processCheckpointDecision(
  runService: IAdminRunService,
  auditService: IAdminAuditService,
  runId: string,
  stepNumber: number,
  decision: 'approve' | 'reject',
  actor: IAdminActorContext,
  comment?: string,
): Promise<CheckpointDecisionResult> {
  // 1. Validate the run exists and is in the right state
  const run = await runService.getRun(runId);
  if (!run) {
    return {
      success: false,
      response: { runId, stepNumber, decision, updatedStatus: AdminRunStatus.Failed },
      error: `Run ${runId} not found`,
    };
  }

  if (TERMINAL_STATUSES.has(run.status)) {
    return {
      success: false,
      response: { runId, stepNumber, decision, updatedStatus: run.status },
      error: `Run ${runId} is in terminal state ${run.status} — cannot process checkpoint decision`,
    };
  }

  if (run.status !== AdminRunStatus.AwaitingApproval) {
    return {
      success: false,
      response: { runId, stepNumber, decision, updatedStatus: run.status },
      error: `Run ${runId} is in state ${run.status}, not AwaitingApproval`,
    };
  }

  // 2. Determine the updated status based on the decision
  const updatedStatus = decision === 'approve' ? AdminRunStatus.Running : AdminRunStatus.Failed;

  // 3. Record the checkpoint decision audit event (fire-and-forget)
  const auditEventType = decision === 'approve'
    ? AdminAuditEventType.CheckpointDecided
    : AdminAuditEventType.CheckpointDecided;

  await auditService.recordEvent({
    auditId: crypto.randomUUID(),
    eventType: auditEventType,
    timestamp: new Date().toISOString(),
    domain: AdminDomain.SetupInstall,
    actionKey: INSTALL_ACTION_KEYS.FULL_INSTALL,
    runId,
    checkpointInstanceId: `checkpoint-step-${stepNumber}`,
    actor,
    rationale: comment ? { reason: comment, externalReference: null, recordedAt: new Date().toISOString(), recordedBy: actor } : null,
    evidenceRef: null,
    configSnapshotRef: null,
    runStatusAtEvent: updatedStatus,
    summary: `Checkpoint at step ${stepNumber} ${decision === 'approve' ? 'approved' : 'rejected'} by ${actor.displayName}${comment ? `: ${comment}` : ''}`,
  }).catch((err) => {
    console.error(`[InstallCheckpointService] Non-critical: failed to record checkpoint decision audit for ${runId}`, err);
  });

  // 4. If rejected, also record a RunFailed event
  if (decision === 'reject') {
    await auditService.recordEvent({
      auditId: crypto.randomUUID(),
      eventType: AdminAuditEventType.RunFailed,
      timestamp: new Date().toISOString(),
      domain: AdminDomain.SetupInstall,
      actionKey: INSTALL_ACTION_KEYS.FULL_INSTALL,
      runId,
      checkpointInstanceId: null,
      actor,
      rationale: comment ? { reason: comment, externalReference: null, recordedAt: new Date().toISOString(), recordedBy: actor } : null,
      evidenceRef: null,
      configSnapshotRef: null,
      runStatusAtEvent: AdminRunStatus.Failed,
      summary: `Install run ${runId} failed — checkpoint at step ${stepNumber} rejected by ${actor.displayName}`,
    }).catch((err) => {
      console.error(`[InstallCheckpointService] Non-critical: failed to record run-failed audit for ${runId}`, err);
    });
  }

  console.log(
    `[InstallCheckpointService] Checkpoint decision for run ${runId} step ${stepNumber}: ` +
    `${decision} by ${actor.upn}${comment ? ` (${comment})` : ''}`,
  );

  return {
    success: true,
    response: { runId, stepNumber, decision, updatedStatus },
  };
}

/**
 * Resume an install run after a checkpoint approval.
 *
 * Re-enters the orchestrator step loop starting from the step after
 * the approved checkpoint. Uses the same adapter-invocation pattern
 * as executeInstallRun.
 */
export async function resumeAfterCheckpoint(
  deps: { runService: IAdminRunService; auditService: IAdminAuditService; adapterRegistry: import('./types.js').IAdminAdapterRegistry },
  runId: string,
  fromStepIndex: number,
  actor: IAdminActorContext,
  commandInput: Record<string, unknown>,
): Promise<IAdminRunEnvelope> {
  const { runService, auditService, adapterRegistry } = deps;
  const { AdminAdapterOutcome } = await import('@hbc/models/admin-control-plane');

  for (let i = fromStepIndex; i < INSTALL_STEP_CATALOG.length; i++) {
    const stepDef = INSTALL_STEP_CATALOG[i];
    const stepNumber = i + 1;

    // Check if run was cancelled between steps
    const currentRun = await runService.getRun(runId);
    if (!currentRun || currentRun.status === AdminRunStatus.Cancelled) {
      return currentRun ?? (await runService.getRun(runId)) as IAdminRunEnvelope;
    }

    // If this step is a checkpoint, pause again
    if (stepDef.requiresCheckpoint) {
      auditService.recordEvent({
        auditId: crypto.randomUUID(),
        eventType: AdminAuditEventType.CheckpointCreated,
        timestamp: new Date().toISOString(),
        domain: AdminDomain.SetupInstall,
        actionKey: INSTALL_ACTION_KEYS.FULL_INSTALL,
        runId,
        checkpointInstanceId: `checkpoint-step-${stepNumber}`,
        actor,
        rationale: null,
        evidenceRef: null,
        configSnapshotRef: null,
        runStatusAtEvent: AdminRunStatus.AwaitingApproval,
        summary: `Checkpoint at step ${stepNumber}: ${stepDef.label}`,
      }).catch((err) => {
        console.error(`[InstallCheckpointService] Non-critical: failed to record checkpoint for step ${stepNumber}`, err);
      });

      return (await runService.getRun(runId)) as IAdminRunEnvelope;
    }

    // Execute step via adapter
    const invocationContext = {
      runId,
      stepNumber,
      actor,
      isRetry: false,
      retryAttempt: 0,
      dryRun: false,
      correlationId: runId,
      input: { ...commandInput, operation: stepDef.operation },
      resolvedConfig: {},
    };

    const result = await adapterRegistry.invoke(stepDef.adapterKey, invocationContext);

    const succeeded =
      result.outcome === AdminAdapterOutcome.Success ||
      result.outcome === AdminAdapterOutcome.SuccessWithWarnings ||
      result.outcome === AdminAdapterOutcome.Skipped;

    if (!succeeded && stepDef.blocking) {
      auditService.recordEvent({
        auditId: crypto.randomUUID(),
        eventType: AdminAuditEventType.RunFailed,
        timestamp: new Date().toISOString(),
        domain: AdminDomain.SetupInstall,
        actionKey: INSTALL_ACTION_KEYS.FULL_INSTALL,
        runId,
        checkpointInstanceId: null,
        actor,
        rationale: null,
        evidenceRef: null,
        configSnapshotRef: null,
        runStatusAtEvent: AdminRunStatus.Failed,
        summary: `Install failed at step ${stepNumber} (${stepDef.label}) after checkpoint resume`,
      }).catch(() => {});

      return (await runService.getRun(runId)) as IAdminRunEnvelope;
    }
  }

  // All remaining steps completed
  auditService.recordEvent({
    auditId: crypto.randomUUID(),
    eventType: AdminAuditEventType.RunCompleted,
    timestamp: new Date().toISOString(),
    domain: AdminDomain.SetupInstall,
    actionKey: INSTALL_ACTION_KEYS.FULL_INSTALL,
    runId,
    checkpointInstanceId: null,
    actor,
    rationale: null,
    evidenceRef: null,
    configSnapshotRef: null,
    runStatusAtEvent: AdminRunStatus.Completed,
    summary: `Install/bootstrap run ${runId} completed after checkpoint resume`,
  }).catch(() => {});

  return (await runService.getRun(runId)) as IAdminRunEnvelope;
}
