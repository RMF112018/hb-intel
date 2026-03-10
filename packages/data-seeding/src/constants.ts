import type { SeedFormat, SeedStatus } from './types';

/** Default number of rows per import batch (D-05) */
export const SEED_BATCH_SIZE_DEFAULT = 50;

/**
 * Files at or above this size (in bytes) are routed to the Azure Functions
 * streaming endpoint rather than parsed client-side (D-01).
 * 10MB = 10 * 1024 * 1024
 */
export const SEED_LARGE_FILE_THRESHOLD_BYTES = 10 * 1024 * 1024;

/** Number of preview rows shown in Standard complexity tier (D-09) */
export const SEED_PREVIEW_ROW_COUNT_STANDARD = 20;

/** Number of preview rows shown in Expert complexity tier (D-09) */
export const SEED_PREVIEW_ROW_COUNT_EXPERT = 50;

/** Maximum columns allowed in a single import file before a warning is shown */
export const SEED_MAX_COLUMN_COUNT_WARNING = 50;

/** SharePoint list name for import history records (D-06) */
export const SEED_IMPORTS_LIST_TITLE = 'HBC_SeedImports';

/** Azure Functions API base path */
export const SEED_API_BASE = '/api/data-seeding';

/** Stale time for import history query (5 minutes) */
export const SEED_HISTORY_STALE_TIME_MS = 5 * 60 * 1000;

/**
 * Human-readable label for each SeedStatus.
 */
export const seedStatusLabel: Record<SeedStatus, string> = {
  idle: 'Ready to Import',
  validating: 'Validating File…',
  previewing: 'Review Mapping',
  importing: 'Importing…',
  complete: 'Import Complete',
  failed: 'Import Failed',
  partial: 'Import Complete (with errors)',
};

/**
 * CSS color class for each SeedStatus (maps to HB Intel Design System tokens).
 */
export const seedStatusColorClass: Record<SeedStatus, string> = {
  idle: 'hbc-seed-status--grey',
  validating: 'hbc-seed-status--blue',
  previewing: 'hbc-seed-status--blue',
  importing: 'hbc-seed-status--blue',
  complete: 'hbc-seed-status--green',
  failed: 'hbc-seed-status--red',
  partial: 'hbc-seed-status--amber',
};

/**
 * MIME types and file extensions accepted per SeedFormat.
 * Used to configure HbcSeedUploader's accept attribute.
 */
export const seedFormatAccept: Record<SeedFormat, { mimeTypes: string[]; extensions: string[] }> =
  {
    xlsx: {
      mimeTypes: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ],
      extensions: ['.xlsx', '.xls'],
    },
    csv: {
      mimeTypes: ['text/csv', 'text/plain'],
      extensions: ['.csv'],
    },
    json: {
      mimeTypes: ['application/json'],
      extensions: ['.json'],
    },
    'procore-export': {
      mimeTypes: ['application/json'],
      extensions: ['.json'],
    },
  };

/**
 * Builds the combined accept string for a file input element
 * given the accepted formats from an ISeedConfig.
 *
 * @example
 * buildAcceptString(['xlsx', 'csv'])
 * // → ".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,..."
 */
export function buildAcceptString(formats: SeedFormat[]): string {
  const extensions = new Set<string>();
  const mimeTypes = new Set<string>();

  for (const format of formats) {
    const { mimeTypes: m, extensions: e } = seedFormatAccept[format];
    m.forEach((t) => mimeTypes.add(t));
    e.forEach((ext) => extensions.add(ext));
  }

  return [...extensions, ...mimeTypes].join(',');
}

/**
 * Detects the SeedFormat from a File object (extension + MIME type).
 * Returns null if format cannot be determined.
 */
export function detectFormat(file: File): SeedFormat | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const mime = file.type.toLowerCase();

  if (ext === 'xlsx' || ext === 'xls') return 'xlsx';
  if (ext === 'csv' || mime === 'text/csv') return 'csv';
  if (ext === 'json') {
    // Procore exports are JSON but have a distinct content structure.
    // The parser handles disambiguation at parse time — we default to 'json' here.
    return 'json';
  }
  return null;
}
