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
