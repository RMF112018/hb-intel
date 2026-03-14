# W0-G2-T09 — Testing, Validation, and Provisioning Verification

## Context

T09 implements comprehensive test coverage for all G2 provisioning work. The T09 plan document (`docs/architecture/plans/MVP/G2/W0-G2-T09-Testing-Validation-and-Provisioning-Verification.md`) defines 62 test cases across 10 categories. This implementation plan adapts T09 to repo truth, fixes a critical mock gap that breaks existing tests, and delivers 69 concrete test cases.

**Key repo findings:**
- `IMockServices` / `createMockServices()` are **missing** `uploadTemplateFile` and `createFolderIfNotExists` — added by T07 to `ISharePointService` but never added to test mocks
- The existing step 3 test in `steps.test.ts:81` is **broken** — it calls `executeStep3` which invokes `services.sharePoint.uploadTemplateFile(...)`, but that method doesn't exist on the mock → TypeError caught → returns `Failed` instead of `Completed`
- T08 validation module was **never implemented** — `backend/functions/src/validation/` does not exist
- `fileExists` method does **not** exist on `ISharePointService` (T08 scope, not done)
- No Step 4b — single `step4-data-lists.ts` handles both core (8) + workflow (26) lists
- Template manifest: **18** entries (4 core + 4 startup + 2 closeout + 4 safety + 1 project-controls + 3 financial)
- Workflow lists: **26** (not 25 as T09 plan states — repo truth governs)
- Parent/child pairs: **6** (startup×2, closeout×1, safety×2, financial×1)
- Department types: `commercial` (34 folders), `luxury-residential` (37 folders)
- Add-ons: 2 (`safety-pack`, `closeout-pack`)
- `vitest.config.ts` coverage includes are missing several T07 source files

**Authoritative source:** `docs/architecture/plans/MVP/G2/W0-G2-T09-Testing-Validation-and-Provisioning-Verification.md`

---

## Implementation Steps

### Step 1 — Fix `mock-services.ts` (Prerequisite for ALL step tests)

**File:** `backend/functions/src/test-utils/mock-services.ts` [EDIT]

Add to `IMockServices.sharePoint` interface:
```typescript
uploadTemplateFile: Mock;
createFolderIfNotExists: Mock;
```

Add to `createMockServices()` factory sharePoint object:
```typescript
uploadTemplateFile: vi.fn(async () => true),
createFolderIfNotExists: vi.fn(async () => {}),
```

Keep existing `uploadTemplateFiles` (old bulk method) for backward compatibility.

---

### Step 2 — Fix Broken Step 3 Test in `steps.test.ts`

**File:** `backend/functions/src/functions/provisioningSaga/steps/steps.test.ts` [EDIT]

Replace the step 3 test (lines 81-91) to use T07 per-file contract:
- First call: assert `ok.status === 'Completed'` and `uploadTemplateFile` was called
- Second call: mock `uploadTemplateFile` to reject, assert `fail.status === 'Failed'`

Also verify step 4 test still passes after mock fix (it uses `createDataLists` which is already in mock — should be fine).

---

### Step 3 — Create `retry.test.ts` (TC-FAIL: 6 tests)

**File:** `backend/functions/src/utils/retry.test.ts` [NEW]

| TC ID | Test |
|-------|------|
| TC-FAIL-01 | Succeeds on first attempt without retry |
| TC-FAIL-02 | Retries transient 429 error and succeeds on attempt 2 |
| TC-FAIL-03 | Exhausts maxAttempts and throws last error |
| TC-FAIL-04 | Does NOT retry non-transient errors |
| TC-FAIL-05 | Honors Retry-After header — delay ≥ retryAfterMs * 1000 |
| TC-FAIL-06 | Calls `onRetry` callback with correct (error, attempt, delay) args |

**Implementation:** Use `vi.useFakeTimers()` + `vi.advanceTimersByTimeAsync()`. For TC-FAIL-05, attach `response.headers` with `get('Retry-After')` returning a numeric string to the error object. The `isTransient` default checks for '429' in the error message.

---

### Step 4 — Create `step3-template-files.test.ts` (TC-STEP 1–6, TC-SEED, TC-DEPT runtime: 18 tests)

**File:** `backend/functions/src/functions/provisioningSaga/steps/step3-template-files.test.ts` [NEW]

| TC ID | Category | Test |
|-------|----------|------|
| TC-STEP-01 | STEP | Returns Completed with stepNumber=3, stepName='Upload Template Files' |
| TC-STEP-02 | STEP | Calls `uploadTemplateFile` once per manifest entry (18 calls) |
| TC-STEP-03 | STEP | Returns Failed with errorMessage when uploadTemplateFile rejects |
| TC-STEP-04 | STEP | With addOns=['safety-pack'], uploads safety-pack template file |
| TC-STEP-05 | STEP | With addOns=['closeout-pack'], uploads closeout-pack template file |
| TC-STEP-06 | STEP | With unknown addOn key, skips gracefully |
| TC-SEED-01 | SEED | Each uploadTemplateFile call receives correct {fileName, targetLibrary, assetPath} |
| TC-SEED-02 | SEED | With no addOns on status, only uploads core manifest files |
| TC-SEED-03 | SEED | With empty addOns array, only uploads core manifest files |
| TC-DEPT-01 | DEPT | department='commercial' → creates 'Commercial Documents' library |
| TC-DEPT-02 | DEPT | department='commercial' → skips createDocumentLibrary when documentLibraryExists=true |
| TC-DEPT-03 | DEPT | department='commercial' → calls createFolderIfNotExists 34 times |
| TC-DEPT-04 | DEPT | department='luxury-residential' → creates 'Luxury Residential Documents' library |
| TC-DEPT-05 | DEPT | department='luxury-residential' → calls createFolderIfNotExists 37 times |
| TC-DEPT-06 | DEPT | No department → skips library creation and folder provisioning entirely |
| TC-DEPT-07 | DEPT | Unknown department → skips gracefully |
| TC-DEPT-08 | DEPT | Folder paths created in parent-first order (verified via mock call order) |

**Implementation:** Import `TEMPLATE_FILE_MANIFEST`, `ADD_ON_DEFINITIONS`, `DEPARTMENT_LIBRARIES`, `DEPARTMENT_FOLDER_TREES`. Set `status.department` and `(status as any).addOns` for scenario variation. Use `createMockServices()` from Step 1.

---

### Step 5 — Create `step4-data-lists.test.ts` (TC-STEP 7–10: 4 tests)

**File:** `backend/functions/src/functions/provisioningSaga/steps/step4-data-lists.test.ts` [NEW]

| TC ID | Test |
|-------|------|
| TC-STEP-07 | Returns Completed with stepNumber=4, stepName='Create Data Lists' |
| TC-STEP-08 | Calls createDataLists twice: first with core (8 lists), second with workflow (26 lists) |
| TC-STEP-09 | Passes `{ projectNumber: status.projectNumber }` as context to second createDataLists call |
| TC-STEP-10 | Returns Failed with errorMessage when createDataLists rejects |

**Implementation:** Import `HB_INTEL_LIST_DEFINITIONS` and `HB_INTEL_WORKFLOW_LIST_DEFINITIONS`. Use `toHaveBeenNthCalledWith` for argument verification.

---

### Step 6 — Create `schema-validation.test.ts` (TC-SCHEMA: 14 tests)

**File:** `backend/functions/src/config/schema-validation.test.ts` [NEW]

Cross-cutting schema correctness across ALL list definitions (core + workflow = 34 lists).

| TC ID | Test |
|-------|------|
| TC-SCHEMA-01 | HB_INTEL_LIST_DEFINITIONS has exactly 8 core lists |
| TC-SCHEMA-02 | HB_INTEL_WORKFLOW_LIST_DEFINITIONS has exactly 26 workflow lists |
| TC-SCHEMA-03 | Every list has a non-empty `title` |
| TC-SCHEMA-04 | Every list has a non-empty `description` |
| TC-SCHEMA-05 | Every list has `template: 100` |
| TC-SCHEMA-06 | Every list has at least one field |
| TC-SCHEMA-07 | Every field has non-empty `internalName` and `displayName` |
| TC-SCHEMA-08 | Field `type` is one of the 9 allowed values |
| TC-SCHEMA-09 | Choice fields have a non-empty `choices` array |
| TC-SCHEMA-10 | No duplicate `internalName` within any single list |
| TC-SCHEMA-11 | No duplicate list titles across all 34 definitions |
| TC-SCHEMA-12 | Lookup fields have `lookupListTitle` defined |
| TC-SCHEMA-13 | All workflow lists have `listFamily` and `provisioningOrder` defined |
| TC-SCHEMA-14 | Every list with `parentListTitle` references an existing list |

**Implementation:** Import both definition arrays. Combine into `ALL_LISTS = [...core, ...workflow]` for cross-cutting checks.

---

### Step 7 — Create `pid-contract.test.ts` (TC-PID: 4 tests)

**File:** `backend/functions/src/config/pid-contract.test.ts` [NEW]

| TC ID | Test |
|-------|------|
| TC-PID-01 | Every workflow list has a `pid` field with `internalName: 'pid'` |
| TC-PID-02 | Every `pid` field has `required: true` and `indexed: true` |
| TC-PID-03 | Every `pid` field has `defaultValue` containing `{{projectNumber}}` |
| TC-PID-04 | No core list has a `pid` field (pid is workflow-only) |

---

### Step 8 — Create `parent-child-lookup.test.ts` (TC-PARENT: 4 tests)

**File:** `backend/functions/src/config/parent-child-lookup.test.ts` [NEW]

| TC ID | Test |
|-------|------|
| TC-PARENT-01 | Exactly 6 lists have `parentListTitle` defined |
| TC-PARENT-02 | Every `parentListTitle` references an existing list title in the workflow set |
| TC-PARENT-03 | Every child list has at least one Lookup field with `lookupListTitle` matching its parent |
| TC-PARENT-04 | Parent lists have lower `provisioningOrder` than their children |

---

### Step 9 — Create `department-libraries.test.ts` (TC-DEPT config: 8 tests)

**File:** `backend/functions/src/config/department-libraries.test.ts` [NEW]

Config-level tests (distinct from Step 4's runtime behavior tests).

| TC ID | Test |
|-------|------|
| TC-DEPT-CFG-01 | DEPARTMENT_LIBRARIES has exactly 2 keys: 'commercial', 'luxury-residential' |
| TC-DEPT-CFG-02 | Commercial has 1 library: 'Commercial Documents' with versioning=true |
| TC-DEPT-CFG-03 | Luxury Residential has 1 library: 'Luxury Residential Documents' with versioning=true |
| TC-DEPT-CFG-04 | DEPARTMENT_FOLDER_TREES keys match DEPARTMENT_LIBRARIES keys |
| TC-DEPT-CFG-05 | Commercial folder tree has 34 paths |
| TC-DEPT-CFG-06 | Luxury Residential folder tree has 37 paths |
| TC-DEPT-CFG-07 | All folder paths are non-empty, no leading/trailing slashes |
| TC-DEPT-CFG-08 | Folder tree `libraryName` matches corresponding DEPARTMENT_LIBRARIES name |

---

### Step 10 — Create `idempotency.test.ts` (TC-IDEM: 5 tests)

**File:** `backend/functions/src/functions/provisioningSaga/__tests__/idempotency.test.ts` [NEW]

| TC ID | Test |
|-------|------|
| TC-IDEM-01 | Step 3 called twice → both return Completed |
| TC-IDEM-02 | Step 4 called twice → both return Completed |
| TC-IDEM-03 | Step 3 with department: documentLibraryExists=true → skips createDocumentLibrary |
| TC-IDEM-04 | Step 3 with department: documentLibraryExists=false → calls createDocumentLibrary |
| TC-IDEM-05 | Step 4 partial failure on first call → second call passes same definitions |

---

### Step 11 — Create `migration-coexistence.test.ts` (TC-MCOEX: 4 tests)

**File:** `backend/functions/src/functions/provisioningSaga/__tests__/migration-coexistence.test.ts` [NEW]

| TC ID | Test |
|-------|------|
| TC-MCOEX-01 | `uploadTemplateFiles` (old bulk) method exists on MockSharePointService |
| TC-MCOEX-02 | `uploadTemplateFile` (new per-file) method exists on MockSharePointService |
| TC-MCOEX-03 | `createFolderIfNotExists` method exists on MockSharePointService |
| TC-MCOEX-04 | Step 3 uses per-file `uploadTemplateFile`, not bulk `uploadTemplateFiles` |

**Implementation:** Instantiate `MockSharePointService` from `sharepoint-service.ts`. Assert method existence via typeof. For TC-MCOEX-04, run step3 with mocks and verify `uploadTemplateFile` called, `uploadTemplateFiles` NOT called.

---

### Step 12 — Create `integration.test.ts` (TC-PILOT: 2 tests, env-gated)

**File:** `backend/functions/src/functions/provisioningSaga/__tests__/integration.test.ts` [NEW]

**Env gate:** `describe.runIf(process.env.SHAREPOINT_INTEGRATION_TEST_ENABLED === 'true')`

| TC ID | Test |
|-------|------|
| TC-PILOT-01 | Full Step 3 + Step 4 against live SharePoint (18 templates, 34 lists) — measures duration |
| TC-PILOT-02 | Step 3 with department='commercial' creates library + 34 folders on live site |

**Implementation:** Follows `smoke.test.ts` pattern — real `SharePointService`, unique site per test, cleanup in `afterEach`, 180s timeout.

---

### Step 13 — Update `vitest.config.ts`

**File:** `backend/functions/vitest.config.ts` [EDIT]

**13a. Coverage includes** — add:
```
'src/utils/retry.ts',
'src/config/core-libraries.ts',
'src/config/add-on-definitions.ts',
'src/config/list-definitions.ts',
'src/config/workflow-list-definitions.ts',
'src/config/startup-list-definitions.ts',
'src/config/closeout-list-definitions.ts',
'src/config/safety-list-definitions.ts',
'src/config/project-controls-list-definitions.ts',
'src/config/financial-list-definitions.ts',
```

**13b. Unit project exclude** — add integration test:
```
'src/functions/provisioningSaga/**/__tests__/integration.test.ts'
```

**13c. Smoke project include** — add integration test:
```
'src/functions/provisioningSaga/**/__tests__/integration.test.ts'
```

---

### Step 14 — Update `current-state-map.md` §2

**File:** `docs/architecture/blueprint/current-state-map.md` [EDIT]

Add classification rows for T09 test artifacts:
```
| `backend/functions/src/utils/retry.test.ts` | **Canonical Current-State** | withRetry Retry-After + backoff tests (TC-FAIL-01–06); produced by W0-G2-T09 |
| `backend/functions/src/config/schema-validation.test.ts` | **Canonical Current-State** | Cross-cutting schema validation tests (TC-SCHEMA-01–14); produced by W0-G2-T09 |
| `backend/functions/src/config/pid-contract.test.ts` | **Canonical Current-State** | PID contract compliance tests (TC-PID-01–04); produced by W0-G2-T09 |
| `backend/functions/src/config/parent-child-lookup.test.ts` | **Canonical Current-State** | Parent/child Lookup structure tests (TC-PARENT-01–04); produced by W0-G2-T09 |
| `backend/functions/src/config/department-libraries.test.ts` | **Canonical Current-State** | Department library + folder tree config tests (TC-DEPT-CFG-01–08); produced by W0-G2-T09 |
```

---

## Files Summary

| # | File | Action | Tests |
|---|------|--------|-------|
| 1 | `src/test-utils/mock-services.ts` | EDIT | — |
| 2 | `src/functions/provisioningSaga/steps/steps.test.ts` | EDIT | fix 1 |
| 3 | `src/utils/retry.test.ts` | NEW | 6 |
| 4 | `src/functions/provisioningSaga/steps/step3-template-files.test.ts` | NEW | 18 |
| 5 | `src/functions/provisioningSaga/steps/step4-data-lists.test.ts` | NEW | 4 |
| 6 | `src/config/schema-validation.test.ts` | NEW | 14 |
| 7 | `src/config/pid-contract.test.ts` | NEW | 4 |
| 8 | `src/config/parent-child-lookup.test.ts` | NEW | 4 |
| 9 | `src/config/department-libraries.test.ts` | NEW | 8 |
| 10 | `src/functions/provisioningSaga/__tests__/idempotency.test.ts` | NEW | 5 |
| 11 | `src/functions/provisioningSaga/__tests__/migration-coexistence.test.ts` | NEW | 4 |
| 12 | `src/functions/provisioningSaga/__tests__/integration.test.ts` | NEW | 2 |
| 13 | `vitest.config.ts` | EDIT | — |
| 14 | `docs/architecture/blueprint/current-state-map.md` | EDIT | — |

**Total: 10 new test files, 4 edited files, 69 new test cases + 1 fixed test**

---

## T09 Coverage by Category

| Category | Unit Tests | Integration (env-gated) | TC IDs |
|----------|-----------|------------------------|--------|
| Schema/Config | 14 | — | TC-SCHEMA-01–14 |
| Step Behavior | 22 (6 step3 + 12 dept-runtime + 4 step4) | — | TC-STEP-01–10, TC-DEPT-01–08, TC-SEED-01–03 |
| Failure/Retry | 6 | — | TC-FAIL-01–06 |
| PID Contract | 4 | — | TC-PID-01–04 |
| Parent/Child | 4 | — | TC-PARENT-01–04 |
| Dept Config | 8 | — | TC-DEPT-CFG-01–08 |
| Idempotency | 5 | — | TC-IDEM-01–05 |
| Migration | 4 | — | TC-MCOEX-01–04 |
| Pilot/Perf | — | 2 | TC-PILOT-01–02 |

---

## Deviations from T09 Plan (Repo-Driven)

| T09 Plan States | Repo Truth | Adaptation |
|-----------------|------------|------------|
| 25 G2 workflow lists | 26 lists | Tests assert 26 |
| `fileExists` method available | Does not exist (T08 not implemented) | Skip IDEM-9 no-overwrite tests |
| Step 4b may exist | No Step 4b | Test single step4 only |
| Test file structure in `tests/` directory | Repo uses colocation (`src/**/*.test.ts`) | Follow colocation convention |
| TC-SEED-02 "uploaded files are non-zero-byte" | Cannot verify via mock | Defer to integration test |
| TC-SEED-05 "safety-critical templates present on disk" | 0-byte placeholder files | Covered by existing template-file-manifest.test.ts asset checks |

---

## Verification

```bash
cd backend/functions

# Step 1-2 fix validation
npx vitest run src/functions/provisioningSaga/steps/steps.test.ts

# New T09 unit tests
npx vitest run src/utils/retry.test.ts
npx vitest run src/config/schema-validation.test.ts
npx vitest run src/config/pid-contract.test.ts
npx vitest run src/config/parent-child-lookup.test.ts
npx vitest run src/config/department-libraries.test.ts
npx vitest run src/functions/provisioningSaga/steps/step3-template-files.test.ts
npx vitest run src/functions/provisioningSaga/steps/step4-data-lists.test.ts
npx vitest run src/functions/provisioningSaga/__tests__/idempotency.test.ts
npx vitest run src/functions/provisioningSaga/__tests__/migration-coexistence.test.ts

# Full regression
npx vitest run

# Type-check
npx tsc --noEmit
```

---

## Execution Order

```
Step 1 (mock fix) ──→ Step 2 (steps.test.ts fix) ──→ Steps 3-11 (all independent)
                                                              │
                                                        Step 12 (integration)
                                                              │
                                                        Step 13 (vitest.config)
                                                              │
                                                        Step 14 (current-state-map)
```

Steps 3–11 are independent and can be implemented in any order after Steps 1–2.
