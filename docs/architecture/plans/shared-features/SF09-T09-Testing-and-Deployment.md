# SF09-T09 — Testing Strategy and Deployment: `@hbc/data-seeding`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-09-Shared-Feature-Data-Seeding.md`
**Decisions Applied:** All D-01 through D-10
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T01–T08

> **Doc Classification:** Canonical Normative Plan — SF09-T09 testing/deployment task; sub-plan of `SF09-Data-Seeding.md`.

---

## Objective

Implement the `@hbc/data-seeding/testing` sub-path with canonical fixtures and state factories. Write unit tests for all parsers, the validation engine, hooks, and components. Write Playwright E2E scenarios covering the full import lifecycle. Gate all mechanical enforcement checks, produce ADR-0094, and publish the developer adoption guide and API reference.

---

## 3-Line Plan

1. Implement the `testing/` sub-path: `createMockSeedConfig`, `createMockSeedResult`, `createMockValidationError`, `createMockSeedRow`, and `mockSeedStatuses` (7 canonical states).
2. Write unit tests for `XlsxParser`, `CsvParser`, `ProcoreExportParser`, `autoMapHeaders`, `validateRow`, `useSeedImport`, `useSeedHistory`, and all four components; produce Storybook stories and 5 Playwright E2E scenarios.
3. Run all four mechanical enforcement gates, create ADR-0094, and publish `docs/how-to/developer/data-seeding-adoption-guide.md` and `docs/reference/data-seeding/api.md`.

---

## Testing Sub-Path: `testing/`

### `testing/createMockSeedConfig.ts`

```typescript
import type { ISeedConfig } from '../src/types';

export function createMockSeedConfig<
  TSource extends Record<string, string> = Record<string, string>,
  TDest extends Record<string, unknown> = Record<string, unknown>
>(overrides: Partial<ISeedConfig<TSource, TDest>> = {}): ISeedConfig<TSource, TDest> {
  return {
    name: 'Test Import',
    recordType: 'test-record',
    acceptedFormats: ['xlsx', 'csv'],
    autoMapHeaders: true,
    allowPartialImport: true,
    batchSize: 10,
    fieldMappings: [
      {
        sourceColumn: 'Name',
        destinationField: 'name' as keyof TDest,
        label: 'Name',
        required: true,
      },
      {
        sourceColumn: 'Email',
        destinationField: 'email' as keyof TDest,
        label: 'Email Address',
        required: false,
        validate: (val) => {
          if (!val) return null;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
            ? null
            : 'Invalid email format';
        },
      },
      {
        sourceColumn: 'Value',
        destinationField: 'value' as keyof TDest,
        label: 'Numeric Value',
        required: false,
        transform: (val) => parseFloat(val) || null,
      },
    ],
    onRecordImported: undefined,
    onImportComplete: undefined,
    ...overrides,
  };
}
```

### `testing/createMockSeedRow.ts`

```typescript
let rowCounter = 0;

export function createMockSeedRow(
  overrides: Record<string, string> = {}
): Record<string, string> {
  rowCounter++;
  return {
    Name: `Test Company ${rowCounter}`,
    Email: `contact${rowCounter}@example.com`,
    Value: String(rowCounter * 10000),
    ...overrides,
  };
}
```

### `testing/createMockValidationError.ts`

```typescript
import type { ISeedValidationError } from '../src/types';

let errorCounter = 0;

export function createMockValidationError(
  overrides: Partial<ISeedValidationError> = {}
): ISeedValidationError {
  errorCounter++;
  return {
    row: errorCounter,
    column: 'Email',
    value: `bad-email-${errorCounter}`,
    error: 'Invalid email format',
    ...overrides,
  };
}
```

### `testing/createMockSeedResult.ts`

```typescript
import type { ISeedResult } from '../src/types';
import { createMockValidationError } from './createMockValidationError';

export function createMockSeedResult(
  overrides: Partial<ISeedResult> = {}
): ISeedResult {
  return {
    totalRows: 50,
    successCount: 48,
    errorCount: 2,
    skippedCount: 0,
    errors: [
      createMockValidationError({ row: 12, column: 'Email', value: 'not-an-email' }),
      createMockValidationError({ row: 37, column: 'Value', value: 'N/A' }),
    ],
    importedAt: '2026-01-15T10:00:00Z',
    importedBy: 'user-admin-001',
    sourceDocumentId: 'doc-seed-001',
    sourceDocumentUrl: 'https://sp.example.com/system/test-import.xlsx',
    ...overrides,
  };
}
```

### `testing/mockSeedStatuses.ts`

```typescript
import type { SeedStatus } from '../src/types';

/**
 * Canonical set of 7 SeedStatus fixtures — one per status value.
 *
 * State machine:
 *   idle → validating → previewing → importing → complete | partial | failed
 *
 * D-10: These are the standardized test states for all component and hook tests.
 */
export interface MockSeedStatuses {
  idle: SeedStatus;
  validating: SeedStatus;
  previewing: SeedStatus;
  importing: SeedStatus;
  complete: SeedStatus;
  partial: SeedStatus;
  failed: SeedStatus;
}

export const mockSeedStatuses: MockSeedStatuses = {
  idle: 'idle',
  validating: 'validating',
  previewing: 'previewing',
  importing: 'importing',
  complete: 'complete',
  partial: 'partial',
  failed: 'failed',
};
```

---

## Unit Tests

### Parser Tests

```typescript
// src/parsers/__tests__/XlsxParser.test.ts
describe('XlsxParser', () => {
  it('parses a small Excel file to row arrays', async () => { /* ... */ });
  it('strips empty rows', async () => { /* ... */ });
  it('returns parsedOnServer: true for large files (D-01)', async () => {
    const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.xlsx');
    const result = await XlsxParser.parse(largeFile);
    expect(result.parsedOnServer).toBe(true);
    expect(result.rows).toHaveLength(0);
  });
  it('peekHeaders reads only first row', async () => { /* ... */ });
});

// src/parsers/__tests__/CsvParser.test.ts
describe('CsvParser', () => {
  it('parses standard CSV with headers', async () => { /* ... */ });
  it('handles quoted fields with embedded commas', async () => { /* ... */ });
  it('handles Windows CRLF line endings', async () => { /* ... */ });
  it('strips UTF-8 BOM', async () => { /* ... */ });
  it('filters empty rows', async () => { /* ... */ });
  it('returns parsedOnServer: true for large files (D-01)', async () => { /* ... */ });
});

// src/parsers/__tests__/ProcoreExportParser.test.ts
describe('ProcoreExportParser', () => {
  it('parses valid Procore project JSON export (D-08)', async () => { /* ... */ });
  it('throws for non-Procore JSON', async () => { /* ... */ });
  it('maps all required Procore project fields', async () => { /* ... */ });
  it('handles missing optional fields gracefully', async () => { /* ... */ });
  it('returns parsedOnServer: true for large files', async () => { /* ... */ });
});
```

### Validation Tests

```typescript
// src/validation/__tests__/autoMapHeaders.test.ts
describe('autoMapHeaders', () => {
  it('maps exact header matches (D-02)', () => {
    const config = createMockSeedConfig();
    const result = autoMapHeaders(['Name', 'Email', 'Value'], config.fieldMappings);
    expect(result['Name']).toBe('name');
    expect(result['Email']).toBe('email');
    expect(result['Value']).toBe('value');
  });

  it('fuzzy-matches similar header names at ≥0.8 threshold (D-02)', () => {
    const config = createMockSeedConfig();
    // "Company Name" is close enough to "Name" to auto-map (Levenshtein)
    const result = autoMapHeaders(['Contact Email', 'Full Name', 'Amount'], config.fieldMappings);
    expect(result['Contact Email']).toBe('email');
  });

  it('does not match headers below the 0.8 threshold', () => {
    const config = createMockSeedConfig();
    const result = autoMapHeaders(['XYZ123', 'ABCDEF', 'GHIJKL'], config.fieldMappings);
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('does not map two headers to the same destination field', () => {
    const config = createMockSeedConfig();
    const result = autoMapHeaders(['Name', 'Full Name'], config.fieldMappings);
    const mappedValues = Object.values(result);
    expect(new Set(mappedValues).size).toBe(mappedValues.length);
  });
});

// src/validation/__tests__/validateRow.test.ts
describe('validateRow', () => {
  it('returns isValid: true for a valid row (D-03)', () => { /* ... */ });
  it('surfaces required field error for empty required column', () => { /* ... */ });
  it('runs custom validate function and surfaces error (D-03)', () => { /* ... */ });
  it('marks email field invalid for bad email value', () => { /* ... */ });
  it('returns multiple errors for multiple invalid fields', () => { /* ... */ });
  it('does not error on unmapped optional fields', () => { /* ... */ });
});
```

### Hook Tests

```typescript
// src/hooks/__tests__/useSeedImport.test.ts
describe('useSeedImport', () => {
  it('starts in idle state', () => { /* ... */ });
  it('transitions to validating after file selected', async () => { /* ... */ });
  it('transitions to previewing after successful file parse', async () => { /* ... */ });
  it('re-runs validation when mapping confirmed (D-03)', async () => { /* ... */ });
  it('imports all rows when all valid', async () => { /* ... */ });
  it('skips invalid rows when allowPartialImport: true (D-04)', async () => { /* ... */ });
  it('blocks import when allowPartialImport: false and errors exist (D-04)', async () => { /* ... */ });
  it('updates importedCount per batch (D-05)', async () => { /* ... */ });
  it('transitions to partial when some rows fail (D-04)', async () => { /* ... */ });
  it('transitions to failed on SeedApi hard error', async () => { /* ... */ });
  it('resets to idle on onReset call', async () => { /* ... */ });
});
```

### Component Tests

```typescript
// HbcSeedUploader:
// - renders drag-drop zone
// - calls onFileLoaded after successful small-file parse
// - shows uploading state for large files (D-01)
// - shows error state for unsupported format
// - shows replace button in ready state

// HbcSeedMapper:
// - returns null in Essential complexity tier (D-09)
// - renders two-column table with auto-mapped dropdowns
// - highlights required unmapped fields in amber
// - disables Confirm button until all required fields mapped
// - calls onMappingConfirmed with correct mapping on confirm

// HbcSeedPreview:
// - renders simplified count summary in Essential (D-09)
// - renders first 20 rows in Standard
// - renders first 50 rows in Expert
// - highlights error cells in red
// - shows "Import N rows, skip M errors" CTA when allowPartialImport: true
// - disables CTA when allowPartialImport: false and errors exist

// HbcSeedProgress:
// - renders progress bar with correct segment widths
// - shows error report download link after partial/complete with errors (D-04)
// - shows Retry button for partial status when onRetryErrors provided
// - renders per-batch detail in Expert complexity (D-05)
```

---

## Playwright E2E Scenarios

### Scenario 1 — Full Excel import: upload → map → preview → import → complete

```typescript
test('BD leads: full Excel import lifecycle', async ({ page }) => {
  await page.goto('/dev-harness/admin/data-import/bd-lead');

  // Upload Excel file
  const fileInput = page.locator('[data-testid="hbc-seed-uploader-input"]');
  await fileInput.setInputFiles('e2e/fixtures/bd-leads-sample.xlsx');

  // Confirm file loaded
  await expect(page.locator('[data-testid="hbc-seed-uploader-ready"]')).toBeVisible();
  await expect(page.locator('[data-testid="hbc-seed-uploader-row-count"]')).toContainText('48');

  // Confirm mapper renders (Standard complexity)
  await expect(page.locator('[data-testid="hbc-seed-mapper"]')).toBeVisible();

  // At least 4 auto-mapped fields
  const confirmedButton = page.locator('[data-testid="hbc-seed-mapper-confirm-button"]');
  await expect(confirmedButton).not.toBeDisabled();
  await confirmedButton.click();

  // Preview rendered with rows
  await expect(page.locator('[data-testid="hbc-seed-preview"]')).toBeVisible();
  await expect(page.locator('[data-testid="hbc-seed-preview-summary-bar"]')).toBeVisible();

  // Confirm import
  await page.click('[data-testid="hbc-seed-preview-confirm-button"]');

  // Progress bar visible
  await expect(page.locator('[data-testid="hbc-seed-progress-bar"]')).toBeVisible();

  // Wait for completion
  await expect(page.locator('[data-testid="hbc-seed-progress-status"]')).toHaveText(
    /Import Complete/i,
    { timeout: 15_000 }
  );

  // Verify imported records appear in BD module
  await page.goto('/dev-harness/business-development/leads');
  await expect(page.locator('[data-testid="leads-list-item"]').first()).toBeVisible();
});
```

### Scenario 2 — Partial import: errors skipped, error report downloadable (D-04)

```typescript
test('Partial import: valid rows imported, error rows in report', async ({ page }) => {
  await page.goto('/dev-harness/admin/data-import/bd-lead');

  // Fixture has 2 intentional email validation errors
  const fileInput = page.locator('[data-testid="hbc-seed-uploader-input"]');
  await fileInput.setInputFiles('e2e/fixtures/bd-leads-with-errors.xlsx');

  await page.click('[data-testid="hbc-seed-mapper-confirm-button"]');

  // Preview shows error count
  await expect(page.locator('[data-testid="hbc-seed-preview-summary-bar"]')).toContainText('2 errors');
  await expect(page.locator('[data-testid="hbc-seed-preview-confirm-button"]')).toContainText(
    'skip 2'
  );

  await page.click('[data-testid="hbc-seed-preview-confirm-button"]');
  await expect(page.locator('[data-testid="hbc-seed-progress-status"]')).toHaveText(
    /with errors/i,
    { timeout: 15_000 }
  );

  // Error report link visible
  await expect(page.locator('[data-testid="hbc-seed-progress-error-report-link"]')).toBeVisible();
});
```

### Scenario 3 — Procore JSON export import for Project Hub (D-08)

```typescript
test('Project Hub: Procore JSON export import', async ({ page }) => {
  await page.goto('/dev-harness/admin/data-import/project-record');

  const fileInput = page.locator('[data-testid="hbc-seed-uploader-input"]');
  await fileInput.setInputFiles('e2e/fixtures/procore-export-sample.json');

  await expect(page.locator('[data-testid="hbc-seed-uploader-ready"]')).toBeVisible();
  // Procore format detected
  await expect(page.locator('[data-testid="hbc-seed-uploader-ready"]')).toContainText(
    'Procore Export'
  );

  await page.click('[data-testid="hbc-seed-mapper-confirm-button"]');
  await page.click('[data-testid="hbc-seed-preview-confirm-button"]');

  await expect(page.locator('[data-testid="hbc-seed-progress-status"]')).toHaveText(
    /Import Complete/i,
    { timeout: 20_000 }
  );
});
```

### Scenario 4 — Essential complexity: simplified flow (D-09)

```typescript
test('Essential complexity: no Mapper or Preview rendered', async ({ page }) => {
  await page.goto('/dev-harness/settings');
  await page.click('[data-testid="complexity-essential"]');
  await page.goto('/dev-harness/admin/data-import/bd-lead');

  const fileInput = page.locator('[data-testid="hbc-seed-uploader-input"]');
  await fileInput.setInputFiles('e2e/fixtures/bd-leads-sample.xlsx');

  await expect(page.locator('[data-testid="hbc-seed-uploader-ready"]')).toBeVisible();

  // Mapper NOT rendered (D-09)
  await expect(page.locator('[data-testid="hbc-seed-mapper"]')).not.toBeVisible();

  // Preview shows simplified row count (Essential)
  await expect(page.locator('[data-testid="hbc-seed-preview--essential"]')).toBeVisible();

  await page.click('[data-testid="hbc-seed-preview-confirm-button"]');
  await expect(page.locator('[data-testid="hbc-seed-progress-status"]')).toHaveText(
    /Import Complete/i,
    { timeout: 15_000 }
  );
});
```

### Scenario 5 — Large file: server-side parse (D-01)

```typescript
test('Large file (>10MB): routes through server-side parse', async ({ page }) => {
  await page.goto('/dev-harness/admin/data-import/bd-lead');

  // Fixture is >10MB
  const fileInput = page.locator('[data-testid="hbc-seed-uploader-input"]');
  await fileInput.setInputFiles('e2e/fixtures/bd-leads-large.xlsx');

  // Shows uploading state
  await expect(page.locator('[data-testid="hbc-seed-uploader-uploading"]')).toBeVisible();

  // After upload, shows ready with row count from server parse
  await expect(page.locator('[data-testid="hbc-seed-uploader-ready"]')).toBeVisible({
    timeout: 30_000,
  });

  // Proceed with normal flow
  await page.click('[data-testid="hbc-seed-mapper-confirm-button"]');
  await page.click('[data-testid="hbc-seed-preview-confirm-button"]');
  await expect(page.locator('[data-testid="hbc-seed-progress-status"]')).toHaveText(
    /Import Complete|with errors/i,
    { timeout: 60_000 }
  );
});
```

---

## Pre-Deployment Checklist (30 items)

### Architecture & Boundary
- [ ] `@hbc/data-seeding` has zero imports of `@hbc/versioned-record`
- [ ] `@hbc/data-seeding` has zero imports of `@hbc/notification-intelligence`
- [ ] `@hbc/data-seeding` has zero imports of `@hbc/bic-next-move`
- [ ] `@hbc/data-seeding` has zero imports of any `packages/features/*` module
- [ ] SheetJS (`xlsx`) is imported only in `src/parsers/XlsxParser.ts`
- [ ] Architecture boundary grep commands (T08) all return zero matches

### Type Safety
- [ ] Zero TypeScript errors: `pnpm --filter @hbc/data-seeding check-types`
- [ ] `ISeedConfig<TSource, TDest>` generic propagates through `useSeedImport`, components
- [ ] `autoMapHeaders` inference resolves `keyof TDest` correctly
- [ ] `validateRow` rowMeta type includes correct `ISeedRowMeta` shape

### Build & Package
- [ ] Build succeeds: `pnpm --filter @hbc/data-seeding build`
- [ ] Both entry points present: `dist/index.js`, `dist/testing/index.js`
- [ ] `testing/` sub-path excluded from production bundle
- [ ] SheetJS tree-shaken from bundles that don't use xlsx format (verify with build analysis)
- [ ] Turbo build with all consuming modules passes: `pnpm turbo run build --filter packages/business-development...`

### Tests
- [ ] All unit tests pass: `pnpm --filter @hbc/data-seeding test`
- [ ] Coverage thresholds met: `lines: 95, branches: 95, functions: 95, statements: 95`
- [ ] `XlsxParser`, `CsvParser`, `ProcoreExportParser` each tested with real fixture files
- [ ] `autoMapHeaders` tested at/above/below the 0.8 threshold
- [ ] `validateRow` tested for required field, custom validate, and multi-error scenarios
- [ ] `useSeedImport` all 7 status transitions covered
- [ ] All 5 Playwright E2E scenarios passing

### Storage & API
- [ ] `HBC_SeedImports` SharePoint list provisioned with all 15 columns
- [ ] Both compound indexes created
- [ ] All 4 Azure Functions deployed to dev environment
- [ ] Large-file path tested: file >10MB correctly routed through `seedParse` endpoint
- [ ] Import history queryable: `useSeedHistory('bd-lead')` returns results in dev

### Integration
- [ ] `DocumentApi.uploadToSystemContext` exists in `@hbc/sharepoint-docs`
- [ ] Seed file appears in SharePoint System context folder after upload
- [ ] Notification Digest fires to admin after `seedComplete` (dev-harness notification feed)
- [ ] Dev-harness 16-step validation sequence completed (T08)

### Documentation
- [ ] `docs/architecture/adr/0094-data-seeding-import-primitive.md` written and accepted
- [ ] `docs/how-to/developer/data-seeding-adoption-guide.md` written
- [ ] `docs/reference/data-seeding/api.md` written
- [ ] `packages/data-seeding/README.md` written (see Package README section below)
- [ ] `docs/README.md` ADR index updated with ADR-0094 entry (see ADR Index Update section below)
- [ ] `current-state-map.md §2` updated with SF09 classification row

---

## ADR-0094: Data Seeding Import Primitive

**File:** `docs/architecture/adr/0094-data-seeding-import-primitive.md`

```markdown
# ADR-0094 — Data Seeding Import Primitive

**Status:** Accepted
**Date:** 2026-03-10
**Deciders:** HB Intel Architecture Team
**Supersedes:** None
**Note:** Source spec (PH7-SF-09) referenced ADR-0018. All ADR numbers below ADR-0091 are
reserved (CLAUDE.md §7). ADR-0091–ADR-0093 are assigned. The canonical ADR for SF-09 is
ADR-0094. Source spec ADR-0018 reference is superseded by this document.

## Context

HB Intel deployments face a cold-start problem: the platform has no mechanism to import
existing data from Excel, CSV, or legacy PM software (e.g., Procore). Without a structured
import layer, onboarding requires weeks of manual data entry before the platform provides
value. `@hbc/data-seeding` solves this by making validated, resumable bulk import a
platform-wide primitive.

## Decisions

### D-01 — Client-Side Parsing + Server-Side Fallback
Files <10MB are parsed client-side using SheetJS (xlsx) and native CSV parsing.
Files ≥10MB are uploaded to SharePoint first, then parsed by the `seedParse` Azure Function.

### D-02 — Fuzzy Header Auto-Mapping (Threshold 0.8)
Auto-mapping uses normalized Levenshtein similarity ≥ 0.8. User can override any auto-map.

### D-03 — Validate-on-Map + Full-Pass Validation
Validation runs when each mapping is confirmed, and again as a full pass before import.

### D-04 — Opt-In Partial Import
`allowPartialImport: true` in ISeedConfig skips invalid rows and collects them in a CSV report.
Default is false (all errors must be resolved).

### D-05 — Configurable Batch Size
Default 50 rows per batch. Progress updated after each batch. Configurable via batchSize.

### D-06 — SharePoint System Context Storage Before Parsing
All seed files stored in SharePoint System context before any parsing begins.
The stored file is the audit source-of-truth for the import.

### D-07 — Versioned-Record Snapshot Tagged 'imported'
First imported version of each record tagged `tag: 'imported'`. Integration opt-in.
`@hbc/data-seeding` does NOT import `@hbc/versioned-record` directly.

### D-08 — First-Class Procore Export Parser
ProcoreExportParser handles Procore project JSON export format for Project Hub seeding.

### D-09 — Complexity Gating: Mapper and Preview Standard+ Only
Essential shows simplified uploader + row count confirm. Standard/Expert show full 5-step flow.

### D-10 — Testing Sub-Path: `@hbc/data-seeding/testing`
7 canonical fixtures: createMockSeedConfig, createMockSeedResult, createMockValidationError,
createMockSeedRow, mockSeedStatuses. Excluded from production bundle.

## Compliance

This ADR is locked by CLAUDE.md §6.3. May only be reversed by a superseding ADR.
```

---

## Developer Adoption Guide

**File:** `docs/how-to/developer/data-seeding-adoption-guide.md`

Key sections:
1. When to add seeding to a module (onboarding requirement vs. one-time admin operation)
2. Implementing `ISeedConfig<TSource, TDest>` — field mappings, transforms, validate functions
3. Mounting the orchestrating component in the Admin module
4. Handling the large-file path (`onLargeFileUploaded`)
5. Wiring versioned-record snapshot after import (D-07 opt-in)
6. Using `@hbc/data-seeding/testing` factories in module tests

---

## API Reference

**File:** `docs/reference/data-seeding/api.md`

| Export | Type | Description |
|--------|------|-------------|
| `ISeedConfig<TSource, TDest>` | Interface | Config object supplied by consuming module |
| `ISeedFieldMapping<TSource, TDest>` | Interface | Single column → field mapping definition |
| `ISeedResult` | Interface | Aggregate import result |
| `ISeedValidationError` | Interface | Single row+column validation error |
| `ISeedRowMeta` | Interface | Per-row validation metadata |
| `ISeedHistoryEntry` | Interface | Single import history record |
| `SeedFormat` | Union type | `'xlsx' \| 'csv' \| 'json' \| 'procore-export'` |
| `SeedStatus` | Union type | 7-state import machine status |
| `XlsxParser` | Object | `parse(file)`, `peekHeaders(file)` |
| `CsvParser` | Object | `parse(file)` |
| `ProcoreExportParser` | Object | `parse(file)`, `isProcoreExport(value)` |
| `autoMapHeaders<S,D>` | Function | Fuzzy header auto-mapping (D-02) |
| `validateRow<S,D>` | Function | Per-row validation engine (D-03) |
| `validateAllRows<S,D>` | Function | Full-pass validation helper |
| `useSeedImport<S,D>` | Hook | Full import state machine |
| `useSeedHistory` | Hook | Import history query |
| `SeedApi` | Object | `importBatch`, `parseStreaming`, `recordCompletion`, `getHistory`, `getImport` |
| `HbcSeedUploader` | Component | Drag-drop file upload with format detection |
| `HbcSeedMapper` | Component | Column mapping UI (Standard+ only, D-09) |
| `HbcSeedPreview` | Component | Preview table with validation (Standard+ only, D-09) |
| `HbcSeedProgress` | Component | Real-time progress bar + result summary |
| `SEED_BATCH_SIZE_DEFAULT` | Constant | `50` |
| `SEED_LARGE_FILE_THRESHOLD_BYTES` | Constant | `10 * 1024 * 1024` |
| `seedStatusLabel` | Constant | Display label per `SeedStatus` |
| `seedStatusColorClass` | Constant | CSS color class per `SeedStatus` |
| `buildAcceptString` | Function | File input accept string from accepted formats |
| `detectFormat` | Function | Detect `SeedFormat` from `File` object |
| `createMockSeedConfig<S,D>` | Testing factory | Minimal mock ISeedConfig |
| `createMockSeedResult` | Testing factory | ISeedResult with 48 success + 2 errors |
| `createMockValidationError` | Testing factory | Single ISeedValidationError |
| `createMockSeedRow` | Testing factory | Single row as string record |
| `mockSeedStatuses` | Testing constant | All 7 SeedStatus values keyed by name |

---

## Package README

**File:** `packages/data-seeding/README.md`

Create this file as part of the T09 implementation deliverables. It is the primary developer-facing entry point for anyone consuming `@hbc/data-seeding` from the monorepo.

````markdown
# @hbc/data-seeding

Structured, validated, resumable bulk-import primitive for the HB Intel platform.

## Overview

`@hbc/data-seeding` implements a 7-state import machine (`idle → validating → previewing → importing → complete | partial | failed`) with client-side parsing (Excel, CSV, Procore JSON), fuzzy header auto-mapping, per-field validation, and full Azure Functions backend for large-file and batch operations.

**Locked ADR:** ADR-0094 — `docs/architecture/adr/0094-data-seeding-import-primitive.md`

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

// 1. Implement ISeedConfig<TSource, TDest> for your import
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

// 2. Wire components in your import route
function MyImportPage() {
  const { state, onFileSelected, onMappingsConfirmed, onPreviewConfirmed, startImport } =
    useSeedImport(myImportConfig);

  return (
    <>
      {state.status === 'idle' && <HbcSeedUploader config={myImportConfig} onFileSelected={onFileSelected} />}
      {state.status === 'previewing' && state.file && (
        <HbcSeedMapper config={myImportConfig} headers={state.headers ?? []} mappings={state.fieldMappings} onConfirm={onMappingsConfirmed} />
      )}
      {state.status === 'previewing' && (
        <HbcSeedPreview config={myImportConfig} rows={state.rows ?? []} errors={state.validationErrors} onConfirm={onPreviewConfirmed} />
      )}
      {(state.status === 'importing' || state.status === 'complete' || state.status === 'partial' || state.status === 'failed') && (
        <HbcSeedProgress state={state} config={myImportConfig} onRetry={() => {}} />
      )}
    </>
  );
}
```

> **Essential complexity (D-09):** When `complexity === 'essential'`, `HbcSeedMapper` returns `null` and the Mapper/Preview steps are skipped. Apply field mappings automatically from `config.fieldMappings` and call `onPreviewConfirmed` directly.

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
| `SeedStatus` | Union type | `'idle' \| 'validating' \| 'previewing' \| 'importing' \| 'complete' \| 'partial' \| 'failed'` |
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

> **Note:** The `testing/` sub-path is excluded from the production bundle (`sideEffects: false`). Import only in test files.

---

## Architecture Boundaries

This package **must not** import from:

- `@hbc/versioned-record` — consuming module tags snapshots in their own `onImportComplete` handler
- `@hbc/notification-intelligence` — Azure Function triggers notifications server-side
- `@hbc/bic-next-move` — import state is not governed by BIC directly
- Any `packages/features/*` module

SheetJS (`xlsx`) must be imported **only** in `src/parsers/XlsxParser.ts`.

Verify with:

```bash
grep -r "from 'xlsx'" packages/data-seeding/src/ | grep -v XlsxParser  # expect 0 matches
grep -r "from '@hbc/versioned-record'" packages/data-seeding/src/       # expect 0 matches
```

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
- `docs/architecture/plans/shared-features/SF09-T02-TypeScript-Contracts.md` — Full type definitions
- `docs/architecture/plans/shared-features/SF09-T03-Parsers-and-Validation.md` — Parser implementations
- `docs/architecture/plans/shared-features/SF09-T04-Storage-and-API.md` — SharePoint schema & Azure Functions
- `docs/architecture/plans/shared-features/SF09-T08-Platform-Wiring.md` — Reference ISeedConfig implementations
- `docs/how-to/developer/data-seeding-adoption-guide.md` — Step-by-step wiring guide
- `docs/reference/data-seeding/api.md` — Full API reference
- `docs/architecture/adr/0094-data-seeding-import-primitive.md` — Locked ADR
````

---

## ADR Index Update

**File:** `docs/README.md`

At implementation time, locate the ADR index table in `docs/README.md` (search for the `## Architecture Decision Records` section or the table header `| ADR | Title | Status | Date |`). Append the following row:

```markdown
| [ADR-0094](architecture/adr/0094-data-seeding-import-primitive.md) | Data Seeding Import Primitive | Accepted | 2026-03-10 |
```

If no ADR index table yet exists, create one under `## Architecture Decision Records` with the following structure before appending the row:

```markdown
## Architecture Decision Records

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-0094](architecture/adr/0094-data-seeding-import-primitive.md) | Data Seeding Import Primitive | Accepted | 2026-03-10 |
```

> **Rule (CLAUDE.md §4):** The ADR catalog is append-only. Never delete or renumber existing rows. Always add new rows in ascending ADR number order.

---

## Final Verification Commands

```bash
# ── Mechanical Enforcement Gates (CLAUDE.md §6.3.3) ──────────────────────────

pnpm turbo run build --filter @hbc/data-seeding...
pnpm turbo run lint --filter @hbc/data-seeding...
pnpm --filter @hbc/data-seeding check-types
pnpm --filter @hbc/data-seeding test --coverage

# ── Architecture Boundary Checks ─────────────────────────────────────────────

grep -r "from '@hbc/versioned-record'" packages/data-seeding/src/
grep -r "from '@hbc/notification-intelligence'" packages/data-seeding/src/
grep -r "from '@hbc/bic-next-move'" packages/data-seeding/src/
grep -r "from 'xlsx'" packages/data-seeding/src/ | grep -v XlsxParser
# All expected: zero matches

# ── Integration Build Checks ─────────────────────────────────────────────────

pnpm turbo run build --filter packages/business-development...
pnpm turbo run build --filter packages/estimating...

# ── P1 Gate ───────────────────────────────────────────────────────────────────

pnpm turbo run test \
  --filter=@hbc/auth-core \
  --filter=@hbc/shell \
  --filter=@hbc/ui-kit \
  --filter=@hbc/shared-kernel \
  --filter=@hbc/app-types

# ── Full Gate ─────────────────────────────────────────────────────────────────

pnpm turbo run build && pnpm turbo run lint && pnpm turbo run check-types

# ── Playwright E2E ────────────────────────────────────────────────────────────

pnpm playwright test e2e/data-seeding/

# ── Documentation Deliverables ────────────────────────────────────────────────

# Confirm package README exists
test -f packages/data-seeding/README.md && echo "README OK" || echo "README MISSING"

# Confirm ADR-0094 entry is present in docs/README.md
grep -c "ADR-0094" docs/README.md
```

---

## Blueprint Progress Comment

After all gates pass, add this to `SF09-Data-Seeding.md`:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
SF09 completed: {DATE}
T01–T09 implemented.
All four mechanical enforcement gates passed.
ADR created: docs/architecture/adr/0094-data-seeding-import-primitive.md
Documentation added:
  - docs/how-to/developer/data-seeding-adoption-guide.md
  - docs/reference/data-seeding/api.md
  - packages/data-seeding/README.md  (implementation-time deliverable — see T09 Package README section)
docs/README.md ADR index updated: ADR-0094 row appended  (implementation-time deliverable — see T09 ADR Index Update section)
current-state-map.md §2 updated: SF09 classification row added.
Prerequisite confirmed: DocumentApi.uploadToSystemContext added to @hbc/sharepoint-docs.
Next: Activate consuming modules per SF09-T08 reference implementations.
  Priority: BD Leads (P0), Estimating Bid Calendar (P0), then Project Hub (P1).
-->
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF09-T09 completed: 2026-03-10
Testing sub-path: 5 factory stubs replaced with real implementations.
Unit tests: XlsxParser, CsvParser, ProcoreExportParser, autoMapHeaders, validateRow, useSeedImport, useSeedHistory, HbcSeedUploader, HbcSeedMapper, HbcSeedPreview, HbcSeedProgress.
Storybook stories: HbcSeedUploader, HbcSeedMapper, HbcSeedPreview, HbcSeedProgress.
Playwright E2E: 5 scenarios (test.skip — dev-harness routes not yet wired).
ADR created: docs/architecture/adr/ADR-0098-data-seeding-import-primitive.md (note: spec referenced ADR-0094, which is taken by versioned-record).
Documentation added:
  - docs/how-to/developer/data-seeding-adoption-guide.md
  - docs/reference/data-seeding/api.md
  - packages/data-seeding/README.md
docs/README.md ADR index updated: ADR-0098 row appended.
current-state-map.md §2 updated: SF09 reclassified from Canonical Normative Plan to Historical Foundational; ADR-0098, adoption guide, and API reference rows added.
-->
