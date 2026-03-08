/**
 * Synchronous mock environment bootstrap for Business Development webpart.
 * D-PH7-BW-5: Updated to use PERSONA_REGISTRY as source of truth for dev identity.
 * Checks localStorage for a persisted DevToolbar persona selection before falling back
 * to the default Administrator persona.
 */
import type { IActiveProject } from '@hbc/models';
import {
  useAuthStore,
  usePermissionStore,
  resolveBootstrapPersona,
  personaToCurrentUser,
  resolveBootstrapPermissions,
} from '@hbc/auth';
import { useProjectStore, useNavStore } from '@hbc/shell';

const MOCK_PROJECTS: IActiveProject[] = [
  { id: 'PRJ-001', name: 'Harbor View Medical Center', number: 'HV-2025-001', status: 'Active', startDate: '2025-01-15', endDate: '2027-06-30' },
  { id: 'PRJ-002', name: 'Riverside Office Complex', number: 'RC-2025-002', status: 'Active', startDate: '2025-03-01', endDate: '2026-12-15' },
];

export function bootstrapMockEnvironment(): void {
  // D-PH7-BW-5: Use PERSONA_REGISTRY — respects DevToolbar persona selection
  const persona = resolveBootstrapPersona();

  useAuthStore.getState().setUser(personaToCurrentUser(persona));
  usePermissionStore.getState().setPermissions(resolveBootstrapPermissions(persona));
  usePermissionStore.getState().setFeatureFlags({ 'go-nogo-scorecard': true, 'committee-meeting': true });
  useProjectStore.getState().setAvailableProjects(MOCK_PROJECTS);
  useProjectStore.getState().setActiveProject(MOCK_PROJECTS[0]);
  useNavStore.getState().setActiveWorkspace('business-development');

  console.log(
    `[HB-BOOTSTRAP] Business Development mock environment bootstrapped as: ${persona.name} (${persona.id})`,
  );
}
