/**
 * BD export adapter — maps Business Development domain data to
 * @hbc/export-runtime contracts.
 *
 * SF24-T07 reference adapter. Standard complexity tier with
 * CSV/XLSX/PDF support for working-data, current-view, and
 * presentation intents.
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

export const BD_EXPORT_MODULE_KEY = 'business-development';

// ── Truth Provider ───────────────────────────────────────────────────────

/**
 * BD truth provider — supplies source truth stamps and payloads
 * for BD domain exports.
 */
export const bdExportTruthProvider: IExportModuleTruthProvider = {
  moduleKey: BD_EXPORT_MODULE_KEY,

  getSourceTruthStamp(recordId: string, projectId: string): IExportSourceTruthStamp {
    return {
      moduleKey: BD_EXPORT_MODULE_KEY,
      projectId,
      recordId,
      snapshotTimestampIso: new Date().toISOString(),
      snapshotType: 'current-view',
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
 * BD export module registration.
 *
 * Standard tier: full menu with CSV, XLSX, and branded PDF.
 */
export const bdExportRegistration: IExportModuleRegistration = {
  moduleKey: BD_EXPORT_MODULE_KEY,
  displayName: 'Business Development',
  supportedFormats: ['csv', 'xlsx', 'pdf'],
  supportedIntents: ['working-data', 'current-view', 'presentation'],
  complexityTier: 'standard',
  truthProvider: bdExportTruthProvider,
};
