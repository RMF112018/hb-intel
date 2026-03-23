/** SF27-T08 — Canonical scenarios. */
import { createMockBulkSelectionSnapshot } from './createMockBulkSelectionSnapshot.js';
import type { IBulkActionDefinition } from '../src/types/index.js';

const immediateAction: IBulkActionDefinition<void> = {
  actionId: 'delete', label: 'Delete', kind: 'immediate', destructive: true,
  destructiveMetadata: { warningMessage: 'This cannot be undone', externallyVisible: false, requiresElevatedPermission: false },
  requiresConfirmation: true, requiresInput: false, inputSchema: null,
  permissionGate: null, transactional: false,
};

const configuredAction: IBulkActionDefinition<{ status: string }> = {
  actionId: 'change-status', label: 'Change Status', kind: 'configured', destructive: false,
  destructiveMetadata: null, requiresConfirmation: false, requiresInput: true as never,
  inputSchema: { fields: [{ key: 'status', label: 'New Status', type: 'select', required: true, options: ['Active', 'Inactive'] }] },
  permissionGate: null, transactional: false,
};

export const mockBulkActionScenarios = {
  pageSelection: createMockBulkSelectionSnapshot({ scope: 'page', exactCount: 3 }),
  filteredSelection: createMockBulkSelectionSnapshot({ scope: 'filtered', exactCount: 150, filterSnapshot: { status: 'active' } }),
  immediateAction,
  configuredAction,
  emptySelection: createMockBulkSelectionSnapshot({ scope: 'page', selectedIds: [], exactCount: 0 }),
} as const;
