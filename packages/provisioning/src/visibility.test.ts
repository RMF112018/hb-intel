import { describe, expect, it } from 'vitest';
import type { NormalizedAuthSession } from '@hbc/auth';
import { getProvisioningVisibility } from './visibility.js';

function createSession(upn: string, resolvedRoles: string[]): NormalizedAuthSession {
  return {
    user: {
      id: 'u-1',
      displayName: upn,
      email: upn,
      roles: resolvedRoles.map((role, index) => ({
        id: `r-${index}`,
        name: role,
        permissions: [],
      })),
    },
    providerIdentityRef: upn,
    resolvedRoles,
    permissionSummary: {
      grantedActions: [],
      deniedActions: [],
      featureVisibility: {},
      scopeFilters: [],
      policyTags: [],
      version: 'test',
    },
    runtimeMode: 'mock',
    issuedAt: new Date().toISOString(),
    validatedAt: new Date().toISOString(),
    restoreMetadata: {
      source: 'memory',
    },
  };
}

describe('D-PH6-09 getProvisioningVisibility', () => {
  it('returns full for Admin role', () => {
    const session = createSession('admin@hb.com', ['Admin']);
    expect(getProvisioningVisibility(session, 'submitter@hb.com')).toBe('full');
  });

  it('returns full for submitter', () => {
    const session = createSession('submitter@hb.com', ['ProjectTeam']);
    expect(getProvisioningVisibility(session, 'submitter@hb.com')).toBe('full');
  });

  it('returns notification for non-admin/non-blocked roles', () => {
    const session = createSession('opex@hb.com', ['OperationalExcellence']);
    expect(getProvisioningVisibility(session, 'submitter@hb.com')).toBe('notification');
  });

  it('returns none for Leadership role', () => {
    const session = createSession('leader@hb.com', ['Leadership']);
    expect(getProvisioningVisibility(session, 'submitter@hb.com')).toBe('none');
  });
});
