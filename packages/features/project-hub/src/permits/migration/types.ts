/**
 * P3-E7-T07 Data Migration, Import, and Future Integration TypeScript contracts.
 */

// ── Migration Mapping ───────────────────────────────────────────────

export interface IMigrationFieldMapping {
  readonly sourceField: string;
  readonly targetField: string;
  readonly notes: string;
}

export interface IMigrationStatusMapping {
  readonly oldStatus: string;
  readonly newStatus: string;
  readonly notes: string;
}

export interface IMigrationResultMapping {
  readonly oldResult: string;
  readonly newResult: string;
}

export interface IMigrationDefault {
  readonly field: string;
  readonly defaultValue: string;
  readonly reason: string;
}

// ── Migration Validation ────────────────────────────────────────────

export interface IMigrationValidationCheckItem {
  readonly checkId: string;
  readonly description: string;
}

// ── Import ──────────────────────────────────────────────────────────

export type ImportIdempotencyChoice = 'Append' | 'Replace' | 'Cancel';

export interface IImportResultSummary {
  readonly totalRows: number;
  readonly created: number;
  readonly skipped: number;
  readonly skippedReasons: readonly string[];
}

// ── Evidence Upload ─────────────────────────────────────────────────

export interface IEvidenceUploadConfig {
  readonly supportedMimeTypes: readonly string[];
  readonly maxFileSizeBytes: number;
  readonly storageModel: string;
}

// ── Versioned Record ────────────────────────────────────────────────

export interface IVersionedRecordField {
  readonly fieldName: string;
  readonly reason: string;
}

// ── Future Integration ──────────────────────────────────────────────

export interface IFutureIntegrationPoint {
  readonly integration: string;
  readonly description: string;
  readonly phase: string;
}
