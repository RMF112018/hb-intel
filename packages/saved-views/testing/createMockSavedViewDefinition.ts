/**
 * SF26-T08 — Mock factory for ISavedViewDefinition.
 */
import type { ISavedViewDefinition } from '../src/types/index.js';

export function createMockSavedViewDefinition(overrides?: Partial<ISavedViewDefinition>): ISavedViewDefinition {
  return {
    viewId: 'view-mock-001',
    moduleKey: 'financial',
    workspaceKey: 'default',
    title: 'My View',
    scope: 'personal',
    filterClauses: [],
    sortBy: [],
    groupBy: [],
    presentation: { density: 'standard', visibleColumnKeys: ['name', 'status', 'amount'], columnOrder: ['name', 'status', 'amount'] },
    schemaVersion: 1,
    createdAtIso: '2026-03-23T14:00:00.000Z',
    updatedAtIso: '2026-03-23T14:00:00.000Z',
    ...overrides,
  };
}
