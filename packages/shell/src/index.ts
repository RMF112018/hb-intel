// Types (Blueprint §1f — shell-specific navigation types)
export type {
  WorkspaceId,
  ToolPickerItem,
  SidebarItem,
  WorkspaceDescriptor,
  ShellEnvironment,
  ShellMode,
  ShellExperienceState,
  ShellCacheRetentionTier,
  ShellModeRules,
  ShellEnvironmentAdapter,
  ShellRouteEnforcementContext,
  ShellRouteEnforcementDecision,
  RedirectMemoryRecord,
  SpfxHostContainerMetadata,
  SpfxHostSignalSnapshot,
  SpfxHostSignalHandlers,
  SpfxHostBridge,
  StartupPhase,
  StartupTimingPhaseMetadata,
  StartupBudgetDefinition,
  StartupTimingRecord,
  StartupBudgetFailure,
  StartupBudgetValidationResult,
  StartupTimingSnapshot,
  SimplifiedToolPickerEntry,
  SimplifiedShellConfig,
} from './types.js';
export { WORKSPACE_IDS } from './types.js';

// Stores (Blueprint §2e — Zustand exclusively)
export { useProjectStore } from './stores/index.js';
export type { ProjectState } from './stores/index.js';
export { useNavStore } from './stores/index.js';
export type { NavState } from './stores/index.js';
export { useShellCoreStore } from './stores/index.js';
export type { ShellCoreState, ShellBootstrapPhase } from './stores/index.js';

/**
 * @internal Shell layout components — designed for use inside ShellCore only.
 *
 * These components are exported for ShellCore's internal composition.
 * Direct app usage outside of ShellCore is NOT supported and may result in:
 * - Missing React context (shell state, auth lifecycle, startup timing)
 * - Rendering in incorrect auth/permission state
 * - Silent failures in experience state management
 *
 * Use `ShellCore` as the integration surface instead.
 *
 * @see ShellCore
 * @see docs/reference/shell/component-exports.md
 */
export { HeaderBar } from './HeaderBar/index.js';
export type { HeaderBarProps } from './HeaderBar/index.js';
export { AppLauncher } from './AppLauncher/index.js';
export type { AppLauncherProps } from './AppLauncher/index.js';
export { ProjectPicker } from './ProjectPicker/index.js';
export type { ProjectPickerProps } from './ProjectPicker/index.js';
export { BackToProjectHub } from './BackToProjectHub/index.js';
export type { BackToProjectHubProps } from './BackToProjectHub/index.js';
export { ContextualSidebar } from './ContextualSidebar/index.js';
export type { ContextualSidebarProps } from './ContextualSidebar/index.js';
export { ShellLayout } from './ShellLayout/index.js';
export type { ShellLayoutProps } from './ShellLayout/index.js';
export {
  ShellCore,
  performShellSignOut,
  resolveRoleLandingPath,
  resolveShellExperienceState,
} from './ShellCore.js';
export type { ShellCoreProps } from './ShellCore.js';
export { resolveLandingDecision } from './landingResolver.js';
export type {
  LandingMode,
  TeamMode,
  LandingDecisionInput,
  LandingDecision,
} from './landingResolver.js';
export { canCompleteFirstProtectedShellRender } from './useStartupTimingCompletion.js';
export {
  RECENT_AUTH_WINDOW_MS,
  TRUSTED_SECTION_FRESHNESS_WINDOW_MS,
  resolveSectionFreshnessState,
  resolveDegradedEligibility,
  resolveSensitiveActionPolicy,
  resolveRestrictedZones,
  resolveSafeRecoveryState,
} from './degradedMode.js';
export type {
  ShellSectionFreshnessState,
  DegradedModeSectionState,
  DegradedEligibilityInput,
  DegradedEligibilityResult,
  ShellSensitiveActionIntent,
  ShellSensitiveActionPolicyResult,
  ShellRestrictedZoneInput,
  ShellRestrictedZoneState,
  ShellRecoveryStateInput,
  ShellRecoveryState,
} from './degradedMode.js';
export {
  validateProtectedFeatureRegistration,
  defineProtectedFeatureRegistration,
  createProtectedFeatureRegistry,
  assertProtectedFeatureRegistered,
  toFeaturePermissionRegistration,
  toFeaturePermissionRegistrations,
} from './featureRegistration.js';
export type {
  ProtectedFeatureRouteMetadata,
  ProtectedFeatureNavigationMetadata,
  ProtectedFeaturePermissionMetadata,
  ProtectedFeatureExtensionPath,
  ProtectedFeatureRegistrationContract,
  ProtectedFeatureRegistrationRegistry,
  ProtectedFeatureRegistrationValidationResult,
} from './featureRegistration.js';
export {
  SHELL_STATUS_PRIORITY,
  resolveShellStatusSnapshot,
  deriveDegradedSectionLabels,
  isShellStatusActionAllowed,
} from './shellStatus.js';
export type {
  ShellStatusKind,
  ShellStatusAction,
  ShellStatusSnapshot,
  ShellStatusResolutionInput,
  ShellConnectivitySignal,
  ShellDegradedSectionInput,
  ShellDegradedSectionLabel,
} from './shellStatus.js';
export { resolveShellModeRules } from './shellModeRules.js';
export {
  assertValidSpfxHostBridge,
  normalizeSpfxHostSignals,
  createSpfxShellEnvironmentAdapter,
} from './spfxHostBridge.js';
export {
  BALANCED_STARTUP_BUDGETS,
  startPhase,
  endPhase,
  recordPhase,
  getSnapshot,
  validateBudgets,
  clear,
  setBudgets,
  registerStartupTimingBridge,
} from './startupTiming.js';
export type { StartupTimingBridge } from './startupTiming.js';

export {
  captureIntendedDestination,
  rememberRedirectTarget,
  restoreRedirectTarget,
  resolvePostGuardRedirect,
  clearRedirectMemory,
  isSafeRedirectPath,
} from './redirectMemory.js';
export { useShellStatusState, useDegradedModeVisibilityRules } from './hooks.js';
export { resolveProjectHubUrl } from './utils/resolveProjectHubUrl.js';
export {
  createDefaultShellSignOutCleanupDependencies,
  runShellSignOutCleanup,
} from './signOutCleanup.js';
export type { ShellSignOutCleanupDependencies } from './signOutCleanup.js';

// Module Configurations (PH4B.2 §Step 3 — moved from ui-kit, F-014)
export {
  scorecardsLanding,
  scorecardsDetail,
  rfisLanding,
  rfisDetail,
  punchListLanding,
  punchListDetail,
  drawingsLanding,
  disciplineFilters,
  budgetLanding,
  dailyLogSections,
  dailyLogVoiceFields,
  turnoverLanding,
  turnoverDetail,
  turnoverTearsheetSteps,
  documentsLanding,
  NAV_ITEMS,
  getNavItemsForWorkspace,
} from './module-configs/index.js';
export type {
  ModuleTableConfig,
  ModuleLandingConfig,
  ModuleDetailConfig,
  NavItemConfig,
} from './module-configs/index.js';
