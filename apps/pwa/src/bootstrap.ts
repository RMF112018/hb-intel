/**
 * Synchronous mock environment bootstrap — Foundation Plan Phase 4.
 * Same pattern as dev-harness bootstrap.ts.
 * Imperatively sets Zustand stores before React renders.
 */
import type { ICurrentUser, IActiveProject } from '@hbc/models';
import { useAuthStore, usePermissionStore } from '@hbc/auth';
import { useProjectStore, useNavStore } from '@hbc/shell';

const MOCK_USER: ICurrentUser = {
  id: 'user-001',
  displayName: 'Dev Admin',
  email: 'dev.admin@hbintel.local',
  roles: [
    {
      id: 'role-admin',
      name: 'Administrator',
      permissions: ['*:*'],
    },
  ],
};

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
  useAuthStore.getState().setUser(MOCK_USER);
  usePermissionStore.getState().setPermissions(['*:*']);
  usePermissionStore.getState().setFeatureFlags(DEFAULT_FEATURE_FLAGS);
  useProjectStore.getState().setAvailableProjects(MOCK_PROJECTS);
  useProjectStore.getState().setActiveProject(MOCK_PROJECTS[0]);
  useNavStore.getState().setActiveWorkspace('project-hub');
}

export { MOCK_USER, MOCK_PROJECTS, DEFAULT_FEATURE_FLAGS };
