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
} from './guards/index.js';
export type {
  RoleGateProps,
  FeatureGateProps,
  PermissionGateProps,
  AccessDeniedProps,
  AccessDeniedActionModel,
} from './guards/index.js';

// Hooks (Blueprint §1e — convenience hooks)
export { useCurrentUser, usePermission, useFeatureFlag } from './hooks/index.js';

// Dual-mode auth types (PH5.2/5.3 — canonical + compatibility runtime contract)
export type {
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
  IMsalConfig,
  ISpfxPageContext,
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
  ShellStatusTransition,
  StandardActionPermission,
} from './types.js';
export type { IAuthAdapter } from './IAuthAdapter.js';
export { mapIdentityToAppRoles, toRoleMappingInput } from './roleMapping.js';

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
export { bootstrapSpfxAuth } from './spfx/index.js';

// MSAL helpers (Blueprint §2b — Phase 4)
export { mapMsalAccountToUser, validateMsalConfig } from './msal/index.js';
