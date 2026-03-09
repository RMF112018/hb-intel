import { AccessDenied, useAuthStore } from '@hbc/auth';
import type { ComponentType, ReactNode } from 'react';
import { Suspense, lazy, useMemo } from 'react';
import type { ShellRestrictedZoneState, ShellSensitiveActionPolicyResult } from './degradedMode.js';
import type { HeaderBarProps } from './HeaderBar/index.js';
import { AppLauncher } from './AppLauncher/index.js';
import { BackToProjectHub } from './BackToProjectHub/index.js';
import { ProjectPicker } from './ProjectPicker/index.js';
import { ShellLayout } from './ShellLayout/index.js';
import { resolveShellModeRules } from './shellModeRules.js';
import type {
  ShellConnectivitySignal,
  ShellDegradedSectionInput,
  ShellStatusAction,
  ShellStatusSnapshot,
} from './shellStatus.js';
import type { ShellRecoveryState, ShellSensitiveActionIntent, ShellRestrictedZoneInput } from './degradedMode.js';
import { useNavStore } from './stores/navStore.js';
import { useShellCoreStore } from './stores/shellCoreStore.js';
import type {
  ShellCacheRetentionTier,
  ShellEnvironmentAdapter,
  ShellExperienceState,
  StartupTimingSnapshot,
  WorkspaceId,
} from './types.js';
import {
  createDefaultShellSignOutCleanupDependencies,
  runShellSignOutCleanup,
} from './signOutCleanup.js';
import { useSpfxHostAdapter } from './useSpfxHostAdapter.js';
import { useRouteEnforcement } from './useRouteEnforcement.js';
import { useShellDegradedRecovery } from './useShellDegradedRecovery.js';
import { useShellBootstrapSync } from './useShellBootstrapSync.js';
import { useShellStatusRail } from './useShellStatusRail.js';
import { useRedirectRestore } from './useRedirectRestore.js';
import { useStartupTimingCompletion } from './useStartupTimingCompletion.js';

// Re-export for backward compat (D1 — index.ts unchanged for this symbol)
export { resolveShellExperienceState } from './shellExperience.js';

// ALIGNMENT: ShellCore.tsx v1.0 - PH5C.4, PH5C.2 - Shell core component with dev toolbar integration
// ALIGNMENT: DevToolbar Integration PH5C.4
// D-PH5C-06/D-PH5C-02: Lazily load dev toolbar only in DEV mode to avoid production inclusion.
let DevToolbar: ComponentType | null = null;
if (import.meta.env.DEV) {
  DevToolbar = lazy(() => import('./devToolbar/DevToolbar.js').then((m) => ({ default: m.DevToolbar })));
}

export interface ShellCoreProps {
  adapter: ShellEnvironmentAdapter;
  children: ReactNode;
  currentPathname: string;
  intendedPathname?: string | null;
  /** Optional status rail slot for backwards compatibility. */
  statusSlot?: ReactNode;
  /** Preferred status rail renderer for unified shell-status integration. */
  renderStatusRail?: (params: {
    snapshot: ShellStatusSnapshot;
    onAction: (action: ShellStatusAction) => void;
  }) => ReactNode;
  degradedSlot?: ReactNode;
  recoverySlot?: ReactNode;
  accessDeniedSlot?: ReactNode;
  toolPickerSlot?: HeaderBarProps['toolPickerSlot'];
  rightSlot?: ReactNode;
  sidebarSlot?: ReactNode;
  onProjectSelect?: (projectId: string) => void;
  onBackToProjectHub?: () => void;
  onWorkspaceSelect?: (workspace: WorkspaceId) => void;
  onSidebarNavigate?: (id: string) => void;
  onToolSelect?: (id: string) => void;
  onNavigate?: (pathname: string) => void;
  onRequestAccess?: () => void;
  onRetry?: () => void;
  onSignInAgain?: () => void;
  onLearnMore?: () => void;
  onShellStatusAction?: (action: ShellStatusAction, snapshot: ShellStatusSnapshot) => void;
  connectivitySignal?: ShellConnectivitySignal;
  /** Cached section metadata used for degraded eligibility/freshness labeling. */
  degradedSections?: readonly ShellDegradedSectionInput[];
  /** Explicit action intents for centralized degraded-mode safety blocking. */
  sensitiveActionIntents?: readonly ShellSensitiveActionIntent[];
  /** Restricted-zone metadata rendered visibly while degraded mode is active. */
  restrictedZones?: readonly ShellRestrictedZoneInput[];
  /** Optional observer for resolved centralized sensitive-action policy. */
  onSensitiveActionPolicyResolved?: (policy: ShellSensitiveActionPolicyResult) => void;
  /** Optional observer for centralized restricted-zone state. */
  onRestrictedZonesResolved?: (zones: readonly ShellRestrictedZoneState[]) => void;
  /** Optional observer for explicit safe recovery transitions. */
  onRecoveryStateResolved?: (state: ShellRecoveryState) => void;
  /** Optional custom renderer for restricted-zone communication surfaces. */
  renderRestrictedZones?: (zones: readonly ShellRestrictedZoneState[]) => ReactNode;
  forcedExperienceState?: Exclude<ShellExperienceState, 'access-denied'> | null;
  /** Optional diagnostics observer for Phase 5.15 startup budget validation. */
  onStartupTimingSnapshot?: (snapshot: StartupTimingSnapshot) => void;
}

/**
 * Resolve role-appropriate landing path fallbacks.
 */
export function resolveRoleLandingPath(resolvedRoles: readonly string[]): string {
  if (resolvedRoles.includes('Administrator')) {
    return '/admin';
  }
  if (resolvedRoles.includes('Executive')) {
    return '/leadership';
  }
  return '/project-hub';
}

/**
 * Shared shell orchestrator for Phase 5.5.
 *
 * Non-goals:
 * - No feature/business logic decisions.
 * - No feature-domain data fetching logic.
 */
// ALIGNMENT: ShellCore exports - Auth shell foundation per PH5C
export function ShellCore({
  adapter,
  children,
  currentPathname,
  intendedPathname = null,
  statusSlot = null,
  renderStatusRail,
  degradedSlot = null,
  recoverySlot = null,
  accessDeniedSlot = null,
  toolPickerSlot,
  rightSlot,
  sidebarSlot,
  onProjectSelect,
  onBackToProjectHub,
  onWorkspaceSelect,
  onSidebarNavigate,
  onToolSelect,
  onNavigate,
  onRequestAccess,
  onRetry,
  onSignInAgain,
  onLearnMore,
  onShellStatusAction,
  connectivitySignal,
  degradedSections = [],
  sensitiveActionIntents = [],
  restrictedZones = [],
  onSensitiveActionPolicyResolved,
  onRestrictedZonesResolved,
  onRecoveryStateResolved,
  renderRestrictedZones,
  forcedExperienceState = null,
  onStartupTimingSnapshot,
}: ShellCoreProps): ReactNode {
  const lifecyclePhase = useAuthStore((s) => s.lifecyclePhase);
  const session = useAuthStore((s) => s.session);
  const structuredError = useAuthStore((s) => s.structuredError);
  const activeWorkspace = useNavStore((s) => s.activeWorkspace);
  const setExperienceState = useShellCoreStore((s) => s.setExperienceState);
  const setBootstrapPhase = useShellCoreStore((s) => s.setBootstrapPhase);
  const setActiveWorkspaceSnapshot = useShellCoreStore((s) => s.setActiveWorkspaceSnapshot);
  const setLastResolvedLandingPath = useShellCoreStore((s) => s.setLastResolvedLandingPath);

  const rules = useMemo(() => resolveShellModeRules(adapter.environment), [adapter.environment]);
  const resolvedRoles = session?.resolvedRoles ?? [];
  const landingPath = resolveRoleLandingPath(resolvedRoles);
  const resolvedConnectivitySignal: ShellConnectivitySignal =
    connectivitySignal ??
    (typeof navigator !== 'undefined' && navigator.onLine ? 'connected' : 'reconnecting');

  // --- Hook calls ---
  useSpfxHostAdapter({ adapter });

  const routeDecision = useRouteEnforcement({
    adapter,
    currentPathname,
    intendedPathname,
    activeWorkspace,
    resolvedRoles,
  });

  const { experienceState, sensitiveActionPolicy, resolvedRestrictedZones, recoveryState } =
    useShellDegradedRecovery({
      lifecyclePhase,
      session,
      degradedSections,
      sensitiveActionIntents,
      restrictedZones,
      routeDecision,
      forcedExperienceState,
      connectivitySignal: resolvedConnectivitySignal,
      onSensitiveActionPolicyResolved,
      onRestrictedZonesResolved,
      onRecoveryStateResolved,
    });

  useShellBootstrapSync({
    lifecyclePhase,
    experienceState,
    activeWorkspace,
    setExperienceState,
    setBootstrapPhase,
    setActiveWorkspaceSnapshot,
  });

  const { statusSnapshot, resolvedStatusRail } = useShellStatusRail({
    lifecyclePhase,
    experienceState,
    routeDecision,
    structuredError,
    connectivitySignal: resolvedConnectivitySignal,
    degradedSections,
    recoveryState,
    renderStatusRail,
    statusSlot,
    onRetry,
    onSignInAgain,
    onLearnMore,
    onShellStatusAction,
  });

  useRedirectRestore({
    session,
    rules,
    onNavigate,
    adapterEnvironment: adapter.environment,
    landingPath,
    currentPathname,
    setLastResolvedLandingPath,
  });

  useStartupTimingCompletion({
    lifecyclePhase,
    experienceState,
    routeDecision,
    adapter,
    onStartupTimingSnapshot,
  });

  // --- Layout slot composition ---
  const layoutLeftSlot =
    rules.supportsProjectPicker && activeWorkspace === 'project-hub' ? (
      <ProjectPicker
        onProjectSelect={(project) => {
          onProjectSelect?.(project.id);
        }}
      />
    ) : rules.supportsProjectPicker ? (
      <BackToProjectHub onNavigate={onBackToProjectHub} />
    ) : undefined;

  const layoutRightSlot =
    rightSlot ??
    (rules.supportsAppLauncher ? (
      <AppLauncher onWorkspaceSelect={onWorkspaceSelect} />
    ) : undefined);

  // --- Experience-state rendering branches ---
  if (experienceState === 'access-denied') {
    return (
      accessDeniedSlot ?? (
        <AccessDenied
          onGoHome={onNavigate ? () => onNavigate(landingPath) : undefined}
          onGoBack={onNavigate ? () => onNavigate('/project-hub') : undefined}
          onRequestAccess={onRequestAccess}
        />
      )
    );
  }

  if (experienceState === 'recovery') {
    return (
      recoverySlot ?? <section data-hbc-shell="shell-recovery">Recovering shell state...</section>
    );
  }

  return (
    <div data-hbc-shell="shell-core" data-environment={adapter.environment}>
      {resolvedStatusRail}
      {experienceState === 'degraded' ? (
        <section data-hbc-shell="shell-degraded-context">
          <p>
            Degraded mode active. Sensitive actions are blocked until current authorization is
            restored.
          </p>
          {statusSnapshot.degradedSectionLabels.length > 0 ? (
            <ul data-hbc-shell="degraded-sections">
              {statusSnapshot.degradedSectionLabels.map((sectionLabel) => (
                <li key={sectionLabel.sectionId}>{sectionLabel.label}</li>
              ))}
            </ul>
          ) : null}
          {sensitiveActionPolicy.blockedActionIds.length > 0 ? (
            <ul data-hbc-shell="blocked-sensitive-actions">
              {sensitiveActionPolicy.blockedActionIds.map((actionId) => (
                <li key={actionId}>{actionId}</li>
              ))}
            </ul>
          ) : null}
          {(renderRestrictedZones?.(resolvedRestrictedZones) ??
            (resolvedRestrictedZones.some((zone) => zone.visible) ? (
              <ul data-hbc-shell="restricted-zones">
                {resolvedRestrictedZones
                  .filter((zone) => zone.visible)
                  .map((zone) => (
                    <li key={zone.zoneId}>
                      {zone.zoneLabel}: {zone.message}
                    </li>
                  ))}
              </ul>
            ) : null))}
        </section>
      ) : null}
      <ShellLayout
        mode={rules.mode}
        leftSlot={layoutLeftSlot}
        toolPickerSlot={toolPickerSlot}
        rightSlot={layoutRightSlot}
        sidebarSlot={sidebarSlot}
        showSidebar={rules.supportsContextualSidebar}
        onSidebarNavigate={onSidebarNavigate}
        onToolSelect={onToolSelect}
      >
        {experienceState === 'degraded' ? degradedSlot : null}
        {children}
      </ShellLayout>
      {import.meta.env.DEV && DevToolbar ? (
        <Suspense fallback={null}>
          <DevToolbar />
        </Suspense>
      ) : null}
    </div>
  );
}

/**
 * Central shell sign-out API enforcing all Phase 5.5 cleanup requirements.
 */
export async function performShellSignOut(
  adapter: ShellEnvironmentAdapter,
  retentionTiers: readonly ShellCacheRetentionTier[] = ['strict', 'standard'],
): Promise<void> {
  const dependencies = createDefaultShellSignOutCleanupDependencies(adapter);
  await runShellSignOutCleanup(dependencies, retentionTiers);
}
