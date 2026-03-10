# @hbc/data-seeding

Structured, validated, resumable bulk-import primitive for the HB Intel platform.

## Overview

`@hbc/data-seeding` implements a 7-state import machine (`idle → validating → previewing → importing → complete | partial | failed`) with client-side parsing (Excel, CSV, Procore JSON), fuzzy header auto-mapping, per-field validation, and full Azure Functions backend for large-file and batch operations.

**Locked ADR:** [ADR-0098](../../docs/architecture/adr/ADR-0098-data-seeding-import-primitive.md)

---

## Installation

This package is internal to the HB Intel monorepo. Add it as a workspace dependency:

```json
{
  "dependencies": {
    "@hbc/data-seeding": "workspace:*"
  }
}
```

---

## Quick Start

```typescript
import type { ISeedConfig } from '@hbc/data-seeding';
import {
  HbcSeedUploader,
  HbcSeedMapper,
  HbcSeedPreview,
  HbcSeedProgress,
  useSeedImport,
} from '@hbc/data-seeding';

const myImportConfig: ISeedConfig<IMySourceRow, IMyRecord> = {
  name: 'My Record Import',
  recordType: 'my-record',
  acceptedFormats: ['xlsx', 'csv'],
  autoMapHeaders: true,
  allowPartialImport: true,
  batchSize: 50,
  fieldMappings: [
    { sourceColumn: 'Name', destinationField: 'name', label: 'Record Name', required: true },
    { sourceColumn: 'Email', destinationField: 'email', label: 'Email Address', required: false },
  ],
};
```

> **Essential complexity (D-09):** When `complexity === 'essential'`, `HbcSeedMapper` returns `null` and the Mapper/Preview steps are skipped.

---

## Exports

| Export | Kind | Description |
|--------|------|-------------|
| `ISeedConfig<S,D>` | Interface | Per-import configuration supplied by consuming module |
| `ISeedFieldMapping<S,D>` | Interface | Single column → field mapping definition |
| `ISeedResult` | Interface | Aggregate import result |
| `ISeedValidationError` | Interface | Single row+column validation error |
| `ISeedRowMeta` | Interface | Per-row validation metadata |
| `ISeedHistoryEntry` | Interface | Single import history record |
| `SeedFormat` | Union type | `'xlsx' \| 'csv' \| 'json' \| 'procore-export'` |
| `SeedStatus` | Union type | 7-state import machine status |
| `XlsxParser` | Object | `parse(file)`, `peekHeaders(file)` — SheetJS confined here only |
| `CsvParser` | Object | `parse(file)` — RFC 4180 native parsing |
| `ProcoreExportParser` | Object | `parse(file)`, `isProcoreExport(value)` |
| `autoMapHeaders<S,D>` | Function | Levenshtein fuzzy header matching (threshold 0.8, D-02) |
| `validateRow<S,D>` | Function | Per-row validation engine (D-03) |
| `validateAllRows<S,D>` | Function | Full-pass validation helper |
| `useSeedImport<S,D>` | Hook | Full 7-state import machine |
| `useSeedHistory` | Hook | Import history query (TanStack Query) |
| `SeedApi` | Object | `importBatch`, `parseStreaming`, `recordCompletion`, `getHistory`, `getImport` |
| `HbcSeedUploader` | Component | Drag-drop file upload with format detection and large-file routing |
| `HbcSeedMapper` | Component | Column mapping UI — returns `null` in Essential (D-09) |
| `HbcSeedPreview` | Component | Preview table with validation — simplified in Essential (D-09) |
| `HbcSeedProgress` | Component | Real-time progress + error report download |
| `SEED_BATCH_SIZE_DEFAULT` | Constant | `50` |
| `SEED_LARGE_FILE_THRESHOLD_BYTES` | Constant | `10 * 1024 * 1024` |
| `buildAcceptString` | Function | File input `accept` attribute string from accepted formats |
| `detectFormat` | Function | Detect `SeedFormat` from a `File` object |

### Testing Sub-Path

```typescript
import { createMockSeedConfig, mockSeedStatuses } from '@hbc/data-seeding/testing';
```

> **Note:** The `testing/` sub-path is excluded from the production bundle. Import only in test files.

---

## Architecture Boundaries

This package **must not** import from:

- `@hbc/versioned-record` — consuming module tags snapshots in their own `onImportComplete` handler
- `@hbc/notification-intelligence` — Azure Function triggers notifications server-side
- `@hbc/bic-next-move` — import state is not governed by BIC directly
- Any `packages/features/*` module

SheetJS (`xlsx`) must be imported **only** in `src/parsers/XlsxParser.ts`.

---

## File Size Routing (D-01)

| File Size | Parse Path |
|-----------|-----------|
| < 10 MB | `XlsxParser` / `CsvParser` runs client-side |
| ≥ 10 MB | `HbcSeedUploader` uploads to SharePoint System context; `seedParse` Azure Function parses server-side |

---

## Complexity Tier Behavior (D-09)

| Complexity | Mapper | Preview | Row Limit |
|-----------|--------|---------|-----------|
| Essential | Not rendered | Simplified count only | N/A |
| Standard | Full mapper | First 20 rows | 20 |
| Expert | Full mapper + confidence scores | First 50 rows + error column | 50 |

---

## Reference Implementations

See `SF09-T08-Platform-Wiring.md` for five complete `ISeedConfig` examples:
- `bdLeadsImportConfig` — BD Leads (xlsx/csv)
- `estimatingBidCalendarImportConfig` — Bid Calendar (xlsx)
- `projectHubImportConfig` — Procore project export (xlsx/procore-export)
- `adminUserImportConfig` — Admin user CSV (no partial import)
- `strategicIntelWinLossImportConfig` — Win/Loss Intel (csv)

---

## Related Plans & References

- `docs/architecture/plans/shared-features/SF09-Data-Seeding.md` — Master plan
- `docs/how-to/developer/data-seeding-adoption-guide.md` — Step-by-step wiring guide
- `docs/reference/data-seeding/api.md` — Full API reference
- `docs/architecture/adr/ADR-0098-data-seeding-import-primitive.md` — Locked ADR
