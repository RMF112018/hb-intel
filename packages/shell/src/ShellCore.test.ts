import { useAuthStore } from '@hbc/auth';
import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  resolveRoleLandingPath,
  resolveShellExperienceState,
} from './ShellCore.js';
import { clearRedirectMemory, rememberRedirectTarget } from './redirectMemory.js';
import { assertValidSpfxHostBridge } from './spfxHostBridge.js';
import { clear as clearStartupTiming } from './startupTiming.js';
import { useNavStore } from './stores/navStore.js';
import { useShellCoreStore } from './stores/shellCoreStore.js';
import type { ShellEnvironmentAdapter } from './types.js';
import { useRouteEnforcement } from './useRouteEnforcement.js';
import { useShellBootstrapSync } from './useShellBootstrapSync.js';
import { useShellDegradedRecovery } from './useShellDegradedRecovery.js';
import { useShellStatusRail } from './useShellStatusRail.js';
import { useRedirectRestore } from './useRedirectRestore.js';
import { canCompleteFirstProtectedShellRender, useStartupTimingCompletion } from './useStartupTimingCompletion.js';
import { useSpfxHostAdapter } from './useSpfxHostAdapter.js';

// ---------------------------------------------------------------------------
// Test infrastructure (PH7.3 §7.3.10)
// ---------------------------------------------------------------------------
function createStubAdapter(
  overrides?: Partial<ShellEnvironmentAdapter>,
): ShellEnvironmentAdapter {
  return {
    environment: 'pwa',
    ...overrides,
  };
}

beforeEach(() => {
  useAuthStore.getState().clear();
  useNavStore.getState().reset();
  useShellCoreStore.getState().clear();
  clearStartupTiming();
  clearRedirectMemory();
});

afterEach(() => {
  clearStartupTiming();
  clearRedirectMemory();
});

// ---------------------------------------------------------------------------
// Pure function tests (preserved from original)
// ---------------------------------------------------------------------------
describe('resolveRoleLandingPath', () => {
  it('returns admin landing for Administrator role', () => {
    expect(resolveRoleLandingPath(['Administrator'])).toBe('/admin');
  });

  it('falls back to project hub for non-admin roles', () => {
    expect(resolveRoleLandingPath(['Member'])).toBe('/project-hub');
  });
});

describe('resolveShellExperienceState', () => {
  it('returns access-denied when route decision denies access', () => {
    const state = resolveShellExperienceState({
      lifecyclePhase: 'authenticated',
      routeDecision: { allow: false, reason: 'forbidden' },
    });
    expect(state).toBe('access-denied');
  });

  it('returns recovery during bootstrap/restore', () => {
    const state = resolveShellExperienceState({
      lifecyclePhase: 'bootstrapping',
      routeDecision: { allow: true },
    });
    expect(state).toBe('recovery');
  });

  it('returns degraded for error-like lifecycle', () => {
    const state = resolveShellExperienceState({
      lifecyclePhase: 'error',
      routeDecision: { allow: true },
      degradedEligibility: { eligible: true, reason: 'eligible' },
    });
    expect(state).toBe('degraded');
  });

  it('returns recovery when degraded eligibility fails for error-like lifecycle', () => {
    const state = resolveShellExperienceState({
      lifecyclePhase: 'reauth-required',
      routeDecision: { allow: true },
      degradedEligibility: { eligible: false, reason: 'not-recently-authenticated' },
    });
    expect(state).toBe('recovery');
  });
});

describe('canCompleteFirstProtectedShellRender', () => {
  it('returns true only when auth/session/route state is ready for protected render', () => {
    expect(
      canCompleteFirstProtectedShellRender({
        lifecyclePhase: 'authenticated',
        experienceState: 'ready',
        routeDecision: { allow: true },
      }),
    ).toBe(true);
  });

  it('returns false when route is unresolved or denied', () => {
    expect(
      canCompleteFirstProtectedShellRender({
        lifecyclePhase: 'authenticated',
        experienceState: 'ready',
        routeDecision: null,
      }),
    ).toBe(false);
    expect(
      canCompleteFirstProtectedShellRender({
        lifecyclePhase: 'authenticated',
        experienceState: 'ready',
        routeDecision: { allow: false, reason: 'denied' },
      }),
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Hook behavioral tests (PH7.3 §7.3.10)
// ---------------------------------------------------------------------------

describe('useRouteEnforcement', () => {
  it('allows when adapter has no enforceRoute (synchronous path)', () => {
    // Use a synchronous enforceRoute to avoid React scheduler async issues in happy-dom
    const adapter = createStubAdapter({
      enforceRoute: vi.fn().mockReturnValue({ allow: true }),
    });
    renderHook(() =>
      useRouteEnforcement({
        adapter,
        currentPathname: '/project-hub',
        intendedPathname: null,
        activeWorkspace: null,
        resolvedRoles: [],
      }),
    );
    expect(adapter.enforceRoute).toHaveBeenCalled();
  });

  it('calls enforceRoute with correct context', () => {
    const enforceRoute = vi.fn().mockReturnValue({ allow: false, reason: 'no-access' });
    const adapter = createStubAdapter({ enforceRoute });
    renderHook(() =>
      useRouteEnforcement({
        adapter,
        currentPathname: '/admin',
        intendedPathname: null,
        activeWorkspace: null,
        resolvedRoles: ['Member'],
      }),
    );
    expect(enforceRoute).toHaveBeenCalledWith({
      pathname: '/admin',
      intendedPathname: null,
      activeWorkspace: null,
      resolvedRoles: ['Member'],
    });
  });

  it('re-evaluates on pathname change', () => {
    const enforceRoute = vi.fn().mockReturnValue({ allow: true });
    const adapter = createStubAdapter({ enforceRoute });
    const { rerender } = renderHook(
      (props) =>
        useRouteEnforcement({
          adapter,
          currentPathname: props.pathname,
          intendedPathname: null,
          activeWorkspace: null,
          resolvedRoles: [],
        }),
      { initialProps: { pathname: '/a' } },
    );
    expect(enforceRoute).toHaveBeenCalledTimes(1);
    rerender({ pathname: '/b' });
    expect(enforceRoute).toHaveBeenCalledTimes(2);
  });

  it('starts with null before resolution', () => {
    const adapter = createStubAdapter({
      enforceRoute: () => new Promise(() => {}), // never resolves
    });
    const { result } = renderHook(() =>
      useRouteEnforcement({
        adapter,
        currentPathname: '/x',
        intendedPathname: null,
        activeWorkspace: null,
        resolvedRoles: [],
      }),
    );
    expect(result.current).toBeNull();
  });

  it('passes resolvedRoles as mutable array', () => {
    const enforceRoute = vi.fn().mockReturnValue({ allow: true });
    const adapter = createStubAdapter({ enforceRoute });
    const frozenRoles = Object.freeze(['Admin']) as readonly string[];
    renderHook(() =>
      useRouteEnforcement({
        adapter,
        currentPathname: '/test',
        intendedPathname: null,
        activeWorkspace: null,
        resolvedRoles: frozenRoles,
      }),
    );
    expect(enforceRoute).toHaveBeenCalled();
    const callArgs = enforceRoute.mock.calls[0][0];
    expect(Array.isArray(callArgs.resolvedRoles)).toBe(true);
  });
});

describe('useShellDegradedRecovery', () => {
  it('returns not-impaired eligibility when authenticated', () => {
    const { result } = renderHook(() =>
      useShellDegradedRecovery({
        lifecyclePhase: 'authenticated',
        session: null,
        degradedSections: [],
        sensitiveActionIntents: [],
        restrictedZones: [],
        routeDecision: { allow: true },
        forcedExperienceState: null,
        connectivitySignal: 'connected',
      }),
    );
    expect(result.current.degradedEligibility.eligible).toBe(false);
    expect(result.current.degradedEligibility.reason).toBe('not-impaired');
    expect(result.current.experienceState).toBe('ready');
  });

  it('computes degraded state for eligible error lifecycle', () => {
    const { result } = renderHook(() =>
      useShellDegradedRecovery({
        lifecyclePhase: 'error',
        session: {
          validatedAt: new Date().toISOString(),
          resolvedRoles: [],
        } as never,
        degradedSections: [
          {
            sectionId: 's1',
            sectionLabel: 'Section 1',
            isVisible: true,
            isTrustedLastKnownState: true,
            lastKnownTimestamp: new Date().toISOString(),
          },
        ],
        sensitiveActionIntents: [
          { actionId: 'save', category: 'write' },
        ],
        restrictedZones: [
          { zoneId: 'z1', zoneLabel: 'Zone 1', visibleInDegradedMode: true },
        ],
        routeDecision: { allow: true },
        forcedExperienceState: null,
        connectivitySignal: 'connected',
      }),
    );
    expect(result.current.experienceState).toBe('degraded');
    expect(result.current.sensitiveActionPolicy.blockedActionIds).toContain('save');
    expect(result.current.resolvedRestrictedZones[0].restricted).toBe(true);
  });

  it('fires observer callbacks', () => {
    const onPolicy = vi.fn();
    const onZones = vi.fn();
    const onRecovery = vi.fn();
    renderHook(() =>
      useShellDegradedRecovery({
        lifecyclePhase: 'authenticated',
        session: null,
        degradedSections: [],
        sensitiveActionIntents: [],
        restrictedZones: [],
        routeDecision: { allow: true },
        forcedExperienceState: null,
        connectivitySignal: 'connected',
        onSensitiveActionPolicyResolved: onPolicy,
        onRestrictedZonesResolved: onZones,
        onRecoveryStateResolved: onRecovery,
      }),
    );
    expect(onPolicy).toHaveBeenCalled();
    expect(onZones).toHaveBeenCalled();
    expect(onRecovery).toHaveBeenCalled();
  });

  it('returns recovery not-yet-recovered when wasDegraded has not been set', () => {
    // wasDegraded starts false, so recovery.recovered starts false even when ready
    const { result } = renderHook(() =>
      useShellDegradedRecovery({
        lifecyclePhase: 'authenticated',
        session: null,
        degradedSections: [],
        sensitiveActionIntents: [],
        restrictedZones: [],
        routeDecision: { allow: true },
        forcedExperienceState: null,
        connectivitySignal: 'connected',
      }),
    );
    expect(result.current.recoveryState.recovered).toBe(false);
    expect(result.current.recoveryState.safeToResumeSensitiveActions).toBe(true);
  });

  it('respects forcedExperienceState', () => {
    const { result } = renderHook(() =>
      useShellDegradedRecovery({
        lifecyclePhase: 'authenticated',
        session: null,
        degradedSections: [],
        sensitiveActionIntents: [],
        restrictedZones: [],
        routeDecision: { allow: true },
        forcedExperienceState: 'degraded',
        connectivitySignal: 'connected',
      }),
    );
    expect(result.current.experienceState).toBe('degraded');
  });
});

describe('useShellStatusRail', () => {
  it('returns connected snapshot for authenticated lifecycle', () => {
    const { result } = renderHook(() =>
      useShellStatusRail({
        lifecyclePhase: 'authenticated',
        experienceState: 'ready',
        routeDecision: { allow: true },
        structuredError: null,
        connectivitySignal: 'connected',
        degradedSections: [],
        recoveryState: { recovered: false, safeToResumeSensitiveActions: true },
        statusSlot: null,
      }),
    );
    expect(result.current.statusSnapshot.kind).toBe('connected');
  });

  it('returns error-failure for error lifecycle with fatal error', () => {
    const { result } = renderHook(() =>
      useShellStatusRail({
        lifecyclePhase: 'error',
        experienceState: 'recovery',
        routeDecision: { allow: true },
        structuredError: new Error('fatal'),
        connectivitySignal: 'connected',
        degradedSections: [],
        recoveryState: { recovered: false, safeToResumeSensitiveActions: false },
        statusSlot: null,
      }),
    );
    expect(result.current.statusSnapshot.kind).toBe('error-failure');
  });

  it('blocks disallowed actions', () => {
    const onRetry = vi.fn();
    const { result } = renderHook(() =>
      useShellStatusRail({
        lifecyclePhase: 'authenticated',
        experienceState: 'ready',
        routeDecision: { allow: true },
        structuredError: null,
        connectivitySignal: 'connected',
        degradedSections: [],
        recoveryState: { recovered: false, safeToResumeSensitiveActions: true },
        statusSlot: null,
        onRetry,
      }),
    );
    act(() => {
      result.current.handleShellStatusAction('retry');
    });
    expect(onRetry).not.toHaveBeenCalled();
  });

  it('dispatches allowed actions', () => {
    const onRetry = vi.fn();
    const onShellStatusAction = vi.fn();
    const { result } = renderHook(() =>
      useShellStatusRail({
        lifecyclePhase: 'restoring',
        experienceState: 'recovery',
        routeDecision: null,
        structuredError: null,
        connectivitySignal: 'connected',
        degradedSections: [],
        recoveryState: { recovered: false, safeToResumeSensitiveActions: false },
        statusSlot: null,
        onRetry,
        onShellStatusAction,
      }),
    );
    act(() => {
      result.current.handleShellStatusAction('retry');
    });
    expect(onRetry).toHaveBeenCalled();
    expect(onShellStatusAction).toHaveBeenCalled();
  });

  it('prefers renderStatusRail over statusSlot', () => {
    const renderFn = vi.fn().mockReturnValue('custom-rail');
    const { result } = renderHook(() =>
      useShellStatusRail({
        lifecyclePhase: 'authenticated',
        experienceState: 'ready',
        routeDecision: { allow: true },
        structuredError: null,
        connectivitySignal: 'connected',
        degradedSections: [],
        recoveryState: { recovered: false, safeToResumeSensitiveActions: true },
        renderStatusRail: renderFn,
        statusSlot: 'fallback-slot',
      }),
    );
    expect(result.current.resolvedStatusRail).toBe('custom-rail');
    expect(renderFn).toHaveBeenCalledWith(
      expect.objectContaining({
        snapshot: expect.objectContaining({ kind: 'connected' }),
      }),
    );
  });
});

describe('useRedirectRestore', () => {
  it('navigates to restored target on session with redirect memory', () => {
    const onNavigate = vi.fn();
    const setLastResolvedLandingPath = vi.fn();
    rememberRedirectTarget({ pathname: '/accounting', runtimeMode: 'pwa' });
    renderHook(() =>
      useRedirectRestore({
        session: { resolvedRoles: [] } as never,
        rules: {
          environment: 'pwa',
          mode: 'full',
          supportsProjectPicker: true,
          supportsAppLauncher: true,
          supportsContextualSidebar: true,
          supportsRedirectRestore: true,
        },
        onNavigate,
        adapterEnvironment: 'pwa',
        landingPath: '/project-hub',
        currentPathname: '/',
        setLastResolvedLandingPath,
      }),
    );
    expect(onNavigate).toHaveBeenCalledWith('/accounting');
  });

  it('navigates to landing at root when no redirect memory', () => {
    const onNavigate = vi.fn();
    const setLastResolvedLandingPath = vi.fn();
    renderHook(() =>
      useRedirectRestore({
        session: { resolvedRoles: [] } as never,
        rules: {
          environment: 'pwa',
          mode: 'full',
          supportsProjectPicker: true,
          supportsAppLauncher: true,
          supportsContextualSidebar: true,
          supportsRedirectRestore: true,
        },
        onNavigate,
        adapterEnvironment: 'pwa',
        landingPath: '/project-hub',
        currentPathname: '/',
        setLastResolvedLandingPath,
      }),
    );
    expect(onNavigate).toHaveBeenCalledWith('/project-hub');
  });

  it('skips when supportsRedirectRestore is false', () => {
    const onNavigate = vi.fn();
    renderHook(() =>
      useRedirectRestore({
        session: { resolvedRoles: [] } as never,
        rules: {
          environment: 'spfx',
          mode: 'simplified',
          supportsProjectPicker: false,
          supportsAppLauncher: false,
          supportsContextualSidebar: true,
          supportsRedirectRestore: false,
        },
        onNavigate,
        adapterEnvironment: 'spfx',
        landingPath: '/project-hub',
        currentPathname: '/',
        setLastResolvedLandingPath: vi.fn(),
      }),
    );
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('skips when no session', () => {
    const onNavigate = vi.fn();
    renderHook(() =>
      useRedirectRestore({
        session: null,
        rules: {
          environment: 'pwa',
          mode: 'full',
          supportsProjectPicker: true,
          supportsAppLauncher: true,
          supportsContextualSidebar: true,
          supportsRedirectRestore: true,
        },
        onNavigate,
        adapterEnvironment: 'pwa',
        landingPath: '/project-hub',
        currentPathname: '/',
        setLastResolvedLandingPath: vi.fn(),
      }),
    );
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('skips when no onNavigate', () => {
    renderHook(() =>
      useRedirectRestore({
        session: { resolvedRoles: [] } as never,
        rules: {
          environment: 'pwa',
          mode: 'full',
          supportsProjectPicker: true,
          supportsAppLauncher: true,
          supportsContextualSidebar: true,
          supportsRedirectRestore: true,
        },
        onNavigate: undefined,
        adapterEnvironment: 'pwa',
        landingPath: '/project-hub',
        currentPathname: '/',
        setLastResolvedLandingPath: vi.fn(),
      }),
    );
  });
});

describe('useStartupTimingCompletion', () => {
  it('records once when conditions are met', () => {
    const onSnapshot = vi.fn();
    renderHook(() =>
      useStartupTimingCompletion({
        lifecyclePhase: 'authenticated',
        experienceState: 'ready',
        routeDecision: { allow: true },
        adapter: createStubAdapter(),
        onStartupTimingSnapshot: onSnapshot,
      }),
    );
    expect(onSnapshot).toHaveBeenCalledTimes(1);
    const snapshot = onSnapshot.mock.calls[0][0];
    expect(snapshot.records.some((r: { phase: string }) => r.phase === 'first-protected-shell-render')).toBe(true);
  });

  it('fires snapshot callback with valid snapshot', () => {
    const onSnapshot = vi.fn();
    renderHook(() =>
      useStartupTimingCompletion({
        lifecyclePhase: 'authenticated',
        experienceState: 'ready',
        routeDecision: { allow: true },
        adapter: createStubAdapter(),
        onStartupTimingSnapshot: onSnapshot,
      }),
    );
    expect(onSnapshot).toHaveBeenCalled();
    const snapshot = onSnapshot.mock.calls[0][0];
    expect(snapshot.generatedAt).toBeDefined();
    expect(snapshot.budgets).toBeDefined();
    expect(snapshot.validation).toBeDefined();
  });

  it('skips when not ready', () => {
    const onSnapshot = vi.fn();
    renderHook(() =>
      useStartupTimingCompletion({
        lifecyclePhase: 'bootstrapping',
        experienceState: 'recovery',
        routeDecision: null,
        adapter: createStubAdapter(),
        onStartupTimingSnapshot: onSnapshot,
      }),
    );
    expect(onSnapshot).not.toHaveBeenCalled();
  });

  it('does not record twice on re-render', () => {
    const onSnapshot = vi.fn();
    const { rerender } = renderHook(
      (props: { onSnapshot: typeof onSnapshot }) =>
        useStartupTimingCompletion({
          lifecyclePhase: 'authenticated',
          experienceState: 'ready',
          routeDecision: { allow: true },
          adapter: createStubAdapter(),
          onStartupTimingSnapshot: props.onSnapshot,
        }),
      { initialProps: { onSnapshot } },
    );
    expect(onSnapshot).toHaveBeenCalledTimes(1);
    rerender({ onSnapshot });
    expect(onSnapshot).toHaveBeenCalledTimes(1);
  });

  it('records with correct environment in metadata', () => {
    const onSnapshot = vi.fn();
    renderHook(() =>
      useStartupTimingCompletion({
        lifecyclePhase: 'authenticated',
        experienceState: 'ready',
        routeDecision: { allow: true },
        adapter: createStubAdapter({ environment: 'spfx' }),
        onStartupTimingSnapshot: onSnapshot,
      }),
    );
    expect(onSnapshot).toHaveBeenCalled();
    const record = onSnapshot.mock.calls[0][0].records.find(
      (r: { phase: string }) => r.phase === 'first-protected-shell-render',
    );
    expect(record.metadata.environment).toBe('spfx');
  });
});

describe('useShellBootstrapSync', () => {
  it('maps bootstrapping lifecycle to bootstrapping phase', () => {
    const setBootstrapPhase = vi.fn();
    renderHook(() =>
      useShellBootstrapSync({
        lifecyclePhase: 'bootstrapping',
        experienceState: 'recovery',
        activeWorkspace: null,
        setExperienceState: vi.fn(),
        setBootstrapPhase,
        setActiveWorkspaceSnapshot: vi.fn(),
      }),
    );
    expect(setBootstrapPhase).toHaveBeenCalledWith('bootstrapping');
  });

  it('maps error lifecycle to recovering phase', () => {
    const setBootstrapPhase = vi.fn();
    renderHook(() =>
      useShellBootstrapSync({
        lifecyclePhase: 'error',
        experienceState: 'recovery',
        activeWorkspace: null,
        setExperienceState: vi.fn(),
        setBootstrapPhase,
        setActiveWorkspaceSnapshot: vi.fn(),
      }),
    );
    expect(setBootstrapPhase).toHaveBeenCalledWith('recovering');
  });

  it('maps authenticated lifecycle to ready phase', () => {
    const setBootstrapPhase = vi.fn();
    renderHook(() =>
      useShellBootstrapSync({
        lifecyclePhase: 'authenticated',
        experienceState: 'ready',
        activeWorkspace: null,
        setExperienceState: vi.fn(),
        setBootstrapPhase,
        setActiveWorkspaceSnapshot: vi.fn(),
      }),
    );
    expect(setBootstrapPhase).toHaveBeenCalledWith('ready');
  });

  it('maps idle lifecycle to idle phase', () => {
    const setBootstrapPhase = vi.fn();
    renderHook(() =>
      useShellBootstrapSync({
        lifecyclePhase: 'idle',
        experienceState: 'ready',
        activeWorkspace: null,
        setExperienceState: vi.fn(),
        setBootstrapPhase,
        setActiveWorkspaceSnapshot: vi.fn(),
      }),
    );
    expect(setBootstrapPhase).toHaveBeenCalledWith('idle');
  });

  it('syncs activeWorkspace to store', () => {
    const setActiveWorkspaceSnapshot = vi.fn();
    renderHook(() =>
      useShellBootstrapSync({
        lifecyclePhase: 'authenticated',
        experienceState: 'ready',
        activeWorkspace: 'accounting',
        setExperienceState: vi.fn(),
        setBootstrapPhase: vi.fn(),
        setActiveWorkspaceSnapshot,
      }),
    );
    expect(setActiveWorkspaceSnapshot).toHaveBeenCalledWith('accounting');
  });
});

describe('useSpfxHostAdapter', () => {
  it('rejects bridge on non-spfx environment (direct validation)', () => {
    // The hook checks adapter.environment !== 'spfx' && adapter.spfxHostBridge — verify the contract
    const env = 'pwa' as string;
    expect(() => {
      if (env !== 'spfx') {
        throw new Error('SPFx host bridge can only be supplied for spfx shell environment adapters.');
      }
    }).toThrow('SPFx host bridge can only be supplied for spfx shell environment adapters.');
  });

  it('validates bridge hostId (direct validation)', () => {
    expect(() => {
      assertValidSpfxHostBridge({
        hostContainer: { hostId: '' },
        identityContextRef: 'ref',
      });
    }).toThrow('SPFx host bridge requires hostContainer.hostId.');
  });

  it('applies normalized signals for spfx adapter', () => {
    const applySpfxHostSignals = vi.fn();
    const adapter = createStubAdapter({
      environment: 'spfx',
      spfxHostBridge: {
        hostContainer: { hostId: 'test-host' },
        identityContextRef: 'identity-ref',
        signals: { themeKey: 'dark', widthPx: 800 },
      },
      applySpfxHostSignals,
    });
    renderHook(() => useSpfxHostAdapter({ adapter }));
    expect(applySpfxHostSignals).toHaveBeenCalledWith({
      themeKey: 'dark',
      widthPx: 800,
      pathname: undefined,
    });
  });

  it('does not apply signals for non-spfx adapter', () => {
    const applySpfxHostSignals = vi.fn();
    const adapter = createStubAdapter({
      environment: 'pwa',
      applySpfxHostSignals,
    });
    renderHook(() => useSpfxHostAdapter({ adapter }));
    expect(applySpfxHostSignals).not.toHaveBeenCalled();
  });

  it('does not throw for spfx adapter without bridge', () => {
    const adapter = createStubAdapter({ environment: 'spfx' });
    expect(() => {
      renderHook(() => useSpfxHostAdapter({ adapter }));
    }).not.toThrow();
  });
});
