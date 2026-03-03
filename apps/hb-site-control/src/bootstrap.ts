/**
 * Mock environment bootstrap — Foundation Plan Phase 6.
 * Seeds Zustand stores for field worker persona with site-control workspace.
 */
import type { ICurrentUser, IActiveProject } from '@hbc/models';
import { useAuthStore, usePermissionStore } from '@hbc/auth';
import { useProjectStore, useNavStore } from '@hbc/shell';

const MOCK_USER: ICurrentUser = {
  id: 'user-field-001',
  displayName: 'Field Worker',
  email: 'field.worker@hbintel.local',
  roles: [
    {
      id: 'role-field',
      name: 'Field Personnel',
      permissions: ['project:read', 'document:write'],
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
];

const DEFAULT_FEATURE_FLAGS: Record<string, boolean> = {
  observations: true,
  'safety-monitoring': true,
  'offline-mode': false,
};

export function bootstrapMockEnvironment(): void {
  useAuthStore.getState().setUser(MOCK_USER);
  usePermissionStore.getState().setPermissions(['project:read', 'document:write']);
  usePermissionStore.getState().setFeatureFlags(DEFAULT_FEATURE_FLAGS);
  useProjectStore.getState().setAvailableProjects(MOCK_PROJECTS);
  useProjectStore.getState().setActiveProject(MOCK_PROJECTS[0]);
  useNavStore.getState().setActiveWorkspace('site-control');
}

export { MOCK_USER, MOCK_PROJECTS, DEFAULT_FEATURE_FLAGS };
