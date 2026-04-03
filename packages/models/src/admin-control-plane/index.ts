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
  PreflightSeverity,
  PreflightCategory,
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

export { AdminAuditEventType, AdminEvidenceType } from './IAdminAudit.js';

export type {
  IAdminAuditRecord,
  IAdminEvidenceReference,
  IAdminConfigSnapshotReference,
  IAdminStandardsReference,
  IAdminRationale,
  IAdminPostRunValidationSummary,
  IAdminPostRunValidationCheck,
  IAdminRunConfigTrace,
} from './IAdminAudit.js';

export { AdminAdapterCategory, AdminAdapterOutcome } from './IAdminAdapter.js';

export type {
  IAdminAdapterDescriptor,
  IAdminAdapterInvocationContext,
  IAdminAdapterResult,
  IAdminAdapterWarning,
  IAdminAdapterIssue,
  IAdminRemediationHint,
} from './IAdminAdapter.js';

export {
  InstallStepId,
  InstallStepFamily,
  InstallPreflightCheckId,
  InstallVerificationCheckId,
  INSTALL_ACTION_KEYS,
} from './IInstallBootstrap.js';

export type {
  IInstallStepDefinition,
  InstallActionKey,
} from './IInstallBootstrap.js';

export { AppBindingStatus, APP_BINDING_ACTION_KEYS } from './IAppBinding.js';

export type {
  BackendMode,
  AppBindingVerificationOutcome,
  IAppBindingRecord,
  IAppBindingRetrievalResponse,
  IAppBindingPublishRequest,
  IAppBindingPublishResult,
  IAppBindingDriftFinding,
  IAppBindingVerificationResult,
  IAppBindingRepairRequest,
  IAppBindingRepairResult,
  IAppBindingStatusSummary,
  AppBindingActionKey,
} from './IAppBinding.js';

export { SharePointStandardsArea, SHAREPOINT_CONTROL_ACTION_KEYS } from './ISharePointControl.js';

export type {
  SharePointDriftSeverity,
  SharePointComparisonOutcome,
  ISharePointManagedAsset,
  ISharePointStandardsExpectation,
  ISharePointStandardsSnapshot,
  ISharePointPostureObservation,
  ISharePointPostureSnapshot,
  ISharePointDriftFinding,
  ISharePointAreaComparisonSummary,
  ISharePointComparisonResult,
  SharePointControlActionKey,
} from './ISharePointControl.js';
