import { describe, expect, it } from 'vitest';
import {
  assertProtectedFeatureRegistered,
  canCompleteFirstProtectedShellRender,
  clearRedirectMemory,
  createProtectedFeatureRegistry,
  createSpfxShellEnvironmentAdapter,
  rememberRedirectTarget,
  resolvePostGuardRedirect,
  resolveRoleLandingPath,
  resolveSafeRecoveryState,
  resolveShellExperienceState,
  resolveShellStatusSnapshot,
  resolveDegradedEligibility,
  runShellSignOutCleanup,
  type ProtectedFeatureRegistrationContract,
  type ShellSignOutCleanupDependencies,
} from '../index.js';
import { evaluateFeatureAccess, toEffectivePermissionSet } from '@hbc/auth';

/**
 * Shared sign-out dependency fixture used to verify deterministic cleanup order.
 */
function buildCleanupDependencies(orderedSteps: string[]): ShellSignOutCleanupDependencies {
  return {
    clearAuthSession: async () => {
      orderedSteps.push('clearAuthSession');
    },
    clearRedirectMemory: async () => {
      orderedSteps.push('clearRedirectMemory');
    },
    clearShellBootstrapState: async () => {
      orderedSteps.push('clearShellBootstrapState');
    },
    clearEnvironmentArtifacts: async () => {
      orderedSteps.push('clearEnvironmentArtifacts');
    },
    clearFeatureCachesByTier: async (tier) => {
      orderedSteps.push(`clearFeatureCachesByTier:${tier}`);
    },
  };
}

describe('Phase 5.16 dual-mode validation matrix (@hbc/shell)', () => {
  it('covers redirect restoration and role-landing behavior', () => {
    clearRedirectMemory();
    rememberRedirectTarget({
      pathname: '/admin/users',
      runtimeMode: 'pwa',
      now: new Date('2026-03-06T00:00:00.000Z'),
      ttlMs: 5 * 60 * 1000,
    });

    const restored = resolvePostGuardRedirect({
      runtimeMode: 'pwa',
      fallbackPath: '/project-hub',
      now: new Date('2026-03-06T00:02:00.000Z'),
      isTargetAllowed: () => true,
    });
    expect(restored).toBe('/admin/users');

    const fallback = resolvePostGuardRedirect({
      runtimeMode: 'spfx',
      fallbackPath: '/project-hub',
      now: new Date('2026-03-06T00:02:00.000Z'),
      isTargetAllowed: () => true,
    });
    expect(fallback).toBe('/project-hub');

    expect(resolveRoleLandingPath(['Administrator'])).toBe('/admin');
    expect(resolveRoleLandingPath(['Executive'])).toBe('/leadership');
    expect(resolveRoleLandingPath(['Member'])).toBe('/project-hub');
  });

  it('covers degraded-mode entry/exit and shell-status priority behavior', () => {
    const degradedEligibility = resolveDegradedEligibility({
      lifecyclePhase: 'reauth-required',
      sessionValidatedAt: '2026-03-06T00:00:00.000Z',
      now: () => new Date('2026-03-06T01:00:00.000Z'),
      sections: [
        {
          sectionId: 'ops',
          sectionLabel: 'Operations',
          isTrustedLastKnownState: true,
          lastKnownTimestamp: '2026-03-06T00:45:00.000Z',
          limitedValidation: true,
        },
      ],
    });
    expect(degradedEligibility.eligible).toBe(true);

    const recovered = resolveSafeRecoveryState({
      wasDegraded: true,
      isDegraded: false,
      lifecyclePhase: 'authenticated',
      connectivitySignal: 'connected',
    });
    expect(recovered.recovered).toBe(true);

    const status = resolveShellStatusSnapshot({
      lifecyclePhase: 'error',
      experienceState: 'degraded',
      hasAccessValidationIssue: true,
      hasFatalError: true,
      connectivitySignal: 'reconnecting',
      degradedSections: [],
      hasRecoveredFromDegraded: false,
    });
    expect(status.kind).toBe('error-failure');
    expect(status.actions).toContain('retry');
  });

  it('covers lockable navigation presentation and protected-render transition checks', () => {
    const lockedEvaluation = evaluateFeatureAccess({
      effective: toEffectivePermissionSet(['project:read']),
      action: 'view',
      registration: {
        featureId: 'admin-dashboard',
        requiredFeatureGrants: ['admin:view'],
        actionGrants: {
          view: ['admin:view'],
        },
        visibility: 'discoverable-locked',
      },
      runtimeMode: 'pwa-msal',
    });

    expect(lockedEvaluation.allowed).toBe(false);
    expect(lockedEvaluation.visible).toBe(true);
    expect(lockedEvaluation.locked).toBe(true);

    expect(
      canCompleteFirstProtectedShellRender({
        lifecyclePhase: 'authenticated',
        experienceState: resolveShellExperienceState({
          lifecyclePhase: 'authenticated',
          routeDecision: { allow: true },
        }),
        routeDecision: { allow: true },
      }),
    ).toBe(true);
  });

  it('covers sign-out cleanup orchestration and strict boundary enforcement checks', async () => {
    const orderedSteps: string[] = [];
    await runShellSignOutCleanup(buildCleanupDependencies(orderedSteps), ['strict', 'standard']);
    expect(orderedSteps).toEqual([
      'clearAuthSession',
      'clearRedirectMemory',
      'clearShellBootstrapState',
      'clearEnvironmentArtifacts',
      'clearFeatureCachesByTier:strict',
      'clearFeatureCachesByTier:standard',
    ]);

    const contract: ProtectedFeatureRegistrationContract = {
      featureId: 'project-hub-dashboard',
      route: {
        primaryPath: '/project-hub',
      },
      navigation: {
        workspaceId: 'project-hub',
        showInNavigation: true,
      },
      permissions: {
        requiredFeaturePermissions: ['project:view'],
        requiredActionPermissions: {
          view: ['project:view'],
        },
      },
      visibility: 'hidden',
    };

    const registry = createProtectedFeatureRegistry([contract]);
    expect(assertProtectedFeatureRegistered(registry, contract.featureId).featureId).toBe(contract.featureId);
    expect(() => assertProtectedFeatureRegistered(registry, 'missing-feature')).toThrowError(/not registered/i);

    expect(() =>
      createSpfxShellEnvironmentAdapter({
        bridge: {
          hostContainer: {
            hostId: '',
          },
          identityContextRef: '',
        },
      }),
    ).toThrowError(/requires/i);
  });
});
