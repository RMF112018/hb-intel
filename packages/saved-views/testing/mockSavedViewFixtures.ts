/**
 * SF26-T08 — Canonical test fixtures.
 */
import { createMockSavedViewDefinition } from './createMockSavedViewDefinition.js';
import type { ISavedViewScopePermissions, ISavedViewSchemaDescriptor } from '../src/types/index.js';

export const mockPersonalView = createMockSavedViewDefinition({ viewId: 'personal-001', scope: 'personal', title: 'My Personal View' });
export const mockTeamView = createMockSavedViewDefinition({ viewId: 'team-001', scope: 'team', title: 'Team View', ownerUserId: 'lead@example.com' });
export const mockRoleView = createMockSavedViewDefinition({ viewId: 'role-001', scope: 'role', title: 'Role Default', isDefault: true });
export const mockSystemView = createMockSavedViewDefinition({ viewId: 'system-001', scope: 'system', title: 'System View', ownerUserId: 'admin@example.com' });
export const mockDegradedView = createMockSavedViewDefinition({ viewId: 'degraded-001', schemaVersion: 1, presentation: { visibleColumnKeys: ['name', 'status', 'removed-col'], columnOrder: ['name', 'status', 'removed-col'] } });
export const mockIncompatibleView = createMockSavedViewDefinition({ viewId: 'incompat-001', schemaVersion: 1, filterClauses: [{ field: 'removed-field', operator: 'equals', value: 'x' }], presentation: { visibleColumnKeys: ['removed-a', 'removed-b'] } });

export const mockPermissionsPersonalOnly: ISavedViewScopePermissions = { canSavePersonal: true, canSaveTeam: false, canSaveRole: false, canSaveSystem: false, teamIds: [], roleIds: [] };
export const mockPermissionsTeamWriter: ISavedViewScopePermissions = { canSavePersonal: true, canSaveTeam: true, canSaveRole: false, canSaveSystem: false, teamIds: ['team-001'], roleIds: [] };

export const mockSchemaV1: ISavedViewSchemaDescriptor = { moduleKey: 'financial', workspaceKey: 'default', validColumnKeys: ['name', 'status', 'amount'], validFilterFields: ['name', 'status', 'amount'], validGroupFields: ['status'], schemaVersion: 1 };
export const mockSchemaV2: ISavedViewSchemaDescriptor = { moduleKey: 'financial', workspaceKey: 'default', validColumnKeys: ['name', 'status'], validFilterFields: ['name', 'status'], validGroupFields: ['status'], schemaVersion: 2 };
