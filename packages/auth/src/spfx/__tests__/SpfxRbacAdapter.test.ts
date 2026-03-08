// D-PH7-BW-10: RBAC mapping tests for SP_GROUP_TO_PERMISSIONS
import { describe, it, expect } from 'vitest';
import { SP_GROUP_TO_PERMISSIONS } from '../SpfxRbacAdapter.js';

describe('SP_GROUP_TO_PERMISSIONS', () => {
  it('Accounting Manager has accounting:write', () => {
    expect(SP_GROUP_TO_PERMISSIONS['HB Intel Accounting Managers']).toContain('accounting:write');
  });

  it('Field Personnel does not have accounting:write', () => {
    expect(SP_GROUP_TO_PERMISSIONS['HB Intel Field Personnel']).not.toContain('accounting:write');
  });

  it('All groups have at least action:read', () => {
    for (const [group, perms] of Object.entries(SP_GROUP_TO_PERMISSIONS)) {
      expect(perms, `${group} missing action:read`).toContain('action:read');
    }
  });

  it('Administrator has all 17 canonical permission keys', () => {
    const adminPerms = SP_GROUP_TO_PERMISSIONS['HB Intel Administrators'];
    const canonical = [
      'admin:read', 'admin:write', 'admin:delete', 'admin:approve',
      'action:read', 'action:write', 'action:delete', 'action:approve',
      'feature:audit-logs', 'feature:override-requests',
      'provisioning:read', 'provisioning:write', 'provisioning:approve',
      'project:read', 'project:write',
      'accounting:read', 'accounting:write',
    ];
    for (const key of canonical) {
      expect(adminPerms, `Administrator missing ${key}`).toContain(key);
    }
  });
});
