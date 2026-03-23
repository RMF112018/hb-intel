import { describe, expect, it } from 'vitest';
import { validateProjectAccess } from './validateProjectAccess.js';
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

describe('validateProjectAccess', () => {
  it('grants access for Administrator', () => {
    const result = validateProjectAccess(createBaseInput({ systemRoles: ['Administrator'] }));
    expect(result.granted).toBe(true);
    if (result.granted) {
      expect(result.role.effectiveRole).toBe('project-administrator');
    }
  });

  it('grants access for PER (non-member)', () => {
    const result = validateProjectAccess(createBaseInput({
      systemRoles: ['Executive'],
      userDepartment: 'commercial',
    }));
    expect(result.granted).toBe(true);
    if (result.granted) {
      expect(result.role.effectiveRole).toBe('portfolio-executive-reviewer');
      expect(result.role.isMember).toBe(false);
    }
  });

  it('grants access for team member', () => {
    const result = validateProjectAccess(createBaseInput({
      entraGroupMembership: { leaders: false, team: true, viewers: false },
    }));
    expect(result.granted).toBe(true);
    if (result.granted) {
      expect(result.role.effectiveRole).toBe('project-team-member');
      expect(result.role.isMember).toBe(true);
    }
  });

  it('denies access with no-eligibility-path for non-member', () => {
    const result = validateProjectAccess(createBaseInput());
    expect(result.granted).toBe(false);
    if (!result.granted) {
      expect(result.denialReason).toBe('no-eligibility-path');
      expect(result.role).toBeNull();
    }
  });

  it('denies access for expired external member', () => {
    const result = validateProjectAccess(createBaseInput({
      externalMember: {
        id: 'ext-001', projectId: 'proj-001', displayName: 'Ext', email: 'ext@other.com',
        grants: ['view:reports'], invitedBy: 'pm@example.com', invitedAt: '2026-01-01T00:00:00Z',
        status: 'expired',
      },
    }));
    expect(result.granted).toBe(false);
    if (!result.granted) {
      expect(result.denialReason).toBe('external-member-expired');
    }
  });

  it('denies access for revoked external member', () => {
    const result = validateProjectAccess(createBaseInput({
      externalMember: {
        id: 'ext-002', projectId: 'proj-001', displayName: 'Ext', email: 'ext@other.com',
        grants: ['view:reports'], invitedBy: 'pm@example.com', invitedAt: '2026-01-01T00:00:00Z',
        status: 'revoked',
      },
    }));
    expect(result.granted).toBe(false);
    if (!result.granted) {
      expect(result.denialReason).toBe('external-member-expired');
    }
  });

  it('grants access for active external member', () => {
    const result = validateProjectAccess(createBaseInput({
      externalMember: {
        id: 'ext-003', projectId: 'proj-001', displayName: 'Ext', email: 'ext@other.com',
        grants: ['view:reports'], invitedBy: 'pm@example.com', invitedAt: '2026-01-01T00:00:00Z',
        status: 'active',
      },
    }));
    expect(result.granted).toBe(true);
    if (result.granted) {
      expect(result.role.effectiveRole).toBe('external-contributor');
    }
  });

  it('grants PM access via team anchor', () => {
    const result = validateProjectAccess(createBaseInput({
      userUpn: 'pm@example.com',
    }));
    expect(result.granted).toBe(true);
    if (result.granted) {
      expect(result.role.effectiveRole).toBe('project-manager');
    }
  });
});
