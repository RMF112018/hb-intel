/**
 * Synchronous mock environment bootstrap for Project Setup Requests surface.
 * Uses PERSONA_REGISTRY as source of truth for dev identity.
 * Checks localStorage for a persisted DevToolbar persona selection before falling back
 * to the default Administrator persona.
 */
import {
  useAuthStore,
  usePermissionStore,
  resolveBootstrapPersona,
  personaToCurrentUser,
  resolveBootstrapPermissions,
} from '@hbc/auth';
import { useNavStore } from '@hbc/shell';

export function bootstrapMockEnvironment(): void {
  // D-PH7-BW-5: Use PERSONA_REGISTRY — respects DevToolbar persona selection
  const persona = resolveBootstrapPersona();

  useAuthStore.getState().setUser(personaToCurrentUser(persona));
  usePermissionStore.getState().setPermissions(resolveBootstrapPermissions(persona));
  usePermissionStore.getState().setFeatureFlags({ 'provisioning-status': true });
  useNavStore.getState().setActiveWorkspace('estimating');

  console.log(
    `[HB-BOOTSTRAP] Project Setup mock environment bootstrapped as: ${persona.name} (${persona.id})`,
  );
}
