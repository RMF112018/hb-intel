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
