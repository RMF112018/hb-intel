import { describe, expect, it } from 'vitest';
import { resolvePerEligibility } from './resolvePerEligibility.js';
import type { AccessControlOverrideRecord } from '../types.js';

function createMockPerOverride(projectId: string): AccessControlOverrideRecord {
  return {
    id: 'override-001',
    targetUserId: 'exec-001',
    baseRoleId: 'portfolio-executive-reviewer',
    requestedChange: { mode: 'grant', grants: ['per:read'] },
    reason: 'Out-of-scope review.',
    requesterId: 'opex-mgr',
    approval: { state: 'approved', requestedAt: '2026-03-20T10:00:00Z', approverId: 'opex-mgr', approvedAt: '2026-03-20T11:00:00Z' },
    expiration: { expiresAt: '2026-12-31T00:00:00Z' },
    emergency: false,
    review: { reviewRequired: false },
    status: 'active',
    overrideType: 'out-of-scope-per',
    projectIds: [projectId],
    department: 'commercial',
  };
}

describe('resolvePerEligibility', () => {
  it('grants C-suite access to any project', () => {
    const result = resolvePerEligibility(undefined, true, 'commercial', [], 'proj-001');
    expect(result).toEqual({ eligible: true, source: 'c-suite' });
  });

  it('grants department-scoped access when departments match', () => {
    const result = resolvePerEligibility('commercial', false, 'commercial', [], 'proj-001');
    expect(result).toEqual({ eligible: true, source: 'department-scope' });
  });

  it('grants access via active override', () => {
    const override = createMockPerOverride('proj-001');
    const result = resolvePerEligibility('luxury-residential', false, 'commercial', [override], 'proj-001');
    expect(result).toEqual({ eligible: true, source: 'override' });
  });

  it('denies when no scope match and no override', () => {
    const result = resolvePerEligibility('luxury-residential', false, 'commercial', [], 'proj-001');
    expect(result).toEqual({ eligible: false, source: 'none' });
  });

  it('denies when department is undefined and not C-suite', () => {
    const result = resolvePerEligibility(undefined, false, 'commercial', [], 'proj-001');
    expect(result).toEqual({ eligible: false, source: 'none' });
  });

  it('does not match overrides for different projects', () => {
    const override = createMockPerOverride('proj-other');
    const result = resolvePerEligibility('luxury-residential', false, 'commercial', [override], 'proj-001');
    expect(result).toEqual({ eligible: false, source: 'none' });
  });
});
