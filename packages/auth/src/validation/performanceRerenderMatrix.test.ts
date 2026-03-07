import { describe, expect, it } from 'vitest';
import {
  selectAuthBootstrapReadiness,
  selectAuthLifecycle,
  selectAuthPermissionSummary,
  selectAuthSessionSummary,
  useAuthStore,
} from '../stores/authStore.js';

/**
 * Build a stable auth session fixture for selector and transition checks.
 */
function seedAuthenticatedState(): void {
  useAuthStore.setState({
    lifecyclePhase: 'authenticated',
    runtimeMode: 'pwa-msal',
    restoreState: {
      inFlight: false,
      outcome: 'restored',
      shellTransition: 'restore-succeeded',
      lastAttemptedAt: '2026-03-06T00:00:00.000Z',
      lastResolvedAt: '2026-03-06T00:00:01.000Z',
    },
    structuredError: null,
    shellBootstrap: {
      authReady: true,
      permissionsReady: true,
      shellReadyToRender: true,
    },
    session: {
      user: {
        id: 'perf-user-1',
        displayName: 'Perf User',
        email: 'perf.user@hbintel.local',
        roles: [
          {
            id: 'role-member',
            name: 'Member',
            permissions: ['project:read'],
          },
        ],
      },
      providerIdentityRef: 'perf.user@hbintel.local',
      resolvedRoles: ['Member'],
      permissionSummary: {
        grants: ['project:read'],
        overrides: [],
      },
      runtimeMode: 'pwa-msal',
      issuedAt: '2026-03-06T00:00:00.000Z',
      validatedAt: '2026-03-06T00:00:00.000Z',
      restoreMetadata: {
        source: 'provider',
      },
    },
    currentUser: {
      id: 'perf-user-1',
      displayName: 'Perf User',
      email: 'perf.user@hbintel.local',
      roles: [
        {
          id: 'role-member',
          name: 'Member',
          permissions: ['project:read'],
        },
      ],
    },
    isLoading: false,
    error: null,
  });
}

describe('Phase 5.16 performance/rerender validation matrix', () => {
  it('keeps selector output scoped to relevant state slices', () => {
    seedAuthenticatedState();
    const baselineState = useAuthStore.getState();

    const lifecycleBaseline = selectAuthLifecycle(baselineState);
    const bootstrapBaseline = selectAuthBootstrapReadiness(baselineState);
    const sessionBaseline = selectAuthSessionSummary(baselineState);
    const permissionBaseline = selectAuthPermissionSummary(baselineState);

    useAuthStore.setState({
      restoreState: {
        ...baselineState.restoreState,
        lastResolvedAt: '2026-03-06T00:05:00.000Z',
      },
      shellBootstrap: {
        ...baselineState.shellBootstrap,
      },
    });

    const updatedState = useAuthStore.getState();
    expect(selectAuthLifecycle(updatedState)).toEqual(lifecycleBaseline);
    expect(selectAuthBootstrapReadiness(updatedState)).toEqual(bootstrapBaseline);
    expect(selectAuthSessionSummary(updatedState)).toEqual(sessionBaseline);
    expect(selectAuthPermissionSummary(updatedState)).toEqual(permissionBaseline);
  });

  it('validates bootstrap and transition timing path without selector regressions', () => {
    useAuthStore.getState().clear();

    useAuthStore.getState().beginBootstrap('pwa-msal');
    const bootstrapping = useAuthStore.getState();
    expect(bootstrapping.lifecyclePhase).toBe('bootstrapping');
    expect(bootstrapping.isLoading).toBe(true);

    useAuthStore.getState().completeBootstrap({
      session: {
        user: {
          id: 'perf-user-2',
          displayName: 'Perf User 2',
          email: 'perf.user2@hbintel.local',
          roles: [
            {
              id: 'role-admin',
              name: 'Administrator',
              permissions: ['*:*'],
            },
          ],
        },
        providerIdentityRef: 'perf.user2@hbintel.local',
        resolvedRoles: ['Administrator'],
        permissionSummary: {
          grants: ['*:*'],
          overrides: [],
        },
        runtimeMode: 'pwa-msal',
        issuedAt: '2026-03-06T00:00:00.000Z',
        validatedAt: '2026-03-06T00:00:00.000Z',
        restoreMetadata: {
          source: 'provider',
        },
      },
      permissionsReady: true,
    });

    const ready = useAuthStore.getState();
    expect(ready.lifecyclePhase).toBe('authenticated');
    expect(ready.shellBootstrap.shellReadyToRender).toBe(true);
    expect(selectAuthLifecycle(ready)).toEqual({
      lifecyclePhase: 'authenticated',
      runtimeMode: 'pwa-msal',
      isLoading: false,
    });
  });
});
