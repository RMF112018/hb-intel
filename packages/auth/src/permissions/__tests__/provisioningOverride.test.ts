import { describe, it, expect } from 'vitest';
import {
  ADMIN_PROVISIONING_RETRY,
  ADMIN_PROVISIONING_ESCALATE,
  ADMIN_PROVISIONING_ARCHIVE,
  ADMIN_PROVISIONING_FORCE_STATE,
  ADMIN_PROVISIONING_ALERT_FULL_DETAIL,
  PROVISIONING_OVERRIDE_PERMISSIONS,
  ALL_PROVISIONING_OVERRIDE_PERMISSIONS,
  ADMIN_APPROVAL_MANAGE,
} from '../provisioningOverride.js';
import { isPermissionGranted, toEffectivePermissionSet } from '../../stores/permissionResolution.js';

describe('provisioningOverride permission constants', () => {
  it('defines 6 individual permission strings', () => {
    expect(ADMIN_PROVISIONING_RETRY).toBe('admin:provisioning:retry');
    expect(ADMIN_PROVISIONING_ESCALATE).toBe('admin:provisioning:escalate');
    expect(ADMIN_PROVISIONING_ARCHIVE).toBe('admin:provisioning:archive');
    expect(ADMIN_PROVISIONING_FORCE_STATE).toBe('admin:provisioning:force-state');
    expect(ADMIN_PROVISIONING_ALERT_FULL_DETAIL).toBe('admin:provisioning:alert:full-detail');
    expect(ADMIN_APPROVAL_MANAGE).toBe('admin:approval:manage');
  });

  it('PROVISIONING_OVERRIDE_PERMISSIONS map has exactly 6 entries', () => {
    expect(Object.keys(PROVISIONING_OVERRIDE_PERMISSIONS)).toHaveLength(6);
  });

  it('ALL_PROVISIONING_OVERRIDE_PERMISSIONS array has exactly 6 entries', () => {
    expect(ALL_PROVISIONING_OVERRIDE_PERMISSIONS).toHaveLength(6);
  });

  it('all constants are non-empty strings', () => {
    for (const perm of ALL_PROVISIONING_OVERRIDE_PERMISSIONS) {
      expect(typeof perm).toBe('string');
      expect(perm.length).toBeGreaterThan(0);
    }
  });
});

describe('provisioningOverride permission resolution', () => {
  it('grants each permission when explicitly granted', () => {
    for (const perm of ALL_PROVISIONING_OVERRIDE_PERMISSIONS) {
      const effective = toEffectivePermissionSet([perm]);
      expect(isPermissionGranted(effective, perm)).toBe(true);
    }
  });

  it('grants all permissions via global wildcard *:*', () => {
    const effective = toEffectivePermissionSet(['*:*']);
    for (const perm of ALL_PROVISIONING_OVERRIDE_PERMISSIONS) {
      expect(isPermissionGranted(effective, perm)).toBe(true);
    }
  });

  it('does not grant permissions when not in grant set', () => {
    const effective = toEffectivePermissionSet(['admin:access-control:view']);
    for (const perm of ALL_PROVISIONING_OVERRIDE_PERMISSIONS) {
      expect(isPermissionGranted(effective, perm)).toBe(false);
    }
  });
});
