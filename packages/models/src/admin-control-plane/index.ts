/**
 * Admin Control Plane domain models — canonical action vocabulary,
 * risk levels, execution modes, and action descriptors for the
 * IT Control Center generalized admin domain model.
 *
 * @module admin-control-plane
 */

export { AdminDomain, AdminRiskLevel, AdminExecutionMode } from './AdminEnums.js';

export type { AdminActionKey, IAdminActionDescriptor } from './types.js';

export { AdminRunStatus, AdminStepStatus } from './IAdminRun.js';

export type {
  IAdminActorContext,
  IAdminStepResult,
  IAdminFailureSummary,
  IAdminRunEnvelope,
} from './IAdminRun.js';

export type {
  IAdminApiResponse,
  IAdminApiListResponse,
  IAdminApiError,
  IAdminFieldError,
  IAdminRunLaunchRequest,
  IAdminRunLaunchResponse,
  IAdminRunStatusRequest,
  IAdminRunHistoryRequest,
  IAdminRunSummary,
  IAdminRunCancelRequest,
  IAdminRunRetryRequest,
  IAdminRunRetryResponse,
  IAdminCheckpointDecisionRequest,
  IAdminCheckpointDecisionResponse,
  IAdminPreflightRequest,
  IAdminPreflightResponse,
  IAdminPreflightCheck,
  IAdminPreviewResponse,
  IAdminPreviewImpactItem,
  IAdminConfigRequest,
  IAdminConfigResponse,
  IAdminActionMetadataRequest,
  IAdminActionMetadata,
} from './IAdminApi.js';

export { AdminCheckpointCategory, AdminCheckpointStatus } from './IAdminCheckpoint.js';

export type {
  IAdminCheckpointDefinition,
  IAdminCheckpoint,
  IAdminCheckpointDecision,
  IAdminExternalEventCorrelation,
} from './IAdminCheckpoint.js';
