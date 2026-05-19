import { app, type InvocationContext, type Timer } from '@azure/functions';
import { randomUUID } from 'node:crypto';
import { getProjectionConfig } from '../../services/my-projects-projection/projection-config.js';
import { PendingWorkRepository } from '../../services/my-projects-projection/state/pending-work-repository.js';
import { SharePointStateStore } from '../../services/my-projects-projection/state/sharepoint-state-store.js';
import { ProjectionSourceSyncStateRepository } from '../../services/my-projects-projection/state/source-sync-state-repository.js';
import { SharePointProjectionControlStateRepository } from '../../services/my-projects-projection/state/sharepoint-control-state-repository.js';
import { SharePointProjectionRunRepository } from '../../services/my-projects-projection/state/sharepoint-run-repository.js';
import { SyncFailureRepository } from '../../services/my-projects-projection/state/sync-failure-repository.js';
import {
  createProjectionGraphDeltaClient,
  handleProjectionSyncMessage,
  type IProjectionGraphDeltaClient,
  type IProjectionSliceRecomputeService,
} from '../../services/my-projects-projection/delta/index.js';
import { createGraphProjectionSourceFetchClient } from '../../services/my-projects-projection/engine/projection-source-fetch-client.js';
import { createProjectionSliceEngine } from '../../services/my-projects-projection/engine/projection-slice-engine.js';
import { createGraphMyProjectsRegistryRepository } from '../../services/my-projects-projection/registry/my-projects-registry-repository.js';
import { GraphListClient } from '../../services/legacy-fallback/graph-list-client.js';
import { createLogger } from '../../utils/logger.js';

const DEFAULT_SCHEDULE = '0 */1 * * * *';
const TIMER_SCHEDULE =
  process.env.HBC_MY_PROJECTS_PROJECTION_PENDING_WORK_PROCESSOR_TIMER_SCHEDULE ?? DEFAULT_SCHEDULE;

let cachedStore: SharePointStateStore | null = null;
let cachedPendingWorkRepository: PendingWorkRepository | null = null;
let cachedDeltaRepository: ProjectionSourceSyncStateRepository | null = null;
let cachedLeaseRepository: SharePointProjectionControlStateRepository | null = null;
let cachedRunRepository: SharePointProjectionRunRepository | null = null;
let cachedFailureRepository: SyncFailureRepository | null = null;
let cachedDeltaClient: IProjectionGraphDeltaClient | null = null;
let cachedRecomputeService: IProjectionSliceRecomputeService | null = null;
const RETRY_DELAY_SECONDS = 60;

function getStore(registrySiteUrl: string): SharePointStateStore {
  if (cachedStore === null) cachedStore = new SharePointStateStore(registrySiteUrl);
  return cachedStore;
}

function getPendingWorkRepository(registrySiteUrl: string): PendingWorkRepository {
  if (cachedPendingWorkRepository === null) {
    cachedPendingWorkRepository = new PendingWorkRepository(getStore(registrySiteUrl));
  }
  return cachedPendingWorkRepository;
}

function getDeltaRepository(registrySiteUrl: string): ProjectionSourceSyncStateRepository {
  if (cachedDeltaRepository === null) {
    cachedDeltaRepository = new ProjectionSourceSyncStateRepository(getStore(registrySiteUrl));
  }
  return cachedDeltaRepository;
}

function getLeaseRepository(registrySiteUrl: string): SharePointProjectionControlStateRepository {
  if (cachedLeaseRepository === null) {
    cachedLeaseRepository = new SharePointProjectionControlStateRepository(getStore(registrySiteUrl));
  }
  return cachedLeaseRepository;
}

function getRunRepository(registrySiteUrl: string): SharePointProjectionRunRepository {
  if (cachedRunRepository === null) {
    cachedRunRepository = new SharePointProjectionRunRepository(getStore(registrySiteUrl));
  }
  return cachedRunRepository;
}

function getFailureRepository(registrySiteUrl: string): SyncFailureRepository {
  if (cachedFailureRepository === null) {
    cachedFailureRepository = new SyncFailureRepository(getStore(registrySiteUrl));
  }
  return cachedFailureRepository;
}

function sanitizeDiagnostic(input: unknown): string {
  const raw = input instanceof Error ? input.message : String(input);
  return raw
    .replace(/Bearer\s+[A-Za-z0-9._+/=-]+/gi, '[REDACTED]')
    .replace(/eyJ[A-Za-z0-9._-]{20,}/g, '[REDACTED]')
    .replace(/[A-Za-z0-9_-]{40,}/g, '[REDACTED]')
    .slice(0, 400);
}

function getDeltaClient(): IProjectionGraphDeltaClient {
  if (cachedDeltaClient === null) cachedDeltaClient = createProjectionGraphDeltaClient();
  return cachedDeltaClient;
}

function getRecomputeService(): IProjectionSliceRecomputeService {
  if (cachedRecomputeService === null) {
    const config = getProjectionConfig();
    const sourceGraph = new GraphListClient(config.sites.sourceSiteUrl);
    const registryGraph = new GraphListClient(config.sites.registrySiteUrl);
    cachedRecomputeService = createProjectionSliceEngine({
      sourceFetchClient: createGraphProjectionSourceFetchClient({ graph: sourceGraph }),
      registryRepository: createGraphMyProjectsRegistryRepository({ graph: registryGraph }),
    });
  }
  return cachedRecomputeService;
}

app.timer('myProjectsProjectionPendingWorkProcessor', {
  schedule: TIMER_SCHEDULE,
  runOnStartup: false,
  handler: async (_timer: Timer, context: InvocationContext): Promise<void> => {
    const logger = createLogger(context);
    const config = getProjectionConfig();
    if (!config.enablement.enabled || !config.pendingWork.processorTimerEnabled) return;
    const now = new Date();
    const repo = getPendingWorkRepository(config.sites.registrySiteUrl);
    const due = await repo.listDue(now.toISOString(), 25);
    const runs = getRunRepository(config.sites.registrySiteUrl);
    const failures = getFailureRepository(config.sites.registrySiteUrl);
    const workerId = `pending-worker-${context.invocationId ?? randomUUID()}`;
    for (const item of due) {
      const claim = await repo.tryClaim({
        workKey: item.workKey,
        workerId,
        nowUtc: now.toISOString(),
        leaseMinutes: config.pendingWork.claimLeaseMinutes,
        maxAttempts: config.pendingWork.maxAttempts,
      });
      if (!claim.claimed) continue;
      const runId = randomUUID();
      const run = await runs.start({
        runId,
        runType: 'incremental',
        startedAtUtc: now.toISOString(),
        sourceListKind: item.sourceListKind,
      });
      try {
        await handleProjectionSyncMessage(
          {
            schemaVersion: 'v1',
            messageType: 'my-projects-projection-sync',
            sourceListKind: item.sourceListKind,
            receivedAtUtc: now.toISOString(),
            debounceBucketUtc: item.debounceBucketUtc,
            notificationBatchId: item.notificationBatchId ?? randomUUID(),
            subscriptionId: item.subscriptionId ?? null,
            notificationCount: item.notificationCount,
            correlationId: item.correlationId ?? randomUUID(),
          },
          {
            deltaStateRepository: getDeltaRepository(config.sites.registrySiteUrl),
            leaseRepository: getLeaseRepository(config.sites.registrySiteUrl),
            deltaClient: getDeltaClient(),
            recomputeService: getRecomputeService(),
            logger,
            now: () => new Date(),
            leaseOwner: workerId,
            syncLeaseMinutes: config.leases.syncLeaseMinutes,
            maxDeltaPagesPerRun: config.leases.maxDeltaPagesPerRun,
            runIdProvider: () => runId,
          },
        );
        await repo.markSucceeded({ workKey: item.workKey, workerId, nowUtc: new Date().toISOString() });
        await runs.finalize({
          rowKey: run.rowKey,
          status: 'succeeded',
          completedAtUtc: new Date().toISOString(),
        });
      } catch (err: unknown) {
        const nowUtc = new Date().toISOString();
        const failureCode = 'pending-work-processing-failed';
        const failureResult = await repo.markFailed({
          workKey: item.workKey,
          workerId,
          nowUtc,
          failureCode,
          maxAttempts: config.pendingWork.maxAttempts,
          retryDelaySeconds: RETRY_DELAY_SECONDS,
        });
        await runs.finalize({
          rowKey: run.rowKey,
          status: 'failed',
          completedAtUtc: nowUtc,
          failureCode,
          notes: sanitizeDiagnostic(err),
        });
        await failures.upsertFailure({
          failureId: `${item.sourceListKind}:${item.workKey}`,
          failureClass: 'pending-work',
          failureCode,
          sourceListKind: item.sourceListKind,
          relatedRunId: runId,
          relatedWorkKey: item.workKey,
          sanitizedMessage: sanitizeDiagnostic(err),
          atUtc: nowUtc,
        });
        logger.warn('my-projects-projection.pending-work.process.failed', {
          workKey: item.workKey,
          sourceListKind: item.sourceListKind,
          failureCode,
          failureOutcome: failureResult ?? 'not-updated',
        });
      }
    }
  },
});
