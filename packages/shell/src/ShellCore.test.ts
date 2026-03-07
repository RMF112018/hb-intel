import { describe, expect, it } from 'vitest';
import {
  canCompleteFirstProtectedShellRender,
  resolveRoleLandingPath,
  resolveShellExperienceState,
} from './ShellCore.js';

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
