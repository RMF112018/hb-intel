import { describe, expect, it } from 'vitest';
import { resolveProjectRole } from './resolveProjectRole.js';
import type { ProjectRoleResolutionInput } from './resolveProjectRole.js';
import type { IProjectRegistryRecord } from '@hbc/models';

function createMockRecord(overrides?: Partial<IProjectRegistryRecord>): IProjectRegistryRecord {
  return {
    projectId: 'proj-001',
    projectNumber: '26-001-01',
    siteUrl: 'https://tenant.sharepoint.com/sites/proj-001',
    activatedAt: '2026-03-22T14:00:00Z',
    activatedByUpn: 'pm@example.com',
    sourceHandoffId: 'handoff-001',
    entraGroupSet: { leadersGroupId: 'g-l', teamGroupId: 'g-t', viewersGroupId: 'g-v' },
    projectName: 'Test Project',
    lifecycleStatus: 'Active',
    startDate: '2026-04-01T00:00:00Z',
    projectManagerUpn: 'pm@example.com',
    projectManagerName: 'PM',
    department: 'commercial',
    siteAssociations: [{ siteUrl: 'https://tenant.sharepoint.com/sites/proj-001', associationType: 'primary', associatedAt: '2026-03-22T14:00:00Z', associatedByUpn: 'pm@example.com' }],
    ...overrides,
  };
}

function createBaseInput(overrides?: Partial<ProjectRoleResolutionInput>): ProjectRoleResolutionInput {
  return {
    systemRoles: ['Member'],
    projectRecord: createMockRecord(),
    userUpn: 'user@example.com',
    ...overrides,
  };
}

describe('resolveProjectRole', () => {
  it('resolves Administrator to project-administrator', () => {
    const result = resolveProjectRole(createBaseInput({ systemRoles: ['Administrator'] }));
    expect(result?.effectiveRole).toBe('project-administrator');
    expect(result?.tier).toBe('platform');
    expect(result?.isMember).toBe(true);
  });

  it('resolves Executive + PX team anchor to project-executive', () => {
    const result = resolveProjectRole(createBaseInput({
      systemRoles: ['Executive'],
      userUpn: 'exec@example.com',
      projectRecord: createMockRecord({ projectExecutiveUpn: 'exec@example.com' }),
    }));
    expect(result?.effectiveRole).toBe('project-executive');
    expect(result?.isMember).toBe(true);
    expect(result?.eligibilityPath).toBe('leadership-member-anchor');
  });

  it('resolves Executive + Leaders group to project-executive', () => {
    const result = resolveProjectRole(createBaseInput({
      systemRoles: ['Executive'],
      entraGroupMembership: { leaders: true, team: false, viewers: false },
    }));
    expect(result?.effectiveRole).toBe('project-executive');
  });

  it('resolves Executive + department scope to PER (non-member)', () => {
    const result = resolveProjectRole(createBaseInput({
      systemRoles: ['Executive'],
      userDepartment: 'commercial',
    }));
    expect(result?.effectiveRole).toBe('portfolio-executive-reviewer');
    expect(result?.isMember).toBe(false);
    expect(result?.perSource).toBe('department-scope');
  });

  it('resolves C-suite to PER for any project', () => {
    const result = resolveProjectRole(createBaseInput({
      systemRoles: ['Executive'],
      isCsuite: true,
      projectRecord: createMockRecord({ department: 'luxury-residential' }),
    }));
    expect(result?.effectiveRole).toBe('portfolio-executive-reviewer');
    expect(result?.perSource).toBe('c-suite');
  });

  it('resolves Executive + override to PER', () => {
    const result = resolveProjectRole(createBaseInput({
      systemRoles: ['Executive'],
      userDepartment: 'luxury-residential',
      activePerOverrides: [{
        id: 'o1', targetUserId: 'user', baseRoleId: 'per',
        requestedChange: { mode: 'grant', grants: ['per:read'] },
        reason: 'test', requesterId: 'mgr',
        approval: { state: 'approved', requestedAt: '2026-01-01T00:00:00Z', approverId: 'mgr', approvedAt: '2026-01-01T00:00:00Z' },
        expiration: {}, emergency: false, review: { reviewRequired: false }, status: 'active',
        overrideType: 'out-of-scope-per', projectIds: ['proj-001'], department: 'luxury-residential',
      }],
    }));
    expect(result?.effectiveRole).toBe('portfolio-executive-reviewer');
    expect(result?.perSource).toBe('override');
  });

  it('resolves PM team anchor to project-manager', () => {
    const result = resolveProjectRole(createBaseInput({
      userUpn: 'pm@example.com',
    }));
    expect(result?.effectiveRole).toBe('project-manager');
    expect(result?.eligibilityPath).toBe('pm-team-anchor');
  });

  it('resolves Superintendent team anchor to superintendent', () => {
    const result = resolveProjectRole(createBaseInput({
      userUpn: 'super@example.com',
      projectRecord: createMockRecord({ superintendentUpn: 'super@example.com' }),
    }));
    expect(result?.effectiveRole).toBe('superintendent');
  });

  it('resolves Team group to project-team-member', () => {
    const result = resolveProjectRole(createBaseInput({
      entraGroupMembership: { leaders: false, team: true, viewers: false },
    }));
    expect(result?.effectiveRole).toBe('project-team-member');
  });

  it('resolves Viewers group to project-viewer', () => {
    const result = resolveProjectRole(createBaseInput({
      entraGroupMembership: { leaders: false, team: false, viewers: true },
    }));
    expect(result?.effectiveRole).toBe('project-viewer');
    expect(result?.isMember).toBe(true);
  });

  it('resolves External member to external-contributor', () => {
    const result = resolveProjectRole(createBaseInput({
      externalMember: {
        id: 'ext-001', projectId: 'proj-001', displayName: 'Ext', email: 'ext@other.com',
        grants: ['view:reports'], invitedBy: 'pm@example.com', invitedAt: '2026-03-01T00:00:00Z', status: 'active',
      },
    }));
    expect(result?.effectiveRole).toBe('external-contributor');
    expect(result?.isMember).toBe(false);
  });

  it('returns null when no eligibility path matches', () => {
    const result = resolveProjectRole(createBaseInput());
    expect(result).toBeNull();
  });

  it('resolves explicit member record to project-team-member', () => {
    const result = resolveProjectRole(createBaseInput({
      projectMember: {
        userId: 'user-001', projectId: 'proj-001', displayName: 'User',
        email: 'user@example.com', addedAt: '2026-03-01T00:00:00Z', addedBy: 'pm@example.com',
      },
    }));
    expect(result?.effectiveRole).toBe('project-team-member');
    expect(result?.eligibilityPath).toBe('explicit-member-record');
  });

  it('case-insensitive UPN matching for team anchors', () => {
    const result = resolveProjectRole(createBaseInput({
      userUpn: 'PM@EXAMPLE.COM',
      projectRecord: createMockRecord({ projectManagerUpn: 'pm@example.com' }),
    }));
    expect(result?.effectiveRole).toBe('project-manager');
  });
});
