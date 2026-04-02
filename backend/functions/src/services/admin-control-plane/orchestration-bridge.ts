/**
 * Admin Control Plane — orchestration bridge.
 *
 * Connects the generalized admin backend to the existing provisioning
 * control-plane implementation. The bridge translates between admin run
 * concepts and provisioning-specific concepts without replacing the
 * provisioning saga runtime.
 *
 * Responsibilities:
 * - Translate admin run launch requests into provisioning invocation context
 * - Map provisioning status (IProvisioningStatus) to generalized admin run envelopes
 * - Provide the adapter invoker for the 'provisioning:bridge' adapter key
 * - Keep provisioning-specific logic isolated from the generalized admin model
 *
 * What this bridge does NOT do:
 * - Replace the SagaOrchestrator or provisioning step implementations
 * - Own provisioning state persistence (that stays in @hbc/provisioning / Table Storage)
 * - Claim Phase 4 audit/evidence maturity
 * - Handle non-provisioning admin domains (those get their own adapters)
 *
 * See: Phase 2 run model, Phase 3 Summary Plan (P3-07)
 *
 * @module admin-control-plane/services
 */

import {
  AdminRunStatus,
  AdminStepStatus,
  AdminAdapterOutcome,
  AdminDomain,
  AdminExecutionMode,
  AdminRiskLevel,
} from '@hbc/models/admin-control-plane';

import type {
  IAdminRunEnvelope,
  IAdminStepResult,
  IAdminActorContext,
  IAdminAdapterInvocationContext,
  IAdminAdapterResult,
} from '@hbc/models/admin-control-plane';

import type { AdapterInvoker } from './adapter-registry.js';

// ─── Provisioning Status Mapping ────────────────────────────────────────────────

/**
 * Minimal provisioning status shape for bridge mapping.
 *
 * This interface captures the subset of IProvisioningStatus fields needed
 * to map provisioning runs into the generalized admin run model. The full
 * IProvisioningStatus type is owned by @hbc/provisioning.
 */
export interface IProvisioningStatusSnapshot {
  readonly projectId: string;
  readonly projectName: string;
  readonly correlationId: string;
  readonly parentCorrelationId?: string;
  readonly overallStatus: string;
  readonly currentStep: number;
  readonly totalSteps: number;
  readonly triggeredBy: string;
  readonly createdAt: string;
  readonly completedAt?: string;
  readonly stepResults?: readonly {
    readonly stepNumber: number;
    readonly stepName: string;
    readonly status: string;
    readonly startedAt?: string;
    readonly completedAt?: string;
    readonly error?: string;
  }[];
  readonly retryCount?: number;
  readonly failureClass?: string;
  readonly lastError?: string;
}

/**
 * Map a provisioning status string to a generalized admin run status.
 */
export function mapProvisioningStatus(provisioningStatus: string): AdminRunStatus {
  switch (provisioningStatus) {
    case 'Queued':
    case 'Pending':
      return AdminRunStatus.Pending;
    case 'Running':
    case 'InProgress':
      return AdminRunStatus.Running;
    case 'Completed':
    case 'Succeeded':
      return AdminRunStatus.Completed;
    case 'Failed':
      return AdminRunStatus.Failed;
    case 'Cancelled':
      return AdminRunStatus.Cancelled;
    case 'WebPartsPending':
    case 'PartiallyDeferred':
      return AdminRunStatus.PartiallyDeferred;
    default:
      return AdminRunStatus.Running;
  }
}

/**
 * Map a provisioning step status string to a generalized admin step status.
 */
export function mapProvisioningStepStatus(stepStatus: string): AdminStepStatus {
  switch (stepStatus) {
    case 'Pending':
    case 'NotStarted':
      return AdminStepStatus.Pending;
    case 'Running':
    case 'InProgress':
      return AdminStepStatus.Running;
    case 'Completed':
    case 'Succeeded':
      return AdminStepStatus.Completed;
    case 'Failed':
      return AdminStepStatus.Failed;
    case 'Skipped':
      return AdminStepStatus.Skipped;
    case 'Deferred':
      return AdminStepStatus.Deferred;
    case 'Compensated':
      return AdminStepStatus.Compensated;
    default:
      return AdminStepStatus.Pending;
  }
}

/**
 * Map a provisioning status snapshot to a generalized admin run envelope.
 *
 * This is the core bridge mapping. It projects provisioning-specific data
 * into the domain-agnostic admin run model so the operator console can
 * display provisioning runs alongside future admin domain runs.
 */
export function mapProvisioningToRunEnvelope(
  snapshot: IProvisioningStatusSnapshot,
  actor?: IAdminActorContext,
): IAdminRunEnvelope {
  const status = mapProvisioningStatus(snapshot.overallStatus);
  const isTerminal = [AdminRunStatus.Completed, AdminRunStatus.Failed, AdminRunStatus.Cancelled].includes(status);

  const steps: IAdminStepResult[] = (snapshot.stepResults ?? []).map(step => ({
    stepNumber: step.stepNumber,
    stepLabel: step.stepName,
    status: mapProvisioningStepStatus(step.status),
    startedAt: step.startedAt ?? null,
    completedAt: step.completedAt ?? null,
    durationMs: (step.startedAt && step.completedAt)
      ? new Date(step.completedAt).getTime() - new Date(step.startedAt).getTime()
      : null,
    errorMessage: step.error ?? null,
    compensatable: true,
    compensated: false,
  }));

  const defaultActor: IAdminActorContext = actor ?? {
    upn: snapshot.triggeredBy,
    objectId: '',
    displayName: snapshot.triggeredBy,
    capturedAt: snapshot.createdAt,
  };

  return {
    runId: snapshot.correlationId,
    parentRunId: snapshot.parentCorrelationId ?? null,
    actionKey: 'provisioning:site:create' as never,
    domain: AdminDomain.ProvisioningRollout,
    riskLevel: AdminRiskLevel.Moderate,
    executionMode: AdminExecutionMode.Seamless,
    initiatedBy: defaultActor,
    lastApprovedBy: null,
    commandInputRef: null,
    configSnapshotRef: null,
    status,
    totalSteps: snapshot.totalSteps,
    currentStep: snapshot.currentStep > 0 ? snapshot.currentStep : null,
    steps,
    failure: status === AdminRunStatus.Failed ? {
      failedAtStep: snapshot.currentStep,
      failureClass: (snapshot.failureClass as 'transient' | 'structural' | 'permissions' | 'repeated' | 'admin-class') ?? 'transient',
      failureMessage: snapshot.lastError ?? 'Provisioning failed',
      retryEligible: true,
      retryCount: snapshot.retryCount ?? 0,
      lastRetryAt: null,
      escalated: false,
      escalatedBy: null,
      escalatedAt: null,
    } : null,
    createdAt: snapshot.createdAt,
    startedAt: snapshot.createdAt,
    completedAt: isTerminal ? (snapshot.completedAt ?? new Date().toISOString()) : null,
    targetEntityId: snapshot.projectId,
    targetEntityLabel: snapshot.projectName,
  };
}

// ─── Provisioning Bridge Adapter Invoker ────────────────────────────────────────

/**
 * Create the adapter invoker for the 'provisioning:bridge' adapter key.
 *
 * This invoker translates admin adapter invocation context into a
 * provisioning-compatible response. In Phase 3 it returns a bridge
 * acknowledgment result; P3-07+ can wire it to actually call the
 * SagaOrchestrator when the service container is available.
 *
 * The invoker does NOT directly call SagaOrchestrator.execute() because:
 * - The saga requires IProjectSetupServiceContainer (project-setup host)
 * - The admin control plane host has IAdminControlPlaneServiceContainer
 * - Cross-host service container access is intentionally prevented
 * - Real integration will go through the existing provisioning HTTP endpoints
 */
export function createProvisioningBridgeInvoker(): AdapterInvoker {
  return async (context: IAdminAdapterInvocationContext): Promise<IAdminAdapterResult> => {
    const startTime = Date.now();

    if (context.dryRun) {
      return {
        adapterKey: 'provisioning:bridge',
        outcome: AdminAdapterOutcome.DryRunComplete,
        summary: 'Provisioning bridge dry-run: would invoke provisioning saga for the target project',
        durationMs: Date.now() - startTime,
        warnings: [],
        issues: [],
        remediationHints: [],
        evidenceRefs: [],
        adapterSpecificData: {
          bridgeType: 'provisioning-saga',
          targetEntityId: context.input.projectId ?? context.input.targetEntityId ?? null,
          dryRun: true,
        },
        deduplicatedInvocation: false,
      };
    }

    // Phase 3: Bridge acknowledges the invocation and records the intent.
    // Real saga invocation is handled through the existing provisioning HTTP
    // endpoints (POST /api/provision-project-site). The admin run tracks the
    // bridged invocation for unified history/status display.
    console.log(
      `[ProvisioningBridge] Bridge invocation for run ${context.runId} ` +
      `step ${context.stepNumber} (retry: ${context.isRetry}, attempt: ${context.retryAttempt})`,
    );

    return {
      adapterKey: 'provisioning:bridge',
      outcome: AdminAdapterOutcome.Success,
      summary: 'Provisioning bridge: invocation acknowledged — saga execution delegated to provisioning host',
      durationMs: Date.now() - startTime,
      warnings: [{
        code: 'BRIDGE_DELEGATION',
        message: 'Actual saga execution is handled by the project-setup host, not the admin control plane host',
        resource: null,
      }],
      issues: [],
      remediationHints: [],
      evidenceRefs: [],
      adapterSpecificData: {
        bridgeType: 'provisioning-saga',
        runId: context.runId,
        stepNumber: context.stepNumber,
        correlationId: context.correlationId,
        targetEntityId: context.input.projectId ?? context.input.targetEntityId ?? null,
      },
      deduplicatedInvocation: false,
    };
  };
}
