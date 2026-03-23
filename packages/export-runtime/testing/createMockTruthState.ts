/**
 * SF24-T08 — Mock factory for IExportTruthState.
 */
import type { IExportTruthState } from '../src/types/index.js';

export function createMockTruthState(
  overrides?: Partial<IExportTruthState>,
): IExportTruthState {
  return {
    sourceTruthStamp: {
      moduleKey: 'financial',
      projectId: 'proj-001',
      recordId: 'rec-001',
      snapshotTimestampIso: '2026-03-23T14:00:00.000Z',
      snapshotType: 'current-view',
      appliedFilters: null,
      appliedSort: null,
      visibleColumns: null,
    },
    snapshotType: 'current-view',
    filtersApplied: false,
    sortApplied: false,
    columnsRestricted: false,
    selectedRowsOnly: false,
    composedSections: null,
    sourceTruthChangedDuringRender: false,
    truthDowngradeReasons: [],
    ...overrides,
  };
}
