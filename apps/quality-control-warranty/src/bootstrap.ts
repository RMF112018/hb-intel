import type { ICurrentUser, IActiveProject } from '@hbc/models';
import { useAuthStore, usePermissionStore } from '@hbc/auth';
import { useProjectStore, useNavStore } from '@hbc/shell';

const MOCK_USER: ICurrentUser = {
  id: 'user-001', displayName: 'Dev Admin', email: 'dev.admin@hbintel.local',
  roles: [{ id: 'role-admin', name: 'Administrator', permissions: ['*:*'] }],
};
const MOCK_PROJECTS: IActiveProject[] = [
  { id: 'PRJ-001', name: 'Harbor View Medical Center', number: 'HV-2025-001', status: 'Active', startDate: '2025-01-15', endDate: '2027-06-30' },
];

export function bootstrapMockEnvironment(): void {
  useAuthStore.getState().setUser(MOCK_USER);
  usePermissionStore.getState().setPermissions(['*:*']);
  usePermissionStore.getState().setFeatureFlags({ 'buyout-schedule': true, 'risk-matrix': true });
  useProjectStore.getState().setAvailableProjects(MOCK_PROJECTS);
  useProjectStore.getState().setActiveProject(MOCK_PROJECTS[0]);
  useNavStore.getState().setActiveWorkspace('quality-control-warranty');
}
