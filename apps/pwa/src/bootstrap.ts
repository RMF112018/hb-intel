/**
 * Synchronous mock environment bootstrap — Foundation Plan Phase 4.
 * D-PH6F-03: Updated to use PERSONA_REGISTRY as the source of truth for dev identity.
 * Checks localStorage for a persisted DevToolbar persona selection before falling back
 * to the default Administrator persona. Same pattern as dev-harness bootstrap.ts.
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
  {
    id: 'proj-uuid-001',
    name: 'City Center Tower',
    number: 'PRJ-001',
    status: 'Active',
    startDate: '2026-01-01',
    endDate: '2028-06-30',
  },
  {
    id: 'proj-uuid-002',
    name: 'Harbor Bridge Renovation',
    number: 'PRJ-002',
    status: 'Active',
    startDate: '2026-03-01',
    endDate: '2027-12-31',
  },
];

const DEFAULT_FEATURE_FLAGS: Record<string, boolean> = {
  'buyout-schedule': true,
  'risk-matrix': true,
  'ai-insights': false,
  'procore-sync': false,
  'my-work-hub': true,
};

export function bootstrapMockEnvironment(): void {
  // D-PH6F-03: Use PERSONA_REGISTRY as source of truth.
  // Restores persisted DevToolbar persona from localStorage if available.
  const persona = resolveBootstrapPersona();

  useAuthStore.getState().setUser(personaToCurrentUser(persona));
  usePermissionStore.getState().setPermissions(resolveBootstrapPermissions(persona));
  usePermissionStore.getState().setFeatureFlags(DEFAULT_FEATURE_FLAGS);
  useProjectStore.getState().setAvailableProjects(MOCK_PROJECTS);
  useProjectStore.getState().setActiveProject(null);
  useNavStore.getState().setActiveWorkspace('project-hub');

  console.log(
    `[HB-BOOTSTRAP] Mock environment bootstrapped as: ${persona.name} (${persona.id})`,
  );
}

export { MOCK_PROJECTS, DEFAULT_FEATURE_FLAGS };
