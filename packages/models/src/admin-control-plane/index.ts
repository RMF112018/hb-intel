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

export {
  WhiteGlovePackageFamily,
  WhiteGloveDevicePlatform,
  WhiteGloveDeviceManufacturer,
  WhiteGloveEnrollmentAuthority,
  WhiteGloveTemplateAttributeGovernance,
  WHITE_GLOVE_PACKAGE_CATALOG,
} from './IWhiteGloveTemplates.js';

export type {
  IWhiteGloveDeviceSlot,
  IWhiteGlovePackageTemplate,
  IWhiteGlovePackageTemplateVersion,
} from './IWhiteGloveTemplates.js';

export {
  ConnectorClassEnum,
  WHITE_GLOVE_CONNECTOR_CLASSES,
  CONNECTOR_DEFAULT_POLICY_TOGGLES,
} from './IWhiteGloveConnectorGovernance.js';

export type {
  IConnectorPolicyToggles,
  ConnectorChangeType,
  IConnectorChangeEntry,
  ConnectionHealthStatus,
  IConnectorGovernanceRecord,
  IConnectorValidationSummary,
  IConnectorValidationCheck,
} from './IWhiteGloveConnectorGovernance.js';

// Phase 10: Configuration governance DTOs
export type {
  ConfigValueSource,
  IConfigOverrideRecord,
  ConfigOverrideStatus,
  ConfigAuditEventType,
  IConfigAuditEvent,
  IConfigSnapshot,
  IConfigOverrideWriteRequest,
  IConfigOverrideRevertRequest,
  ConfigValidationStatus,
  IResolvedConfigItem,
} from './IConfigGovernance.js';

// Phase 10: Configuration versioning and diff DTOs
export type {
  IConfigVersionSummary,
  IConfigVersionDiff,
  IConfigVersionHistory,
} from './IConfigVersioning.js';

// Phase 11: Safety contracts
export { AdminSafetyControl } from './IAdminSafety.js';

export type {
  AdminConfirmationType,
  IAdminSafetyProfile,
  IAdminExecutionScope,
  IAdminSafetyWarning,
  IAdminSafetyPreviewResult,
  IAdminSafetyImpactItem,
  IAdminConfirmationPayload,
  IAdminRecoveryGuidance,
  IAdminRecoveryStep,
  IAdminSafetyEvidenceSummary,
} from './IAdminSafety.js';

// Phase 12: Observability enums
export {
  ObservabilityAlertSeverity,
  ObservabilityAlertStatus,
  ObservabilityAlertCategory,
  ObservabilityAffectedEntityType,
  ObservabilityProbeKind,
  ObservabilityProbeHealthStatus,
  ObservabilityIncidentStatus,
  ObservabilityErrorClassification,
  ObservabilityErrorSource,
  ObservabilityOperatorActionType,
  ObservabilityTimelineItemKind,
} from './ObservabilityEnums.js';

// Phase 12: Observability alert contracts
export type {
  IObservabilityAlertRecord,
  IObservabilityAlertIngestionPayload,
  IObservabilityAlertIngestionItem,
  IObservabilityAlertQuery,
  IObservabilityAlertSummary,
} from './IObservabilityAlert.js';

// Phase 12: Observability probe contracts
export type {
  IObservabilityProbeResultRecord,
  IObservabilityProbeSnapshotRecord,
  IObservabilityProbeSnapshotQuery,
  IObservabilityProbeSubmissionPayload,
  IObservabilityProbeHealthSummary,
} from './IObservabilityProbe.js';

// Phase 12: Observability incident contracts
export type {
  IObservabilityIncidentRecord,
  IObservabilityIncidentQuery,
} from './IObservabilityIncident.js';

// Phase 12: Observability error event contracts
export type {
  IObservabilityErrorRecord,
  IObservabilityErrorIngestionPayload,
  IObservabilityErrorIngestionItem,
  IObservabilityErrorQuery,
} from './IObservabilityError.js';

// Phase 12: Observability timeline and correlation contracts
export type {
  IObservabilityCorrelation,
  IObservabilityOperatorActionRecord,
  IObservabilityTimelineItem,
  IObservabilityTimelineQuery,
  IObservabilityPagedResponse,
  IObservabilityDashboardSummary,
} from './IObservabilityTimeline.js';

export {
  WhiteGloveCheckpointType,
  WhiteGloveEvidenceType,
  WhiteGlovePackageRunStatus,
  WhiteGloveDeviceRunStatus,
  WhiteGloveFailureClass,
  WHITE_GLOVE_ACTION_KEYS,
  WHITE_GLOVE_CHECKPOINT_CATEGORY_MAP,
} from './IWhiteGlove.js';

export type {
  IWhiteGloveDeviceLaunchInput,
  IWhiteGloveLaunchRequest,
  IWhiteGloveConnectorState,
  IWhiteGloveConnectorSnapshot,
  IWhiteGloveReadinessCheck,
  IWhiteGloveReadinessSnapshot,
  IWhiteGloveCheckpointInstance,
  IWhiteGloveEvidenceItem,
  IWhiteGloveFailureSummary,
  IWhiteGloveDeviceRun,
  IWhiteGlovePackageRun,
  WhiteGloveActionKey,
} from './IWhiteGlove.js';
