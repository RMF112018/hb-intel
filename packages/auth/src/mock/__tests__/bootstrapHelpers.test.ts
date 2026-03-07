// packages/auth/src/mock/__tests__/bootstrapHelpers.test.ts
// D-PH6F.5: Unit tests for bootstrap helpers (PH6F.3)
// @vitest-environment happy-dom

import { describe, it, expect, beforeEach } from 'vitest';
import { resolveBootstrapPersona, personaToCurrentUser, resolveBootstrapPermissions } from '../bootstrapHelpers.js';
import { PERSONA_REGISTRY } from '../personaRegistry.js';

const DEV_TOOLBAR_STATE_KEY = 'hb-auth-dev-toolbar-state';

beforeEach(() => {
  localStorage.clear();
});

describe('resolveBootstrapPersona', () => {
  it('returns default Administrator persona when localStorage is empty', () => {
    const persona = resolveBootstrapPersona();
    expect(persona.id).toBe('persona-admin');
    expect(persona.name).toBe('Administrator');
  });

  it('returns persisted persona from localStorage when valid', () => {
    localStorage.setItem(
      DEV_TOOLBAR_STATE_KEY,
      JSON.stringify({ selectedPersonaId: 'persona-accounting', auditLoggingEnabled: true }),
    );
    const persona = resolveBootstrapPersona();
    expect(persona.id).toBe('persona-accounting');
    expect(persona.name).toBe('AccountingUser');
  });

  it('falls back to default when localStorage persona id is invalid', () => {
    localStorage.setItem(
      DEV_TOOLBAR_STATE_KEY,
      JSON.stringify({ selectedPersonaId: 'persona-nonexistent', auditLoggingEnabled: true }),
    );
    const persona = resolveBootstrapPersona();
    expect(persona.id).toBe('persona-admin');
  });

  it('falls back to default when localStorage contains invalid JSON', () => {
    localStorage.setItem(DEV_TOOLBAR_STATE_KEY, 'not-valid-json');
    const persona = resolveBootstrapPersona();
    expect(persona.id).toBe('persona-admin');
  });
});

describe('personaToCurrentUser', () => {
  it('converts Administrator persona to correct ICurrentUser shape', () => {
    const admin = PERSONA_REGISTRY.default();
    const user = personaToCurrentUser(admin);

    expect(user.id).toBe('persona-admin');
    expect(user.displayName).toBe('Administrator');
    expect(user.email).toBe('admin@hb-intel.local');
    expect(user.roles.length).toBeGreaterThan(0);
  });

  it('does not include _-prefixed keys in role permissions', () => {
    const degraded = PERSONA_REGISTRY.getById('persona-degraded-mode')!;
    const user = personaToCurrentUser(degraded);
    const allPermissions = user.roles.flatMap((r) => r.permissions);
    expect(allPermissions.some((p) => p.startsWith('_'))).toBe(false);
  });
});

describe('resolveBootstrapPermissions', () => {
  it('returns flat array of truthy permission strings', () => {
    const accounting = PERSONA_REGISTRY.getById('persona-accounting')!;
    const permissions = resolveBootstrapPermissions(accounting);

    expect(permissions).toContain('feature:accounting-invoice');
    expect(permissions).toContain('action:read');
    expect(permissions).not.toContain('feature:admin-panel');
    expect(permissions).not.toContain('action:delete');
  });

  it('excludes internal _ flags', () => {
    const pending = PERSONA_REGISTRY.getById('persona-pending-override')!;
    const permissions = resolveBootstrapPermissions(pending);
    expect(permissions.some((p) => p.startsWith('_'))).toBe(false);
  });
});
