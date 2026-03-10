# How to Add Data Seeding to a Module

> **Doc Classification:** Living Reference (Diátaxis) — How-to quadrant; developer audience; data-seeding module adoption.

This guide walks you through wiring `@hbc/data-seeding` into a consuming module for structured bulk import.

**Locked ADR:** [ADR-0098](../../architecture/adr/ADR-0098-data-seeding-import-primitive.md)
**API Reference:** [data-seeding/api.md](../../reference/data-seeding/api.md)

---

## 1. When to Add Seeding

Add data seeding when your module needs to bulk-import records from external sources (Excel, CSV, Procore JSON) during onboarding or periodic data refresh. Typical use cases:

- **BD Leads** — import existing lead lists from Excel
- **Estimating Bid Calendar** — import bid schedules from Excel
- **Project Hub** — import Procore project exports (JSON)
- **Admin Users** — import user lists from CSV

If your module only needs single-record creation, use the standard form flow instead.

---

## 2. Implementing ISeedConfig

Create an `ISeedConfig<TSource, TDest>` for your import route:

```typescript
import type { ISeedConfig } from '@hbc/data-seeding';

interface IMySourceRow extends Record<string, string> {
  Name: string;
  Email: string;
  Value: string;
}

interface IMyRecord {
  name: string;
  email: string;
  value: number | null;
}

export const myImportConfig: ISeedConfig<IMySourceRow, IMyRecord> = {
  name: 'My Record Import',
  recordType: 'my-record',
  acceptedFormats: ['xlsx', 'csv'],
  autoMapHeaders: true,
  allowPartialImport: true,
  batchSize: 50,
  fieldMappings: [
    {
      sourceColumn: 'Name',
      destinationField: 'name',
      label: 'Record Name',
      required: true,
    },
    {
      sourceColumn: 'Email',
      destinationField: 'email',
      label: 'Email Address',
      required: false,
      validate: (val) => {
        if (!val) return null;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? null : 'Invalid email format';
      },
    },
    {
      sourceColumn: 'Value',
      destinationField: 'value',
      label: 'Numeric Value',
      required: false,
      transform: (val) => parseFloat(val) || null,
    },
  ],
};
```

---

## 3. Mounting Components

Wire the four data-seeding components in your admin import route:

```typescript
import {
  HbcSeedUploader,
  HbcSeedMapper,
  HbcSeedPreview,
  HbcSeedProgress,
  useSeedImport,
} from '@hbc/data-seeding';

function MyImportPage() {
  const seed = useSeedImport(myImportConfig, {
    userId: currentUser.id,
    userName: currentUser.displayName,
  });

  return (
    <>
      <HbcSeedUploader config={myImportConfig} onFileLoaded={() => {}} />
      {seed.status === 'previewing' && (
        <>
          <HbcSeedMapper
            config={myImportConfig}
            detectedHeaders={seed.detectedHeaders}
            autoMapping={seed.activeMapping}
            onMappingConfirmed={seed.onMappingConfirmed}
          />
          <HbcSeedPreview
            config={myImportConfig}
            rows={seed.rows}
            rowMeta={seed.rowMeta}
            activeMapping={seed.activeMapping}
            onImportConfirmed={seed.onImportConfirmed}
            onBack={seed.onReset}
          />
        </>
      )}
      {(seed.status === 'importing' || seed.status === 'complete' ||
        seed.status === 'partial' || seed.status === 'failed') && (
        <HbcSeedProgress
          totalRows={seed.rows.length}
          importedRows={seed.importedCount}
          errorRows={seed.importErrorCount}
          status={seed.status}
          result={seed.result}
          onRetryErrors={seed.onRetryErrors}
          onReset={seed.onReset}
        />
      )}
    </>
  );
}
```

---

## 4. Handling the Large-File Path

Files ≥10MB are routed through SharePoint upload + server-side parsing (D-01, D-06):

```typescript
<HbcSeedUploader
  config={myImportConfig}
  onFileLoaded={handleFileLoaded}
  uploadFile={async (file, recordType) => {
    const result = await UploadService.uploadToSystemContext(file, recordType);
    return { documentId: result.documentId, sharepointUrl: result.sharepointUrl };
  }}
  onLargeFileUploaded={async (file, documentId) => {
    const parsed = await SeedApi.parseStreaming({ format: 'xlsx', documentId });
    // Handle parsed rows
  }}
/>
```

---

## 5. Wiring Versioned-Record Snapshot (D-07)

To tag the first imported version of each record:

```typescript
const config: ISeedConfig<TSource, TDest> = {
  ...baseConfig,
  onImportComplete: async (result) => {
    // Tag imported records via versioned-record
    await VersionedRecordApi.tagBatch(result.sourceDocumentId, 'imported');
  },
};
```

`@hbc/data-seeding` does **not** import `@hbc/versioned-record` — this wiring happens in the consuming module.

---

## 6. Using Testing Factories

In your module's tests, use the canonical testing sub-path:

```typescript
import {
  createMockSeedConfig,
  createMockSeedResult,
  createMockValidationError,
  createMockSeedRow,
  mockSeedStatuses,
} from '@hbc/data-seeding/testing';

describe('MyImportPage', () => {
  it('renders with mock config', () => {
    const config = createMockSeedConfig({ recordType: 'my-record' });
    // ... test with mock config
  });
});
```

---

## Architecture Boundaries

`@hbc/data-seeding` must **not** import from:
- `@hbc/versioned-record`
- `@hbc/notification-intelligence`
- `@hbc/bic-next-move`
- Any `packages/features/*` module

SheetJS (`xlsx`) must only be imported in `src/parsers/XlsxParser.ts`.
