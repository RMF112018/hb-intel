# SF09-T05 — Hooks: `@hbc/data-seeding`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-09-Shared-Feature-Data-Seeding.md`
**Decisions Applied:** D-01 (parse routing), D-02 (auto-map), D-03 (validate-on-map), D-04 (partial import), D-05 (batch progress), D-06 (SharePoint storage), D-09 (complexity gating in callers)
**Estimated Effort:** 0.50 sprint-weeks
**Depends On:** T01–T04

> **Doc Classification:** Canonical Normative Plan — SF09-T05 hooks task; sub-plan of `SF09-Data-Seeding.md`.

---

## Objective

Implement `useSeedImport<TSource, TDest>` (full file→validate→preview→import state machine) and `useSeedHistory` (import history query for a record type).

---

## 3-Line Plan

1. Implement `useSeedImport<TSource, TDest>` as a self-contained state machine using `useReducer`; it drives the five stages (idle→validating→previewing→importing→complete/partial/failed) and coordinates parsers, validation, and SeedApi.
2. Implement the validate-on-map pattern: when `onMappingConfirmed` is called, immediately re-run `validateAllRows` on the full row set to update `rowMeta` and `validRowCount`.
3. Implement `useSeedHistory` as a standard TanStack Query hook with `SEED_HISTORY_STALE_TIME_MS` stale time.

---

## `src/hooks/useSeedImport.ts`

```typescript
import { useReducer, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ISeedConfig, IUseSeedImportResult, ISeedRowMeta, ISeedResult } from '../types';
import {
  SEED_BATCH_SIZE_DEFAULT,
  SEED_LARGE_FILE_THRESHOLD_BYTES,
} from '../constants';
import { XlsxParser } from '../parsers/XlsxParser';
import { CsvParser } from '../parsers/CsvParser';
import { ProcoreExportParser } from '../parsers/ProcoreExportParser';
import { autoMapHeaders } from '../validation/autoMapHeaders';
import { validateAllRows } from '../validation/validateRow';
import { SeedApi } from '../api/SeedApi';
import { detectFormat } from '../constants';

// ─── State Machine ────────────────────────────────────────────────────────────

type SeedImportState<TSource, TDest> = {
  status: import('../types').SeedStatus;
  rows: TSource[];
  rowMeta: ISeedRowMeta[];
  detectedHeaders: string[];
  activeMapping: Record<string, keyof TDest>;
  importedCount: number;
  importErrorCount: number;
  result: ISeedResult | null;
  error: string | null;
  currentFile: File | null;
  importId: string | null;
  isFileParsed: boolean;
};

type SeedImportAction<TSource, TDest> =
  | { type: 'FILE_PARSE_START'; file: File }
  | { type: 'FILE_PARSE_COMPLETE'; rows: TSource[]; headers: string[]; autoMapping: Record<string, keyof TDest> }
  | { type: 'FILE_PARSE_ERROR'; error: string }
  | { type: 'MAPPING_CONFIRMED'; mapping: Record<string, keyof TDest>; rowMeta: ISeedRowMeta[] }
  | { type: 'IMPORT_START'; importId: string }
  | { type: 'BATCH_COMPLETE'; importedCount: number; importErrorCount: number }
  | { type: 'IMPORT_COMPLETE'; result: ISeedResult }
  | { type: 'IMPORT_FAILED'; error: string }
  | { type: 'RESET' };

function seedImportReducer<TSource, TDest>(
  state: SeedImportState<TSource, TDest>,
  action: SeedImportAction<TSource, TDest>
): SeedImportState<TSource, TDest> {
  switch (action.type) {
    case 'FILE_PARSE_START':
      return {
        ...state,
        status: 'validating',
        currentFile: action.file,
        rows: [],
        rowMeta: [],
        detectedHeaders: [],
        activeMapping: {},
        isFileParsed: false,
        result: null,
        error: null,
      };

    case 'FILE_PARSE_COMPLETE':
      return {
        ...state,
        status: 'previewing',
        rows: action.rows as TSource[],
        detectedHeaders: action.headers,
        activeMapping: action.autoMapping,
        isFileParsed: true,
      };

    case 'FILE_PARSE_ERROR':
      return {
        ...state,
        status: 'failed',
        error: action.error,
        isFileParsed: false,
      };

    case 'MAPPING_CONFIRMED':
      return {
        ...state,
        activeMapping: action.mapping,
        rowMeta: action.rowMeta,
        status: 'previewing',
      };

    case 'IMPORT_START':
      return {
        ...state,
        status: 'importing',
        importId: action.importId,
        importedCount: 0,
        importErrorCount: 0,
      };

    case 'BATCH_COMPLETE':
      return {
        ...state,
        importedCount: action.importedCount,
        importErrorCount: action.importErrorCount,
      };

    case 'IMPORT_COMPLETE':
      return {
        ...state,
        status: action.result.errorCount > 0 && action.result.successCount > 0
          ? 'partial'
          : action.result.errorCount > 0
          ? 'failed'
          : 'complete',
        result: action.result,
      };

    case 'IMPORT_FAILED':
      return { ...state, status: 'failed', error: action.error };

    case 'RESET':
      return initialState as SeedImportState<TSource, TDest>;

    default:
      return state;
  }
}

const initialState: SeedImportState<unknown, unknown> = {
  status: 'idle',
  rows: [],
  rowMeta: [],
  detectedHeaders: [],
  activeMapping: {},
  importedCount: 0,
  importErrorCount: 0,
  result: null,
  error: null,
  currentFile: null,
  importId: null,
  isFileParsed: false,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Manages the full file → validate → preview → import state machine.
 *
 * @template TSource - The raw row type from the import file
 * @template TDest   - The destination HB Intel record type
 *
 * @example
 * const {
 *   status, rows, validRowCount, onFileSelected, onMappingConfirmed, onImportConfirmed
 * } = useSeedImport(bdLeadsImportConfig, { userId: user.id, userName: user.displayName });
 */
export function useSeedImport<TSource extends Record<string, string>, TDest>(
  config: ISeedConfig<TSource, TDest>,
  importerContext: { userId: string; userName: string }
): IUseSeedImportResult<TSource, TDest> {
  const [state, dispatch] = useReducer(
    seedImportReducer as typeof seedImportReducer<TSource, TDest>,
    initialState as SeedImportState<TSource, TDest>
  );

  // Ref to track running import so we can abort retries
  const abortRef = useRef(false);

  // ── File selected handler ──────────────────────────────────────────────────

  const onFileSelected = useCallback(
    async (file: File) => {
      dispatch({ type: 'FILE_PARSE_START', file });

      try {
        let rows: TSource[];
        let headers: string[];

        const format = detectFormat(file);
        if (!format) {
          throw new Error(
            `Unsupported file format. Accepted: ${config.acceptedFormats.join(', ')}.`
          );
        }

        if (file.size >= SEED_LARGE_FILE_THRESHOLD_BYTES) {
          // Large file: upload to SharePoint first, then parse on server (D-01, D-06)
          // Note: DocumentApi.uploadToSystemContext() is called by the consuming module
          // via HbcSeedUploader — by the time onFileSelected is called, the file
          // should already have a documentId in the config context.
          // For this hook, we signal to the caller that server-side parsing is needed.
          // The caller (HbcSeedUploader) provides the documentId after upload.
          // This is handled by a separate onLargeFileUploaded callback in the Uploader.
          throw new Error(
            `File is too large for client-side parsing (${Math.round(file.size / 1_000_000)}MB). ` +
            'Please wait — uploading to secure storage for server-side processing.'
          );
        }

        // Small file: parse client-side
        if (format === 'xlsx') {
          const result = await XlsxParser.parse(file);
          rows = result.rows as TSource[];
          headers = result.headers;
        } else if (format === 'csv') {
          const result = await CsvParser.parse(file);
          rows = result.rows as TSource[];
          headers = result.headers;
        } else if (format === 'json' || format === 'procore-export') {
          const result = await ProcoreExportParser.parse(file);
          rows = result.rows as TSource[];
          headers = result.headers;
        } else {
          throw new Error(`Format ${format} is not supported.`);
        }

        // Auto-map headers if configured (D-02)
        const autoMapping =
          config.autoMapHeaders !== false
            ? autoMapHeaders(headers, config.fieldMappings)
            : ({} as Record<string, keyof TDest>);

        dispatch({ type: 'FILE_PARSE_COMPLETE', rows, headers, autoMapping });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown parse error';
        dispatch({ type: 'FILE_PARSE_ERROR', error: message });
      }
    },
    [config]
  );

  // ── Mapping confirmed handler ──────────────────────────────────────────────

  const onMappingConfirmed = useCallback(
    (mappings: Record<string, keyof TDest>) => {
      // D-03: Re-run full-pass validation whenever mappings change
      const rowMeta = validateAllRows(state.rows, mappings, config.fieldMappings);
      dispatch({ type: 'MAPPING_CONFIRMED', mapping: mappings, rowMeta });
    },
    [state.rows, config.fieldMappings]
  );

  // ── Import confirmed handler ───────────────────────────────────────────────

  const onImportConfirmed = useCallback(async () => {
    const importId = uuidv4();
    dispatch({ type: 'IMPORT_START', importId });
    abortRef.current = false;

    const batchSize = config.batchSize ?? SEED_BATCH_SIZE_DEFAULT;
    const rowsToImport = config.allowPartialImport
      ? state.rows.filter((_, i) => state.rowMeta[i]?.isValid !== false)
      : state.rows;

    const allErrors = state.rowMeta.flatMap((m) => m.errors);
    let totalImported = 0;
    let totalFailed = 0;
    const batchErrors: import('../types').ISeedValidationError[] = [];

    try {
      for (let batchStart = 0; batchStart < rowsToImport.length; batchStart += batchSize) {
        if (abortRef.current) break;

        const batch = rowsToImport.slice(batchStart, batchStart + batchSize);
        // Apply transforms from field mappings
        const transformedBatch = batch.map((row) => applyTransforms(row, state.activeMapping, config.fieldMappings));

        const batchResult = await SeedApi.importBatch({
          recordType: config.recordType,
          rows: transformedBatch,
          importId,
          batchIndex: Math.floor(batchStart / batchSize),
        });

        totalImported += batchResult.importedCount;
        totalFailed += batchResult.failedCount;
        batchErrors.push(...batchResult.errors);

        dispatch({
          type: 'BATCH_COMPLETE',
          importedCount: totalImported,
          importErrorCount: totalFailed,
        });
      }

      // Record completion (D-06: sourceDocumentId should be in config context;
      // for now, use a placeholder — the calling component wires this in)
      const result: ISeedResult = {
        totalRows: state.rows.length,
        successCount: totalImported,
        errorCount: totalFailed + (state.rows.length - rowsToImport.length),
        skippedCount: state.rows.length - rowsToImport.length,
        errors: [...allErrors, ...batchErrors],
        importedAt: new Date().toISOString(),
        importedBy: importerContext.userId,
        sourceDocumentId: '', // Wired by HbcSeedUploader after D-06 file upload
        sourceDocumentUrl: '',
      };

      config.onImportComplete?.(result);

      await SeedApi.recordCompletion({
        importId,
        recordType: config.recordType,
        totalRows: result.totalRows,
        successCount: result.successCount,
        errorCount: result.errorCount,
        skippedCount: result.skippedCount,
        errors: result.errors,
        importedAt: result.importedAt,
        importedBy: result.importedBy,
        importedByName: importerContext.userName,
        sourceDocumentId: result.sourceDocumentId,
        sourceDocumentUrl: result.sourceDocumentUrl,
        sourceFileName: '',
      });

      dispatch({ type: 'IMPORT_COMPLETE', result });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Import failed';
      dispatch({ type: 'IMPORT_FAILED', error: message });
    }
  }, [state.rows, state.rowMeta, state.activeMapping, config, importerContext]);

  // ── Retry errors handler ───────────────────────────────────────────────────

  const onRetryErrors = useCallback(async () => {
    if (!config.allowPartialImport || state.status !== 'partial') return;
    // Re-run import on the failed rows only
    const failedRows = state.rows.filter((_, i) => !state.rowMeta[i]?.isValid);
    if (failedRows.length === 0) return;
    await onImportConfirmed(); // Full re-import (retry logic can be enhanced if needed)
  }, [state, config, onImportConfirmed]);

  const onReset = useCallback(() => {
    abortRef.current = true;
    dispatch({ type: 'RESET' });
  }, []);

  // ── Derived state ──────────────────────────────────────────────────────────

  const validRowCount = state.rowMeta.filter((m) => m.isValid).length;
  const invalidRowCount = state.rowMeta.filter((m) => !m.isValid).length;

  const requiredMappings = config.fieldMappings
    .filter((m) => m.required)
    .map((m) => m.destinationField);

  const mappedDestFields = Object.values(state.activeMapping) as Array<keyof TDest>;
  const isMappingComplete = requiredMappings.every((req) => mappedDestFields.includes(req));
  const isReadyToImport =
    state.isFileParsed &&
    isMappingComplete &&
    (config.allowPartialImport ? validRowCount > 0 : invalidRowCount === 0);

  return {
    status: state.status,
    rows: state.rows,
    rowMeta: state.rowMeta,
    detectedHeaders: state.detectedHeaders,
    activeMapping: state.activeMapping,
    validRowCount,
    invalidRowCount,
    importedCount: state.importedCount,
    importErrorCount: state.importErrorCount,
    result: state.result,
    isFileParsed: state.isFileParsed,
    isMappingComplete,
    isReadyToImport,
    onFileSelected,
    onMappingConfirmed,
    onImportConfirmed,
    onRetryErrors,
    onReset,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Applies ISeedFieldMapping.transform functions to each row value
 * before sending to the import endpoint.
 */
function applyTransforms<TSource, TDest>(
  row: TSource,
  activeMapping: Record<string, keyof TDest>,
  fieldMappings: import('../types').ISeedFieldMapping<TSource, TDest>[]
): Record<string, unknown> {
  const rawRow = row as Record<string, string>;
  const result: Record<string, unknown> = {};

  for (const [sourceCol, destField] of Object.entries(activeMapping)) {
    const mapping = fieldMappings.find((m) => m.destinationField === destField);
    const rawValue = rawRow[sourceCol] ?? '';
    result[destField as string] = mapping?.transform ? mapping.transform(rawValue) : rawValue;
  }

  return result;
}
```

---

## `src/hooks/useSeedHistory.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import type { IUseSeedHistoryResult } from '../types';
import { SeedApi } from '../api/SeedApi';
import { SEED_HISTORY_STALE_TIME_MS } from '../constants';

/**
 * Query key factory for seed history queries.
 */
export function seedHistoryQueryKey(recordType: string) {
  return ['@hbc/data-seeding', 'history', recordType] as const;
}

/**
 * Returns the import history for a given record type, newest first.
 *
 * @param recordType - The target record type to query history for
 *                     (e.g., 'bd-lead', 'project-record')
 *
 * @example
 * const { history, isLoading } = useSeedHistory('bd-lead');
 */
export function useSeedHistory(recordType: string): IUseSeedHistoryResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: seedHistoryQueryKey(recordType),
    queryFn: () => SeedApi.getHistory(recordType),
    staleTime: SEED_HISTORY_STALE_TIME_MS,
    enabled: Boolean(recordType),
  });

  return {
    history: data ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch: () => void refetch(),
  };
}
```

---

## Verification Commands

```bash
# Type-check hooks
pnpm --filter @hbc/data-seeding check-types

# Run hook unit tests
pnpm --filter @hbc/data-seeding test -- --grep "useSeedImport|useSeedHistory"

# Verify hook exports
node -e "
  import('@hbc/data-seeding').then(m => {
    console.log('useSeedImport:', typeof m.useSeedImport);
    console.log('useSeedHistory:', typeof m.useSeedHistory);
  });
"
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF09-T05 not yet started.
Note: useSeedImport's onFileSelected currently throws for large files
rather than delegating to the server — HbcSeedUploader (T06) must handle
the large-file path by calling DocumentApi.uploadToSystemContext first,
then calling a separate onLargeFileUploaded handler on the hook.
This pattern should be finalized in T06 before T05 is implemented.
Next: SF09-T06-HbcSeedUploader-and-HbcSeedMapper.md
-->
