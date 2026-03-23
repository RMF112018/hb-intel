/**
 * Estimating export adapter — maps Estimating domain data to
 * @hbc/export-runtime contracts.
 *
 * SF24-T07 reference adapter. Essential complexity tier with
 * CSV/XLSX support for working-data and record-snapshot intents.
 *
 * Governing: SF24-T07
 */

import type {
  ExportIntent,
  ExportPayload,
  IExportSourceTruthStamp,
  IExportModuleRegistration,
  IExportModuleTruthProvider,
} from '@hbc/export-runtime';

// ── Constants ────────────────────────────────────────────────────────────

export const ESTIMATING_EXPORT_MODULE_KEY = 'estimating';

// ── Truth Provider ───────────────────────────────────────────────────────

/**
 * Estimating truth provider — supplies source truth stamps and payloads
 * for Estimating domain exports.
 */
export const estimatingExportTruthProvider: IExportModuleTruthProvider = {
  moduleKey: ESTIMATING_EXPORT_MODULE_KEY,

  getSourceTruthStamp(recordId: string, projectId: string): IExportSourceTruthStamp {
    return {
      moduleKey: ESTIMATING_EXPORT_MODULE_KEY,
      projectId,
      recordId,
      snapshotTimestampIso: new Date().toISOString(),
      snapshotType: 'point-in-time',
      appliedFilters: null,
      appliedSort: null,
      visibleColumns: null,
    };
  },

  buildPayload(_recordId: string, _projectId: string, _intent: ExportIntent): ExportPayload {
    return {
      kind: 'table',
      columns: [],
      rowCount: 0,
      selectedRowIds: null,
      filterSummary: null,
      sortSummary: null,
    };
  },
};

// ── Registration ─────────────────────────────────────────────────────────

/**
 * Estimating export module registration.
 *
 * Essential tier: reduced-choice CSV/XLSX for working analysis.
 */
export const estimatingExportRegistration: IExportModuleRegistration = {
  moduleKey: ESTIMATING_EXPORT_MODULE_KEY,
  displayName: 'Estimating',
  supportedFormats: ['csv', 'xlsx'],
  supportedIntents: ['working-data', 'record-snapshot'],
  complexityTier: 'essential',
  truthProvider: estimatingExportTruthProvider,
};
