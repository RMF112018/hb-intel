/**
 * Admin Control Plane — durable run store (Azure Table Storage).
 *
 * Replaces InMemoryAdminRunService with Table Storage-backed persistence.
 * Table: `AdminRuns`, PartitionKey: `domain`, RowKey: `runId`.
 *
 * Follows the provisioning precedent: Replace-mode upserts, JSON-serialized
 * complex fields, empty-string-to-undefined deserialization.
 *
 * See: Phase 4 baseline (P4-02), persistence boundary matrix
 *
 * @module admin-control-plane/services
 */

import { odata } from '@azure/data-tables';
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
  IAdminStepResult,
  IAdminFailureSummary,
  AdminActionKey,
} from '@hbc/models/admin-control-plane';

import { createAppTableClient } from '../../utils/table-client-factory.js';

import type {
  IAdminRunService,
  IAdminRunListOptions,
  IAdminRunListResult,
} from './types.js';

const ADMIN_RUNS_TABLE = 'AdminRuns';

/**
 * Durable admin run store backed by Azure Table Storage.
 *
 * Entity keying:
 * - PartitionKey: `domain` — enables domain-scoped queries
 * - RowKey: `runId` (UUID v4) — globally unique, enables direct lookup
 *
 * JSON-serialized fields: steps, failure, initiatedBy, lastApprovedBy
 * Empty-string convention: undefined optional strings stored as ''
 */
export class DurableAdminRunStore implements IAdminRunService {
  private readonly client = createAppTableClient(ADMIN_RUNS_TABLE);
  private tableEnsured = false;

  private async ensureTable(): Promise<void> {
    if (this.tableEnsured) return;
    await this.client.createTable().catch(() => { /* table may already exist */ });
    this.tableEnsured = true;
  }

  async launchRun(request: IAdminRunLaunchRequest, actor: IAdminActorContext): Promise<IAdminRunLaunchResponse> {
    const runId = crypto.randomUUID();
    const now = new Date().toISOString();

    const executionMode = AdminExecutionMode.Seamless;
    const riskLevel = AdminRiskLevel.Low;
    const domain = extractDomainFromActionKey(request.actionKey);

    const envelope: IAdminRunEnvelope = {
      runId,
      parentRunId: null,
      actionKey: request.actionKey as AdminActionKey,
      domain: domain as never,
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

    await this.upsertRun(envelope);

    return {
      runId,
      status: envelope.status,
      actionKey: request.actionKey as AdminActionKey,
      executionMode,
      riskLevel,
    };
  }

  async getRun(runId: string): Promise<IAdminRunEnvelope | null> {
    await this.ensureTable();

    // Scan all partitions for the runId (row key).
    // For direct lookup by runId without knowing domain, we scan.
    // Production optimization: maintain a runId→domain index or use runId as partition key.
    const entities = this.client.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`RowKey eq ${runId}` },
    });

    for await (const entity of entities) {
      return deserializeRunEnvelope(entity as Record<string, unknown>);
    }
    return null;
  }

  async listRuns(options: IAdminRunListOptions): Promise<IAdminRunListResult> {
    await this.ensureTable();

    const filters: string[] = [];
    if (options.domain) {
      filters.push(odata`PartitionKey eq ${options.domain}`);
    }
    if (options.status) {
      filters.push(odata`status eq ${options.status}`);
    }

    const queryOptions = filters.length > 0
      ? { filter: filters.join(' and ') }
      : undefined;

    const entities = this.client.listEntities<Record<string, unknown>>({ queryOptions });

    const allRuns: IAdminRunEnvelope[] = [];
    for await (const entity of entities) {
      allRuns.push(deserializeRunEnvelope(entity as Record<string, unknown>));
    }

    // Sort by creation time descending
    allRuns.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? 25;
    const total = allRuns.length;
    const start = (page - 1) * pageSize;
    const pageItems = allRuns.slice(start, start + pageSize);

    const items = pageItems.map(r => ({
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
    const run = await this.getRun(runId);
    if (!run) throw new Error(`Run ${runId} not found`);

    const cancellable = new Set([
      AdminRunStatus.Pending, AdminRunStatus.Validating,
      AdminRunStatus.Running, AdminRunStatus.AwaitingApproval,
    ]);
    if (!cancellable.has(run.status)) {
      throw new Error(`Run ${runId} cannot be cancelled in status ${run.status}`);
    }

    const updated: IAdminRunEnvelope = {
      ...run,
      status: AdminRunStatus.Cancelled,
      completedAt: new Date().toISOString(),
    };

    await this.upsertRun(updated);
    console.log(`[DurableAdminRunStore] Cancelled run ${runId} by ${actor.upn}${reason ? `: ${reason}` : ''}`);
    return updated;
  }

  async retryRun(parentRunId: string, actor: IAdminActorContext): Promise<IAdminRunLaunchResponse> {
    const parentRun = await this.getRun(parentRunId);
    if (!parentRun) throw new Error(`Run ${parentRunId} not found`);
    if (parentRun.status !== AdminRunStatus.Failed) {
      throw new Error(`Run ${parentRunId} is not in Failed status (current: ${parentRun.status})`);
    }

    const runId = crypto.randomUUID();
    const now = new Date().toISOString();

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

    await this.upsertRun(envelope);
    return {
      runId,
      status: AdminRunStatus.Pending,
      actionKey: parentRun.actionKey,
      executionMode: parentRun.executionMode,
      riskLevel: parentRun.riskLevel,
    };
  }

  /** Upsert a run envelope to Table Storage. */
  private async upsertRun(envelope: IAdminRunEnvelope): Promise<void> {
    await this.ensureTable();
    await this.client.upsertEntity(serializeRunEnvelope(envelope), 'Replace');
  }
}

// ── Serialization ──────────────────────────────────────────────────────────────

/** Extract domain prefix from action key (e.g., 'provisioning:site:create' → 'provisioning-rollout'). */
function extractDomainFromActionKey(actionKey: string): string {
  return actionKey.split(':')[0] || 'unknown';
}

/** Serialize an IAdminRunEnvelope to a Table Storage entity. */
export function serializeRunEnvelope(envelope: IAdminRunEnvelope): { partitionKey: string; rowKey: string } & Record<string, unknown> {
  return {
    partitionKey: String(envelope.domain),
    rowKey: envelope.runId,
    parentRunId: envelope.parentRunId ?? '',
    actionKey: String(envelope.actionKey),
    domain: String(envelope.domain),
    riskLevel: String(envelope.riskLevel),
    executionMode: String(envelope.executionMode),
    initiatedByJson: JSON.stringify(envelope.initiatedBy),
    lastApprovedByJson: JSON.stringify(envelope.lastApprovedBy),
    commandInputRef: envelope.commandInputRef ?? '',
    configSnapshotRef: envelope.configSnapshotRef ?? '',
    status: String(envelope.status),
    totalSteps: envelope.totalSteps,
    currentStep: envelope.currentStep ?? -1,
    stepsJson: JSON.stringify(envelope.steps),
    failureJson: JSON.stringify(envelope.failure),
    createdAt: envelope.createdAt,
    startedAt: envelope.startedAt ?? '',
    completedAt: envelope.completedAt ?? '',
    targetEntityId: envelope.targetEntityId ?? '',
    targetEntityLabel: envelope.targetEntityLabel ?? '',
  };
}

/** Deserialize a Table Storage entity to IAdminRunEnvelope. */
export function deserializeRunEnvelope(entity: Record<string, unknown>): IAdminRunEnvelope {
  return {
    runId: entity.rowKey as string,
    parentRunId: (entity.parentRunId as string) || null,
    actionKey: (entity.actionKey as string) as AdminActionKey,
    domain: (entity.domain as string) as never,
    riskLevel: (entity.riskLevel as string) as AdminRiskLevel,
    executionMode: (entity.executionMode as string) as AdminExecutionMode,
    initiatedBy: JSON.parse((entity.initiatedByJson as string) || '{}') as IAdminActorContext,
    lastApprovedBy: parseJsonOrNull<IAdminActorContext>(entity.lastApprovedByJson as string),
    commandInputRef: (entity.commandInputRef as string) || null,
    configSnapshotRef: (entity.configSnapshotRef as string) || null,
    status: (entity.status as string) as AdminRunStatus,
    totalSteps: (entity.totalSteps as number) ?? 0,
    currentStep: (entity.currentStep as number) === -1 ? null : (entity.currentStep as number),
    steps: JSON.parse((entity.stepsJson as string) || '[]') as IAdminStepResult[],
    failure: parseJsonOrNull<IAdminFailureSummary>(entity.failureJson as string),
    createdAt: entity.createdAt as string,
    startedAt: (entity.startedAt as string) || null,
    completedAt: (entity.completedAt as string) || null,
    targetEntityId: (entity.targetEntityId as string) || null,
    targetEntityLabel: (entity.targetEntityLabel as string) || null,
  };
}

function parseJsonOrNull<T>(json: string | undefined | null): T | null {
  if (!json || json === 'null') return null;
  try { return JSON.parse(json) as T; } catch { return null; }
}
