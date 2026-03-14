# W0-G2-T07 — Provisioning Saga Step 3, Step 4, and Seeding Updates — Implementation Plan

## Context

T07 is the implementation bridge between the T01–T06 schema definitions and the actual provisioning saga backend code. The saga's Step 3 (template file uploads) and Step 4 (data list provisioning) are currently partially scaffolded. T07 activates them with the full G2 data model, adds department library folder tree creation, fixes `withRetry` for Retry-After headers, and resolves four open decisions from T02–T06.

**Repo truth reconciliation:**
- `IFieldDefinition` already has `defaultValue`, `indexed`, `lookupListTitle`, `lookupFieldName` — no type changes needed
- `SharePointService.createDataLists()` already handles Lookup fields, indexing, and defaultValue — no service changes needed for field support
- Workflow-family lists exist in 5 separate files (T02–T06), totaling **26 lists** (not 25 as T07 plan states — plan used some placeholder names that differ from actual T02–T06 implementations)
- `TEMPLATE_FILE_MANIFEST` already has 18 entries (all G2 files already added by T02–T06)
- Template asset placeholder files already exist (0-byte) in `assets/templates/`
- The `safety-pack` add-on still references old `Safety Plan Template.docx` — needs T07 consolidation update

**Step 4b decision (pre-implementation):** Defer Step 4b introduction. The `createDataLists` method has per-list idempotency (`listExists` check). With 26 workflow lists at ~3-8s each, worst case is ~208s (~3.5 min) + ~64s for 8 core lists = ~4.5 min total. This is well within the 10-minute Azure Function timeout. The orchestrator wraps each step with `withRetry` at the outer level, and `createDataLists` internally handles per-list idempotency. If a retry occurs, already-created lists are skipped. The 6-minute threshold from T07-R1 is not expected to be exceeded. Step 4b is explicitly deferred with this justification — T09 staging tests will confirm.

---

## Implementation Steps

### Step 1 — `withRetry` Retry-After Header Fix
**File:** `backend/functions/src/utils/retry.ts`

**Changes:**
- Extract `Retry-After` header from 429 errors if available on the error object
- Use `Math.max(retryAfterSeconds * 1000, calculatedDelay)` as actual delay
- PnPjs throws `HttpRequestError` with `.response` property containing headers. Check for `.response?.headers?.get('Retry-After')` on the error
- Fall back to existing exponential backoff if header is absent

```typescript
// In the catch block, before the delay:
let delay = baseDelayMs * Math.pow(2, attempt - 1);

// Honor Retry-After header from 429 responses
const retryAfterSec = getRetryAfterSeconds(err);
if (retryAfterSec !== undefined) {
  delay = Math.max(retryAfterSec * 1000, delay);
}
```

Add helper function:
```typescript
function getRetryAfterSeconds(error: unknown): number | undefined {
  if (error && typeof error === 'object') {
    const resp = (error as Record<string, unknown>).response;
    if (resp && typeof resp === 'object') {
      const headers = (resp as Record<string, unknown>).headers;
      if (headers && typeof (headers as Record<string, unknown>).get === 'function') {
        const val = (headers as { get: (n: string) => string | null }).get('Retry-After');
        if (val) {
          const seconds = Number(val);
          if (!isNaN(seconds) && seconds > 0) return seconds;
        }
      }
    }
  }
  return undefined;
}
```

**Test file:** `backend/functions/src/utils/retry.test.ts` — add test cases:
- 429 with Retry-After header uses header value as minimum delay
- 429 without Retry-After falls back to exponential backoff
- Non-429 transient errors use normal backoff

### Step 2 — PunchBatchId Amendment to Core Punch List
**File:** `backend/functions/src/config/list-definitions.ts`

Add to the `Punch List` entry's `fields` array:
```typescript
{ internalName: 'PunchBatchId', displayName: 'Punch Batch Reference', type: 'Text' },
```

**Test file:** `backend/functions/src/config/list-definitions.test.ts` — add assertion that Punch List has `PunchBatchId` Text field.

### Step 3 — Create `workflow-list-definitions.ts` Composition Module
**File:** `backend/functions/src/config/workflow-list-definitions.ts` (new)

Creates the ordered `HB_INTEL_WORKFLOW_LIST_DEFINITIONS` array by composing all 5 family arrays in the correct parent-before-child provisioning order.

```typescript
import { STARTUP_LIST_DEFINITIONS } from './startup-list-definitions.js';
import { CLOSEOUT_LIST_DEFINITIONS } from './closeout-list-definitions.js';
import { SAFETY_LIST_DEFINITIONS } from './safety-list-definitions.js';
import { PROJECT_CONTROLS_LIST_DEFINITIONS } from './project-controls-list-definitions.js';
import { FINANCIAL_LIST_DEFINITIONS } from './financial-list-definitions.js';
import type { IListDefinition } from '../services/sharepoint-service.js';

/**
 * W0-G2-T07: Combined workflow-family list definitions for provisioning saga Step 4.
 * Order is critical: parent lists must precede child lists for Lookup field resolution.
 * Each family's internal array already maintains parent-before-child order via provisioningOrder.
 * Families are concatenated in T02→T03→T04→T05→T06 sequence per T07 §5.
 */
export const HB_INTEL_WORKFLOW_LIST_DEFINITIONS: IListDefinition[] = [
  ...STARTUP_LIST_DEFINITIONS,
  ...CLOSEOUT_LIST_DEFINITIONS,
  ...SAFETY_LIST_DEFINITIONS,
  ...PROJECT_CONTROLS_LIST_DEFINITIONS,
  ...FINANCIAL_LIST_DEFINITIONS,
];
```

**Test file:** `backend/functions/src/config/workflow-list-definitions.test.ts` (new)
- Total count = 26 lists
- All family arrays are represented
- Parent lists come before their child lists (provisioningOrder check)
- Every list has `pid` field with required/indexed/defaultValue
- Every list has `listFamily` set
- No duplicate titles across all families

### Step 4 — Safety-Pack Add-On Consolidation
**File:** `backend/functions/src/config/add-on-definitions.ts`

Update `safety-pack` templateFiles entry:
- Change `fileName` from `Safety Plan Template.docx` to `Site Specific Safety Plan Template.docx`
- Change `assetPath` from `add-ons/safety-pack/Safety Plan Template.docx` to `Site Specific Safety Plan Template.docx` (use the same core asset — no separate add-on copy needed since T04 seeds this universally)

### Step 5 — Department Library Folder Trees Config
**File:** `backend/functions/src/config/department-folder-trees.ts` (new)

Define the folder tree structures as typed constants:

```typescript
import type { ProjectDepartment } from '@hbc/models';

export interface IDepartmentLibraryConfig {
  libraryName: string;
  folderTree: string[];  // Flat list of relative paths, e.g. 'Owner Files/Contract'
}

export const DEPARTMENT_LIBRARY_CONFIGS: Record<ProjectDepartment, IDepartmentLibraryConfig> = {
  'commercial': {
    libraryName: 'Commercial Documents',
    folderTree: [
      'Owner Files', 'Owner Files/Contract', 'Owner Files/Insurance', 'Owner Files/Notices',
      'Engineering Reports', 'Engineering Reports/Civil', 'Engineering Reports/MEP', 'Engineering Reports/Structural', 'Engineering Reports/Surveyor',
      'Permits', 'Permits/HBC Permits', 'Permits/Sub Permits',
      'Testing and Inspection', 'Testing and Inspection/Concrete', 'Testing and Inspection/Soil', 'Testing and Inspection/Special Inspections',
      'Meetings',
      'Safety', 'Safety/JHA Forms', 'Safety/Incident Reports',
      'Schedule', 'Schedule/CPM', 'Schedule/3 Week Look Ahead',
      'Accounting', 'Accounting/Budget', 'Accounting/Forecast', 'Accounting/Pay Applications',
      'Change Orders', 'Change Orders/PCO', 'Change Orders/PCCO',
      'Subcontractor',
      'Closeout', 'Closeout/Owner Manual', 'Closeout/Punchlist',
    ],
  },
  'luxury-residential': {
    libraryName: 'Luxury Residential Documents',
    folderTree: [
      'Owner Files', 'Owner Files/Contract', 'Owner Files/Insurance', 'Owner Files/Notices', 'Owner Files/Owner Direct Subcontracts',
      'Engineering Reports', 'Engineering Reports/Civil', 'Engineering Reports/MEP', 'Engineering Reports/Structural', 'Engineering Reports/Surveyor',
      'Permits', 'Permits/HBC Permits', 'Permits/Sub Permits',
      'Testing and Inspection', 'Testing and Inspection/Concrete', 'Testing and Inspection/Soil', 'Testing and Inspection/HVAC',
      'Meetings',
      'Safety', 'Safety/JHA Forms', 'Safety/Incident Reports',
      'Schedule', 'Schedule/CPM', 'Schedule/3 Week Look Ahead',
      'Accounting', 'Accounting/Budget', 'Accounting/Forecast', 'Accounting/Pay Applications',
      'Change Orders', 'Change Orders/PCO', 'Change Orders/PCCO',
      'Subcontractor', 'Subcontractor/Working Documents',
      'Closeout', 'Closeout/Owner Manual', 'Closeout/Punchlist', 'Closeout/Survey',
    ],
  },
};
```

**Test file:** `backend/functions/src/config/department-folder-trees.test.ts` (new)
- Both departments have configs
- Commercial has 32 folder paths, Luxury Residential has 35
- No path exceeds 2 levels deep
- Every subfolder's parent is also in the list
- Library names match spec

### Step 6 — Add `createFolderIfNotExists` to SharePointService
**File:** `backend/functions/src/services/sharepoint-service.ts`

Add to `ISharePointService` interface:
```typescript
createFolderIfNotExists(siteUrl: string, libraryName: string, folderPath: string): Promise<void>;
```

Add to `SharePointService` class:
```typescript
async createFolderIfNotExists(siteUrl: string, libraryName: string, folderPath: string): Promise<void> {
  const sp: any = await this.getSP(siteUrl);
  const sitePath = new URL(siteUrl).pathname.slice(1);
  const serverRelativePath = `/${sitePath}/${libraryName}/${folderPath}`;
  try {
    await sp.web.getFolderByServerRelativePath(serverRelativePath).select('Exists')();
    // Folder already exists — idempotent no-op
  } catch {
    // Folder does not exist — create it
    await sp.web.folders.addUsingPath(serverRelativePath);
  }
}
```

Add to `MockSharePointService`:
```typescript
async createFolderIfNotExists(_siteUrl: string, _libraryName: string, _folderPath: string): Promise<void> {}
```

Add to `IMockServices` in `mock-services.ts`:
```typescript
createFolderIfNotExists: Mock;
```

And the mock factory default:
```typescript
createFolderIfNotExists: vi.fn(async () => {}),
```

### Step 7 — Activate Step 3 (Department Pruning + Folder Trees + Full Manifest Upload)
**File:** `backend/functions/src/functions/provisioningSaga/steps/step3-template-files.ts`

Replace scaffolded department pruning with actual implementation:

```typescript
import { DEPARTMENT_LIBRARY_CONFIGS } from '../../../config/department-folder-trees.js';

// In executeStep3, after core template file upload:

// --- Department library folder tree creation ---
if (status.department) {
  const config = DEPARTMENT_LIBRARY_CONFIGS[status.department];
  if (config) {
    // Create the department document library (idempotent)
    const libExists = await services.sharePoint.documentLibraryExists(status.siteUrl!, config.libraryName);
    if (!libExists) {
      await services.sharePoint.createDocumentLibrary(status.siteUrl!, config.libraryName);
    }
    // Create folder tree (paths are ordered parent-first, createFolderIfNotExists is idempotent)
    for (const folderPath of config.folderTree) {
      await services.sharePoint.createFolderIfNotExists(status.siteUrl!, config.libraryName, folderPath);
    }
  }
}
```

Remove the scaffolded department pruning comments. Keep the add-on section functional (it already handles missing files gracefully).

### Step 8 — Activate Step 4 (Core + Workflow-Family Lists)
**File:** `backend/functions/src/functions/provisioningSaga/steps/step4-data-lists.ts`

```typescript
import { HB_INTEL_LIST_DEFINITIONS } from '../../../config/list-definitions.js';
import { HB_INTEL_WORKFLOW_LIST_DEFINITIONS } from '../../../config/workflow-list-definitions.js';

export async function executeStep4(
  services: IServiceContainer,
  status: IProvisioningStatus
): Promise<ISagaStepResult> {
  // ... existing result setup ...
  try {
    // Core lists (8 lists, including PunchBatchId amendment)
    await services.sharePoint.createDataLists(status.siteUrl!, HB_INTEL_LIST_DEFINITIONS, {
      projectNumber: status.projectNumber,
    });
    // G2 workflow-family lists (26 lists, parent-before-child order)
    await services.sharePoint.createDataLists(status.siteUrl!, HB_INTEL_WORKFLOW_LIST_DEFINITIONS, {
      projectNumber: status.projectNumber,
    });
    result.status = 'Completed';
    result.completedAt = new Date().toISOString();
  } catch (err) {
    // ... existing error handling ...
  }
  return result;
}
```

Key change: Pass `{ projectNumber: status.projectNumber }` as context so `createDataLists` can resolve `{{projectNumber}}` in `pid` default values.

### Step 9 — Update Step Tests
**File:** `backend/functions/src/functions/provisioningSaga/steps/steps.test.ts`

Update step 3 test to verify:
- Department folder creation is called when `status.department` is set
- No folder creation when `status.department` is undefined
- Upload still works

Update step 4 test to verify:
- `createDataLists` is called twice (core + workflow)
- Context with projectNumber is passed

### Step 10 — Documentation Updates
**File:** `docs/reference/data-model/workflow-list-schemas.md`
- Add note about T07 decisions resolved (pre-seeding deferred, Draw Schedule simplified, safety-pack consolidated, PunchBatchId added)

**File:** `docs/reference/provisioning/provisioning-saga-reference.md` (new or update existing)
- Document Step 3 department library behavior
- Document Step 4 list provisioning order
- Document Step 4b deferral decision

**File:** `docs/architecture/blueprint/current-state-map.md` §2
- Add rows for: `workflow-list-definitions.ts`, `department-folder-trees.ts`

---

## Files Changed Summary

| File | Action | Purpose |
|------|--------|---------|
| `backend/functions/src/utils/retry.ts` | Edit | Retry-After header support |
| `backend/functions/src/utils/retry.test.ts` | Edit | Retry-After test cases |
| `backend/functions/src/config/list-definitions.ts` | Edit | PunchBatchId amendment |
| `backend/functions/src/config/list-definitions.test.ts` | Edit | PunchBatchId test |
| `backend/functions/src/config/workflow-list-definitions.ts` | Create | Combined 26-list ordered array |
| `backend/functions/src/config/workflow-list-definitions.test.ts` | Create | Composition + ordering tests |
| `backend/functions/src/config/department-folder-trees.ts` | Create | Folder tree configs |
| `backend/functions/src/config/department-folder-trees.test.ts` | Create | Folder tree validation tests |
| `backend/functions/src/config/add-on-definitions.ts` | Edit | Safety-pack consolidation |
| `backend/functions/src/services/sharepoint-service.ts` | Edit | Add createFolderIfNotExists |
| `backend/functions/src/test-utils/mock-services.ts` | Edit | Add createFolderIfNotExists mock |
| `backend/functions/src/functions/provisioningSaga/steps/step3-template-files.ts` | Edit | Activate department pruning + folder creation |
| `backend/functions/src/functions/provisioningSaga/steps/step4-data-lists.ts` | Edit | Add workflow-family lists + context |
| `backend/functions/src/functions/provisioningSaga/steps/steps.test.ts` | Edit | Update step 3/4 tests |
| `docs/reference/data-model/workflow-list-schemas.md` | Edit | T07 decision resolutions |
| `docs/architecture/blueprint/current-state-map.md` | Edit | Classification rows |

## What T07 Implements vs. Defers

**Implements now:**
- `withRetry` Retry-After header support
- PunchBatchId amendment to core Punch List
- `HB_INTEL_WORKFLOW_LIST_DEFINITIONS` composition module (26 lists)
- Safety-pack add-on consolidation
- Department folder tree configs (Commercial + Luxury Residential)
- `createFolderIfNotExists` SharePointService method
- Step 3 department pruning + folder tree creation activation
- Step 4 workflow-family list provisioning with projectNumber context
- All four open decision resolutions documented

**Defers:**
- **Step 4b:** Explicitly deferred — total list count (34) within Azure Function timeout; T09 staging tests will validate
- **Pre-seeded checklist items:** Deferred to Wave 1 per T07 §4.1
- **Template asset content:** 0-byte placeholders remain; content creation is product-owner task
- **T08:** Validation rules and idempotency hardening
- **T09:** Integration tests, throttle simulation, staging duration measurement

## Verification

```bash
cd backend/functions
npx vitest run src/utils/retry.test.ts                               # Retry-After tests
npx vitest run src/config/list-definitions.test.ts                   # PunchBatchId + core regression
npx vitest run src/config/workflow-list-definitions.test.ts          # Composition module
npx vitest run src/config/department-folder-trees.test.ts            # Folder tree configs
npx vitest run src/config/startup-list-definitions.test.ts           # T02 regression
npx vitest run src/config/closeout-list-definitions.test.ts          # T03 regression
npx vitest run src/config/safety-list-definitions.test.ts            # T04 regression
npx vitest run src/config/project-controls-list-definitions.test.ts  # T05 regression
npx vitest run src/config/financial-list-definitions.test.ts         # T06 regression
npx vitest run src/config/template-file-manifest.test.ts             # Manifest regression
npx vitest run src/functions/provisioningSaga/steps/steps.test.ts    # Step 3/4 tests
npx tsc --noEmit                                                     # Type-check clean
```
