import { describe, expect, it } from 'vitest';
import { isPerRole, canPerAnnotate, canPerPushToTeam, getPerRestrictions } from './perScope.js';
import type { ProjectRoleResolutionResult } from './resolveProjectRole.js';

function makeResult(role: string): ProjectRoleResolutionResult {
  return {
    effectiveRole: role as ProjectRoleResolutionResult['effectiveRole'],
    tier: 'leadership',
    isMember: false,
    eligibilityPath: 'test',
  };
}

describe('isPerRole', () => {
  it('returns true for portfolio-executive-reviewer', () => {
    expect(isPerRole(makeResult('portfolio-executive-reviewer'))).toBe(true);
  });

  it('returns false for project-executive', () => {
    expect(isPerRole(makeResult('project-executive'))).toBe(false);
  });

  it('returns false for project-manager', () => {
    expect(isPerRole(makeResult('project-manager'))).toBe(false);
  });
});

describe('canPerAnnotate', () => {
  it('true for Financial', () => expect(canPerAnnotate('financial')).toBe(true));
  it('true for Schedule', () => expect(canPerAnnotate('schedule')).toBe(true));
  it('true for Constraints', () => expect(canPerAnnotate('constraints')).toBe(true));
  it('true for Permits', () => expect(canPerAnnotate('permits')).toBe(true));
  it('true for Health', () => expect(canPerAnnotate('health')).toBe(true));
  it('true for Reports', () => expect(canPerAnnotate('reports')).toBe(true));
  it('false for Safety (P3-E1 §9.3)', () => expect(canPerAnnotate('safety')).toBe(false));
  it('false for Home', () => expect(canPerAnnotate('home')).toBe(false));
  it('false for Activity', () => expect(canPerAnnotate('activity')).toBe(false));
});

describe('canPerPushToTeam', () => {
  it('true for review-layer modules', () => {
    expect(canPerPushToTeam('financial')).toBe(true);
    expect(canPerPushToTeam('schedule')).toBe(true);
  });

  it('false for Safety (no annotation layer)', () => {
    expect(canPerPushToTeam('safety')).toBe(false);
  });

  it('false for read-only modules', () => {
    expect(canPerPushToTeam('home')).toBe(false);
    expect(canPerPushToTeam('activity')).toBe(false);
  });
});

describe('getPerRestrictions', () => {
  it('returns all false flags', () => {
    const restrictions = getPerRestrictions();
    expect(restrictions.canWriteSourceRecords).toBe(false);
    expect(restrictions.canAppearInMembershipRoster).toBe(false);
    expect(restrictions.canConfirmPmDraft).toBe(false);
    expect(restrictions.canReleaseReports).toBe(false);
    expect(restrictions.canAssumeNarrativeOwnership).toBe(false);
  });

  it('returns frozen object', () => {
    const restrictions = getPerRestrictions();
    expect(Object.isFrozen(restrictions)).toBe(true);
  });
});
