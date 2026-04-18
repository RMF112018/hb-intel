/**
 * Provisioning domain models — site provisioning saga orchestrator.
 *
 * @module provisioning
 */

export type {
  ISagaStepResult,
  IProvisioningStatus,
  IProvisionSiteRequest,
  IProvisioningProgressEvent,
  IProjectSetupRequest,
  ProjectSetupRequestState,
  IProvisioningAuditRecord,
  ProjectDepartment,
  IEntraGroupSet,
  ProvisioningFailureClass,
} from './IProvisioning.js';
export type {
  IRequestClarification,
  ClarificationStatus,
  IRequestClarificationInput,
  IClarificationResponseInput,
} from './IRequestClarification.js';
export type { IProvisionSiteFormData } from './IProvisioningFormData.js';
export type {
  IProvisioningEvidence,
  IStepEvidence,
  IPermissionPosture,
} from './IProvisioningEvidence.js';
export type {
  IRecoveryGuidance,
  RecoveryAction,
  IPrelaunchFailure,
  IPrelaunchValidationResult,
  PrelaunchFailureCategory,
} from './IRecoveryGuidance.js';
export type {
  LegacyFallbackMatchStatus,
  LegacyFallbackMatchConfidence,
  LegacyFallbackMatchMethod,
  ILegacyFallbackRecordIdentity,
  ILegacyProjectFallbackRegistryRecord,
  ILegacyProjectFallbackSyncRun,
} from './ILegacyProjectFallback.js';
export type { ProvisioningOverallStatus, SagaStepStatus } from './ProvisioningEnums.js';
export type { SagaStepNumber } from './types.js';
export { SAGA_STEPS, TOTAL_SAGA_STEPS } from './constants.js';
export {
  createLegacyFallbackRecordKey,
  parseLegacyFallbackRecordKey,
} from './ILegacyProjectFallback.js';
