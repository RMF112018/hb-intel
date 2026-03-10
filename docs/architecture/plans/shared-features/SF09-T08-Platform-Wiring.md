# SF09-T08 — Platform Wiring and Reference Implementations: `@hbc/data-seeding`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-09-Shared-Feature-Data-Seeding.md`
**Decisions Applied:** D-06 (SharePoint storage), D-07 (versioned-record integration), D-08 (Procore parser), D-09 (complexity)
**Estimated Effort:** 0.50 sprint-weeks
**Depends On:** T01–T07

> **Doc Classification:** Canonical Normative Plan — SF09-T08 platform wiring task; sub-plan of `SF09-Data-Seeding.md`.

---

## Objective

Document and specify the integration patterns for `@hbc/sharepoint-docs`, `@hbc/versioned-record`, and `@hbc/notification-intelligence`. Provide complete reference `ISeedConfig` implementations for all five confirmed seeding modules (BD, Estimating, Project Hub, Admin, Strategic Intelligence).

---

## 3-Line Plan

1. Specify the `@hbc/sharepoint-docs` System context upload pattern (D-06), the `@hbc/versioned-record` first-import snapshot pattern (D-07), and the notification Digest event (via the seedComplete Azure Function).
2. Write five reference `ISeedConfig` implementations — one per applicable module — for placement in each module's `src/seeding/` directory.
3. Document architecture boundary rules, dev-harness validation sequence, and boundary verification commands.

---

## Architecture Boundary Diagram

```
┌───────────────────────────────────────────────────────────────────────┐
│                     @hbc/data-seeding                                 │
│  ┌──────────────────┐  ┌─────────────┐  ┌──────────────────────────┐ │
│  │   Parsers        │  │    Hooks    │  │       Components         │ │
│  │ XlsxParser       │  │useSeedImport│  │ HbcSeedUploader          │ │
│  │ CsvParser        │  │useSeedHistory│ │ HbcSeedMapper (Std+)     │ │
│  │ ProcoreParser    │  └──────┬──────┘  │ HbcSeedPreview (Std+)    │ │
│  └──────────────────┘         │         │ HbcSeedProgress           │ │
│                               │SeedApi  └──────────────────────────┘ │
└───────────────────────────────┼───────────────────────────────────────┘
                                │ REST: /api/data-seeding/*
                     ┌──────────▼───────────────────┐
                     │   Azure Functions             │
                     │   seedImportBatch             │
                     │   seedParse                   │
                     │   seedComplete ──────────────►│ notification event
                     │   seedHistory                 │
                     └──────────┬────────────────────┘
                                │
              ┌─────────────────┼──────────────────┐
              ▼                 ▼                  ▼
   @hbc/sharepoint-docs   Module APIs       @hbc/versioned-record
   (System context upload) (upsert batch)   (tag: 'imported' snapshot)

BOUNDARY RULE: @hbc/data-seeding does NOT import:
  - @hbc/versioned-record
  - @hbc/notification-intelligence
  - @hbc/bic-next-move
  - Any feature module (packages/features/*)

Versioning and notifications are triggered server-side by seedComplete
Azure Function and client-side by the consuming module's onImportComplete
callback in ISeedConfig.
```

---

## Integration 1 — `@hbc/sharepoint-docs` System Context Upload (D-06)

Before any parsing begins, the seed file must be stored in the SharePoint System context folder. The consuming module's `HbcSeedUploader` wiring calls `DocumentApi.uploadToSystemContext`.

### Required: `DocumentApi.uploadToSystemContext`

This method must exist in `@hbc/sharepoint-docs` before SF09 can be implemented. If it does not exist, it must be added as part of SF09 scope.

**Proposed signature:**

```typescript
// In @hbc/sharepoint-docs
interface ISystemContextUploadOptions {
  file: File;
  /** Identifies the data category (e.g., 'seed-import') */
  contextType: string;
  /** Identifies the specific record type (e.g., 'bd-lead') */
  contextId: string;
}

interface ISystemContextUploadResult {
  documentId: string;
  sharepointUrl: string;
  fileName: string;
  fileSizeBytes: number;
  uploadedAt: string;  // ISO 8601
}

// DocumentApi.uploadToSystemContext must:
// 1. Upload the file to the 'System' library (not user-facing document libraries)
// 2. Set appropriate column metadata: ContextType, ContextId, UploadedAt, UploadedBy
// 3. Return the documentId and URL for use in ISeedResult.sourceDocumentId
```

### Usage Pattern in Consuming Module

```typescript
// In the consuming module's importer component, before onFileLoaded is called:
const handleLargeFileUploaded = async (
  file: File,
  documentId: string,
  documentUrl: string
) => {
  // Store file metadata for inclusion in the ISeedResult
  setSeedFileMetadata({ documentId, documentUrl, fileName: file.name });
  // Trigger server-side parse
  const parsed = await SeedApi.parseStreaming({
    format: detectFormat(file)!,
    documentId,
  });
  // Feed parsed rows into the state machine
  seedState.onMappingConfirmed?.(buildMappingFromParsed(parsed.headers));
};
```

---

## Integration 2 — `@hbc/versioned-record` First-Import Snapshot (D-07)

After each record is successfully imported (in `ISeedConfig.onRecordImported` or after the full import in `onImportComplete`), the consuming module creates a versioned-record snapshot tagged `'imported'`.

```typescript
// In the consuming module's onImportComplete callback:
async function handleImportComplete(result: ISeedResult): Promise<void> {
  // For each successfully imported record, create a version snapshot
  // (batch this if versioned-record supports batch creation)
  for (const record of importedRecords) {
    await VersionApi.createSnapshot({
      recordType: 'bd-lead',
      recordId: record.id,
      snapshot: record,
      tag: 'imported',
      contextPayload: {
        importId: result.sourceDocumentId,
        sourceFileName: result.sourceDocumentUrl,
        importedBy: result.importedBy,
        importedAt: result.importedAt,
      },
    });
  }
}
```

**Opt-in rule (D-07):** The consuming module decides whether to create versioned snapshots. `@hbc/data-seeding` does NOT import or call `@hbc/versioned-record` directly.

---

## Integration 3 — Notification (Digest on Import Complete)

The `seedComplete` Azure Function fires a Digest notification to the importing admin after recording the import result.

**Notification event table:**

| Event | Trigger | Channel | Priority |
|---|---|---|---|
| `seed-import-complete` | `seedComplete` Azure Function after list item created | Digest | Normal |

**Payload:**

```json
{
  "eventType": "seed-import-complete",
  "recipientUserId": "{importedBy}",
  "payload": {
    "recordType": "bd-lead",
    "successCount": 48,
    "errorCount": 2,
    "importId": "import-abc123",
    "errorReportUrl": "https://sp.example.com/system/error-report.csv"
  }
}
```

`@hbc/data-seeding` does NOT import `@hbc/notification-intelligence`. The notification is triggered server-side from the `seedComplete` Azure Function.

---

## Reference Implementations

### 1 — `bdLeadsImportConfig` (P0)

**File:** `packages/business-development/src/seeding/bdLeadsImportConfig.ts`

```typescript
import type { ISeedConfig } from '@hbc/data-seeding';
import type { IBdLeadRow } from '../types/IBdLeadRow';
import type { ILead } from '../types/ILead';
import { LeadApi } from '../api/LeadApi';
import { VersionApi } from '@hbc/versioned-record';

export interface IBdLeadRow {
  companyName: string;
  contactName: string;
  contactEmail: string;
  projectType: string;
  estimatedValue: string;
  stage: string;
  owner: string;
  nextFollowUpDate: string;
}

export const bdLeadsImportConfig: ISeedConfig<IBdLeadRow, ILead> = {
  name: 'BD Active Leads',
  recordType: 'bd-lead',
  acceptedFormats: ['xlsx', 'csv'],
  autoMapHeaders: true,
  allowPartialImport: true,
  batchSize: 50,

  fieldMappings: [
    {
      sourceColumn: 'Company Name',
      destinationField: 'companyName',
      label: 'Company Name',
      required: true,
    },
    {
      sourceColumn: 'Contact Name',
      destinationField: 'primaryContactName',
      label: 'Primary Contact Name',
      required: false,
    },
    {
      sourceColumn: 'Contact Email',
      destinationField: 'primaryContactEmail',
      label: 'Contact Email',
      required: false,
      validate: (val) => {
        if (!val) return null;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
          ? null
          : 'Invalid email format';
      },
    },
    {
      sourceColumn: 'Project Type',
      destinationField: 'projectType',
      label: 'Project Type',
      required: false,
    },
    {
      sourceColumn: 'Estimated Value',
      destinationField: 'estimatedValue',
      label: 'Estimated Value ($)',
      required: false,
      transform: (val) => {
        const num = parseFloat(val.replace(/[$,]/g, ''));
        return isNaN(num) ? null : num;
      },
      validate: (val) => {
        if (!val) return null;
        const num = parseFloat(val.replace(/[$,]/g, ''));
        return isNaN(num) ? 'Value must be a number (e.g., 1500000 or $1,500,000)' : null;
      },
    },
    {
      sourceColumn: 'Stage',
      destinationField: 'workflowStage',
      label: 'Stage',
      required: false,
    },
    {
      sourceColumn: 'Owner',
      destinationField: 'ownerId',
      label: 'Lead Owner (email or name)',
      required: false,
    },
    {
      sourceColumn: 'Next Follow-Up Date',
      destinationField: 'nextFollowUpDate',
      label: 'Next Follow-Up Date',
      required: false,
      validate: (val) => {
        if (!val) return null;
        const d = new Date(val);
        return isNaN(d.getTime()) ? 'Invalid date format (use YYYY-MM-DD or MM/DD/YYYY)' : null;
      },
      transform: (val) => {
        if (!val) return null;
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
      },
    },
  ],

  onImportComplete: async (result) => {
    console.log(
      `[BD Leads Import] Complete: ${result.successCount} imported, ${result.errorCount} errors`
    );
    // Versioned-record snapshot is batched by the consuming admin view component
  },
};
```

---

### 2 — `estimatingBidCalendarImportConfig` (P0)

**File:** `packages/estimating/src/seeding/estimatingBidCalendarImportConfig.ts`

```typescript
import type { ISeedConfig } from '@hbc/data-seeding';

export interface IEstimatingBidCalendarRow {
  projectName: string;
  ownerName: string;
  bidDueDate: string;
  bidBond: string;
  estimatedValue: string;
  projectType: string;
  goNoGoStatus: string;
  estimatingCoordinator: string;
}

export interface IEstimatingPursuitSeed {
  projectName: string;
  ownerName: string;
  bidDueDate: string;
  requiresBidBond: boolean;
  estimatedValue: number | null;
  projectType: string;
  goNoGoStatus: string;
  estimatingCoordinatorId: string;
  workflowStage: 'active';
}

export const estimatingBidCalendarImportConfig: ISeedConfig<
  IEstimatingBidCalendarRow,
  IEstimatingPursuitSeed
> = {
  name: 'Estimating Active Bid Calendar',
  recordType: 'estimating-pursuit',
  acceptedFormats: ['xlsx', 'csv'],
  autoMapHeaders: true,
  allowPartialImport: true,
  batchSize: 50,

  fieldMappings: [
    {
      sourceColumn: 'Project Name',
      destinationField: 'projectName',
      label: 'Project Name',
      required: true,
    },
    {
      sourceColumn: 'Owner',
      destinationField: 'ownerName',
      label: 'Owner / Client Name',
      required: true,
    },
    {
      sourceColumn: 'Bid Due Date',
      destinationField: 'bidDueDate',
      label: 'Bid Due Date',
      required: true,
      validate: (val) => {
        const d = new Date(val);
        return isNaN(d.getTime()) ? 'Invalid date — use YYYY-MM-DD or MM/DD/YYYY' : null;
      },
      transform: (val) => {
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
      },
    },
    {
      sourceColumn: 'Bid Bond',
      destinationField: 'requiresBidBond',
      label: 'Requires Bid Bond',
      required: false,
      transform: (val) => {
        return ['yes', 'y', 'true', '1'].includes(val.toLowerCase());
      },
    },
    {
      sourceColumn: 'Estimated Value',
      destinationField: 'estimatedValue',
      label: 'Estimated Construction Value ($)',
      required: false,
      transform: (val) => {
        const num = parseFloat(val.replace(/[$,]/g, ''));
        return isNaN(num) ? null : num;
      },
    },
    {
      sourceColumn: 'Project Type',
      destinationField: 'projectType',
      label: 'Project Type',
      required: false,
    },
    {
      sourceColumn: 'Go/No-Go',
      destinationField: 'goNoGoStatus',
      label: 'Go/No-Go Status',
      required: false,
    },
    {
      sourceColumn: 'Estimating Coordinator',
      destinationField: 'estimatingCoordinatorId',
      label: 'Estimating Coordinator (email or name)',
      required: false,
    },
  ],
};
```

---

### 3 — `projectHubImportConfig` (P1)

**File:** `packages/project-hub/src/seeding/projectHubImportConfig.ts`

```typescript
import type { ISeedConfig } from '@hbc/data-seeding';
import type { IProcoreProjectRow } from '@hbc/data-seeding';

export interface IProjectRecordSeed {
  projectName: string;
  projectNumber: string;
  status: string;
  startDate: string;
  completionDate: string;
  contractValue: number | null;
  clientName: string;
  projectManagerId: string;
  superintendentId: string;
  procoreId: string;
}

export const projectHubImportConfig: ISeedConfig<IProcoreProjectRow, IProjectRecordSeed> = {
  name: 'Project Hub Active Projects',
  recordType: 'project-record',
  // Accepts both Excel (for manual exports) and Procore JSON
  acceptedFormats: ['xlsx', 'procore-export'],
  autoMapHeaders: true,
  allowPartialImport: true,
  batchSize: 25, // Smaller batches for project records (more fields)

  fieldMappings: [
    {
      sourceColumn: 'projectName',
      destinationField: 'projectName',
      label: 'Project Name',
      required: true,
    },
    {
      sourceColumn: 'projectNumber',
      destinationField: 'projectNumber',
      label: 'Project Number',
      required: false,
    },
    {
      sourceColumn: 'status',
      destinationField: 'status',
      label: 'Project Status',
      required: false,
    },
    {
      sourceColumn: 'startDate',
      destinationField: 'startDate',
      label: 'Start Date',
      required: false,
      validate: (val) => {
        if (!val) return null;
        const d = new Date(val);
        return isNaN(d.getTime()) ? 'Invalid date format' : null;
      },
      transform: (val) => {
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
      },
    },
    {
      sourceColumn: 'completionDate',
      destinationField: 'completionDate',
      label: 'Completion Date',
      required: false,
      transform: (val) => {
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
      },
    },
    {
      sourceColumn: 'contractValue',
      destinationField: 'contractValue',
      label: 'Contract Value ($)',
      required: false,
      transform: (val) => {
        const num = parseFloat(val.replace(/[$,]/g, ''));
        return isNaN(num) ? null : num;
      },
    },
    {
      sourceColumn: 'ownerName',
      destinationField: 'clientName',
      label: 'Client / Owner Name',
      required: false,
    },
    {
      sourceColumn: 'projectManagerName',
      destinationField: 'projectManagerId',
      label: 'Project Manager (name)',
      required: false,
    },
    {
      sourceColumn: 'superintendentName',
      destinationField: 'superintendentId',
      label: 'Superintendent (name)',
      required: false,
    },
    {
      sourceColumn: 'procoreId',
      destinationField: 'procoreId',
      label: 'Procore Project ID',
      required: false,
    },
  ],
};
```

---

### 4 — `adminUserImportConfig` (P1)

**File:** `packages/admin/src/seeding/adminUserImportConfig.ts`

```typescript
import type { ISeedConfig } from '@hbc/data-seeding';

export interface IAdminUserRow {
  displayName: string;
  email: string;
  jobTitle: string;
  department: string;
  role: string;
  manager: string;
}

export interface IHbIntelUser {
  displayName: string;
  email: string;
  jobTitle: string;
  department: string;
  hbIntelRole: string;
  managerId: string;
}

export const adminUserImportConfig: ISeedConfig<IAdminUserRow, IHbIntelUser> = {
  name: 'HB Intel User Accounts',
  recordType: 'hb-intel-user',
  acceptedFormats: ['csv'],
  autoMapHeaders: true,
  allowPartialImport: false, // All users must import successfully — no partial user loads
  batchSize: 100,

  fieldMappings: [
    {
      sourceColumn: 'Display Name',
      destinationField: 'displayName',
      label: 'Display Name',
      required: true,
    },
    {
      sourceColumn: 'Email',
      destinationField: 'email',
      label: 'Email Address',
      required: true,
      validate: (val) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
          ? null
          : 'Invalid email address format';
      },
    },
    {
      sourceColumn: 'Job Title',
      destinationField: 'jobTitle',
      label: 'Job Title',
      required: false,
    },
    {
      sourceColumn: 'Department',
      destinationField: 'department',
      label: 'Department',
      required: false,
    },
    {
      sourceColumn: 'HB Intel Role',
      destinationField: 'hbIntelRole',
      label: 'HB Intel Role',
      required: true,
      validate: (val) => {
        const validRoles = ['admin', 'estimating-coordinator', 'project-manager', 'bd-director', 'viewer'];
        return validRoles.includes(val.toLowerCase())
          ? null
          : `Invalid role. Must be one of: ${validRoles.join(', ')}`;
      },
      transform: (val) => val.toLowerCase(),
    },
    {
      sourceColumn: 'Manager Email',
      destinationField: 'managerId',
      label: 'Manager Email',
      required: false,
      validate: (val) => {
        if (!val) return null;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
          ? null
          : 'Invalid manager email format';
      },
    },
  ],
};
```

---

### 5 — `strategicIntelWinLossImportConfig` (P2)

**File:** `packages/strategic-intelligence/src/seeding/strategicIntelWinLossImportConfig.ts`

```typescript
import type { ISeedConfig } from '@hbc/data-seeding';

export interface IWinLossHistoryRow {
  projectName: string;
  bidYear: string;
  outcome: string;
  clientName: string;
  contractValue: string;
  projectType: string;
  competitors: string;
  bidMargin: string;
  winningBidder: string;
}

export interface IWinLossRecord {
  projectName: string;
  bidYear: number;
  outcome: 'win' | 'loss' | 'no-bid';
  clientName: string;
  contractValue: number | null;
  projectType: string;
  competitors: string[];
  bidMarginPercent: number | null;
  winningBidder: string | null;
}

export const strategicIntelWinLossImportConfig: ISeedConfig<IWinLossHistoryRow, IWinLossRecord> = {
  name: 'Win/Loss Historical Data',
  recordType: 'win-loss-record',
  acceptedFormats: ['xlsx', 'csv'],
  autoMapHeaders: true,
  allowPartialImport: true,
  batchSize: 100,

  fieldMappings: [
    {
      sourceColumn: 'Project Name',
      destinationField: 'projectName',
      label: 'Project Name',
      required: true,
    },
    {
      sourceColumn: 'Bid Year',
      destinationField: 'bidYear',
      label: 'Bid Year',
      required: true,
      validate: (val) => {
        const year = parseInt(val);
        return isNaN(year) || year < 1950 || year > 2100
          ? 'Invalid year (must be 1950–2100)'
          : null;
      },
      transform: (val) => parseInt(val),
    },
    {
      sourceColumn: 'Outcome',
      destinationField: 'outcome',
      label: 'Outcome (win/loss/no-bid)',
      required: true,
      validate: (val) => {
        return ['win', 'loss', 'no-bid', 'no bid'].includes(val.toLowerCase())
          ? null
          : 'Outcome must be win, loss, or no-bid';
      },
      transform: (val) => {
        const normalized = val.toLowerCase().replace(/\s+/g, '-');
        return normalized as 'win' | 'loss' | 'no-bid';
      },
    },
    {
      sourceColumn: 'Client',
      destinationField: 'clientName',
      label: 'Client / Owner',
      required: false,
    },
    {
      sourceColumn: 'Contract Value',
      destinationField: 'contractValue',
      label: 'Contract Value ($)',
      required: false,
      transform: (val) => {
        const num = parseFloat(val.replace(/[$,]/g, ''));
        return isNaN(num) ? null : num;
      },
    },
    {
      sourceColumn: 'Project Type',
      destinationField: 'projectType',
      label: 'Project Type',
      required: false,
    },
    {
      sourceColumn: 'Competitors',
      destinationField: 'competitors',
      label: 'Competitors (comma-separated)',
      required: false,
      transform: (val) =>
        val ? val.split(',').map((c) => c.trim()).filter(Boolean) : [],
    },
    {
      sourceColumn: 'Bid Margin',
      destinationField: 'bidMarginPercent',
      label: 'Bid Margin (%)',
      required: false,
      transform: (val) => {
        const num = parseFloat(val.replace(/%/g, '').trim());
        return isNaN(num) ? null : num;
      },
    },
    {
      sourceColumn: 'Winning Bidder',
      destinationField: 'winningBidder',
      label: 'Winning Bidder (if loss)',
      required: false,
      transform: (val) => val || null,
    },
  ],
};
```

---

## Dev-Harness Validation Sequence

Run this 16-step sequence in the dev-harness after all T01–T07 tasks are complete:

1. Navigate to Admin → Data Import
2. Confirm HbcSeedUploader drag-drop zone is visible
3. Upload `test-fixtures/bd-leads-sample.xlsx` (Standard complexity)
4. Confirm row count shown: "48 rows detected"
5. Confirm HbcSeedMapper renders with auto-mapped columns (fuzzy match should map ≥4 fields)
6. Override one auto-mapped column to confirm manual override works
7. Click "Confirm Mapping"
8. Confirm HbcSeedPreview renders first 20 rows
9. Confirm error cells highlighted for any invalid rows (fixture includes 2 intentional errors)
10. Confirm CTA reads "Import 46 rows, skip 2 errors" (allowPartialImport: true)
11. Click "Import 46 rows, skip 2 errors"
12. Confirm HbcSeedProgress shows real-time batch progress
13. Confirm result: "46 imported, 2 failed"
14. Click "Download error report" — confirm CSV downloads with 2 rows
15. Switch to Essential complexity — re-upload same file
16. Confirm HbcSeedMapper is NOT rendered; confirm simplified "Import 48 rows?" confirm flow

---

## Architecture Boundary Verification Commands

```bash
# @hbc/data-seeding must NOT import these packages:
grep -r "from '@hbc/versioned-record'" packages/data-seeding/src/
# Expected: zero matches

grep -r "from '@hbc/notification-intelligence'" packages/data-seeding/src/
# Expected: zero matches

grep -r "from '@hbc/bic-next-move'" packages/data-seeding/src/
# Expected: zero matches

grep -r "from '@hbc/features" packages/data-seeding/src/
# Expected: zero matches

# SheetJS must be confined to XlsxParser only:
grep -r "from 'xlsx'" packages/data-seeding/src/ | grep -v XlsxParser
# Expected: zero matches

# Confirm ISeedConfig is used (not inline-defined) in all module seeding files:
grep -r "ISeedConfig" packages/business-development/src/seeding/
grep -r "ISeedConfig" packages/estimating/src/seeding/
grep -r "ISeedConfig" packages/project-hub/src/seeding/
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF09-T08 not yet started.
Prerequisite: @hbc/sharepoint-docs must have DocumentApi.uploadToSystemContext
before this platform wiring can be completed.
Next: SF09-T09-Testing-and-Deployment.md
-->
