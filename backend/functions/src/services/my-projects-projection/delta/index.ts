export {
  createProjectionGraphDeltaClient,
  type IDeltaDrainOutcome,
  type IDeltaDrainResult,
  type IDeltaItem,
  type IInitialDeltaLinkOutcome,
  type IProjectionGraphDeltaClient,
  type IProjectionGraphDeltaClientOptions,
  type ProjectionGraphDeltaFailureCode,
} from './projection-graph-delta-client.js';

export {
  NoopProjectionSliceRecomputeService,
  type IProjectionSliceRecomputeService,
  type IRecomputeCounts,
  type IRecomputeOutcome,
  type IRecomputeRequest,
  type ProjectionSliceRecomputeFailureCode,
} from './projection-slice-recompute-service.js';

export {
  handleProjectionSyncMessage,
  type IProjectionDeltaStateAdvancer,
  type IProjectionDeltaStateReader,
  type IProjectionLeaseAcquirer,
  type IProjectionSyncWorkerDeps,
  type IProjectionSyncWorkerOutcome,
  type IProjectionSyncWorkerStatus,
} from './projection-sync-worker.js';
