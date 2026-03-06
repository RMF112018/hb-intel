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
} from './types.js';
export { WORKSPACE_IDS } from './types.js';

// Stores (Blueprint §2e — Zustand exclusively)
export { useProjectStore } from './stores/index.js';
export type { ProjectState } from './stores/index.js';
export { useNavStore } from './stores/index.js';
export type { NavState } from './stores/index.js';
export { useShellCoreStore } from './stores/index.js';
export type { ShellCoreState, ShellBootstrapPhase } from './stores/index.js';

// Components (Blueprint §1f, §2c — Procore-inspired shell)
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
  captureIntendedDestination,
  rememberRedirectTarget,
  restoreRedirectTarget,
  resolvePostGuardRedirect,
  clearRedirectMemory,
  isSafeRedirectPath,
} from './redirectMemory.js';
export { useShellStatusState, useDegradedModeVisibilityRules } from './hooks.js';
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
