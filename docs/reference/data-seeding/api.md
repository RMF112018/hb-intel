# @hbc/data-seeding — API Reference

> **Doc Classification:** Living Reference (Diátaxis) — Reference quadrant; developer audience; data-seeding API reference.

**Package:** `packages/data-seeding/`
**Locked ADR:** [ADR-0098](../../architecture/adr/ADR-0098-data-seeding-import-primitive.md)

---

## Main Exports (`@hbc/data-seeding`)

### Types

| Export | Kind | Description |
|--------|------|-------------|
| `ISeedConfig<TSource, TDest>` | Interface | Per-import configuration supplied by consuming module |
| `ISeedFieldMapping<TSource, TDest>` | Interface | Single column → field mapping definition |
| `ISeedResult` | Interface | Aggregate import result |
| `ISeedValidationError` | Interface | Single row+column validation error |
| `ISeedRowMeta` | Interface | Per-row validation metadata |
| `ISeedHistoryEntry` | Interface | Single import history record |
| `ISeedBatchResult` | Interface | Result of a single batch import |
| `SeedFormat` | Union type | `'xlsx' \| 'csv' \| 'json' \| 'procore-export'` |
| `SeedStatus` | Union type | `'idle' \| 'validating' \| 'previewing' \| 'importing' \| 'complete' \| 'partial' \| 'failed'` |

### Parsers

| Export | Kind | Description |
|--------|------|-------------|
| `XlsxParser` | Object | `parse(file): Promise<IParseResult>`, `peekHeaders(file): Promise<string[]>` — SheetJS confined here only |
| `CsvParser` | Object | `parse(file): Promise<IParseResult>` — RFC 4180 native parsing |
| `ProcoreExportParser` | Object | `parse(file): Promise<IParseResult<IProcoreProjectRow>>`, `isProcoreExport(value): boolean` |

### Validation

| Export | Kind | Description |
|--------|------|-------------|
| `autoMapHeaders<S, D>(headers, fieldMappings)` | Function | Levenshtein fuzzy header matching (threshold 0.8, D-02) |
| `validateRow<S, D>(row, rowNumber, activeMapping, fieldMappings)` | Function | Per-row validation engine (D-03) |
| `validateAllRows<S, D>(rows, activeMapping, fieldMappings)` | Function | Full-pass validation helper |

### Hooks

| Export | Kind | Description |
|--------|------|-------------|
| `useSeedImport<S, D>(config, importerContext)` | Hook | Full 7-state import machine |
| `useSeedHistory(recordType)` | Hook | Import history query (TanStack Query) |

### Components

| Export | Kind | Description |
|--------|------|-------------|
| `HbcSeedUploader` | Component | Drag-drop file upload with format detection and large-file routing |
| `HbcSeedMapper` | Component | Column mapping UI — returns `null` in Essential (D-09) |
| `HbcSeedPreview` | Component | Preview table with validation — simplified in Essential (D-09) |
| `HbcSeedProgress` | Component | Real-time progress + error report download |

### API Client

| Export | Kind | Description |
|--------|------|-------------|
| `SeedApi` | Object | `importBatch`, `parseStreaming`, `recordCompletion`, `getHistory`, `getImport`, `getErrorReportUrl` |
| `configureSeedApiFetch(fetchFn)` | Function | Inject custom fetch (e.g., authenticated) |

### Constants

| Export | Kind | Description |
|--------|------|-------------|
| `SEED_BATCH_SIZE_DEFAULT` | Constant | `50` |
| `SEED_LARGE_FILE_THRESHOLD_BYTES` | Constant | `10 * 1024 * 1024` (10MB) |
| `SEED_PREVIEW_ROW_COUNT_STANDARD` | Constant | `20` |
| `SEED_PREVIEW_ROW_COUNT_EXPERT` | Constant | `50` |
| `SEED_IMPORTS_LIST_TITLE` | Constant | `'HBC_SeedImports'` |
| `SEED_API_BASE` | Constant | `'/api/data-seeding'` |
| `seedStatusLabel` | Constant | Display label per `SeedStatus` |
| `seedStatusColorClass` | Constant | CSS color class per `SeedStatus` |
| `buildAcceptString(formats)` | Function | File input `accept` attribute string |
| `detectFormat(file)` | Function | Detect `SeedFormat` from a `File` object |

---

## Testing Sub-Path (`@hbc/data-seeding/testing`)

| Export | Kind | Description |
|--------|------|-------------|
| `createMockSeedConfig<S, D>(overrides?)` | Factory | Minimal mock ISeedConfig with 3 field mappings |
| `createMockSeedResult(overrides?)` | Factory | ISeedResult with 48 success + 2 errors |
| `createMockValidationError(overrides?)` | Factory | Single ISeedValidationError with auto-incrementing row |
| `createMockSeedRow(overrides?)` | Factory | Single row as `Record<string, string>` |
| `mockSeedStatuses` | Constant | All 7 SeedStatus values keyed by name |

> **Note:** The `testing/` sub-path is excluded from the production bundle. Import only in test files.
