export {
  PROJECTION_DEFAULT_DELTA_STATE_TABLE,
  PROJECTION_DEFAULT_LEASES_TABLE,
  PROJECTION_DEFAULT_RUNS_TABLE,
  PROJECTION_DEFAULT_SUBSCRIPTIONS_TABLE,
  PROJECTION_TABLE_ACCOUNT_URL_ENV,
  createProjectionTableClient,
  ensureProjectionTable,
  type IProjectionEnsureTableClient,
} from './projection-table-client-factory.js';

export {
  ProjectionSubscriptionStateRepository,
  type IProjectionSubscriptionStateRepository,
} from './subscription-state-repository.js';

export {
  DeltaStateAlreadyInitializedError,
  DeltaStateConcurrencyError,
  ProjectionDeltaStateRepository,
} from './delta-state-repository.js';

export {
  ProjectionLeaseRepository,
  type LeaseAcquireOutcome,
  type ProjectionLeaseRowKey,
} from './lease-repository.js';

export {
  ProjectionRunRepository,
  sanitizeProjectionRunNotes,
  type IProjectionRunFinalizeArgs,
  type IProjectionRunListArgs,
  type IProjectionRunStartArgs,
} from './run-repository.js';

// SharePoint-backed active MVP repositories (B05.16 Prompt 04).
export { SharePointStateStore } from './sharepoint-state-store.js';
export { ProjectionSourceSyncStateRepository } from './source-sync-state-repository.js';
export { SharePointProjectionSubscriptionStateRepository } from './sharepoint-subscription-state-repository.js';
export {
  SharePointProjectionControlStateRepository,
  type LeaseAcquireOutcome as SharePointLeaseAcquireOutcome,
  type ProjectionLeaseRowKey as SharePointProjectionLeaseRowKey,
} from './sharepoint-control-state-repository.js';
export { SharePointProjectionRunRepository } from './sharepoint-run-repository.js';
export { PendingWorkRepository } from './pending-work-repository.js';
export { SyncFailureRepository } from './sync-failure-repository.js';
