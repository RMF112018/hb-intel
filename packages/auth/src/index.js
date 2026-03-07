// Audit logging + retention (PH5.13 — structured traceability and governance)
export { DEFAULT_AUDIT_RETENTION_POLICY, createStructuredAuditEvent, recordStructuredAuditEvent, getStructuredAuditEvents, seedStructuredAuditEvents, clearStructuredAuditEvents, partitionAuditEventsByRetention, buildAuditOperationalVisibility, sortAuditEventsNewestFirst, } from './audit/index.js';
// Stores (Blueprint §2e — Zustand exclusively)
export { useAuthStore, useAuthLifecycleSelector, useAuthBootstrapSelector, useAuthSessionSummarySelector, useAuthPermissionSummarySelector, resolveEffectivePermissions, toEffectivePermissionSet, isPermissionGranted, isActionAllowed, isProtectedFeatureRegistered, isFeatureVisible, isFeatureAccessible, evaluateFeatureAccess, getPermissionResolutionSnapshot, } from './stores/index.js';
export { usePermissionStore } from './stores/index.js';
// Guards (Blueprint §1e — React access control components)
export { RoleGate, FeatureGate, PermissionGate, AccessDenied, buildAccessDeniedActionModel, resolveGuardResolution, ProtectedContentGuard, ShellBootstrapSurface, SessionRestoreSurface, ExpiredSessionSurface, UnsupportedRuntimeSurface, FatalStartupSurface, } from './guards/index.js';
// Hooks (Blueprint §1e — convenience hooks)
export { useCurrentUser, useCurrentSession, useResolvedRuntimeMode, usePermission, usePermissionEvaluation, useFeatureFlag, } from './hooks/index.js';
export { mapIdentityToAppRoles, toRoleMappingInput } from './roleMapping.js';
// Access-control workflow layer (PH5.12 — approval, renewal, emergency governance)
export { DEFAULT_OVERRIDE_REQUEST_POLICY, validateStructuredOverrideRequest, createStructuredOverrideRequest, toOverrideRequestInput, DEFAULT_OVERRIDE_APPROVAL_POLICY, createPendingOverrideFromRequest, applyOverrideApprovalAction, isOverrideApprovalDecision, isOverrideExpired, createRenewalRequest, runRenewalWorkflow, DEFAULT_EMERGENCY_ACCESS_POLICY, evaluateEmergencyBoundary, runEmergencyAccessWorkflow, } from './workflows/index.js';
// Admin UX module (PH5.11 — minimal production admin capability surface)
export { AdminAccessControlPage, buildAccessControlAdminSnapshot, getAccessControlAdminSnapshot, createInMemoryAccessControlAdminRepository, defaultAccessControlAdminRepository, toOverrideQueueItem, isRenewalDue, buildRoleAccessLookup, applyOverrideReviewDecision, applyRenewalRequest, resolveRoleChangeReview, applyEmergencyReviewDecision, deriveQueueByDecision, sortAuditEventsDescending, loadAdminAccessControlSnapshot, toAdminSearchQuery, toAdminAuditOperationalVisibility, useAdminAccessControlData, } from './admin/index.js';
// Access-control backend model (PH5.10 — centralized HB Intel authorization SoR)
export { createBaseRoleDefinition, normalizeAccessControlStatus, resolveRenewalState, createReviewMetadata, createAccessControlAuditEvent, getChangedBaseRoleReferences, createOverrideRequest, approveOverrideRequest, revokeOverrideRecord, archiveOverrideRecord, renewOverrideRecord, resolveOverrideLifecycleStatus, flagOverrideForReview, markDependentOverridesForRoleReview, DEFAULT_SHELL_AUTH_CONFIGURATION, resolveShellAuthConfiguration, validateShellAuthConfiguration, loadShellAuthConfiguration, } from './backend/index.js';
// Adapters (Blueprint §2b — dual-mode auth)
export { resolveAuthMode, resolveCanonicalAuthMode, mapLegacyToCanonicalAuthMode, mapCanonicalToLegacyAuthMode, describeResolvedAuthRuntime, extractSpfxUser, initMsalAuth, createAuthFailure, normalizeIdentityToSession, restoreSessionWithinPolicy, MsalAdapter, SpfxAdapter, MockAdapter, } from './adapters/index.js';
// SPFx bootstrap (Blueprint §2b — Phase 5)
export { bootstrapSpfxAuth, assertValidSpfxHostBridgeInput, toSpfxIdentityBridgeInput, } from './spfx/index.js';
// D-PH5C-02:
// Dev-only adapter exports are intentionally isolated behind the package subpath
// entrypoint `@hbc/auth/dev` via `src/dev.ts` to keep root index exports valid
// under TypeScript/ESM static export rules.
// Startup timing bridge (PH5.15 — cross-package startup phase instrumentation seam)
export { startStartupPhase, endStartupPhase, recordStartupPhase, } from './startup/startupTimingBridge.js';
// MSAL helpers (Blueprint §2b — Phase 4)
export { mapMsalAccountToUser, validateMsalConfig } from './msal/index.js';
// D-PH6F-03: Bootstrap helpers and persona registry for dev-mode identity resolution.
export { PERSONA_REGISTRY } from './mock/personaRegistry.js';
export { resolveBootstrapPersona, personaToCurrentUser, resolveBootstrapPermissions, } from './mock/bootstrapHelpers.js';
//# sourceMappingURL=index.js.map