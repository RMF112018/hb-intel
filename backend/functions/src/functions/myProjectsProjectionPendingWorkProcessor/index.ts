import { app, type InvocationContext, type Timer } from '@azure/functions';
import { randomUUID } from 'node:crypto';
import { getProjectionConfig } from '../../services/my-projects-projection/projection-config.js';
import { PendingWorkRepository } from '../../services/my-projects-projection/state/pending-work-repository.js';
import { SharePointStateStore } from '../../services/my-projects-projection/state/sharepoint-state-store.js';
import { ProjectionSourceSyncStateRepository } from '../../services/my-projects-projection/state/source-sync-state-repository.js';
import { SharePointProjectionControlStateRepository } from '../../services/my-projects-projection/state/sharepoint-control-state-repository.js';
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
let cachedDeltaClient: IProjectionGraphDeltaClient | null = null;
let cachedRecomputeService: IProjectionSliceRecomputeService | null = null;

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
    for (const item of due) {
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
          leaseOwner: `pending-worker-${context.invocationId ?? randomUUID()}`,
          syncLeaseMinutes: config.leases.syncLeaseMinutes,
          maxDeltaPagesPerRun: config.leases.maxDeltaPagesPerRun,
          runIdProvider: () => randomUUID(),
        },
      );
    }
  },
});
