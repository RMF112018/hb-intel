// packages/auth/src/mock/bootstrapHelpers.ts
// D-PH6F-03: Bootstrap utilities for PERSONA_REGISTRY-aware dev bootstrapping.
// Shared by apps/pwa/src/bootstrap.ts and apps/dev-harness/src/bootstrap.ts.

import type { IInternalUser } from '@hbc/models';
import { PERSONA_REGISTRY, type IPersona } from './personaRegistry.js';

/** Must match STATE_KEY in packages/shell/src/devToolbar/useDevAuthBypass.ts */
const DEV_TOOLBAR_STATE_KEY = 'hb-auth-dev-toolbar-state';

interface IStoredToolbarState {
  selectedPersonaId: string | null;
  auditLoggingEnabled: boolean;
}

/**
 * Resolves the starting persona for dev-mode bootstrap.
 * Checks localStorage for a persisted DevToolbar persona selection,
 * falling back to PERSONA_REGISTRY.default() (Administrator).
 *
 * D-PH6F-03: Eliminates the MOCK_USER -> DevToolbar persona flash on refresh.
 */
export function resolveBootstrapPersona(): IPersona {
  if (typeof localStorage === 'undefined') {
    return PERSONA_REGISTRY.default();
  }

  try {
    const raw = localStorage.getItem(DEV_TOOLBAR_STATE_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as IStoredToolbarState;
      if (stored.selectedPersonaId) {
        const persona = PERSONA_REGISTRY.getById(stored.selectedPersonaId);
        if (persona) {
          console.log(
            `[HB-BOOTSTRAP] Restoring persisted persona: ${persona.id} (${persona.name})`,
          );
          return persona;
        }
      }
    }
  } catch {
    // localStorage read failed — fall through to default
  }

  return PERSONA_REGISTRY.default();
}

/**
 * Converts an IPersona to the ICurrentUser shape expected by useAuthStore.setUser().
 * Mirrors sessionDataToCurrentUser() in packages/shell but operates directly from IPersona.
 *
 * D-PH6F-03: Bridge between PERSONA_REGISTRY personas and the Zustand auth store.
 */
export function personaToCurrentUser(persona: IPersona): IInternalUser {
  const grantedPermissions = resolveBootstrapPermissions(persona);

  return {
    type: 'internal',
    id: persona.id,
    displayName: persona.name,
    email: persona.email,
    roles: persona.roles.map((roleName, index) => ({
      id: `dev-role-${roleName.toLowerCase().replace(/\s+/g, '-')}`,
      name: roleName,
      grants: index === 0 ? grantedPermissions : [],
      source: 'manual' as const,
    })),
  };
}

/**
 * Extracts granted (truthy) permission keys from an IPersona's permissions map.
 * Filters out internal flags (keys starting with '_').
 *
 * D-PH6F-03: Returns string[] suitable for usePermissionStore.setPermissions().
 */
export function resolveBootstrapPermissions(persona: IPersona): string[] {
  return Object.entries(persona.permissions)
    .filter(([key, allowed]) => allowed && !key.startsWith('_'))
    .map(([permissionKey]) => permissionKey);
}
