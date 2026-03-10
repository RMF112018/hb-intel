# SF09-T02 — TypeScript Contracts: `@hbc/data-seeding`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-09-Shared-Feature-Data-Seeding.md`
**Decisions Applied:** D-01 (parse routing), D-02 (auto-map), D-03 (validation timing), D-04 (partial import), D-05 (batch), D-09 (complexity), D-10 (testing sub-path)
**Estimated Effort:** 0.25 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan — SF09-T02 contracts task; sub-plan of `SF09-Data-Seeding.md`.

---

## Objective

Define all TypeScript interfaces, union types, and constants for `@hbc/data-seeding`. These types are the stable API surface consumed by all downstream task files (parsers, hooks, components, platform wiring).

---

## 3-Line Plan

1. Define all union types (`SeedFormat`, `SeedStatus`) and all interfaces (`ISeedFieldMapping`, `ISeedConfig`, `ISeedValidationError`, `ISeedResult`, `ISeedRowMeta`, `ISeedBatchResult`, `ISeedHistoryEntry`, hook return types).
2. Define all module constants (`SEED_BATCH_SIZE_DEFAULT`, `SEED_LARGE_FILE_THRESHOLD_BYTES`, `SEED_PREVIEW_ROW_COUNT_STANDARD`, `SEED_PREVIEW_ROW_COUNT_EXPERT`, `seedStatusLabel`, `seedFormatAccept`).
3. Define `IRawSeedListItem` (SharePoint list shape for import history) and helper type guards.

---

## `src/types/IDataSeeding.ts`

```typescript
// ─── Format & Status ────────────────────────────────────────────────────────

/**
 * Accepted seed file formats.
 *
 * D-01: xlsx and csv are parsed client-side (SheetJS / native).
 *       json and procore-export are parsed client-side for files <10MB,
 *       or routed through the Azure Functions streaming endpoint for files ≥10MB.
 */
export type SeedFormat = 'xlsx' | 'csv' | 'json' | 'procore-export';

/**
 * Import state machine status.
 *
 * State transitions:
 *   idle → validating → previewing → importing → complete | partial | failed
 *
 * D-09: Essential complexity tier only shows idle/importing/complete/failed/partial.
 *       The previewing state is only reachable in Standard+ (Mapper/Preview rendered).
 */
export type SeedStatus =
  | 'idle'          // No file selected or user has reset
  | 'validating'    // File is being parsed; per-field validation running
  | 'previewing'    // Validation complete; user reviewing mapped preview (Standard+)
  | 'importing'     // Batch import loop in progress
  | 'complete'      // All rows imported successfully
  | 'failed'        // Hard error (network, auth, endpoint failure)
  | 'partial';      // allowPartialImport: true; some rows imported, some failed (D-04)

// ─── Field Mapping ───────────────────────────────────────────────────────────

/**
 * Defines how a single source column maps to a destination record field.
 *
 * @template TSource - The raw row type from the parsed file (string-keyed record)
 * @template TDest   - The HB Intel record type being populated
 */
export interface ISeedFieldMapping<TSource, TDest> {
  /** Source column name as it appears in the file header row */
  sourceColumn: string;
  /** Destination field on the HB Intel record type */
  destinationField: keyof TDest;
  /** Human-readable label shown in the Mapper component */
  label: string;
  /** Whether this mapping is required before the import can proceed (D-03) */
  required: boolean;
  /**
   * Optional transform applied to the raw source string value
   * before it is assigned to the destination field.
   *
   * @example Convert "2026-01-15" → Date object
   * transform: (raw) => new Date(raw)
   */
  transform?: (rawValue: string) => unknown;
  /**
   * Optional per-field validation.
   * Returns null if valid; returns an error string if invalid.
   * Runs during validate-on-map and again during full-pass validation (D-03).
   */
  validate?: (rawValue: string) => string | null;
}

// ─── Seed Config ─────────────────────────────────────────────────────────────

/**
 * Configuration object supplied by the consuming module for a specific import route.
 *
 * @template TSource - The raw row type from the import file
 * @template TDest   - The destination HB Intel record type
 *
 * @example
 * const bdLeadsImportConfig: ISeedConfig<IBdLeadRow, ILead> = {
 *   name: 'BD Active Leads',
 *   recordType: 'bd-lead',
 *   acceptedFormats: ['xlsx', 'csv'],
 *   fieldMappings: [...],
 *   autoMapHeaders: true,
 *   allowPartialImport: true,
 * };
 */
export interface ISeedConfig<TSource, TDest> {
  /** Human-readable name shown in the importer header */
  name: string;
  /** Target record type identifier (used in import history and versioned-record tagging) */
  recordType: string;
  /** File formats this import route accepts (D-01) */
  acceptedFormats: SeedFormat[];
  /** Field mapping definitions — at least one required mapping must be present */
  fieldMappings: ISeedFieldMapping<TSource, TDest>[];
  /**
   * If true, attempt to auto-map column headers to field labels using fuzzy
   * matching (normalized Levenshtein ≥ 0.8 threshold). User may override. (D-02)
   * Defaults to true.
   */
  autoMapHeaders?: boolean;
  /**
   * Maximum rows per import batch. (D-05)
   * Defaults to SEED_BATCH_SIZE_DEFAULT (50).
   */
  batchSize?: number;
  /**
   * If true, valid rows are imported even when some rows have validation errors.
   * Invalid rows are collected into a downloadable CSV error report. (D-04)
   * Defaults to false (all errors must be resolved before import).
   */
  allowPartialImport?: boolean;
  /** Called after each successfully imported record. Optional progress callback. */
  onRecordImported?: (record: TDest) => void;
  /** Called when the import completes (status becomes complete, partial, or failed). */
  onImportComplete?: (result: ISeedResult) => void;
}

// ─── Validation ──────────────────────────────────────────────────────────────

/**
 * Represents a single validation error on a specific row+column.
 */
export interface ISeedValidationError {
  /** 1-based row number in the source file */
  row: number;
  /** Source column name where the error occurred */
  column: string;
  /** The raw value that failed validation */
  value: string;
  /** Human-readable error message */
  error: string;
}

// ─── Row Metadata ─────────────────────────────────────────────────────────────

/**
 * Metadata attached to each parsed row during the validation phase.
 * Used internally by useSeedImport and HbcSeedPreview.
 */
export interface ISeedRowMeta {
  /** 1-based row number */
  rowNumber: number;
  /** Whether this row passed all required field validations */
  isValid: boolean;
  /** All validation errors for this row (empty array if valid) */
  errors: ISeedValidationError[];
  /** Whether this row was skipped during partial import (D-04) */
  skipped: boolean;
}

// ─── Import Result ───────────────────────────────────────────────────────────

/**
 * The aggregate result of a completed import.
 */
export interface ISeedResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  skippedCount: number;
  errors: ISeedValidationError[];
  importedAt: string;  // ISO 8601
  importedBy: string;  // userId of the user who initiated the import
  /** SharePoint document ID of the source seed file (D-06) */
  sourceDocumentId: string;
  /** SharePoint URL of the stored seed file (D-06) */
  sourceDocumentUrl: string;
}

// ─── Batch Result ─────────────────────────────────────────────────────────────

/**
 * Result of a single batch sent to the import endpoint. (D-05)
 * Returned by SeedApi.importBatch().
 */
export interface ISeedBatchResult {
  batchIndex: number;
  importedCount: number;
  failedCount: number;
  errors: ISeedValidationError[];
}

// ─── Import History ───────────────────────────────────────────────────────────

/**
 * A single import history entry returned by useSeedHistory.
 */
export interface ISeedHistoryEntry {
  importId: string;
  recordType: string;
  status: Extract<SeedStatus, 'complete' | 'partial' | 'failed'>;
  totalRows: number;
  successCount: number;
  errorCount: number;
  importedAt: string;     // ISO 8601
  importedBy: string;
  importedByName: string;
  sourceDocumentId: string;
  sourceDocumentUrl: string;
  sourceFileName: string;
}

// ─── Hook Return Types ────────────────────────────────────────────────────────

/**
 * Return type for useSeedImport<TSource, TDest>.
 *
 * The hook manages the full file → validate → preview → import state machine.
 */
export interface IUseSeedImportResult<TSource, TDest> {
  /** Current import status */
  status: SeedStatus;
  /** Parsed rows from the uploaded file. Empty until validating stage. */
  rows: TSource[];
  /** Per-row metadata (validation results). Populated after validating stage. */
  rowMeta: ISeedRowMeta[];
  /** Detected column headers from the file */
  detectedHeaders: string[];
  /** Active column-to-field mapping (sourceColumn → destinationField) */
  activeMapping: Record<string, keyof TDest>;
  /** Total number of valid rows (rows with isValid: true) */
  validRowCount: number;
  /** Total number of invalid rows */
  invalidRowCount: number;
  /** Import progress: number of rows imported so far */
  importedCount: number;
  /** Import progress: number of rows that failed during import */
  importErrorCount: number;
  /** Final aggregate result. Null until status is complete/partial/failed. */
  result: ISeedResult | null;
  /** Whether a file has been selected and parsing has completed */
  isFileParsed: boolean;
  /** Whether all required mappings are confirmed */
  isMappingComplete: boolean;
  /** Whether the import is safe to proceed (valid rows exist + mapping complete) */
  isReadyToImport: boolean;
  /** Handler: called by HbcSeedUploader when a file is selected */
  onFileSelected: (file: File) => Promise<void>;
  /** Handler: called by HbcSeedMapper when user confirms mappings */
  onMappingConfirmed: (mappings: Record<string, keyof TDest>) => void;
  /** Handler: called by HbcSeedPreview when user confirms import */
  onImportConfirmed: () => Promise<void>;
  /** Handler: retry failed rows after partial import */
  onRetryErrors: () => Promise<void>;
  /** Handler: reset to idle state */
  onReset: () => void;
}

/**
 * Return type for useSeedHistory.
 */
export interface IUseSeedHistoryResult {
  history: ISeedHistoryEntry[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── SharePoint List Shape ────────────────────────────────────────────────────

/**
 * Raw SharePoint list item shape for `HBC_SeedImports`.
 * Used by SeedApi to map between API responses and ISeedHistoryEntry.
 */
export interface IRawSeedListItem {
  Id: number;
  ImportId: string;
  RecordType: string;
  Status: string;
  TotalRows: number;
  SuccessCount: number;
  ErrorCount: number;
  ImportedAt: string;
  ImportedBy: string;
  ImportedByName: string;
  SourceDocumentId: string;
  SourceDocumentUrl: string;
  SourceFileName: string;
}
```

---

## `src/types/index.ts`

```typescript
export * from './IDataSeeding';
```

---

## Constants

```typescript
// src/constants.ts

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
```

---

## Verification Commands

```bash
# Confirm all types are exported from the package root
node -e "
  import('@hbc/data-seeding').then(m => {
    const exports = [
      'seedStatusLabel', 'seedStatusColorClass', 'seedFormatAccept',
      'SEED_BATCH_SIZE_DEFAULT', 'SEED_LARGE_FILE_THRESHOLD_BYTES',
      'buildAcceptString', 'detectFormat',
    ];
    exports.forEach(e => console.log(e + ':', typeof m[e] !== 'undefined' ? 'OK' : 'MISSING'));
  });
"

# Type-check
pnpm --filter @hbc/data-seeding check-types
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF09-T02 not yet started.
Next: SF09-T03-Parsers-and-Validation.md
-->
