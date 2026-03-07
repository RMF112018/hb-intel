/**
 * Synchronous mock environment bootstrap — Foundation Plan Phase 3 (dev-harness).
 * D-PH6F-03: Updated to use PERSONA_REGISTRY as source of truth for dev identity.
 * Mirrors apps/pwa/src/bootstrap.ts — keep these two files in sync.
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
    id: 'PRJ-001',
    name: 'Harbor View Medical Center',
    number: 'HV-2025-001',
    status: 'Active',
    startDate: '2025-01-15',
    endDate: '2027-06-30',
  },
  {
    id: 'PRJ-002',
    name: 'Riverside Office Complex',
    number: 'RC-2025-002',
    status: 'Active',
    startDate: '2025-03-01',
    endDate: '2026-12-15',
  },
  {
    id: 'PRJ-003',
    name: 'Downtown Transit Hub',
    number: 'DT-2025-003',
    status: 'Planning',
    startDate: '2025-06-01',
    endDate: '2028-02-28',
  },
];

const DEFAULT_FEATURE_FLAGS: Record<string, boolean> = {
  'buyout-schedule': true,
  'risk-matrix': true,
  'ai-insights': false,
  'procore-sync': false,
};

export function bootstrapMockEnvironment(): void {
  // D-PH6F-03: Use PERSONA_REGISTRY as source of truth.
  // Restores persisted DevToolbar persona from localStorage if available.
  const persona = resolveBootstrapPersona();

  useAuthStore.getState().setUser(personaToCurrentUser(persona));
  usePermissionStore.getState().setPermissions(resolveBootstrapPermissions(persona));
  usePermissionStore.getState().setFeatureFlags(DEFAULT_FEATURE_FLAGS);
  useProjectStore.getState().setAvailableProjects(MOCK_PROJECTS);
  useProjectStore.getState().setActiveProject(MOCK_PROJECTS[0]);
  useNavStore.getState().setActiveWorkspace('project-hub');

  console.log(
    `[HB-BOOTSTRAP] Mock environment bootstrapped as: ${persona.name} (${persona.id})`,
  );
}

export { MOCK_PROJECTS, DEFAULT_FEATURE_FLAGS };
