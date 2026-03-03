/**
 * Synchronous mock environment bootstrap — Foundation Plan Phase 3.
 * Imperatively sets Zustand stores before React renders,
 * ensuring all components mount with data already present.
 */
import type { ICurrentUser, IActiveProject } from '@hbc/models';
import { useAuthStore } from '@hbc/auth';
import { usePermissionStore } from '@hbc/auth';
import { useProjectStore } from '@hbc/shell';
import { useNavStore } from '@hbc/shell';

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
  // Auth store — set current user
  useAuthStore.getState().setUser(MOCK_USER);

  // Permission store — admin wildcard + default feature flags
  usePermissionStore.getState().setPermissions(['*:*']);
  usePermissionStore.getState().setFeatureFlags(DEFAULT_FEATURE_FLAGS);

  // Project store — seed available projects and select first
  useProjectStore.getState().setAvailableProjects(MOCK_PROJECTS);
  useProjectStore.getState().setActiveProject(MOCK_PROJECTS[0]);

  // Nav store — default to project-hub workspace
  useNavStore.getState().setActiveWorkspace('project-hub');
}

export { MOCK_USER, MOCK_PROJECTS, DEFAULT_FEATURE_FLAGS };
