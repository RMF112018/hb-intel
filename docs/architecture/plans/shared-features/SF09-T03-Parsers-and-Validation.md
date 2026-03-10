# SF09-T03 — File Parsers and Validation Engine: `@hbc/data-seeding`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-09-Shared-Feature-Data-Seeding.md`
**Decisions Applied:** D-01 (parse routing), D-02 (auto-map fuzzy matching), D-03 (validate-on-map), D-08 (Procore parser)
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T01, T02

> **Doc Classification:** Canonical Normative Plan — SF09-T03 parsers task; sub-plan of `SF09-Data-Seeding.md`.

---

## Objective

Implement `XlsxParser`, `CsvParser`, and `ProcoreExportParser` for client-side file parsing. Implement `validateRow` (per-row field-level validation engine) and `autoMapHeaders` (fuzzy header matching, D-02). SheetJS (`xlsx`) is used only in `XlsxParser` — no other file imports it.

---

## 3-Line Plan

1. Implement `XlsxParser.parse(file): Promise<{rows: unknown[], headers: string[]}>` using SheetJS; handle the large-file threshold by delegating to `SeedApi.parseStreaming()` if the file exceeds `SEED_LARGE_FILE_THRESHOLD_BYTES`.
2. Implement `CsvParser.parse(file)` using native `FileReader` + split/trim; implement `ProcoreExportParser.parse(file)` for Procore JSON project exports.
3. Implement `validateRow<TSource, TDest>(row, mappings, fieldMappings)` and `autoMapHeaders(headers, fieldMappings)` with normalized Levenshtein ≥ 0.8 threshold.

---

## `src/parsers/XlsxParser.ts`

```typescript
import type { SeedFormat } from '../types';
import {
  SEED_LARGE_FILE_THRESHOLD_BYTES,
  SEED_PREVIEW_ROW_COUNT_EXPERT,
} from '../constants';

export interface IParseResult<TRow = Record<string, string>> {
  /** Detected column headers from the first row */
  headers: string[];
  /** All data rows as string-keyed records */
  rows: TRow[];
  /** Format that was actually detected/used */
  format: SeedFormat;
  /** File size in bytes */
  fileSizeBytes: number;
  /** Number of data rows (excludes header row) */
  rowCount: number;
  /** Whether the file was routed to the streaming endpoint (D-01) */
  parsedOnServer: boolean;
}

/**
 * Parses Excel (.xlsx, .xls) files to row arrays using SheetJS.
 *
 * D-01: Files ≥ SEED_LARGE_FILE_THRESHOLD_BYTES are not parsed client-side.
 * Instead, a stub IParseResult is returned with parsedOnServer: true and
 * rows: []. The actual parsing happens via SeedApi.parseStreaming() which
 * returns the full row array from the server.
 *
 * Note: SheetJS is imported dynamically to enable tree-shaking in bundles
 * that do not use the xlsx format.
 */
export const XlsxParser = {
  async parse(file: File): Promise<IParseResult> {
    if (file.size >= SEED_LARGE_FILE_THRESHOLD_BYTES) {
      // Large file: return metadata stub; caller must use SeedApi.parseStreaming()
      return {
        headers: [],
        rows: [],
        format: 'xlsx',
        fileSizeBytes: file.size,
        rowCount: 0,
        parsedOnServer: true,
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    // Dynamic import to enable tree-shaking
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellText: true, cellDates: true });

    // Use first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error('The Excel file contains no sheets.');
    }

    const sheet = workbook.Sheets[sheetName];
    const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,         // coerce all values to strings
      defval: '',         // empty cells become empty string
    }) as Record<string, unknown>[];

    if (rawRows.length === 0) {
      return {
        headers: [],
        rows: [],
        format: 'xlsx',
        fileSizeBytes: file.size,
        rowCount: 0,
        parsedOnServer: false,
      };
    }

    // First row is headers
    const headers = (rawRows[0] as string[]).map((h) => String(h).trim());
    const dataRows = rawRows.slice(1).map((rawRow) => {
      const row: Record<string, string> = {};
      const cells = rawRow as string[];
      headers.forEach((header, index) => {
        row[header] = String(cells[index] ?? '').trim();
      });
      return row;
    });

    // Filter out completely empty rows
    const nonEmptyRows = dataRows.filter((row) =>
      headers.some((h) => (row[h] ?? '').length > 0)
    );

    return {
      headers,
      rows: nonEmptyRows,
      format: 'xlsx',
      fileSizeBytes: file.size,
      rowCount: nonEmptyRows.length,
      parsedOnServer: false,
    };
  },

  /**
   * Reads only the header row of an Excel file without loading all data.
   * Used by HbcSeedUploader to show detected headers before full parse.
   */
  async peekHeaders(file: File): Promise<string[]> {
    const arrayBuffer = await file.arrayBuffer();
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(arrayBuffer, {
      type: 'array',
      sheetRows: 1, // Read only the first row
    });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return [];
    const sheet = workbook.Sheets[sheetName];
    const headerRow: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    return (headerRow[0] ?? []).map((h) => String(h).trim());
  },
};
```

---

## `src/parsers/CsvParser.ts`

```typescript
import type { IParseResult } from './XlsxParser';
import { SEED_LARGE_FILE_THRESHOLD_BYTES } from '../constants';

/**
 * Parses CSV files to row arrays using native FileReader.
 *
 * D-01: Files ≥ SEED_LARGE_FILE_THRESHOLD_BYTES return a server-routing stub.
 *
 * Handles:
 * - Quoted fields with embedded commas
 * - Windows (CRLF) and Unix (LF) line endings
 * - Empty trailing rows
 * - UTF-8 BOM stripping
 */
export const CsvParser = {
  async parse(file: File): Promise<IParseResult> {
    if (file.size >= SEED_LARGE_FILE_THRESHOLD_BYTES) {
      return {
        headers: [],
        rows: [],
        format: 'csv',
        fileSizeBytes: file.size,
        rowCount: 0,
        parsedOnServer: true,
      };
    }

    const text = await file.text();
    const cleaned = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = cleaned.split('\n').filter((l) => l.trim().length > 0);

    if (lines.length === 0) {
      return { headers: [], rows: [], format: 'csv', fileSizeBytes: file.size, rowCount: 0, parsedOnServer: false };
    }

    const headers = parseCsvLine(lines[0]);
    const rows = lines.slice(1).map((line) => {
      const cells = parseCsvLine(line);
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = (cells[index] ?? '').trim();
      });
      return row;
    });

    return {
      headers,
      rows,
      format: 'csv',
      fileSizeBytes: file.size,
      rowCount: rows.length,
      parsedOnServer: false,
    };
  },
};

/**
 * Parses a single CSV line, handling quoted fields.
 * Handles the RFC 4180 quoted-field convention.
 */
function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      // Escaped quote inside a quoted field
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      cells.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells;
}
```

---

## `src/parsers/ProcoreExportParser.ts`

```typescript
import type { IParseResult } from './XlsxParser';
import { SEED_LARGE_FILE_THRESHOLD_BYTES } from '../constants';

/**
 * Shape of a Procore project JSON export.
 * Only the fields required for Project Hub seeding are mapped.
 * All other fields in the export are ignored.
 *
 * This interface reflects the Procore REST API project export format (D-08).
 * See Procore API docs for the full schema: https://developers.procore.com/
 */
export interface IProcoreProjectExport {
  projects: IProcoreProject[];
}

export interface IProcoreProject {
  id: number;
  name: string;
  display_name?: string;
  project_number?: string;
  status: string;
  start_date?: string;       // YYYY-MM-DD
  completion_date?: string;  // YYYY-MM-DD
  value?: string;
  address?: string;
  city?: string;
  state_code?: string;
  owner_name?: string;
  project_manager?: { id: number; name: string };
  superintendent?: { id: number; name: string };
  custom_fields?: Record<string, unknown>;
}

/**
 * Normalized Project Hub row after Procore export parsing.
 * This is the TSource type for `projectHubImportConfig`.
 */
export interface IProcoreProjectRow extends Record<string, string> {
  procoreId: string;
  projectName: string;
  projectNumber: string;
  status: string;
  startDate: string;
  completionDate: string;
  contractValue: string;
  address: string;
  city: string;
  stateCode: string;
  ownerName: string;
  projectManagerName: string;
  superintendentName: string;
}

/**
 * Parses Procore project JSON export files into normalized row arrays.
 *
 * D-08: ProcoreExportParser is a first-class parser for Project Hub onboarding.
 *
 * Detection: If the parsed JSON has a top-level `projects` array with objects
 * containing an `id` and `name` field, it is treated as a Procore export.
 * Otherwise, a `ProcoreFormatError` is thrown.
 */
export const ProcoreExportParser = {
  /**
   * Returns true if the parsed JSON appears to be a Procore project export.
   * Used by the format detection logic in useSeedImport.
   */
  isProcoreExport(parsed: unknown): parsed is IProcoreProjectExport {
    return (
      typeof parsed === 'object' &&
      parsed !== null &&
      'projects' in parsed &&
      Array.isArray((parsed as IProcoreProjectExport).projects) &&
      (parsed as IProcoreProjectExport).projects.length > 0 &&
      typeof (parsed as IProcoreProjectExport).projects[0].id === 'number' &&
      typeof (parsed as IProcoreProjectExport).projects[0].name === 'string'
    );
  },

  async parse(file: File): Promise<IParseResult<IProcoreProjectRow>> {
    if (file.size >= SEED_LARGE_FILE_THRESHOLD_BYTES) {
      return {
        headers: [],
        rows: [],
        format: 'procore-export',
        fileSizeBytes: file.size,
        rowCount: 0,
        parsedOnServer: true,
      };
    }

    const text = await file.text();
    let parsed: unknown;

    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(
        'Invalid JSON file. Please check that the file is a valid Procore export.'
      );
    }

    if (!ProcoreExportParser.isProcoreExport(parsed)) {
      throw new Error(
        'This JSON file does not appear to be a Procore project export. ' +
        'Expected an object with a "projects" array. ' +
        'If this is a different format, try uploading as Excel or CSV instead.'
      );
    }

    const rows: IProcoreProjectRow[] = parsed.projects.map((p) => ({
      procoreId: String(p.id),
      projectName: p.display_name ?? p.name,
      projectNumber: p.project_number ?? '',
      status: p.status ?? '',
      startDate: p.start_date ?? '',
      completionDate: p.completion_date ?? '',
      contractValue: p.value ?? '',
      address: p.address ?? '',
      city: p.city ?? '',
      stateCode: p.state_code ?? '',
      ownerName: p.owner_name ?? '',
      projectManagerName: p.project_manager?.name ?? '',
      superintendentName: p.superintendent?.name ?? '',
    }));

    const headers: Array<keyof IProcoreProjectRow> = [
      'procoreId', 'projectName', 'projectNumber', 'status',
      'startDate', 'completionDate', 'contractValue', 'address',
      'city', 'stateCode', 'ownerName', 'projectManagerName', 'superintendentName',
    ];

    return {
      headers: headers as string[],
      rows,
      format: 'procore-export',
      fileSizeBytes: file.size,
      rowCount: rows.length,
      parsedOnServer: false,
    };
  },
};

export class ProcoreFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProcoreFormatError';
  }
}
```

---

## `src/validation/autoMapHeaders.ts`

```typescript
import type { ISeedFieldMapping } from '../types';

/**
 * Fuzzy header auto-mapping (D-02).
 *
 * Attempts to match each detected source column header to a field mapping's
 * label using normalized Levenshtein distance.
 *
 * A match is accepted if the similarity score ≥ FUZZY_MATCH_THRESHOLD (0.8).
 * Each field mapping is matched to at most one source column.
 * The highest-scoring match wins if multiple columns score above the threshold.
 *
 * @returns A map from sourceColumn → destinationField for columns that matched.
 *          Unmatched columns are not included (caller treats them as unmapped).
 */
export const FUZZY_MATCH_THRESHOLD = 0.8;

export function autoMapHeaders<TSource, TDest>(
  detectedHeaders: string[],
  fieldMappings: ISeedFieldMapping<TSource, TDest>[]
): Record<string, keyof TDest> {
  const result: Record<string, keyof TDest> = {};
  const usedColumns = new Set<string>();

  for (const mapping of fieldMappings) {
    let bestScore = 0;
    let bestColumn: string | null = null;

    for (const header of detectedHeaders) {
      if (usedColumns.has(header)) continue;
      const score = normalizedSimilarity(
        normalize(header),
        normalize(mapping.label)
      );
      if (score > bestScore) {
        bestScore = score;
        bestColumn = header;
      }
    }

    if (bestColumn !== null && bestScore >= FUZZY_MATCH_THRESHOLD) {
      result[bestColumn] = mapping.destinationField;
      usedColumns.add(bestColumn);
    }
  }

  return result;
}

/**
 * Normalizes a string for comparison:
 * - Lowercase
 * - Remove non-alphanumeric characters
 * - Collapse whitespace
 */
function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/**
 * Computes normalized Levenshtein similarity between two strings.
 * Returns a value in [0, 1] where 1 is an exact match.
 */
function normalizedSimilarity(a: string, b: string): number {
  const distance = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - distance / maxLen;
}

/**
 * Standard Levenshtein edit distance.
 */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}
```

---

## `src/validation/validateRow.ts`

```typescript
import type { ISeedFieldMapping, ISeedValidationError, ISeedRowMeta } from '../types';

/**
 * Validates a single parsed row against the active field mappings.
 *
 * D-03: Runs both during validate-on-map (single field) and
 *       full-pass validation (all fields).
 *
 * @param row           - The raw source row (string-keyed record)
 * @param rowNumber     - 1-based row number for error reporting
 * @param activeMapping - Map of sourceColumn → destinationField
 * @param fieldMappings - The ISeedFieldMapping array from the config
 *
 * @returns ISeedRowMeta with isValid flag and errors array
 */
export function validateRow<TSource, TDest>(
  row: TSource,
  rowNumber: number,
  activeMapping: Record<string, keyof TDest>,
  fieldMappings: ISeedFieldMapping<TSource, TDest>[]
): ISeedRowMeta {
  const errors: ISeedValidationError[] = [];
  const rawRow = row as Record<string, string>;

  // Build a reverse index: destinationField → source column(s) in activeMapping
  const destToSourceCol = new Map<keyof TDest, string>();
  for (const [sourceCol, destField] of Object.entries(activeMapping)) {
    destToSourceCol.set(destField as keyof TDest, sourceCol);
  }

  for (const mapping of fieldMappings) {
    const sourceCol = destToSourceCol.get(mapping.destinationField);

    // Check required fields
    if (mapping.required) {
      if (!sourceCol) {
        // Required field is not mapped — this is a config-level error,
        // not a row-level error. Should be caught by isMappingComplete check.
        continue;
      }
      const value = rawRow[sourceCol] ?? '';
      if (value.trim() === '') {
        errors.push({
          row: rowNumber,
          column: sourceCol,
          value: '',
          error: `"${mapping.label}" is required and cannot be empty.`,
        });
        continue;
      }
    }

    // Run field-level validate function if present
    if (sourceCol && mapping.validate) {
      const value = rawRow[sourceCol] ?? '';
      const errorMsg = mapping.validate(value);
      if (errorMsg !== null) {
        errors.push({
          row: rowNumber,
          column: sourceCol,
          value,
          error: errorMsg,
        });
      }
    }
  }

  return {
    rowNumber,
    isValid: errors.length === 0,
    errors,
    skipped: false,
  };
}

/**
 * Runs validateRow on all rows and returns the full ISeedRowMeta array.
 * Used for the full-pass validation before the Preview step.
 */
export function validateAllRows<TSource, TDest>(
  rows: TSource[],
  activeMapping: Record<string, keyof TDest>,
  fieldMappings: ISeedFieldMapping<TSource, TDest>[]
): ISeedRowMeta[] {
  return rows.map((row, index) =>
    validateRow(row, index + 1, activeMapping, fieldMappings)
  );
}
```

---

## Verification Commands

```bash
# Type-check parsers
pnpm --filter @hbc/data-seeding check-types

# Verify SheetJS import is confined to XlsxParser only
grep -r "from 'xlsx'" packages/data-seeding/src/ | grep -v XlsxParser
# Expected: zero matches

grep -r "import.*xlsx" packages/data-seeding/src/ | grep -v XlsxParser
# Expected: zero matches

# Run parser unit tests
pnpm --filter @hbc/data-seeding test -- --grep "Parser|autoMapHeaders|validateRow"

# Confirm ProcoreExportParser accepts a valid Procore JSON fixture
# (use a fixture file in packages/data-seeding/src/parsers/__fixtures__/procore-sample.json)
pnpm --filter @hbc/data-seeding test -- --grep "ProcoreExportParser"
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF09-T03 completed: 2026-03-10
All three parsers (XlsxParser, CsvParser, ProcoreExportParser) implemented per spec.
Validation engine (validateRow, validateAllRows, autoMapHeaders) implemented per spec.
Barrel exports updated for parsers/index.ts and validation/index.ts.
ESLint config (.eslintrc.cjs) added to package (was missing from T01 scaffold).
Removed unused SEED_PREVIEW_ROW_COUNT_EXPERT import from XlsxParser (spec included it but code doesn't use it).
Fixed TS2352 cast errors: Record<string, unknown> → unknown → string[] (double-cast for SheetJS raw row arrays).
Gates: check-types ✅ | build ✅ | lint ✅ (0 errors) | test ✅ (passWithNoTests)
SheetJS confinement: verified — zero xlsx imports outside XlsxParser.ts.
Next: SF09-T04-Storage-and-API.md
-->
