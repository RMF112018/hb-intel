# W0-G2-T08 — Validation, Idempotency, Migration, and Seed Rules

## Context

T08 turns the G2 provisioning correctness rules (structural validation, PID contract, idempotency, migration posture, seed rules) into concrete, testable seams in the repo. T09 will write integration tests against these seams. The goal is backend validation helpers + reference docs — NOT runtime UI enforcement.

**Key repo findings:**
- `IMockServices` is missing `uploadTemplateFile`, `createFolderIfNotExists` (added by T07) — TypeScript should catch this since it extends `IServiceContainer`. Must fix.
- `uploadTemplateFile` uses `{ Overwrite: true }` — T08 IDEM-9 mandates no-overwrite on re-run.
- No `fileExists` method on `ISharePointService` — needed for the no-overwrite check.
- No `validation/` directory exists — starting fresh.
- T08 plan says "25 G2 lists" but repo has 26 — repo truth governs.
- 6 parent/child Lookup pairs exist across startup(2), closeout(1), safety(2), financial(1).

**Authoritative source:** `docs/architecture/plans/MVP/G2/W0-G2-T08-Validation-Idempotency-Migration-and-Seed-Rules.md`

---

## Implementation Steps

### Step 1 — Validation Types (`backend/functions/src/validation/types.ts`) [NEW]

Standard validation result contract for all validators and T09 test assertions:

```typescript
export interface IValidationResult {
  rule: string;        // e.g., 'V-STRUCT-1', 'V-PID-1', 'IDEM-9'
  passed: boolean;
  message: string;
  severity: 'error' | 'warning';
  details?: unknown;
}

export interface IValidationReport {
  category: string;    // 'structural' | 'pid' | 'idempotency' | 'file' | 'migration'
  results: IValidationResult[];
  allPassed: boolean;
}
```

Pure types file, no runtime deps.

---

### Step 2 — Structural Validators (`backend/functions/src/validation/structural-validators.ts`) [NEW]

Pure functions that validate config definition arrays (NOT live SharePoint). Each returns `IValidationResult[]`.

| Function | T08 Rules | Input Constants | Validates |
|----------|-----------|-----------------|-----------|
| `validateCoreListsIntact` | V-STRUCT-1, V-STRUCT-2 | `HB_INTEL_LIST_DEFINITIONS` | 8 core lists present; PunchBatchId is only additive change; no G2 properties (pid, listFamily, provisioningOrder) leaked |
| `validateG2PidPresence` | V-STRUCT-3, V-STRUCT-4 | `HB_INTEL_WORKFLOW_LIST_DEFINITIONS` | Every G2 list has `pid` field: Text, required, indexed |
| `validateG2StatusPresence` | V-STRUCT-5 | `HB_INTEL_WORKFLOW_LIST_DEFINITIONS` | Every G2 list has `Status` Choice field |
| `validateParentChildLookups` | V-STRUCT-6 | `HB_INTEL_WORKFLOW_LIST_DEFINITIONS` | All 6 parent/child pairs: parent exists, child has ParentRecord Lookup pointing to correct parent, provisioningOrder parent < child |
| `validateDepartmentLibraries` | V-LIB-1, V-LIB-2 | `DEPARTMENT_LIBRARIES`, `CORE_LIBRARIES` | Department pruning correct (2 departments, 1 library each, distinct names); 3 core libraries always present with versioning |
| `validateFolderTrees` | V-LIB-2 | `DEPARTMENT_FOLDER_TREES` | Every subfolder's parent is also in the list; parent-first ordering |
| `runAllStructuralValidations` | All V-STRUCT + V-LIB | All config constants | Aggregates all above into `IValidationReport` |

---

### Step 3 — PID Validators (`backend/functions/src/validation/pid-validators.ts`) [NEW]

Pure functions validating PID contract compliance across all 26 workflow lists.

| Function | T08 Rules | Validates |
|----------|-----------|-----------|
| `validatePidDisplayName` | V-PID-1 | Every G2 list's pid field has `displayName: 'Project ID'` |
| `validatePidDefaultValue` | V-PID-2 | Every G2 list's pid field has `defaultValue: '{{projectNumber}}'` |
| `validatePidFullContract` | V-PID-3 | pid field matches full contract: type Text, required, indexed, defaultValue pattern |
| `runAllPidValidations` | All V-PID | Aggregates into `IValidationReport` |

---

### Step 4 — File Validators (`backend/functions/src/validation/file-validators.ts`) [NEW]

Validates template file manifest and local asset presence.

| Function | T08 Rules | Validates |
|----------|-----------|-----------|
| `validateTemplateManifest` | V-FILE-1 | All entries have non-empty fileName, targetLibrary, assetPath; targetLibrary matches a CORE_LIBRARIES name |
| `validateTemplateAssets` | V-FILE-2 | Check local filesystem for each asset; missing = `warning` severity (not error); returns report of present/missing |
| `validateAddOnAssets` | V-FILE-2 | Same for add-on definition template files |
| `runAllFileValidations` | All V-FILE | Aggregates into `IValidationReport` |

`validateTemplateAssets` accepts optional `basePath` parameter for testability (default: `path.resolve(__dirname, '../assets/templates/')`).

---

### Step 5 — Idempotency Rules (`backend/functions/src/validation/idempotency-rules.ts`) [NEW]

Code-as-documentation module. Typed rule objects that T09 uses to derive test scenarios.

```typescript
export interface IIdempotencyRule {
  ruleId: string;           // 'IDEM-1' through 'IDEM-9'
  description: string;
  implementedBy: string;    // e.g., 'SharePointService.listExists → createDataLists skip'
  testScenario: string;     // What T09 should test
}

export const IDEMPOTENCY_RULES: readonly IIdempotencyRule[] = [
  { ruleId: 'IDEM-1', description: 'Existing list → skip creation, log idempotentSkip', implementedBy: 'SharePointService.createDataLists', testScenario: 'Mock listExists=true, verify createDataLists skips' },
  // ... IDEM-2 through IDEM-9
];

export const RERUN_SCENARIOS = [
  { id: 'A', name: 'Clean first run', description: 'All items created' },
  { id: 'B', name: 'Full retry on complete site', description: 'All idempotently skipped' },
  { id: 'C', name: 'Partial failure mid-list', description: 'Created lists skipped, remaining created' },
  { id: 'D', name: 'Step 3 folder failure', description: 'Existing folders skipped, remaining created' },
] as const;
```

---

### Step 6 — Migration Rules (`backend/functions/src/validation/migration-rules.ts`) [NEW]

Codifies the 5 MIGR rules from T08 §4 as typed reference. Pure data.

```typescript
export const MIGRATION_RULES = [
  { ruleId: 'MIGR-1', description: 'File is active operational source during Wave 0; list is structural only', phase: 'wave-0' },
  { ruleId: 'MIGR-2', description: 'G2 creates empty list structures only — no data migration', phase: 'wave-0' },
  { ruleId: 'MIGR-3', description: 'Loading existing data into lists is Wave 1 scope', phase: 'wave-1' },
  { ruleId: 'MIGR-4', description: 'Seeded files are project-team owned; template refresh out of G2 scope', phase: 'wave-0' },
  { ruleId: 'MIGR-5', description: 'Template file version in assets/ does not auto-update provisioned sites', phase: 'wave-0' },
] as const;

export const COEXISTENCE_DOCTRINE = {
  wave0: 'File and list coexist but are NOT synchronized. File is operational source.',
  wave1: 'Per-feature migration moves operational truth from file to list.',
  noAutoSync: 'Changing a template asset does NOT propagate to already-provisioned sites.',
} as const;
```

---

### Step 7 — Barrel Export (`backend/functions/src/validation/index.ts`) [NEW]

Re-exports all validators, types, and rule constants from a single entry point.

---

### Step 8 — Add `fileExists` to SharePointService [EDIT]

**File:** `backend/functions/src/services/sharepoint-service.ts`

**8a. Interface addition:**
```typescript
fileExists(siteUrl: string, libraryName: string, fileName: string): Promise<boolean>;
```

**8b. `SharePointService` implementation:**
```typescript
async fileExists(siteUrl: string, libraryName: string, fileName: string): Promise<boolean> {
  const sp: any = await this.getSP(siteUrl);
  const fileUrl = `/${new URL(siteUrl).pathname.slice(1)}/${libraryName}/${fileName}`;
  try {
    await sp.web.getFileByServerRelativePath(fileUrl).select('Exists')();
    return true;
  } catch {
    return false;
  }
}
```

**8c. `MockSharePointService` implementation:**
```typescript
async fileExists(_siteUrl: string, _libraryName: string, _fileName: string): Promise<boolean> {
  return false;
}
```

**8d. Fix `uploadTemplateFile` — IDEM-9 no-overwrite:**
```typescript
async uploadTemplateFile(siteUrl, entry): Promise<boolean> {
  const fullPath = path.resolve(__dirname, '../assets/templates/', entry.assetPath);
  if (!fs.existsSync(fullPath)) return false;

  // IDEM-9: Do not overwrite existing files on re-run
  const alreadyExists = await this.fileExists(siteUrl, entry.targetLibrary, entry.fileName);
  if (alreadyExists) return true;

  const sp: any = await this.getSP(siteUrl);
  const folderUrl = `/${new URL(siteUrl).pathname.slice(1)}/${entry.targetLibrary}`;
  const folder = sp.web.getFolderByServerRelativePath(folderUrl);
  await folder.files.addUsingPath(entry.fileName, fs.readFileSync(fullPath), { Overwrite: false });
  return true;
}
```

---

### Step 9 — Fix Mock Services [EDIT]

**File:** `backend/functions/src/test-utils/mock-services.ts`

Add missing mocks to both `IMockServices` interface and `createMockServices()`:

| Mock | Default Return |
|------|---------------|
| `uploadTemplateFile: Mock` | `vi.fn(async () => true)` |
| `createFolderIfNotExists: Mock` | `vi.fn(async () => {})` |
| `fileExists: Mock` | `vi.fn(async () => false)` |

---

### Step 10 — Validation Tests (`backend/functions/src/validation/structural-validators.test.ts`) [NEW]

Tests for the validation module itself (~20 assertions):
- `runAllStructuralValidations` returns all-passed for current config
- `runAllPidValidations` returns all-passed for current config
- `validateParentChildLookups` correctly identifies all 6 parent/child pairs
- `validateTemplateManifest` passes for current 18-entry manifest
- `validateTemplateAssets` returns warnings (not errors) for 0-byte placeholder files
- `validateCoreListsIntact` passes with current 8 core lists
- `validateFolderTrees` validates parent-first ordering

---

### Step 11 — Reference Documentation [NEW — 3 docs]

**11a. `docs/reference/provisioning/g2-validation-rules.md`**

Comprehensive reference listing all validation rules organized by category:
- Structural (V-STRUCT-1 through V-STRUCT-6, V-LIB-1, V-LIB-2, V-FILE-1, V-FILE-2)
- PID (V-PID-1, V-PID-2, V-PID-3)
- Idempotency (IDEM-1 through IDEM-9, re-run scenarios A–D)
- Migration (MIGR-1 through MIGR-5, coexistence doctrine)
- Readiness gates (§5.1–5.6 from T08)
- Cross-references to validation module functions

**11b. `docs/reference/provisioning/seeded-file-manifest.md`**

Reference listing all 18 template entries + 2 add-on entries:
- Columns: fileName, targetLibrary, assetPath, family origin, asset status
- Missing-asset behavior documentation
- Add-on activation rules

**11c. `docs/reference/provisioning/department-library-folders.md`**

Reference listing:
- 3 core libraries (all projects)
- 2 department-specific libraries with folder trees
- Pruning rule (only department-matched library is created)
- Folder parent-first ordering requirement

---

### Step 12 — Update `current-state-map.md` §2 [EDIT]

Add classification rows:
```
| `backend/functions/src/validation/` | **Canonical Current-State** | G2 provisioning validation module (structural, PID, file, idempotency, migration rules); produced by W0-G2-T08 |
| `docs/reference/provisioning/g2-validation-rules.md` | **Living Reference (Diátaxis)** | G2 validation rules reference — structural, PID, idempotency, migration; produced by W0-G2-T08 |
| `docs/reference/provisioning/seeded-file-manifest.md` | **Living Reference (Diátaxis)** | Seeded template file manifest reference; produced by W0-G2-T08 |
| `docs/reference/provisioning/department-library-folders.md` | **Living Reference (Diátaxis)** | Department library + folder tree reference; produced by W0-G2-T08 |
```

---

## Files Summary

| File | Action | Category |
|------|--------|----------|
| `backend/functions/src/validation/types.ts` | NEW | Code |
| `backend/functions/src/validation/structural-validators.ts` | NEW | Code |
| `backend/functions/src/validation/pid-validators.ts` | NEW | Code |
| `backend/functions/src/validation/file-validators.ts` | NEW | Code |
| `backend/functions/src/validation/idempotency-rules.ts` | NEW | Code |
| `backend/functions/src/validation/migration-rules.ts` | NEW | Code |
| `backend/functions/src/validation/index.ts` | NEW | Code |
| `backend/functions/src/validation/structural-validators.test.ts` | NEW | Test |
| `backend/functions/src/services/sharepoint-service.ts` | EDIT | Code (fileExists + IDEM-9 fix) |
| `backend/functions/src/test-utils/mock-services.ts` | EDIT | Code (3 missing mocks) |
| `docs/reference/provisioning/g2-validation-rules.md` | NEW | Docs |
| `docs/reference/provisioning/seeded-file-manifest.md` | NEW | Docs |
| `docs/reference/provisioning/department-library-folders.md` | NEW | Docs |
| `docs/architecture/blueprint/current-state-map.md` | EDIT | Docs (4 new rows) |

---

## What T09 Gets to Test Against

1. **Structural validators** — `runAllStructuralValidations()` returns all-passed for current config; individual validators testable per-rule
2. **PID validators** — `runAllPidValidations()` verifies contract across all 26 lists
3. **File validators** — `validateTemplateAssets()` reports present/missing with correct severity
4. **Idempotency rules** — `IDEMPOTENCY_RULES` array + `RERUN_SCENARIOS` for structured test generation; `fileExists` method enables mock-based upload-skip testing
5. **Migration rules** — `MIGRATION_RULES` + `COEXISTENCE_DOCTRINE` for documentation-level assertions
6. **Mock services** — Complete mock coverage for `uploadTemplateFile`, `createFolderIfNotExists`, `fileExists`

## What T08 Implements Now vs. Defers

**Implements:**
- All V-STRUCT, V-PID, V-LIB, V-FILE validation as pure config-level validators
- IDEM-9 fix (no-overwrite) in SharePointService
- `fileExists` service method
- Mock services completeness
- All 3 reference documents
- Typed idempotency/migration rule contracts

**Defers to T09:**
- Integration tests exercising idempotency with mocked SharePoint (scenarios A–D)
- Throttle simulation tests for withRetry
- Staging duration measurement for Step 4b decision
- Asset-existence verification against live SharePoint
- Folder idempotency integration tests

**Defers to Wave 1:**
- Data migration, pre-seeded rows, template refresh, UI validation screens

---

## Verification

```bash
cd backend/functions
npx vitest run src/validation/                                       # New T08 validation tests
npx vitest run src/config/list-definitions.test.ts                   # Core regression
npx vitest run src/config/workflow-list-definitions.test.ts          # Composition regression
npx vitest run src/config/template-file-manifest.test.ts             # Manifest regression
npx tsc --noEmit                                                     # Type-check (mock services fix should resolve interface mismatch)
```
