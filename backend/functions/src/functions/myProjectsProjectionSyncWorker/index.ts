/**
 * My Projects projection — Service Bus queue-trigger sync worker.
 *
 * Service Bus trigger configured via identity-based connection per the package
 * (`MyProjectsProjectionServiceBus__*` app settings, see
 * `02_Azure_Infrastructure_Specification.md §5.1`). Queue name comes from
 * `HBC_MY_PROJECTS_PROJECTION_QUEUE_NAME` (default `my-projects-projection-sync`).
 *
 * All business logic lives in
 * `services/my-projects-projection/delta/projection-sync-worker.ts`. This file
 * is plumbing only.
 *
 * Prompt-06 ships with `NoopProjectionSliceRecomputeService` wired in; Prompt 07
 * swaps the import to the real engine.
 */

import { app, type InvocationContext } from '@azure/functions';
import { randomUUID } from 'node:crypto';
import { getProjectionConfig } from '../../services/my-projects-projection/projection-config.js';
import { ProjectionDeltaStateRepository } from '../../services/my-projects-projection/state/delta-state-repository.js';
import { ProjectionLeaseRepository } from '../../services/my-projects-projection/state/lease-repository.js';
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

const DEFAULT_QUEUE_NAME = 'my-projects-projection-sync';
const QUEUE_NAME = process.env.HBC_MY_PROJECTS_PROJECTION_QUEUE_NAME ?? DEFAULT_QUEUE_NAME;

let cachedDeltaClient: IProjectionGraphDeltaClient | null = null;
let cachedDeltaRepository: ProjectionDeltaStateRepository | null = null;
let cachedLeaseRepository: ProjectionLeaseRepository | null = null;
let cachedRecomputeService: IProjectionSliceRecomputeService | null = null;

function getDeltaClient(): IProjectionGraphDeltaClient {
  if (cachedDeltaClient === null) cachedDeltaClient = createProjectionGraphDeltaClient();
  return cachedDeltaClient;
}

function getDeltaRepository(): ProjectionDeltaStateRepository {
  if (cachedDeltaRepository === null) cachedDeltaRepository = new ProjectionDeltaStateRepository();
  return cachedDeltaRepository;
}

function getLeaseRepository(): ProjectionLeaseRepository {
  if (cachedLeaseRepository === null) cachedLeaseRepository = new ProjectionLeaseRepository();
  return cachedLeaseRepository;
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

app.serviceBusQueue('myProjectsProjectionSyncWorker', {
  connection: 'MyProjectsProjectionServiceBus',
  queueName: QUEUE_NAME,
  handler: async (message: unknown, context: InvocationContext): Promise<void> => {
    const logger = createLogger(context);
    const config = getProjectionConfig();
    if (!config.enablement.enabled) {
      logger.info('my-projects-projection.sync-worker.skipped', {
        invocationId: context.invocationId,
        reason: 'projection-disabled',
      });
      return;
    }
    await handleProjectionSyncMessage(message, {
      deltaStateRepository: getDeltaRepository(),
      leaseRepository: getLeaseRepository(),
      deltaClient: getDeltaClient(),
      recomputeService: getRecomputeService(),
      logger,
      now: () => new Date(),
      leaseOwner: `worker-${context.invocationId ?? randomUUID()}`,
      syncLeaseMinutes: config.leases.syncLeaseMinutes,
      maxDeltaPagesPerRun: config.leases.maxDeltaPagesPerRun,
      runIdProvider: () => randomUUID(),
    });
  },
});
