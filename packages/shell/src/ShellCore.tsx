import { AccessDenied, useAuthStore } from '@hbc/auth';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { HeaderBarProps } from './HeaderBar/index.js';
import { AppLauncher } from './AppLauncher/index.js';
import { BackToProjectHub } from './BackToProjectHub/index.js';
import { ProjectPicker } from './ProjectPicker/index.js';
import { ShellLayout } from './ShellLayout/index.js';
import { clearRedirectMemory, restoreRedirectTarget } from './redirectMemory.js';
import { resolveShellModeRules } from './shellModeRules.js';
import {
  isShellStatusActionAllowed,
  resolveShellStatusSnapshot,
  type ShellConnectivitySignal,
  type ShellDegradedSectionInput,
  type ShellStatusAction,
  type ShellStatusSnapshot,
} from './shellStatus.js';
import {
  createDefaultShellSignOutCleanupDependencies,
  runShellSignOutCleanup,
} from './signOutCleanup.js';
import { useNavStore } from './stores/navStore.js';
import { useShellCoreStore } from './stores/shellCoreStore.js';
import type {
  ShellCacheRetentionTier,
  ShellEnvironmentAdapter,
  ShellExperienceState,
  ShellRouteEnforcementDecision,
  WorkspaceId,
} from './types.js';

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
  degradedSections?: readonly ShellDegradedSectionInput[];
  forcedExperienceState?: Exclude<ShellExperienceState, 'access-denied'> | null;
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
 * Centralized selector for shell experience surfaces.
 */
export function resolveShellExperienceState(params: {
  lifecyclePhase: string;
  routeDecision: ShellRouteEnforcementDecision | null;
  forcedExperienceState?: Exclude<ShellExperienceState, 'access-denied'> | null;
}): ShellExperienceState {
  if (params.routeDecision && !params.routeDecision.allow) {
    return 'access-denied';
  }

  if (params.forcedExperienceState) {
    return params.forcedExperienceState;
  }

  if (params.lifecyclePhase === 'bootstrapping' || params.lifecyclePhase === 'restoring') {
    return 'recovery';
  }

  if (params.lifecyclePhase === 'error' || params.lifecyclePhase === 'reauth-required') {
    return 'degraded';
  }

  return 'ready';
}

/**
 * Shared shell orchestrator for Phase 5.5.
 *
 * Non-goals:
 * - No feature/business logic decisions.
 * - No feature-domain data fetching logic.
 */
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
  forcedExperienceState = null,
}: ShellCoreProps): ReactNode {
  const lifecyclePhase = useAuthStore((s) => s.lifecyclePhase);
  const session = useAuthStore((s) => s.session);
  const structuredError = useAuthStore((s) => s.structuredError);
  const activeWorkspace = useNavStore((s) => s.activeWorkspace);
  const setExperienceState = useShellCoreStore((s) => s.setExperienceState);
  const setBootstrapPhase = useShellCoreStore((s) => s.setBootstrapPhase);
  const setActiveWorkspaceSnapshot = useShellCoreStore((s) => s.setActiveWorkspaceSnapshot);
  const setLastResolvedLandingPath = useShellCoreStore((s) => s.setLastResolvedLandingPath);
  const [routeDecision, setRouteDecision] = useState<ShellRouteEnforcementDecision | null>(null);

  const rules = useMemo(() => resolveShellModeRules(adapter.environment), [adapter.environment]);
  const resolvedRoles = session?.resolvedRoles ?? [];
  const landingPath = resolveRoleLandingPath(resolvedRoles);
  const experienceState = resolveShellExperienceState({
    lifecyclePhase,
    routeDecision,
    forcedExperienceState,
  });
  const resolvedConnectivitySignal: ShellConnectivitySignal =
    connectivitySignal ??
    (typeof navigator !== 'undefined' && navigator.onLine ? 'connected' : 'reconnecting');
  const statusSnapshot = useMemo(
    () =>
      resolveShellStatusSnapshot({
        lifecyclePhase,
        experienceState,
        hasAccessValidationIssue: Boolean(routeDecision && !routeDecision.allow),
        hasFatalError: Boolean(structuredError),
        connectivitySignal: resolvedConnectivitySignal,
        degradedSections,
      }),
    [
      lifecyclePhase,
      experienceState,
      routeDecision,
      structuredError,
      resolvedConnectivitySignal,
      degradedSections,
    ],
  );

  useEffect(() => {
    setExperienceState(experienceState);
  }, [experienceState, setExperienceState]);

  useEffect(() => {
    setBootstrapPhase(
      lifecyclePhase === 'bootstrapping' || lifecyclePhase === 'restoring'
        ? 'bootstrapping'
        : lifecyclePhase === 'error' || lifecyclePhase === 'reauth-required'
          ? 'recovering'
          : lifecyclePhase === 'authenticated'
            ? 'ready'
            : 'idle',
    );
  }, [lifecyclePhase, setBootstrapPhase]);

  useEffect(() => {
    setActiveWorkspaceSnapshot(activeWorkspace);
  }, [activeWorkspace, setActiveWorkspaceSnapshot]);

  useEffect(() => {
    const evaluateRoute = async (): Promise<void> => {
      if (!adapter.enforceRoute) {
        setRouteDecision({ allow: true });
        return;
      }

      const decision = await adapter.enforceRoute({
        pathname: currentPathname,
        intendedPathname,
        activeWorkspace,
        resolvedRoles: [...resolvedRoles],
      });
      setRouteDecision(decision);
    };

    void evaluateRoute();
  }, [activeWorkspace, adapter, currentPathname, intendedPathname, resolvedRoles]);

  useEffect(() => {
    if (!session || !rules.supportsRedirectRestore || !onNavigate) {
      return;
    }

    const restored = restoreRedirectTarget({
      runtimeMode: adapter.environment,
    });

    if (restored) {
      setLastResolvedLandingPath(restored.pathname);
      onNavigate(restored.pathname);
      clearRedirectMemory();
      return;
    }

    if (currentPathname === '/') {
      setLastResolvedLandingPath(landingPath);
      onNavigate(landingPath);
    }
  }, [
    adapter.environment,
    currentPathname,
    landingPath,
    onNavigate,
    rules.supportsRedirectRestore,
    session,
    setLastResolvedLandingPath,
  ]);

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

  const handleShellStatusAction = (action: ShellStatusAction): void => {
    if (!isShellStatusActionAllowed(statusSnapshot, action)) {
      return;
    }

    if (action === 'retry') {
      onRetry?.();
    }
    if (action === 'sign-in-again') {
      onSignInAgain?.();
    }
    if (action === 'learn-more') {
      onLearnMore?.();
    }

    onShellStatusAction?.(action, statusSnapshot);
  };

  const resolvedStatusRail =
    renderStatusRail != null
      ? renderStatusRail({
          snapshot: statusSnapshot,
          onAction: handleShellStatusAction,
        })
      : statusSlot;

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
    return recoverySlot ?? <section data-hbc-shell="shell-recovery">Recovering shell state...</section>;
  }

  if (experienceState === 'degraded' && degradedSlot) {
    return degradedSlot;
  }

  return (
    <div data-hbc-shell="shell-core" data-environment={adapter.environment}>
      {resolvedStatusRail}
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
        {children}
      </ShellLayout>
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
