/**
 * Admin Control Plane — in-memory run service implementation.
 *
 * Provides a working run lifecycle (launch, status, history, cancel, retry)
 * backed by an in-memory store. This implementation is used during Phase 3
 * for development and testing. Phase 4 will add durable Table Storage persistence.
 *
 * Design:
 * - Run envelopes are stored in a Map keyed by runId.
 * - Launch creates a new envelope in Pending status.
 * - Status/history queries read from the in-memory store.
 * - Cancel and retry perform state transitions with validation.
 * - All state changes are synchronous (no async orchestration yet — P3-07).
 *
 * See: Phase 2 run model, Phase 3 Summary Plan (P3-05)
 *
 * @module admin-control-plane/services
 */

import {
  AdminRunStatus,
  AdminExecutionMode,
  AdminRiskLevel,
} from '@hbc/models/admin-control-plane';

import type {
  IAdminActorContext,
  IAdminRunEnvelope,
  IAdminRunLaunchRequest,
  IAdminRunLaunchResponse,
  IAdminRunSummary,
  AdminActionKey,
} from '@hbc/models/admin-control-plane';

import type {
  IAdminRunService,
  IAdminRunListOptions,
  IAdminRunListResult,
} from './types.js';

/**
 * In-memory run service for Phase 3 development and testing.
 *
 * Stores run envelopes in memory. State is lost on process restart.
 * Phase 4 replaces this with Table Storage persistence.
 */
export class InMemoryAdminRunService implements IAdminRunService {
  private readonly runs = new Map<string, IAdminRunEnvelope>();

  async launchRun(request: IAdminRunLaunchRequest, actor: IAdminActorContext): Promise<IAdminRunLaunchResponse> {
    const runId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Default execution mode and risk level — later prompts will resolve
    // these from the action catalog based on actionKey.
    const executionMode = AdminExecutionMode.Seamless;
    const riskLevel = AdminRiskLevel.Low;

    const envelope: IAdminRunEnvelope = {
      runId,
      parentRunId: null,
      actionKey: request.actionKey as AdminActionKey,
      domain: 'provisioning' as never, // Domain resolution deferred to P3-06
      riskLevel,
      executionMode,
      initiatedBy: actor,
      lastApprovedBy: null,
      commandInputRef: null,
      configSnapshotRef: null,
      status: request.dryRun ? AdminRunStatus.Validating : AdminRunStatus.Pending,
      totalSteps: 0,
      currentStep: null,
      steps: [],
      failure: null,
      createdAt: now,
      startedAt: null,
      completedAt: null,
      targetEntityId: request.targetEntityId ?? null,
      targetEntityLabel: null,
    };

    this.runs.set(runId, envelope);

    console.log(`[InMemoryAdminRunService] Created run ${runId} for action ${request.actionKey} (${request.dryRun ? 'dry-run' : 'live'})`);

    return {
      runId,
      status: envelope.status,
      actionKey: request.actionKey as AdminActionKey,
      executionMode,
      riskLevel,
    };
  }

  async getRun(runId: string): Promise<IAdminRunEnvelope | null> {
    return this.runs.get(runId) ?? null;
  }

  async listRuns(options: IAdminRunListOptions): Promise<IAdminRunListResult> {
    let runs = [...this.runs.values()];

    // Apply filters
    if (options.domain) {
      runs = runs.filter(r => r.domain === options.domain);
    }
    if (options.status) {
      runs = runs.filter(r => r.status === options.status);
    }

    // Sort by creation time descending (newest first)
    runs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? 25;
    const total = runs.length;
    const start = (page - 1) * pageSize;
    const pageItems = runs.slice(start, start + pageSize);

    const items: IAdminRunSummary[] = pageItems.map(r => ({
      runId: r.runId,
      actionKey: r.actionKey,
      domain: r.domain,
      riskLevel: r.riskLevel,
      executionMode: r.executionMode,
      status: r.status,
      targetEntityId: r.targetEntityId,
      targetEntityLabel: r.targetEntityLabel,
      initiatedBy: r.initiatedBy,
      totalSteps: r.totalSteps,
      currentStep: r.currentStep,
      createdAt: r.createdAt,
      startedAt: r.startedAt,
      completedAt: r.completedAt,
    }));

    return { items, total, page, pageSize };
  }

  async cancelRun(runId: string, actor: IAdminActorContext, reason?: string): Promise<IAdminRunEnvelope> {
    const run = this.runs.get(runId);
    if (!run) {
      throw new Error(`Run ${runId} not found`);
    }

    const cancellableStatuses = new Set([
      AdminRunStatus.Pending,
      AdminRunStatus.Validating,
      AdminRunStatus.Running,
      AdminRunStatus.AwaitingApproval,
    ]);

    if (!cancellableStatuses.has(run.status)) {
      throw new Error(`Run ${runId} cannot be cancelled in status ${run.status}`);
    }

    const now = new Date().toISOString();
    const updated: IAdminRunEnvelope = {
      ...run,
      status: AdminRunStatus.Cancelled,
      completedAt: now,
    };

    this.runs.set(runId, updated);
    console.log(`[InMemoryAdminRunService] Cancelled run ${runId} by ${actor.upn}${reason ? `: ${reason}` : ''}`);

    return updated;
  }

  async retryRun(parentRunId: string, actor: IAdminActorContext): Promise<IAdminRunLaunchResponse> {
    const parentRun = this.runs.get(parentRunId);
    if (!parentRun) {
      throw new Error(`Run ${parentRunId} not found`);
    }

    if (parentRun.status !== AdminRunStatus.Failed) {
      throw new Error(`Run ${parentRunId} is not in Failed status (current: ${parentRun.status})`);
    }

    const runId = crypto.randomUUID();
    const now = new Date().toISOString();

    const retryCount = (parentRun.failure?.retryCount ?? 0) + 1;

    const envelope: IAdminRunEnvelope = {
      ...parentRun,
      runId,
      parentRunId,
      status: AdminRunStatus.Pending,
      currentStep: null,
      steps: [],
      failure: null,
      initiatedBy: actor,
      lastApprovedBy: null,
      createdAt: now,
      startedAt: null,
      completedAt: null,
    };

    this.runs.set(runId, envelope);
    console.log(`[InMemoryAdminRunService] Retry run ${runId} created from parent ${parentRunId} (attempt ${retryCount})`);

    return {
      runId,
      status: AdminRunStatus.Pending,
      actionKey: parentRun.actionKey,
      executionMode: parentRun.executionMode,
      riskLevel: parentRun.riskLevel,
    };
  }
}
