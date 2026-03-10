# SF09-T04 — Storage and API: `@hbc/data-seeding`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-09-Shared-Feature-Data-Seeding.md`
**Decisions Applied:** D-01 (large-file streaming endpoint), D-05 (batch import), D-06 (SharePoint file storage)
**Estimated Effort:** 0.50 sprint-weeks
**Depends On:** T01, T02, T03

> **Doc Classification:** Canonical Normative Plan — SF09-T04 storage/API task; sub-plan of `SF09-Data-Seeding.md`.

---

## Objective

Implement the SharePoint `HBC_SeedImports` list schema (import history records), the `SeedApi` REST client (batch import, streaming parse, import history), and the Azure Functions backend (batch import endpoint, large-file streaming parse endpoint).

---

## 3-Line Plan

1. Define the `HBC_SeedImports` SharePoint list schema (9 columns, 2 compound indexes) for persisting import history records.
2. Implement `SeedApi` with five methods: `importBatch`, `parseStreaming`, `getHistory`, `getImport`, and `downloadErrorReport`.
3. Specify Azure Functions: `seedImportBatch` (batch upsert), `seedParse` (large-file streaming), and `seedHistory` (history query).

---

## SharePoint List Schema: `HBC_SeedImports`

**List Title:** `HBC_SeedImports`
**Purpose:** Persists a summary record for every completed import session. Raw data is not stored here — only audit metadata. Full error detail is stored in the error report document linked by `ErrorReportDocumentId`.

| Column | Type | Description |
|--------|------|-------------|
| `ImportId` | Single line | GUID — primary import identifier |
| `RecordType` | Single line | Target record type (e.g., `'bd-lead'`, `'project-record'`) |
| `Status` | Choice | `complete`, `partial`, `failed` |
| `TotalRows` | Number | Total rows in the source file |
| `SuccessCount` | Number | Rows successfully imported |
| `ErrorCount` | Number | Rows that failed validation or import |
| `SkippedCount` | Number | Rows skipped (allowPartialImport mode) |
| `ImportedAt` | Date and Time | ISO 8601 timestamp |
| `ImportedBy` | Single line | User ID of the importing admin |
| `ImportedByName` | Single line | Display name of the importing admin |
| `SourceDocumentId` | Single line | SharePoint document ID of the seed file (D-06) |
| `SourceDocumentUrl` | Single line | SharePoint URL of the seed file |
| `SourceFileName` | Single line | Original filename of the seed file |
| `ErrorReportDocumentId` | Single line | SharePoint doc ID of the CSV error report (null if none) |
| `ErrorReportDocumentUrl` | Single line | URL of the CSV error report (null if none) |

**Indexes:**
- `(RecordType, ImportedAt DESC)` — powers `useSeedHistory` queries by record type
- `(ImportedBy, ImportedAt DESC)` — powers admin personal import history view

---

## `src/api/SeedApi.ts`

```typescript
import type {
  ISeedBatchResult,
  ISeedResult,
  ISeedHistoryEntry,
  IRawSeedListItem,
  ISeedValidationError,
} from '../types';
import {
  SEED_API_BASE,
  SEED_IMPORTS_LIST_TITLE,
} from '../constants';

type FetchFn = typeof fetch;

let _fetch: FetchFn = globalThis.fetch;

/**
 * Allows injection of a custom fetch function (e.g., authenticated fetch)
 * in consuming modules or tests.
 */
export function configureSeedApiFetch(fetchFn: FetchFn): void {
  _fetch = fetchFn;
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await _fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => response.statusText);
    throw new Error(`SeedApi request failed [${response.status}]: ${body}`);
  }

  return response.json() as Promise<T>;
}

// ─── Response shapes from Azure Functions ────────────────────────────────────

interface IBatchImportRequest {
  recordType: string;
  rows: Record<string, unknown>[];
  importId: string;
  batchIndex: number;
}

interface IStreamingParseRequest {
  format: 'xlsx' | 'csv' | 'json' | 'procore-export';
  documentId: string;  // SharePoint document ID of the already-uploaded file (D-06)
}

interface IStreamingParseResponse {
  headers: string[];
  rows: Record<string, string>[];
  rowCount: number;
}

interface IImportCompleteRequest {
  importId: string;
  recordType: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  skippedCount: number;
  errors: ISeedValidationError[];
  sourceDocumentId: string;
  sourceDocumentUrl: string;
  sourceFileName: string;
  errorReportDocumentId?: string;
  errorReportDocumentUrl?: string;
}

// ─── SeedApi ─────────────────────────────────────────────────────────────────

export const SeedApi = {
  /**
   * Imports a batch of transformed rows to the target module's record store.
   *
   * D-05: Called in a loop by useSeedImport; one call per batch of batchSize rows.
   * The Azure Function upserts each row via the target module's data API.
   *
   * @param request.recordType   - Target record type (e.g., 'bd-lead')
   * @param request.rows         - Batch of transformed destination record objects
   * @param request.importId     - Import session GUID (consistent across all batches)
   * @param request.batchIndex   - 0-based batch index (for progress tracking)
   */
  async importBatch(request: IBatchImportRequest): Promise<ISeedBatchResult> {
    return apiFetch<ISeedBatchResult>(`${SEED_API_BASE}/batch`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Parses a large file (≥ SEED_LARGE_FILE_THRESHOLD_BYTES) on the server.
   *
   * D-01: The file must have already been uploaded to SharePoint by
   * DocumentApi.uploadToSystemContext() before calling this method.
   * The Azure Function downloads the file from SharePoint and returns
   * the parsed rows to the client.
   */
  async parseStreaming(request: IStreamingParseRequest): Promise<IStreamingParseResponse> {
    return apiFetch<IStreamingParseResponse>(`${SEED_API_BASE}/parse`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Records the final import result to the HBC_SeedImports SharePoint list.
   * Called once per import session after all batches complete.
   * Also triggers the completion notification (D-07 via Azure Function).
   */
  async recordCompletion(request: IImportCompleteRequest): Promise<{ importId: string }> {
    return apiFetch<{ importId: string }>(`${SEED_API_BASE}/complete`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Retrieves import history for a record type, newest first.
   * Powers useSeedHistory.
   */
  async getHistory(recordType: string): Promise<ISeedHistoryEntry[]> {
    const params = new URLSearchParams({ recordType });
    const raw = await apiFetch<IRawSeedListItem[]>(
      `${SEED_API_BASE}/history?${params.toString()}`
    );
    return raw.map(mapListItemToHistoryEntry);
  },

  /**
   * Retrieves a single import record by importId.
   */
  async getImport(importId: string): Promise<ISeedHistoryEntry> {
    const raw = await apiFetch<IRawSeedListItem>(
      `${SEED_API_BASE}/history/${importId}`
    );
    return mapListItemToHistoryEntry(raw);
  },

  /**
   * Returns a signed download URL for the CSV error report associated
   * with an import, if one was generated (D-04 partial import).
   *
   * @returns The SharePoint URL of the error report document, or null if none.
   */
  async getErrorReportUrl(importId: string): Promise<string | null> {
    const entry = await SeedApi.getImport(importId);
    return entry.sourceDocumentUrl ?? null; // Uses error report URL in the entry
  },
};

// ─── Mapping ─────────────────────────────────────────────────────────────────

function mapListItemToHistoryEntry(item: IRawSeedListItem): ISeedHistoryEntry {
  return {
    importId: item.ImportId,
    recordType: item.RecordType,
    status: item.Status as ISeedHistoryEntry['status'],
    totalRows: item.TotalRows,
    successCount: item.SuccessCount,
    errorCount: item.ErrorCount,
    importedAt: item.ImportedAt,
    importedBy: item.ImportedBy,
    importedByName: item.ImportedByName,
    sourceDocumentId: item.SourceDocumentId,
    sourceDocumentUrl: item.SourceDocumentUrl,
    sourceFileName: item.SourceFileName,
  };
}
```

---

## Azure Functions Specification

### `seedImportBatch` — Batch Upsert Endpoint

**Route:** `POST /api/data-seeding/batch`

**Purpose:** Receives a batch of transformed destination record objects and upserts them via the appropriate module's data layer. The function dispatches to the correct module API based on `recordType`.

**Request body:**
```json
{
  "recordType": "bd-lead",
  "rows": [/* array of destination record objects */],
  "importId": "import-abc123",
  "batchIndex": 0
}
```

**Response:**
```json
{
  "batchIndex": 0,
  "importedCount": 48,
  "failedCount": 2,
  "errors": [
    { "row": 12, "column": "leadOwner", "value": "Unknown User", "error": "User not found in Azure AD" }
  ]
}
```

**Implementation notes:**
- Dispatch table: `recordType → ModuleApi.upsertBatch()` (must be registered for each module that supports seeding)
- Use `Promise.allSettled` for the batch to collect partial failures without aborting
- Return 200 even for partial failures (the ISeedBatchResult shape covers this)
- Azure AD lookup failures are per-row errors, not hard function failures

---

### `seedParse` — Large-File Streaming Endpoint

**Route:** `POST /api/data-seeding/parse`

**Purpose:** Downloads a seed file from SharePoint (already stored per D-06) and parses it on the server. Returns headers + rows as JSON. Used for files ≥ `SEED_LARGE_FILE_THRESHOLD_BYTES`.

**Request body:**
```json
{
  "format": "xlsx",
  "documentId": "doc-abc123"
}
```

**Response:**
```json
{
  "headers": ["Project Name", "Start Date", "Owner", "..."],
  "rows": [
    { "Project Name": "Harbor View Tower", "Start Date": "2026-01-15", "...": "..." }
  ],
  "rowCount": 312
}
```

**Implementation notes:**
- Uses `@pnp/sp` to download the file bytes from SharePoint by `documentId`
- Applies the same parser logic as client-side: SheetJS for xlsx, native split for csv, JSON.parse for json/procore-export
- Streams response as JSON (not chunked streaming) — 312 rows is the largest expected production case
- Return 413 if file exceeds 100MB with a descriptive error message

---

### `seedComplete` — Import Completion Record

**Route:** `POST /api/data-seeding/complete`

**Purpose:** Creates the `HBC_SeedImports` list item for the completed import. Optionally triggers a Digest notification to the importing admin (D-07 integration via `@hbc/notification-intelligence` server-side event).

**Request body:** See `IImportCompleteRequest` in SeedApi.ts above.

**Response:**
```json
{ "importId": "import-abc123" }
```

---

### `seedHistory` — Import History Query

**Route:** `GET /api/data-seeding/history?recordType={recordType}`

**Purpose:** Returns the import history for a given record type from `HBC_SeedImports`, newest first.

**Response:** Array of `IRawSeedListItem` (mapped by client to `ISeedHistoryEntry`).

---

### `seedHistoryGet` — Single Import Record

**Route:** `GET /api/data-seeding/history/{importId}`

**Purpose:** Returns a single import record by `importId`.

---

## Verification Commands

```bash
# Type-check SeedApi
pnpm --filter @hbc/data-seeding check-types

# Unit test SeedApi (all methods mocked)
pnpm --filter @hbc/data-seeding test -- --grep "SeedApi"

# Confirm SeedApi is exported from package root
node -e "import('@hbc/data-seeding').then(m => console.log('SeedApi:', typeof m.SeedApi))"
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF09-T04 not yet started.
The seedImportBatch Azure Function requires a dispatch table registration
mechanism that must be designed before implementing consuming module configs.
Next: SF09-T05-Hooks.md
-->
