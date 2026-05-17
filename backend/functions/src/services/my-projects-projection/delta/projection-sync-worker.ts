/**
 * My Projects projection — Service Bus sync worker (pure handler).
 *
 * Receives an `IMyProjectsProjectionSyncMessage`, acquires the per-source-kind
 * sync lease, reads delta state, drains Graph `listItem/delta`, hands the
 * classified change set to the projection slice-recompute service (Prompt-07
 * seam; Prompt-06 ships a noop), advances the delta checkpoint under ETag
 * guard, and releases the lease.
 *
 * Failure semantics:
 *   - 410 Gone           → markNeedsResync (preserves prior DeltaLink),
 *                          return cleanly (Service Bus completes the message).
 *   - delta non-410      → markFailure, RETHROW (Service Bus retries).
 *   - recompute failure  → release lease, RETHROW. Do NOT advance checkpoint.
 *   - advance concurrency → benign (another worker won); release + return.
 */

import { randomUUID } from 'node:crypto';
import type { ILogger } from '../../../utils/logger.js';
import {
  isProjectionSyncMessage,
  type IMyProjectsProjectionSyncMessage,
} from '../projection-message-contract.js';
import type { IProjectionDeltaStateEntity } from '../projection-state-entities.js';
import type { SourceListKind } from '../projection-types.js';
import { DeltaStateConcurrencyError } from '../state/delta-state-repository.js';
import type {
  IProjectionGraphDeltaClient,
  IDeltaDrainOutcome,
} from './projection-graph-delta-client.js';
import type {
  IProjectionSliceRecomputeService,
  IRecomputeCounts,
} from './projection-slice-recompute-service.js';

export interface IProjectionDeltaStateReader {
  getWithEtag(
    sourceListKind: SourceListKind,
  ): Promise<{ entity: IProjectionDeltaStateEntity; etag: string } | null>;
}

export interface IProjectionDeltaStateAdvancer {
  advanceCheckpoint(args: {
    sourceListKind: SourceListKind;
    deltaLink: string;
    changedCount: number;
    deletedCount: number;
    batchId: string;
    atUtc: string;
    expectedEtag: string;
  }): Promise<void>;
  markFailure(args: {
    sourceListKind: SourceListKind;
    failureCode: string;
    atUtc: string;
    expectedEtag: string;
  }): Promise<void>;
  markNeedsResync(args: {
    sourceListKind: SourceListKind;
    failureCode: string;
    atUtc: string;
    expectedEtag: string;
  }): Promise<void>;
}

export interface IProjectionLeaseAcquirer {
  tryAcquire(args: {
    rowKey: `Lease:Sync:${SourceListKind}`;
    leaseType: 'sync';
    leaseOwner: string;
    ttlMinutes: number;
    sourceListKind?: SourceListKind;
    now: Date;
  }): Promise<
    | { readonly acquired: true; readonly expiresAtUtc: string }
    | {
        readonly acquired: false;
        readonly reason: 'active';
        readonly currentOwner: string;
        readonly expiresAtUtc: string;
      }
    | { readonly acquired: false; readonly reason: 'race-conflict' }
  >;
  release(args: {
    rowKey: `Lease:Sync:${SourceListKind}`;
    leaseOwner: string;
  }): Promise<{ readonly released: boolean }>;
}

export interface IProjectionSyncWorkerDeps {
  readonly deltaStateRepository: IProjectionDeltaStateReader & IProjectionDeltaStateAdvancer;
  readonly leaseRepository: IProjectionLeaseAcquirer;
  readonly deltaClient: IProjectionGraphDeltaClient;
  readonly recomputeService: IProjectionSliceRecomputeService;
  readonly logger: ILogger;
  readonly now: () => Date;
  readonly leaseOwner: string;
  readonly syncLeaseMinutes: number;
  readonly maxDeltaPagesPerRun: number;
  readonly runIdProvider?: () => string;
}

export type IProjectionSyncWorkerStatus =
  | 'completed'
  | 'lease-skipped'
  | 'resync-required-no-baseline'
  | 'resync-required-state-flag'
  | 'resync-required-410'
  | 'rejected-malformed';

export interface IProjectionSyncWorkerOutcome {
  readonly status: IProjectionSyncWorkerStatus;
  readonly sourceListKind?: SourceListKind;
  readonly runId?: string;
  readonly counts?: IRecomputeCounts;
}

function leaseRowKey(kind: SourceListKind): `Lease:Sync:${SourceListKind}` {
  return `Lease:Sync:${kind}`;
}

export async function handleProjectionSyncMessage(
  message: unknown,
  deps: IProjectionSyncWorkerDeps,
): Promise<IProjectionSyncWorkerOutcome> {
  const messageStartMs = deps.now().getTime();

  if (!isProjectionSyncMessage(message)) {
    deps.logger.trackEvent('myProjectsProjection.worker.message.received', {
      correlationId: null,
      failureCode: 'invalid-message',
    });
    return { status: 'rejected-malformed' };
  }
  const typed: IMyProjectsProjectionSyncMessage = message;
  const sourceListKind = typed.sourceListKind;
  const correlationId = typed.correlationId ?? null;
  const notificationBatchId = typed.notificationBatchId;

  deps.logger.trackEvent('myProjectsProjection.worker.message.received', {
    correlationId,
    sourceListKind,
    debounceBucketUtc: typed.debounceBucketUtc,
    notificationBatchId,
  });

  const leaseAcquire = await deps.leaseRepository.tryAcquire({
    rowKey: leaseRowKey(sourceListKind),
    leaseType: 'sync',
    leaseOwner: deps.leaseOwner,
    ttlMinutes: deps.syncLeaseMinutes,
    sourceListKind,
    now: deps.now(),
  });
  if (!leaseAcquire.acquired) {
    const currentOwner = leaseAcquire.reason === 'active' ? leaseAcquire.currentOwner : undefined;
    deps.logger.trackEvent('myProjectsProjection.worker.lease.skipped', {
      correlationId,
      sourceListKind,
      reason: leaseAcquire.reason,
      currentOwner,
    });
    return { status: 'lease-skipped', sourceListKind };
  }
  deps.logger.trackEvent('myProjectsProjection.worker.lease.acquired', {
    correlationId,
    sourceListKind,
    expiresAtUtc: leaseAcquire.expiresAtUtc,
  });

  try {
    const stateWithEtag = await deps.deltaStateRepository.getWithEtag(sourceListKind);
    if (stateWithEtag === null || (stateWithEtag.entity.DeltaLink ?? '').length === 0) {
      deps.logger.trackEvent('myProjectsProjection.worker.delta.resyncRequired', {
        correlationId,
        sourceListKind,
        reason: 'no-baseline',
      });
      return { status: 'resync-required-no-baseline', sourceListKind };
    }
    if (stateWithEtag.entity.NeedsResync === true) {
      deps.logger.trackEvent('myProjectsProjection.worker.delta.resyncRequired', {
        correlationId,
        sourceListKind,
        reason: 'state-flag',
      });
      return { status: 'resync-required-state-flag', sourceListKind };
    }

    const runId = deps.runIdProvider?.() ?? randomUUID();
    deps.logger.trackEvent('myProjectsProjection.worker.delta.start', {
      correlationId,
      sourceListKind,
      runId,
    });
    const drainOutcome: IDeltaDrainOutcome = await deps.deltaClient.drainDelta({
      deltaLink: stateWithEtag.entity.DeltaLink as string,
      maxPages: deps.maxDeltaPagesPerRun,
    });

    if (!drainOutcome.ok) {
      if (drainOutcome.failureCode === 'graph-410-gone') {
        await deps.deltaStateRepository.markNeedsResync({
          sourceListKind,
          failureCode: 'delta-token-expired-or-invalid',
          atUtc: deps.now().toISOString(),
          expectedEtag: stateWithEtag.etag,
        });
        deps.logger.trackEvent('myProjectsProjection.worker.delta.resyncRequired', {
          correlationId,
          sourceListKind,
          runId,
          reason: '410',
        });
        return { status: 'resync-required-410', sourceListKind, runId };
      }
      try {
        await deps.deltaStateRepository.markFailure({
          sourceListKind,
          failureCode: drainOutcome.failureCode,
          atUtc: deps.now().toISOString(),
          expectedEtag: stateWithEtag.etag,
        });
      } catch (markErr: unknown) {
        const markMessage = markErr instanceof Error ? markErr.message : String(markErr);
        deps.logger.warn('myProjectsProjection.worker.delta.markFailureError', {
          correlationId,
          sourceListKind,
          sanitizedReason: markMessage.slice(0, 240),
        });
      }
      deps.logger.trackEvent('myProjectsProjection.worker.delta.failure', {
        correlationId,
        sourceListKind,
        runId,
        failureCode: drainOutcome.failureCode,
        sanitizedReason: drainOutcome.sanitizedReason,
      });
      throw new Error(
        `projection-sync-worker: delta drain failed (${drainOutcome.failureCode}) for source list '${sourceListKind}'.`,
      );
    }

    const drainResult = drainOutcome.result;
    if (drainResult.pageCount > 1) {
      deps.logger.trackEvent('myProjectsProjection.worker.delta.page', {
        correlationId,
        sourceListKind,
        runId,
        deltaPageCount: drainResult.pageCount,
      });
    }
    deps.logger.trackEvent('myProjectsProjection.worker.delta.success', {
      correlationId,
      sourceListKind,
      runId,
      changedItemCount: drainResult.changedItems.length,
      deletedItemCount: drainResult.deletedItemIds.length,
      deltaPageCount: drainResult.pageCount,
    });

    const recomputeOutcome = await deps.recomputeService.recompute({
      sourceListKind,
      changedItemIds: drainResult.changedItems.map((item) => item.id),
      deletedItemIds: drainResult.deletedItemIds,
      projectionBatchId: runId,
      correlationId: correlationId ?? runId,
    });

    if (!recomputeOutcome.ok) {
      deps.logger.trackEvent('myProjectsProjection.worker.projection.write.failure', {
        correlationId,
        sourceListKind,
        runId,
        failureCode: recomputeOutcome.failureCode,
        sanitizedReason: recomputeOutcome.sanitizedReason,
        partialCounts: recomputeOutcome.partialCounts,
      });
      throw new Error(
        `projection-sync-worker: recompute failed (${recomputeOutcome.failureCode}) for source list '${sourceListKind}'.`,
      );
    }
    deps.logger.trackEvent('myProjectsProjection.worker.projection.write.success', {
      correlationId,
      sourceListKind,
      runId,
      counts: recomputeOutcome.counts,
    });

    try {
      await deps.deltaStateRepository.advanceCheckpoint({
        sourceListKind,
        deltaLink: drainResult.finalDeltaLink,
        changedCount: drainResult.changedItems.length,
        deletedCount: drainResult.deletedItemIds.length,
        batchId: runId,
        atUtc: deps.now().toISOString(),
        expectedEtag: stateWithEtag.etag,
      });
    } catch (err: unknown) {
      if (err instanceof DeltaStateConcurrencyError) {
        deps.logger.warn('myProjectsProjection.worker.delta.checkpointConcurrencyConflict', {
          correlationId,
          sourceListKind,
          runId,
        });
        deps.logger.trackEvent('myProjectsProjection.worker.message.completed', {
          correlationId,
          sourceListKind,
          runId,
          durationMs: deps.now().getTime() - messageStartMs,
          counts: recomputeOutcome.counts,
          checkpointAdvanced: false,
        });
        return {
          status: 'completed',
          sourceListKind,
          runId,
          counts: recomputeOutcome.counts,
        };
      }
      throw err;
    }

    deps.logger.trackEvent('myProjectsProjection.worker.message.completed', {
      correlationId,
      sourceListKind,
      runId,
      durationMs: deps.now().getTime() - messageStartMs,
      counts: recomputeOutcome.counts,
      checkpointAdvanced: true,
    });
    return {
      status: 'completed',
      sourceListKind,
      runId,
      counts: recomputeOutcome.counts,
    };
  } finally {
    await deps.leaseRepository.release({
      rowKey: leaseRowKey(sourceListKind),
      leaseOwner: deps.leaseOwner,
    });
  }
}
