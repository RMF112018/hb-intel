import { describe, expect, it } from 'vitest';
import { resolveRoleLandingPath, resolveShellExperienceState } from './ShellCore.js';

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
    });
    expect(state).toBe('degraded');
  });
});
