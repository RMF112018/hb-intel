/**
 * Admin Control Plane services — barrel export.
 *
 * Re-exports all service interfaces and stub implementations for the
 * admin control plane domain host.
 *
 * @module admin-control-plane/services
 */

// Service interfaces
export type {
  IAdminRunService,
  IAdminRunListOptions,
  IAdminRunListResult,
  IAdminAdapterRegistry,
  IAdminConfigService,
  IAdminAuditService,
  IAdminAuditListOptions,
  IAdminPreflightService,
  IAdminEvidenceService,
  EvidenceRetentionClass,
  IAdminActorContextResolver,
  IAdminActorResolverInput,
  IAdminAppBindingService,
  IConfigOverrideStore,
  IConfigVersioningService,
  IConfigResolutionService,
  IResolvableCatalogEntry,
  IConfigSnapshotStore,
} from './types.js';

// Durable implementations (Phase 4)
export { DurableAdminRunStore, serializeRunEnvelope, deserializeRunEnvelope } from './admin-run-store.js';
export { DurableAdminAuditStore, MockAdminAuditStore, serializeAuditRecord, deserializeAuditRecord } from './admin-audit-store.js';

// In-memory implementations (Phase 3 — kept for mock/test mode)
export { InMemoryAdminRunService } from './in-memory-run-service.js';

// Adapter registry and Phase 3 adapter set
export { AdminAdapterRegistry } from './adapter-registry.js';
export type { AdapterInvoker } from './adapter-registry.js';
export { registerPhase3Adapters, PHASE_3_ADAPTERS } from './adapters.js';

// Actor context resolver (P3-08)
export { AdminActorContextResolver } from './actor-context-resolver.js';

// Preflight validation service (P6-04)
export { AdminPreflightService } from './preflight-service.js';

// Install checkpoint service (P6-06)
export { getCheckpointInstructions, processCheckpointDecision, resumeAfterCheckpoint } from './install-checkpoint-service.js';
export type { CheckpointInstructions, CheckpointDecisionResult } from './install-checkpoint-service.js';

// Post-install verification service (P6-07)
export { executeVerificationChecks, runPostInstallVerification } from './install-verification-service.js';

// Install/bootstrap orchestrator (P6-05)
export { INSTALL_STEP_CATALOG, buildInitialSteps, executeInstallRun, getInstallStepCatalog, publishBindingsAfterInstall, MANAGED_APP_IDS } from './install-orchestrator.js';
export type { InstallOrchestratorDeps } from './install-orchestrator.js';

// Evidence service (P4-06)
export { DurableAdminEvidenceStore, MockAdminEvidenceStore, isEvidenceInlineable, generateBlobLocator, EVIDENCE_INLINE_MAX_BYTES } from './evidence-service.js';

// Provisioning audit bridge (P4-04)
export { ProvisioningAuditBridge, createProvisioningAuditBridge } from './provisioning-audit-bridge.js';
export type { ProvisioningBridgeEvent } from './provisioning-audit-bridge.js';

// Orchestration bridge (P3-07)
export {
  mapProvisioningToRunEnvelope,
  mapProvisioningStatus,
  mapProvisioningStepStatus,
  createProvisioningBridgeInvoker,
} from './orchestration-bridge.js';
export type { IProvisioningStatusSnapshot } from './orchestration-bridge.js';

// App binding store (P6A-04)
export { DurableAdminAppBindingStore, MockAdminAppBindingStore, serializeBindingRecord, deserializeBindingRecord } from './app-binding-store.js';

// Binding verification service (P6A-07)
export {
  checkRequiredFields,
  checkFunctionAppReachable,
  checkApiAudienceValid,
  checkBindingNotStale,
  checkBindingNotSuperseded,
  executeBindingVerificationChecks,
  runAppBindingVerification,
} from './binding-verification-service.js';

// SharePoint drift detection service (P8-04)
export {
  resolveCodeDefaultStandards,
  comparePostureToStandards,
  buildComparisonResult,
  runSharePointDriftDetection,
  CODE_DEFAULT_STANDARDS_VERSION,
} from './sharepoint-drift-service.js';

// SharePoint repair preview service (P8-05)
export {
  generateRepairPreview,
  runSharePointRepairPreview,
} from './sharepoint-preview-service.js';

// SharePoint repair execution service (P8-06)
export {
  validateRepairBoundary,
  executeSharePointRepair,
} from './sharepoint-repair-service.js';
export type {
  RepairExecutor,
  RepairStepOutcome,
  RepairRunOutcome,
  ISharePointRepairStepResult,
  ISharePointRepairResult,
} from './sharepoint-repair-service.js';

// SharePoint posture validation service (P8-07)
export {
  executePostureChecks,
  buildPostureValidationResult,
  runPostureValidation,
  POSTURE_CHECK_CATALOG,
} from './sharepoint-posture-service.js';
export type {
  PostureCategory,
  PostureCheckStatus,
  PostureCollector,
  IPostureCheckFinding,
  IPostureValidationResult,
} from './sharepoint-posture-service.js';

// Config override store (Phase 10 — P10-04)
export {
  DurableConfigOverrideStore,
  MockConfigOverrideStore,
  serializeOverrideRecord,
  deserializeOverrideRecord,
  serializeAuditEvent,
  deserializeAuditEvent,
} from './config-override-store.js';

// Config versioning service (Phase 10 — P10-05)
export { ConfigVersioningService, stableEquals, buildDiffSummary } from './config-versioning-service.js';

// Config resolution service (Phase 10 — P10-06)
export { ConfigResolutionService, processEnvReader } from './config-resolution-service.js';

// Config snapshot store (Phase 10 — P10-06)
export { DurableConfigSnapshotStore, MockConfigSnapshotStore, serializeSnapshot, deserializeSnapshot } from './config-snapshot-store.js';

// Safety policy registry and enforcement (Phase 11 — P11-04)
export {
  registerSafetyProfile,
  getSafetyProfile,
  listSafetyProfiles,
  clearSafetyRegistry,
  getDefaultControlsForRiskLevel,
  getDefaultConfirmationType,
  buildSafetyProfile,
  evaluateSafetyGates,
  requireSafetyGates,
  requireSafetyProfile,
  getRequiredEvidenceControls,
  isControlRequired,
  isPostRunValidationRequired,
  isRecoveryGuidanceRequired,
  resolveSafetyProfile,
} from './safety-policy-registry.js';
export type { ISafetyGateContext, ISafetyGateResult } from './safety-policy-registry.js';

// Safety action catalog (Phase 11 — P11-04)
export { registerDefaultSafetyProfiles } from './safety-action-catalog.js';

// Safety preview pipeline (Phase 11 — P11-05)
export {
  registerPreviewProvider,
  getPreviewProvider,
  clearPreviewProviders,
  executeSafetyPreview,
} from './safety-preview-service.js';
export type {
  IPreviewProvider,
  IPreviewProviderInput,
  IPreviewProviderOutput,
  IPreviewProviderScope,
  IPreviewLimitation,
  ISafetyPreviewRequest,
  ISafetyPreviewPipelineResult,
} from './safety-preview-service.js';

// Safety post-run validation and recovery (Phase 11 — P11-08)
export {
  registerPostRunValidationProvider,
  getPostRunValidationProvider,
  clearPostRunValidationProviders,
  executePostRunValidation,
  registerRecoveryGuidanceProvider,
  getRecoveryGuidanceProvider,
  clearRecoveryGuidanceProviders,
  generateRecoveryGuidance,
  assembleSafetyEvidenceSummary,
} from './safety-post-run-service.js';
export type {
  IPostRunValidationProvider,
  IPostRunValidationInput,
  IPostRunValidationResult,
  IRecoveryGuidanceProvider,
  IRecoveryGuidanceInput,
  IRecoveryGuidanceResult,
  ISafetyEvidenceSummaryInput,
} from './safety-post-run-service.js';

// Safety confirmation service (Phase 11 — P11-07)
export {
  validateConfirmation,
  recordConfirmation,
  executeConfirmationFlow,
  requiresCheckpointExecution,
  requiresDestructiveConfirmation,
} from './safety-confirmation-service.js';
export type {
  IConfirmationPayloadInput,
  IConfirmationValidationResult,
  IConfirmationRecordResult,
  IConfirmationFlowResult,
} from './safety-confirmation-service.js';

// Stub implementations (mock/test mode and services not yet implemented)
export {
  StubAdminRunService,
  StubAdminAdapterRegistry,
  StubAdminConfigService,
  StubAdminAuditService,
  StubAdminPreflightService,
  StubAdminActorContextResolver,
} from './stubs.js';
