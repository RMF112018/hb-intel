/**
 * Shell navigation types — Blueprint §1f, §2c.
 * Navigation is a shell concern; these types live here, not in @hbc/models.
 */

/** The 19 workspace identifiers — 14 Procore-aligned + 5 SPFx-only (Blueprint §2c, Phase 5). */
export type WorkspaceId =
  | 'project-hub'
  | 'accounting'
  | 'estimating'
  | 'scheduling'
  | 'buyout'
  | 'compliance'
  | 'contracts'
  | 'risk'
  | 'scorecard'
  | 'pmp'
  | 'leadership'
  | 'business-development'
  | 'admin'
  | 'site-control'
  | 'safety'
  | 'quality-control-warranty'
  | 'risk-management'
  | 'operational-excellence'
  | 'human-resources';

/** Runtime-iterable list of all workspace IDs (e.g. for AppLauncher grid). */
export const WORKSPACE_IDS: readonly WorkspaceId[] = [
  'project-hub',
  'accounting',
  'estimating',
  'scheduling',
  'buyout',
  'compliance',
  'contracts',
  'risk',
  'scorecard',
  'pmp',
  'leadership',
  'business-development',
  'admin',
  'site-control',
  'safety',
  'quality-control-warranty',
  'risk-management',
  'operational-excellence',
  'human-resources',
] as const;

/** A single item in the center tool-picker strip (Blueprint §2c). */
export interface ToolPickerItem {
  id: string;
  label: string;
  icon?: string;
  onClick: () => void;
}

/** A single item in the contextual sidebar (Blueprint §2c). D-04: active state is router-derived. */
export interface SidebarItem {
  id: string;
  label: string;
  icon?: string;
  onClick: () => void;
}

/** Descriptor for a workspace tile in the AppLauncher grid. */
export interface WorkspaceDescriptor {
  id: WorkspaceId;
  label: string;
  icon?: string;
  description?: string;
}

/**
 * Phase 5.5 runtime environment identifiers.
 *
 * These are host/runtime identities, not feature modes. Central shell rules are
 * resolved from this enum to keep behavior consistent across adapters.
 */
export type ShellEnvironment = 'pwa' | 'spfx' | 'hb-site-control' | 'dev-override';

/**
 * Core shell mode controls layout affordances only.
 * Business-feature behavior remains outside shell scope.
 */
export type ShellMode = 'full' | 'simplified';

/**
 * Shell-level experience surfaces selected by centralized rule orchestration.
 */
export type ShellExperienceState = 'ready' | 'degraded' | 'recovery' | 'access-denied';

/**
 * Feature cache retention tiers enforced during shell sign-out cleanup.
 */
export type ShellCacheRetentionTier = 'strict' | 'standard' | 'preserve-session';

/**
 * Centralized shell-mode capabilities resolved from environment adapters.
 */
export interface ShellModeRules {
  environment: ShellEnvironment;
  mode: ShellMode;
  supportsProjectPicker: boolean;
  supportsAppLauncher: boolean;
  supportsContextualSidebar: boolean;
  supportsRedirectRestore: boolean;
}

/**
 * Route enforcement context consumed by approved shell extension points.
 */
export interface ShellRouteEnforcementContext {
  pathname: string;
  intendedPathname?: string | null;
  activeWorkspace: WorkspaceId | null;
  resolvedRoles: string[];
}

/**
 * Route enforcement decision returned by shell adapters.
 */
export interface ShellRouteEnforcementDecision {
  allow: boolean;
  reason?: string;
}

/**
 * Redirect memory payload for safe restore orchestration.
 */
export interface RedirectMemoryRecord {
  pathname: string;
  runtimeMode: ShellEnvironment;
  expiresAt: string;
}

/**
 * Approved extension point contract for environment-specific shell behavior.
 *
 * Scope boundary:
 * - Allowed: host/runtime integration seams.
 * - Not allowed: feature/business logic branching.
 */
export interface ShellEnvironmentAdapter {
  environment: ShellEnvironment;
  enforceRoute?: (
    context: ShellRouteEnforcementContext,
  ) => ShellRouteEnforcementDecision | Promise<ShellRouteEnforcementDecision>;
  clearEnvironmentArtifacts?: () => void | Promise<void>;
  clearFeatureCachesByTier?: (tier: ShellCacheRetentionTier) => void | Promise<void>;
}
