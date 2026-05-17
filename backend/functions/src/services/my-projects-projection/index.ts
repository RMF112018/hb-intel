export {
  PROJECTION_MESSAGE_ID_PREFIX,
  PROJECTION_MESSAGE_SCHEMA_VERSION,
  PROJECTION_MESSAGE_TYPE,
  PROJECTION_READ_MODES,
  PROJECTION_RUN_STATUSES,
  PROJECTION_RUN_TYPES,
  PROJECTION_VERSION,
  SOURCE_LIST_KINDS,
  isProjectionReadMode,
  isProjectionRunStatus,
  isProjectionRunType,
  isSourceListKind,
  type ProjectionReadMode,
  type ProjectionRunStatus,
  type ProjectionRunType,
  type SourceListKind,
} from './projection-types.js';

export {
  buildProjectionSyncMessageId,
  computeDebounceBucketUtc,
  isProjectionSyncMessage,
  type IMyProjectsProjectionSyncMessage,
} from './projection-message-contract.js';

export type {
  IProjectionAdminRebuildRequest,
  IProjectionAdminRebuildResponse,
  ProjectionAdminRebuildKind,
} from './projection-admin-contracts.js';

export {
  PROJECTION_LEASE_TYPES,
  PROJECTION_STATE_PARTITION_KEY,
  PROJECTION_SUBSCRIPTION_STATUSES,
  projectionRunRowKey,
  type IProjectionDeltaStateEntity,
  type IProjectionLeaseEntity,
  type IProjectionRunEntity,
  type IProjectionSubscriptionEntity,
  type ProjectionLeaseType,
  type ProjectionSubscriptionStatus,
} from './projection-state-entities.js';

export {
  getProjectionConfig,
  validateProjectionConfig,
  type IProjectionConfig,
  type IProjectionConfigIssue,
  type IProjectionConfigValidationResult,
  type IProjectionDriftConfig,
  type IProjectionEnablement,
  type IProjectionLeasesConfig,
  type IProjectionPurgeConfig,
  type IProjectionQueueConfig,
  type IProjectionSitesConfig,
  type IProjectionSubscriptionsConfig,
  type IProjectionTablesConfig,
  type IProjectionWebhookConfig,
  type ProjectionConfigIssueCode,
} from './projection-config.js';
