// Permission constants (G6-T02 — granular provisioning override permissions)
export {
  ADMIN_PROVISIONING_RETRY,
  ADMIN_PROVISIONING_ESCALATE,
  ADMIN_PROVISIONING_ARCHIVE,
  ADMIN_PROVISIONING_FORCE_STATE,
  ADMIN_PROVISIONING_ALERT_FULL_DETAIL,
  PROVISIONING_OVERRIDE_PERMISSIONS,
  ADMIN_PROVISIONING_OVERRIDE,
  ALL_PROVISIONING_OVERRIDE_PERMISSIONS,
  ADMIN_APPROVAL_MANAGE,
} from './permissions/index.js';

// Audit logging + retention (PH5.13 — structured traceability and governance)
export {
  DEFAULT_AUDIT_RETENTION_POLICY,
  createStructuredAuditEvent,
  recordStructuredAuditEvent,
  getStructuredAuditEvents,
  seedStructuredAuditEvents,
  clearStructuredAuditEvents,
  partitionAuditEventsByRetention,
  buildAuditOperationalVisibility,
  sortAuditEventsNewestFirst,
} from './audit/index.js';
export type { CreateAuditEventInput } from './audit/index.js';

// Stores (Blueprint §2e — Zustand exclusively)
export {
  useAuthStore,
  useAuthLifecycleSelector,
  useAuthBootstrapSelector,
  useAuthSessionSummarySelector,
  useAuthPermissionSummarySelector,
  resolveEffectivePermissions,
  toEffectivePermissionSet,
  isPermissionGranted,
  isActionAllowed,
  isProtectedFeatureRegistered,
  isFeatureVisible,
  isFeatureAccessible,
  evaluateFeatureAccess,
  getPermissionResolutionSnapshot,
} from './stores/index.js';
export type { AuthState } from './stores/index.js';
export { usePermissionStore } from './stores/index.js';
export type { PermissionState } from './stores/index.js';

// Guards (Blueprint §1e — React access control components)
export {
  RoleGate,
  FeatureGate,
  PermissionGate,
  AccessDenied,
  buildAccessDeniedActionModel,
  resolveGuardResolution,
  ProtectedContentGuard,
  ShellBootstrapSurface,
  SessionRestoreSurface,
  ExpiredSessionSurface,
  UnsupportedRuntimeSurface,
  FatalStartupSurface,
} from './guards/index.js';
export type {
  RoleGateProps,
  FeatureGateProps,
  PermissionGateProps,
  AccessDeniedProps,
  AccessDeniedActionModel,
  GuardFailureKind,
  GuardResolutionInput,
  GuardResolutionResult,
  ProtectedContentGuardProps,
  RequestAccessSubmission,
  RequestAccessSubmissionResult,
  AccessRequestSubmitter,
} from './guards/index.js';

// Hooks (Blueprint §1e — convenience hooks)
export {
  useCurrentUser,
  useCurrentSession,
  useResolvedRuntimeMode,
  usePermission,
  usePermissionEvaluation,
  useFeatureFlag,
} from './hooks/index.js';

// Dual-mode auth types (PH5.2/5.3 — canonical + compatibility runtime contract)
export type {
  AccessOverrideApprovalActionCommand,
  AccessOverrideApprovalDecision,
  AccessOverrideApprovalPolicy,
  AccessOverrideApprovalResult,
  AccessOverrideEmergencyBoundaryCheck,
  AccessOverrideEmergencyCommand,
  AccessOverrideEmergencyPolicy,
  AccessOverrideEmergencyResult,
  AccessOverrideRenewalAction,
  AccessOverrideRenewalCommand,
  AccessOverrideRenewalResult,
  AccessOverrideRequestPolicy,
  AccessOverrideRequestValidationResult,
  AccessControlAdminQuery,
  AccessControlAdminRepository,
  AccessControlAdminSection,
  AccessControlAdminSnapshot,
  AccessControlAdminAuditVisibility,
  AccessControlAuditEventRecord,
  AccessControlAuditEventSource,
  AccessControlAuditEventType,
  AccessControlAuditOutcome,
  AccessControlAuditRetentionPolicy,
  AccessControlAuditRetentionSnapshot,
  AccessControlApproverScope,
  AccessControlOverrideRecord,
  AccessControlOverrideReviewMetadata,
  AccessControlOverrideType,
  AccessControlPolicySettings,
  AccessControlRecordStatus,
  AccessControlRoleAccessRecord,
  AccessControlUserLookupRecord,
  AccessControlWorkflowResult,
  AccessOverrideApprovalMetadata,
  AccessOverrideChangeMode,
  AccessOverrideExpirationMetadata,
  AccessOverrideGrantChange,
  AccessOverrideRequest,
  AdapterIdentityPayload,
  AuthBootstrapSelectorResult,
  AuthFailure,
  AuthFailureCode,
  AuthLifecyclePhase,
  AuthLifecycleSelectorResult,
  AuthMode,
  AuthPermissionSummarySelectorResult,
  AuthResult,
  AuthRestoreState,
  AuthSessionSummarySelectorResult,
  AuthStoreActions,
  AuthStoreSlice,
  AuthStoreState,
  CanonicalAuthMode,
  EffectivePermissionSet,
  EmergencyAccessState,
  FeatureAccessEvaluation,
  FeaturePermissionRegistration,
  FeatureVisibilityMode,
  AuthRuntimeRuleSet,
  BaseRoleDefinition,
  BaseRoleDefinitionInput,
  BaseRoleDefinitionVersionDiff,
  IMsalConfig,
  ISpfxPageContext,
  SpfxHostContainerMetadata,
  SpfxHostSignalState,
  SpfxIdentityBridgeInput,
  LegacyAuthMode,
  NormalizedAuthSession,
  PermissionOverrideRecord,
  PermissionResolutionInput,
  PermissionResolutionSnapshot,
  RoleMappingException,
  RoleMappingHint,
  RoleMappingInput,
  RoleMappingOptions,
  SessionRestoreMetadata,
  SessionRestoreOutcome,
  SessionRestorePolicy,
  SessionRestoreResult,
  ShellBootstrapReadiness,
  ShellAuthConfiguration,
  ShellAuthConfigurationInput,
  ShellStatusTransition,
  RedirectDefaultPolicy,
  RenewOverrideCommand,
  ResolveRoleChangeReviewCommand,
  ReviewEmergencyAccessCommand,
  ReviewOverrideCommand,
  ReviewOverrideDecision,
  StructuredAccessOverrideRequest,
  StructuredAccessOverrideRequestCommand,
  RenewalState,
  SessionPolicyWindowSettings,
  StandardActionPermission,
} from './types.js';
export type { IAuthAdapter } from './IAuthAdapter.js';
export { mapIdentityToAppRoles, toRoleMappingInput } from './roleMapping.js';

// Access-control workflow layer (PH5.12 — approval, renewal, emergency governance)
export {
  DEFAULT_OVERRIDE_REQUEST_POLICY,
  validateStructuredOverrideRequest,
  createStructuredOverrideRequest,
  toOverrideRequestInput,
  DEFAULT_OVERRIDE_APPROVAL_POLICY,
  createPendingOverrideFromRequest,
  applyOverrideApprovalAction,
  isOverrideApprovalDecision,
  isOverrideExpired,
  createRenewalRequest,
  runRenewalWorkflow,
  DEFAULT_EMERGENCY_ACCESS_POLICY,
  evaluateEmergencyBoundary,
  runEmergencyAccessWorkflow,
} from './workflows/index.js';

// Admin UX module (PH5.11 — minimal production admin capability surface)
export {
  AdminAccessControlPage,
  buildAccessControlAdminSnapshot,
  getAccessControlAdminSnapshot,
  createInMemoryAccessControlAdminRepository,
  defaultAccessControlAdminRepository,
  toOverrideQueueItem,
  isRenewalDue,
  buildRoleAccessLookup,
  applyOverrideReviewDecision,
  applyRenewalRequest,
  resolveRoleChangeReview,
  applyEmergencyReviewDecision,
  deriveQueueByDecision,
  sortAuditEventsDescending,
  loadAdminAccessControlSnapshot,
  toAdminSearchQuery,
  toAdminAuditOperationalVisibility,
  useAdminAccessControlData,
} from './admin/index.js';
export type { AdminAccessControlPageProps, AdminSectionDescriptor } from './admin/index.js';

// Access-control backend model (PH5.10 — centralized HB Intel authorization SoR)
export {
  createBaseRoleDefinition,
  normalizeAccessControlStatus,
  resolveRenewalState,
  createReviewMetadata,
  createAccessControlAuditEvent,
  getChangedBaseRoleReferences,
  createOverrideRequest,
  approveOverrideRequest,
  revokeOverrideRecord,
  archiveOverrideRecord,
  renewOverrideRecord,
  resolveOverrideLifecycleStatus,
  flagOverrideForReview,
  markDependentOverridesForRoleReview,
  createPerOverrideRequest,
  isPerOverride,
  getPerOverridesForUser,
  getPerOverridesForProject,
  getActivePerOverrides,
  suspendPerOverridesForDepartmentChange,
  DEFAULT_SHELL_AUTH_CONFIGURATION,
  resolveShellAuthConfiguration,
  validateShellAuthConfiguration,
  loadShellAuthConfiguration,
} from './backend/index.js';

// Project role resolution, membership enforcement, and module visibility (Phase 3 Stage 2.1–2.3)
export {
  resolveProjectRole,
  resolvePerEligibility,
  validateProjectAccess,
  ProjectMembershipGate,
  getModuleVisibility,
  getPerModuleVisibility,
  canAnnotateModule,
  isPerRole,
  canPerAnnotate,
  canPerPushToTeam,
  getPerRestrictions,
} from './project/index.js';
export type {
  ProjectRoleResolutionInput,
  ProjectRoleResolutionResult,
  PerEligibilityResult,
  PerEligibilitySource,
  ProjectAccessResult,
  ProjectAccessDenialReason,
  ProjectMembershipGateProps,
  ModuleVisibility,
  ProjectModuleId,
  PerRestrictions,
} from './project/index.js';

// Adapters (Blueprint §2b — dual-mode auth)
export {
  resolveAuthMode,
  resolveCanonicalAuthMode,
  mapLegacyToCanonicalAuthMode,
  mapCanonicalToLegacyAuthMode,
  describeResolvedAuthRuntime,
  extractSpfxUser,
  initMsalAuth,
  createAuthFailure,
  normalizeIdentityToSession,
  restoreSessionWithinPolicy,
  MsalAdapter,
  SpfxAdapter,
  MockAdapter,
} from './adapters/index.js';

// SPFx bootstrap (Blueprint §2b — Phase 5)
export {
  bootstrapSpfxAuth,
  assertValidSpfxHostBridgeInput,
  toSpfxIdentityBridgeInput,
} from './spfx/hostBridge.js';

// D-PH5C-02:
// Dev-only adapter exports are intentionally isolated behind the package subpath
// entrypoint `@hbc/auth/dev` via `src/dev.ts` to keep root index exports valid
// under TypeScript/ESM static export rules.

// D-PH6F-03: Bootstrap helpers and persona registry for dev-mode identity resolution.
// Tree-shaking eliminates these from production builds since bootstrapMockEnvironment()
// is only called in mock mode (guarded by resolveAuthMode() in main.tsx).
export { PERSONA_REGISTRY, type IPersona } from './mock/personaRegistry.js';
export {
  resolveBootstrapPersona,
  personaToCurrentUser,
  resolveBootstrapPermissions,
} from './mock/bootstrapHelpers.js';

// Startup timing bridge (PH5.15 — cross-package startup phase instrumentation seam)
export {
  startStartupPhase,
  endStartupPhase,
  recordStartupPhase,
} from './startup/startupTimingBridge.js';
export type {
  StartupPhase as AuthStartupPhase,
  StartupTimingPhaseMetadata as AuthStartupTimingPhaseMetadata,
} from './startup/startupTimingBridge.js';
export type { SpfxHostBridgeInput } from './spfx/hostBridge.js';

// MSAL helpers (Blueprint §2b — Phase 4)
export { mapMsalAccountToUser, validateMsalConfig } from './msal/index.js';
