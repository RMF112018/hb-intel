import { AccessDenied, useAuthStore } from '@hbc/auth';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  resolveDegradedEligibility,
  resolveRestrictedZones,
  resolveSafeRecoveryState,
  resolveSensitiveActionPolicy,
  type DegradedEligibilityResult,
  type ShellRestrictedZoneInput,
  type ShellRestrictedZoneState,
  type ShellRecoveryState,
  type ShellSensitiveActionIntent,
  type ShellSensitiveActionPolicyResult,
} from './degradedMode.js';
import type { HeaderBarProps } from './HeaderBar/index.js';
import { AppLauncher } from './AppLauncher/index.js';
import { BackToProjectHub } from './BackToProjectHub/index.js';
import { ProjectPicker } from './ProjectPicker/index.js';
import { ShellLayout } from './ShellLayout/index.js';
import { clearRedirectMemory, resolvePostGuardRedirect, restoreRedirectTarget } from './redirectMemory.js';
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
  degradedEligibility?: DegradedEligibilityResult;
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
    return params.degradedEligibility?.eligible === true ? 'degraded' : 'recovery';
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
  sensitiveActionIntents = [],
  restrictedZones = [],
  onSensitiveActionPolicyResolved,
  onRestrictedZonesResolved,
  onRecoveryStateResolved,
  renderRestrictedZones,
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
  const [wasDegraded, setWasDegraded] = useState(false);

  const rules = useMemo(() => resolveShellModeRules(adapter.environment), [adapter.environment]);
  const resolvedRoles = session?.resolvedRoles ?? [];
  const landingPath = resolveRoleLandingPath(resolvedRoles);
  // Controlled degraded mode is gated by strict policy, not direct lifecycle state.
  const degradedEligibility = useMemo(
    () =>
      resolveDegradedEligibility({
        lifecyclePhase,
        sessionValidatedAt: session?.validatedAt ?? null,
        sections: degradedSections,
      }),
    [degradedSections, lifecyclePhase, session?.validatedAt],
  );
  const experienceState = resolveShellExperienceState({
    lifecyclePhase,
    routeDecision,
    degradedEligibility,
    forcedExperienceState,
  });
  const resolvedConnectivitySignal: ShellConnectivitySignal =
    connectivitySignal ??
    (typeof navigator !== 'undefined' && navigator.onLine ? 'connected' : 'reconnecting');
  // Centralized sensitive-action resolver enforces blocked categories in degraded mode.
  const sensitiveActionPolicy = useMemo(
    () =>
      resolveSensitiveActionPolicy({
        isDegradedMode: experienceState === 'degraded',
        intents: sensitiveActionIntents,
      }),
    [experienceState, sensitiveActionIntents],
  );
  // Restricted zones remain visible in degraded mode to make constraints explicit.
  const resolvedRestrictedZones = useMemo(
    () =>
      resolveRestrictedZones({
        isDegradedMode: experienceState === 'degraded',
        zones: restrictedZones,
      }),
    [experienceState, restrictedZones],
  );
  // Recovery is explicit and safe only once authenticated + connected state is restored.
  const recoveryState = useMemo(
    () =>
      resolveSafeRecoveryState({
        wasDegraded,
        isDegraded: experienceState === 'degraded',
        lifecyclePhase,
        connectivitySignal: resolvedConnectivitySignal,
      }),
    [experienceState, lifecyclePhase, resolvedConnectivitySignal, wasDegraded],
  );
  const statusSnapshot = useMemo(
    () =>
      resolveShellStatusSnapshot({
        lifecyclePhase,
        experienceState,
        hasAccessValidationIssue: Boolean(routeDecision && !routeDecision.allow),
        hasFatalError: Boolean(structuredError),
        connectivitySignal: resolvedConnectivitySignal,
        degradedSections,
        hasRecoveredFromDegraded: recoveryState.recovered,
      }),
    [
      lifecyclePhase,
      experienceState,
      routeDecision,
      structuredError,
      resolvedConnectivitySignal,
      degradedSections,
      recoveryState.recovered,
    ],
  );

  useEffect(() => {
    setExperienceState(experienceState);
  }, [experienceState, setExperienceState]);

  useEffect(() => {
    // Track whether shell has entered degraded mode to power one-shot recovery signaling.
    if (experienceState === 'degraded') {
      setWasDegraded(true);
      return;
    }

    if (recoveryState.recovered) {
      setWasDegraded(false);
    }
  }, [experienceState, recoveryState.recovered]);

  useEffect(() => {
    onSensitiveActionPolicyResolved?.(sensitiveActionPolicy);
  }, [onSensitiveActionPolicyResolved, sensitiveActionPolicy]);

  useEffect(() => {
    onRestrictedZonesResolved?.(resolvedRestrictedZones);
  }, [onRestrictedZonesResolved, resolvedRestrictedZones]);

  useEffect(() => {
    onRecoveryStateResolved?.(recoveryState);
  }, [onRecoveryStateResolved, recoveryState]);

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

    const resolvedPath = resolvePostGuardRedirect({
      runtimeMode: adapter.environment,
      fallbackPath: landingPath,
      isTargetAllowed: (pathname) => pathname !== currentPathname,
    });

    const restored = restoreRedirectTarget({ runtimeMode: adapter.environment });
    if (restored && restored.pathname === resolvedPath) {
      setLastResolvedLandingPath(resolvedPath);
      onNavigate(resolvedPath);
      clearRedirectMemory();
      return;
    }

    if (currentPathname === '/') {
      setLastResolvedLandingPath(resolvedPath);
      onNavigate(resolvedPath);
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
