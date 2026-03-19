// packages/shell/src/devToolbar/__tests__/sessionDataToCurrentUser.test.ts
// D-PH6F.5: Unit tests for sessionDataToCurrentUser + extractGrantedPermissions

import { describe, it, expect } from 'vitest';
import { sessionDataToCurrentUser, extractGrantedPermissions } from '../sessionDataToCurrentUser.js';
import type { ISessionData } from '@hbc/auth/dev';

const makeSession = (overrides: Partial<ISessionData> = {}): ISessionData => ({
  sessionId: 'test-session-id',
  userId: 'persona-accounting',
  displayName: 'AccountingUser',
  email: 'accounting@hb-intel.local',
  roles: ['AccountingUser'],
  permissions: {
    'feature:admin-panel': false,
    'feature:accounting-invoice': true,
    'feature:accounting-reports': true,
    'feature:view-dashboard': true,
    'feature:view-profile': true,
    'action:read': true,
    'action:write': true,
    'action:delete': false,
    'action:approve': false,
  },
  expiresAt: Date.now() + 8 * 60 * 60 * 1000,
  acquiredAt: Date.now(),
  ...overrides,
});

describe('sessionDataToCurrentUser', () => {
  it('maps userId to ICurrentUser.id', () => {
    const user = sessionDataToCurrentUser(makeSession());
    expect(user.id).toBe('persona-accounting');
  });

  it('maps displayName correctly', () => {
    const user = sessionDataToCurrentUser(makeSession());
    expect(user.displayName).toBe('AccountingUser');
  });

  it('maps email correctly', () => {
    const user = sessionDataToCurrentUser(makeSession());
    expect(user.email).toBe('accounting@hb-intel.local');
  });

  it('creates one role entry per role in session.roles', () => {
    const user = sessionDataToCurrentUser(makeSession({ roles: ['AccountingUser', 'Manager'] }));
    expect(user.roles).toHaveLength(2);
    expect(user.roles[0].name).toBe('AccountingUser');
    expect(user.roles[1].name).toBe('Manager');
  });

  it('first role includes only truthy permissions as flat strings', () => {
    const user = sessionDataToCurrentUser(makeSession());
    const permissions = user.roles[0].grants;
    expect(permissions).toContain('feature:accounting-invoice');
    expect(permissions).toContain('feature:accounting-reports');
    expect(permissions).toContain('action:read');
    expect(permissions).toContain('action:write');
    expect(permissions).not.toContain('feature:admin-panel');
    expect(permissions).not.toContain('action:delete');
    expect(permissions).not.toContain('action:approve');
  });

  it('second role has empty permissions array', () => {
    const user = sessionDataToCurrentUser(makeSession({ roles: ['AccountingUser', 'Manager'] }));
    expect(user.roles[1].grants).toHaveLength(0);
  });

  it('generates role id with dev-role- prefix and kebab-case slug', () => {
    const user = sessionDataToCurrentUser(makeSession({ roles: ['Project User'] }));
    expect(user.roles[0].id).toBe('dev-role-project-user');
  });

  it('handles session with no truthy permissions', () => {
    const noPermissions = Object.fromEntries(
      Object.keys(makeSession().permissions).map((k) => [k, false]),
    );
    const user = sessionDataToCurrentUser(makeSession({ permissions: noPermissions }));
    expect(user.roles[0].grants).toHaveLength(0);
  });
});

describe('extractGrantedPermissions', () => {
  it('returns only truthy permission keys', () => {
    const granted = extractGrantedPermissions({
      'feature:admin-panel': false,
      'feature:accounting-invoice': true,
      'action:read': true,
      'action:delete': false,
    });
    expect(granted).toEqual(['feature:accounting-invoice', 'action:read']);
  });

  it('returns empty array when all permissions are false', () => {
    const granted = extractGrantedPermissions({
      'feature:admin-panel': false,
      'feature:view-dashboard': false,
    });
    expect(granted).toHaveLength(0);
  });

  it('includes _-prefixed keys when truthy (no filtering)', () => {
    const granted = extractGrantedPermissions({
      'feature:view-dashboard': true,
      '_session:expired': true,
      '_system:degraded': true,
    });
    expect(granted).toContain('feature:view-dashboard');
    expect(granted).toContain('_session:expired');
    expect(granted).toContain('_system:degraded');
  });
});
