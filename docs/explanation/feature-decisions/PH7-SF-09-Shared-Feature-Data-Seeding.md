# PH7-SF-09: `@hbc/data-seeding` — Structured Data Import & Initial State Population

**Priority Tier:** 2 — Application Layer (required before production onboarding)
**Package:** `packages/data-seeding/`
**Interview Decision:** Q7 — Option B confirmed
**Mold Breaker Source:** UX-MB §5 (Offline-Safe Workflows); ux-mold-breaker.md Signature Solution #5; con-tech-ux-study §10.4 (Form State Preservation — cold-start problem)

---

## Problem Solved

Every new HB Intel deployment faces a cold-start problem: the system is only valuable when it contains real data (projects, leads, pursuits, staff assignments), but the platform has no mechanism for importing that data from existing systems (Excel spreadsheets, legacy PM software, email exports). Without a structured import layer:

- Project Managers must manually re-enter every active project on day one
- BD staff must re-enter every active lead and pursuit
- Historical data (won/lost bids, prior project performance) is unavailable for benchmarking
- Estimating Coordinators have no way to populate initial bid calendars

**Confirmed Phase 7 seeding use cases:**
- Estimating: import active bid calendar from Excel
- BD: import active leads from CRM export or Excel
- Project Hub: import active projects with key dates and staff assignments
- Admin: bulk-import user accounts and role assignments
- Living Strategic Intelligence: seed historical project win/loss data

---

## Mold Breaker Rationale

The ux-mold-breaker.md Signature Solution #5 (Offline-Safe Workflows) specifies: "The system must accept data in any state of connectivity and resolve it correctly." The cold-start onboarding experience is the highest-stakes connectivity event — the initial import. The con-tech UX study §10.4 identifies form state preservation as the highest-impact PWA opportunity; bulk data import with progress tracking and resumable uploads is the onboarding manifestation of the same principle.

`@hbc/data-seeding` makes structured, validated, resumable data import a platform-wide primitive, ensuring that HB Intel can be fully operational on day one without months of manual data entry.

---

## Applicable Modules

| Module | Seed Target | Source Formats |
|---|---|---|
| Business Development | Active leads | Excel (.xlsx), CSV |
| Estimating | Active pursuits, bid calendar | Excel (.xlsx), CSV |
| Project Hub | Active projects, staff assignments | Excel (.xlsx), Procore export (JSON) |
| Admin | User accounts, role assignments | CSV, Azure AD group export |
| Strategic Intelligence | Historical win/loss data | Excel (.xlsx) |
| `@hbc/sharepoint-docs` | Routes uploaded seed files to staging area | (internal) |

---

## Interface Contract

```typescript
// packages/data-seeding/src/types/IDataSeeding.ts

export type SeedFormat = 'xlsx' | 'csv' | 'json' | 'procore-export';
export type SeedStatus = 'idle' | 'validating' | 'previewing' | 'importing' | 'complete' | 'failed' | 'partial';

export interface ISeedFieldMapping<TSource, TDest> {
  /** Source column name (as it appears in the import file) */
  sourceColumn: string;
  /** Destination field key on the HB Intel record type */
  destinationField: keyof TDest;
  /** Human-readable label for the mapping UI */
  label: string;
  /** Whether this mapping is required for the import to proceed */
  required: boolean;
  /** Transform function applied to source value before assignment */
  transform?: (rawValue: string) => unknown;
  /** Validation function: returns null if valid, error string if not */
  validate?: (rawValue: string) => string | null;
}

export interface ISeedConfig<TSource, TDest> {
  /** Human-readable name for this seed type */
  name: string;
  /** Target record type */
  recordType: string;
  /** Accepted file formats */
  acceptedFormats: SeedFormat[];
  /** Field mapping definitions */
  fieldMappings: ISeedFieldMapping<TSource, TDest>[];
  /** Auto-detect column mapping from header row */
  autoMapHeaders?: boolean;
  /** Maximum rows per import batch */
  batchSize?: number;
  /** Whether to allow partial import (some rows succeed, some fail) */
  allowPartialImport?: boolean;
  /** Called for each successfully imported record */
  onRecordImported?: (record: TDest) => void;
  /** Called when import completes */
  onImportComplete?: (result: ISeedResult) => void;
}

export interface ISeedValidationError {
  row: number;
  column: string;
  value: string;
  error: string;
}

export interface ISeedResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  skippedCount: number;
  errors: ISeedValidationError[];
  importedAt: string;
  importedBy: string;
}
```

---

## Package Architecture

```
packages/data-seeding/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── IDataSeeding.ts
│   │   └── index.ts
│   ├── parsers/
│   │   ├── XlsxParser.ts                 # parse Excel sheets to row arrays
│   │   ├── CsvParser.ts                  # parse CSV to row arrays
│   │   └── ProcoreExportParser.ts        # parse Procore JSON export format
│   ├── api/
│   │   └── SeedApi.ts                    # batch import endpoint wrapper
│   ├── hooks/
│   │   ├── useSeedImport.ts              # manages file → validate → preview → import flow
│   │   └── useSeedHistory.ts             # lists prior imports for a record type
│   └── components/
│       ├── HbcSeedUploader.tsx           # file upload + format detection
│       ├── HbcSeedMapper.tsx             # column-to-field mapping UI
│       ├── HbcSeedPreview.tsx            # preview table with validation errors highlighted
│       ├── HbcSeedProgress.tsx           # real-time import progress
│       └── index.ts
```

---

## Component Specifications

### `HbcSeedUploader` — File Upload & Format Detection

```typescript
interface HbcSeedUploaderProps<TSource, TDest> {
  config: ISeedConfig<TSource, TDest>;
  onFileLoaded: (rows: TSource[], detectedHeaders: string[]) => void;
}
```

**Visual behavior:**
- Drag-and-drop zone accepting configured formats
- Format auto-detected from file extension + MIME type
- On upload: file parsed to row array → `onFileLoaded` called
- Shows file name, row count, detected format

### `HbcSeedMapper` — Column-to-Field Mapping UI

```typescript
interface HbcSeedMapperProps<TSource, TDest> {
  config: ISeedConfig<TSource, TDest>;
  detectedHeaders: string[];
  onMappingConfirmed: (mappings: Record<string, keyof TDest>) => void;
}
```

**Visual behavior:**
- Two-column table: Source Column (detected from file) | HB Intel Field (dropdown selector)
- Auto-map: if `autoMapHeaders` is true, fuzzy-matches column names to field labels
- Required fields highlighted in amber until mapped
- Unmapped optional columns shown as "Not imported"

### `HbcSeedPreview` — Preview Table with Validation

```typescript
interface HbcSeedPreviewProps<TSource, TDest> {
  rows: TSource[];
  mappings: Record<string, keyof TDest>;
  config: ISeedConfig<TSource, TDest>;
  onImportConfirmed: () => void;
}
```

**Visual behavior:**
- Data table showing first N rows (configurable preview count)
- Validation errors highlighted in red cells with error tooltip
- Summary: "48 rows ready to import, 3 rows have errors"
- If `allowPartialImport`: "Import 48 rows, skip 3 errors" CTA available
- Otherwise: all errors must be resolved before import CTA is enabled

### `HbcSeedProgress` — Import Progress Indicator

```typescript
interface HbcSeedProgressProps {
  totalRows: number;
  importedRows: number;
  errorRows: number;
  status: SeedStatus;
  onRetryErrors?: () => void;
}
```

**Visual behavior:**
- Progress bar with imported count and percentage
- Error rows shown in red section of bar
- On completion: result summary with error detail download (CSV of failed rows + error reasons)
- Retry failed rows CTA if `allowPartialImport`

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/sharepoint-docs` | Uploaded seed files stored in `System` context folder; imported files linked to HbcDocumentRegistry |
| `@hbc/versioned-record` | First imported version of each record tagged `tag: 'imported'` |
| `@hbc/notification-intelligence` | Import completion → Digest notification to admin who initiated import |
| `@hbc/complexity` | Full import UI (mapper, preview) available only in Standard+; Essential shows simplified uploader only |

---

## SPFx Constraints

- `HbcSeedUploader` and `HbcSeedMapper` are PWA-primary (Admin module)
- File parsing (`XlsxParser`, `CsvParser`) runs client-side using SheetJS — no server-side parsing required for files <10MB
- Files >10MB route through Azure Functions streaming endpoint
- SPFx webpart variant not required (seeding is an Admin-only, one-time operation)

---

## Priority & ROI

**Priority:** P1 — Required for production onboarding; without it, each customer requires weeks of manual data entry before the platform is usable
**Estimated build effort:** 4–5 sprint-weeks (parsers, four components, validation engine, batch import API)
**ROI:** Reduces onboarding time from weeks to hours; enables immediate historical benchmarking; eliminates the "empty system" trust problem that causes adoption failures

---

## Definition of Done

- [ ] `ISeedConfig<TSource, TDest>` contract defined and exported
- [ ] `XlsxParser` parses Excel sheets to typed row arrays using SheetJS
- [ ] `CsvParser` parses CSV with header detection
- [ ] `ProcoreExportParser` parses Procore JSON export format for project records
- [ ] `HbcSeedUploader` handles drag-drop, format detection, and row count display
- [ ] `HbcSeedMapper` auto-maps headers and allows manual override
- [ ] `HbcSeedPreview` renders first N rows with validation error highlighting
- [ ] `HbcSeedProgress` shows real-time import progress with error row tracking
- [ ] `allowPartialImport` mode: skip errors, import valid rows, download error report
- [ ] Files >10MB routed through Azure Functions streaming endpoint
- [ ] `@hbc/sharepoint-docs` integration: seed files stored in System context
- [ ] `@hbc/versioned-record` integration: imported records tagged `'imported'`
- [ ] Unit tests ≥95% on all parsers and validation logic
- [ ] E2E test: Excel upload → map → preview → import → records appear in module

---

## ADR Reference

Create `docs/architecture/adr/0018-data-seeding-import-primitive.md` documenting the decision to implement structured import as a shared package, the client-side parsing strategy using SheetJS, the batch import pattern, and the Procore export format support rationale.
