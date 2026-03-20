import { describe, expect, it } from 'vitest';
import { resolveLandingDecision } from './landingResolver.js';
import type { LandingDecisionInput } from './landingResolver.js';

function decide(overrides: Partial<LandingDecisionInput> = {}) {
  return resolveLandingDecision({
    resolvedRoles: [],
    runtimeMode: 'pwa',
    cohortEnabled: false,
    ...overrides,
  });
}

describe('resolveLandingDecision', () => {
  // Priority 1: Redirect memory
  it('returns redirectTarget when provided (highest priority)', () => {
    const result = decide({ redirectTarget: '/accounting', resolvedRoles: ['Administrator'] });
    expect(result.pathname).toBe('/accounting');
  });

  it('sets landingMode to phase-2 when cohort enabled with redirect', () => {
    const result = decide({ redirectTarget: '/accounting', cohortEnabled: true });
    expect(result.landingMode).toBe('phase-2');
  });

  it('sets landingMode to legacy when cohort disabled with redirect', () => {
    const result = decide({ redirectTarget: '/accounting', cohortEnabled: false });
    expect(result.landingMode).toBe('legacy');
  });

  // Priority 2: Administrator
  it('routes Administrator to /admin regardless of cohort (cohort off)', () => {
    const result = decide({ resolvedRoles: ['Administrator'], cohortEnabled: false });
    expect(result).toEqual({ pathname: '/admin', landingMode: 'legacy' });
  });

  it('routes Administrator to /admin regardless of cohort (cohort on)', () => {
    const result = decide({ resolvedRoles: ['Administrator'], cohortEnabled: true });
    expect(result).toEqual({ pathname: '/admin', landingMode: 'legacy' });
  });

  it('routes multi-role including Administrator to /admin', () => {
    const result = decide({ resolvedRoles: ['Executive', 'Administrator'], cohortEnabled: true });
    expect(result.pathname).toBe('/admin');
  });

  // Priority 2: Executive
  it('routes Executive to /leadership when cohort disabled', () => {
    const result = decide({ resolvedRoles: ['Executive'], cohortEnabled: false });
    expect(result).toEqual({ pathname: '/leadership', landingMode: 'legacy' });
  });

  it('routes Executive to /my-work with personal mode when cohort enabled', () => {
    const result = decide({ resolvedRoles: ['Executive'], cohortEnabled: true });
    expect(result).toEqual({ pathname: '/my-work', landingMode: 'phase-2', teamMode: 'personal' });
  });

  // Priority 3: Standard role
  it('routes standard role to /project-hub when cohort disabled', () => {
    const result = decide({ resolvedRoles: ['Member'], cohortEnabled: false });
    expect(result).toEqual({ pathname: '/project-hub', landingMode: 'legacy' });
  });

  it('routes standard role to /my-work with personal mode when cohort enabled', () => {
    const result = decide({ resolvedRoles: ['Member'], cohortEnabled: true });
    expect(result).toEqual({ pathname: '/my-work', landingMode: 'phase-2', teamMode: 'personal' });
  });

  // Edge: empty roles
  it('routes empty roles to /project-hub when cohort disabled', () => {
    const result = decide({ resolvedRoles: [], cohortEnabled: false });
    expect(result).toEqual({ pathname: '/project-hub', landingMode: 'legacy' });
  });

  it('routes empty roles to /my-work when cohort enabled', () => {
    const result = decide({ resolvedRoles: [], cohortEnabled: true });
    expect(result).toEqual({ pathname: '/my-work', landingMode: 'phase-2', teamMode: 'personal' });
  });

  // Null/undefined redirectTarget should not trigger Priority 1
  it('ignores null redirectTarget', () => {
    const result = decide({ redirectTarget: null, resolvedRoles: ['Member'], cohortEnabled: false });
    expect(result.pathname).toBe('/project-hub');
  });

  it('ignores undefined redirectTarget', () => {
    const result = decide({ resolvedRoles: ['Member'], cohortEnabled: false });
    expect(result.pathname).toBe('/project-hub');
  });
});
