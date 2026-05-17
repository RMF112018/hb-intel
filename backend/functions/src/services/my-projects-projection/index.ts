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

export {
  DEACTIVATION_REASON_CHOICES,
  LAUNCH_ACTION_STATE_CHOICES,
  MY_PROJECTS_REGISTRY_LIST_DESCRIPTOR,
  MY_PROJECTS_REGISTRY_LIST_DESCRIPTORS,
  MY_PROJECTS_REGISTRY_LIST_GOVERNANCE,
  MY_PROJECTS_REGISTRY_LIST_HOST_SITE_URL,
  MY_PROJECTS_REGISTRY_LIST_TITLE,
  PROJECTION_SOURCE_CHOICES,
  SHAREPOINT_ACTION_KIND_CHOICES,
  SHAREPOINT_ACTION_STATE_CHOICES,
  getMyProjectsRegistryListHostSiteUrl,
  type DeactivationReasonChoice,
  type IMyProjectsRegistryListGovernance,
  type LaunchActionStateChoice,
  type ProjectionSourceChoice,
  type SharePointActionKindChoice,
  type SharePointActionStateChoice,
} from './registry-list-descriptor.js';

export {
  MY_PROJECTS_REGISTRY_READINESS_STATES,
  buildMyProjectsRegistrySchemaReadinessReport,
  type MyProjectsRegistryReadinessState,
  type MyProjectsRegistrySchemaReadinessReport,
  type RegistryFieldReadinessEntry,
  type RegistryListFieldSnapshot,
} from './registry-schema-readiness.js';

export * from './state/index.js';

export * from './webhook/index.js';

export * from './subscriptions/index.js';

export * from './delta/index.js';
