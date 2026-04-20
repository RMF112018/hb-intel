# W0-G2-T09 — Testing, Validation, and Provisioning Verification

> **Doc Classification:** Canonical Normative Plan — Wave 0 Group 2 task plan defining the complete testing and verification strategy for all G2 provisioned structures, implementation code, and configuration contracts. This plan translates T08 validation rules into executable test cases and defines the proof requirements for G2 pilot readiness.

**Phase Reference:** Wave 0 Group 2 — Backend Hardening and Workflow Data Foundations Plan
**Depends On:** T01 (schema contracts), T02–T06 (workflow-family schemas), T07 (implementation specifications), T08 (validation rules — T09 translates T08 into tests)
**Unlocks:** G2 pilot deployment; G3 platform wiring entry conditions
**Repo Paths Governed:** `backend/functions/src/functions/provisioningSaga/steps/`, `backend/functions/src/config/`, `backend/functions/src/services/sharepoint-service.ts`, `backend/functions/tests/` (or equivalent test directory)

---

## Objective

T09 is the testing governance plan for G2. It defines every test that must exist, what each test must verify, what constitutes a pass, and what the aggregate test suite must prove before G2 implementation is considered ready for pilot deployment.

T09 is paired with T08. T08 defines the rules. T09 defines the tests that verify those rules are satisfied in the implementation. If T08 says "every G2 list must have the `pid` column indexed," T09 contains test `TC-PID-01` that verifies that property in the configuration and `TC-PID-02` that verifies it against a live provisioned site.

T09 does not define how the implementation works — that is T07. T09 defines what must be proven about the implementation's outputs.

---

## Scope

T09 covers:

1. Unit tests — configuration, schema, and helper logic verified without network calls
2. Behavior tests — provisioning step logic verified with mocked SharePoint responses
3. Integration tests — provisioning steps verified against a real dev/staging SharePoint site
4. Idempotency tests — re-run and partial-failure scenarios
5. Department-specific tree verification — commercial vs. luxury-residential pruning
6. Parent/child list structure tests — Lookup column correctness
7. `pid` contract tests — presence, type, indexing, and default value
8. Seeded-file tests — upload, skip-if-exists, graceful-skip-if-missing
9. Negative-path and error-recovery tests — throttle, partial failure, compensation
10. Migration and coexistence validation — file-backed and list-backed state
11. Pilot readiness gate — what must pass before G2 is deployed to the first pilot project

T09 does not cover:

- Data quality of items entered by users into the lists (Wave 1)
- UI form validation (G4/G5 scope)
- Performance optimization of list queries (Wave 1)
- Authentication and authorization tests (G1 T02–T03 scope)

---

## 1. Test Organization and Naming

### 1.1 Test File Structure

All G2 tests live under `backend/functions/tests/` (or the established test directory per the repo's Vitest configuration). The recommended structure:

```
backend/functions/tests/
├── unit/
│   ├── config/
│   │   ├── list-definitions.test.ts          # Schema contract tests
│   │   ├── workflow-list-definitions.test.ts  # G2 list definitions
│   │   ├── template-file-manifest.test.ts     # Seeded file manifest
│   │   └── add-on-definitions.test.ts         # Add-on config
│   ├── services/
│   │   └── sharepoint-service.test.ts         # Service method unit tests
│   └── steps/
│       ├── step3-template-files.test.ts       # Step 3 logic
│       ├── step4-data-lists.test.ts           # Step 4 logic
│       └── step4b-workflow-lists.test.ts      # Step 4b logic (conditional)
├── behavior/
│   ├── provisioning-idempotency.test.ts       # Re-run scenarios
│   ├── provisioning-partial-failure.test.ts   # Mid-execution failure
│   └── provisioning-throttle.test.ts          # withRetry Retry-After behavior
└── integration/
    ├── structural-validation.test.ts          # Live list/library presence
    ├── pid-contract.test.ts                   # pid column verification
    ├── parent-child-lookup.test.ts            # Lookup column correctness
    ├── department-library.test.ts             # Pruning and folder tree
    └── seeded-files.test.ts                   # File upload verification
```

### 1.2 Test ID Convention

Every test case is identified by a stable test ID in the format:

```
TC-{CATEGORY}-{NUMBER}
```

Categories:

| Category | Scope |
|----------|-------|
| `SCHEMA` | Configuration and schema validation (unit) |
| `STEP` | Provisioning step behavior (unit/behavior) |
| `PID` | pid column contract |
| `PARENT` | Parent/child list structure |
| `DEPT` | Department library and folder tree |
| `SEED` | Seeded file upload and idempotency |
| `IDEM` | Idempotency and re-run scenarios |
| `FAIL` | Failure, throttle, and recovery |
| `INTG` | Integration tests against live site |
| `PILOT` | Pilot readiness gate tests |

Test IDs are referenced in T08 and must be stable across refactors. If a test is deleted, its ID must not be reused.

---

## 2. Unit Tests — Configuration and Schema Validation

These tests verify that the static configuration constants are internally consistent and structurally correct before any network call is made. They run in CI on every commit.

### TC-SCHEMA-01: Core list count

**What:** Verify `HB_INTEL_LIST_DEFINITIONS` contains exactly 8 list definitions.

**Pass criterion:** `HB_INTEL_LIST_DEFINITIONS.length === 8`

**Why:** A regression here would silently drop or add core lists to every provisioned site.

---

### TC-SCHEMA-02: G2 workflow list count

**What:** Verify `HB_INTEL_WORKFLOW_LIST_DEFINITIONS` contains exactly 25 list definitions.

**Pass criterion:** `HB_INTEL_WORKFLOW_LIST_DEFINITIONS.length === 25`

**Why:** The complete G2 list set is 25 lists. Any deviation is a provisioning scope regression.

---

### TC-SCHEMA-03: All G2 lists have pid field

**What:** For every entry in `HB_INTEL_WORKFLOW_LIST_DEFINITIONS`, verify a field with `internalName: 'pid'` is present in the `fields` array.

**Pass criterion:** Every list definition has exactly one field where `field.internalName === 'pid'`.

**Why:** T01 §1 establishes `pid` as a mandatory field on every G2 list. This test prevents any list from being added without a `pid` field.

---

### TC-SCHEMA-04: pid field type, required, and indexed

**What:** For every `pid` field across all G2 lists, verify:
- `type === 'Text'` (single-line)
- `required === true`
- `indexed === true`

**Pass criterion:** All three properties are satisfied for every `pid` field instance.

**Why:** An un-indexed `pid` would cause cross-list queries to perform full table scans (T08 §2.1).

---

### TC-SCHEMA-05: pid field display name

**What:** For every `pid` field, verify `displayName === 'Project ID'`.

**Pass criterion:** All `pid` fields have `displayName === 'Project ID'`.

**Why:** Display name consistency is required for the UI to reference the column correctly.

---

### TC-SCHEMA-06: All G2 lists have Status field

**What:** For every entry in `HB_INTEL_WORKFLOW_LIST_DEFINITIONS`, verify a field with `internalName: 'Status'` is present.

**Pass criterion:** Every list definition has a `Status` field.

**Why:** T08 §1.2 requires a `Status` Choice column on every G2 list.

---

### TC-SCHEMA-07: Parent lists precede child lists in definition order

**What:** For each confirmed parent/child pair from T08 §1.3, verify the parent list appears at an earlier index in `HB_INTEL_WORKFLOW_LIST_DEFINITIONS` than its child.

**Parent/child pairs to check:**
- Startup Checklist before Startup Checklist Items
- Estimating Kickoff Log before Kickoff Responsibility Items
- Closeout Checklist before Closeout Checklist Items
- JHA Log before JHA Steps
- JHA Log before JHA Attendees
- Buyout Log before Buyout Bid Lines

**Pass criterion:** For every pair, `indexOf(parent) < indexOf(child)`.

**Why:** Step 4 creates lists in definition order. Lookup columns on child lists reference the parent by title — if the parent does not yet exist at Lookup creation time, the column creation fails. Parent-before-child ordering prevents this.

---

### TC-SCHEMA-08: Child lists have ParentRecord Lookup field

**What:** For each child list in the confirmed parent/child pairs, verify a field with `internalName: 'ParentRecord'` and `type: 'Lookup'` is present.

**Child lists to check:** Startup Checklist Items, Kickoff Responsibility Items, Closeout Checklist Items, JHA Steps, JHA Attendees, Buyout Bid Lines.

**Pass criterion:** Every child list has exactly one `ParentRecord` Lookup field.

**Why:** The parent/child relational contract requires this field (T01 §4, T08 §1.3).

---

### TC-SCHEMA-09: Lookup fields specify lookupListTitle and lookupFieldName

**What:** For every `ParentRecord` Lookup field across all child lists, verify:
- `lookupListTitle` is set and is non-empty
- `lookupFieldName === 'ID'`
- `lookupListTitle` matches the expected parent list title per T08 §1.3

**Pass criterion:** All three conditions satisfied for every Lookup field.

**Why:** A Lookup field without a target list title would fail at SharePoint column creation time with a cryptic error.

---

### TC-SCHEMA-10: No duplicate list titles in combined definitions

**What:** Combine `HB_INTEL_LIST_DEFINITIONS` and `HB_INTEL_WORKFLOW_LIST_DEFINITIONS`. Verify no two entries share the same `title`.

**Pass criterion:** All 33 list titles are unique.

**Why:** SharePoint uses list titles as identifiers for lookups and user navigation. Duplicate titles would cause unpredictable behavior.

---

### TC-SCHEMA-11: Core list fields contain no defaultValue or indexed properties

**What:** For every field in `HB_INTEL_LIST_DEFINITIONS`, verify no field has `defaultValue` or `indexed` set (these properties are G2 additions and must not appear on core list fields unless intentionally added, such as `PunchBatchId`).

**Exception:** `PunchBatchId` on the `Punch List` may have these properties if G2 adds them intentionally.

**Pass criterion:** No unintended `defaultValue` or `indexed` on core list fields.

**Why:** Prevents accidental structural drift in core lists from G2 development activity.

---

### TC-SCHEMA-12: Template file manifest completeness

**What:** For every entry in `TEMPLATE_FILE_MANIFEST`, verify:
- `libraryName` is non-empty
- `fileName` is non-empty
- `assetPath` is non-empty and ends with a recognized file extension (`.xlsx`, `.docx`, `.pdf`)

**Pass criterion:** All manifest entries pass the structural check.

**Why:** A manifest entry with a missing or malformed path would cause a runtime error during seeded file upload.

---

### TC-SCHEMA-13: Add-on definitions reference valid library names

**What:** For every entry in `ADD_ON_DEFINITIONS` that specifies template files, verify each referenced `libraryName` appears in `CORE_LIBRARIES` or `DEPARTMENT_LIBRARIES`.

**Pass criterion:** All add-on library names are resolvable.

**Why:** An add-on that references a non-existent library would silently fail or error at upload time.

---

### TC-SCHEMA-14: Department library definitions are non-empty

**What:** Verify `DEPARTMENT_LIBRARIES` contains at least one entry for `commercial` and at least one for `luxury-residential`.

**Pass criterion:** Both department keys are present with non-empty library name values.

**Why:** Department pruning in Step 3 depends on these definitions being present.

---

## 3. Unit Tests — Provisioning Step Logic

These tests verify the behavior of the provisioning step functions with mocked SharePoint service dependencies. They do not make network calls.

### TC-STEP-01: Step 3 calls uploadTemplateFiles for all manifest entries

**What:** Mock `SharePointService`. Call Step 3 with a test `SagaStatus`. Verify `uploadTemplateFiles` (or the equivalent seeded-file upload method) is called once per entry in `TEMPLATE_FILE_MANIFEST`.

**Pass criterion:** Upload method called `TEMPLATE_FILE_MANIFEST.length` times with correct `(siteUrl, fileName, libraryName)` arguments.

---

### TC-STEP-02: Step 3 prunes department library correctly for commercial

**What:** Call Step 3 with `status.department === 'commercial'`. Mock the library creation and pruning calls. Verify:
- `Commercial Documents` library creation is called
- `Luxury Residential Documents` library creation is NOT called
- Deletion (pruning) of `Luxury Residential Documents` is called if it exists

**Pass criterion:** Exactly the correct library creation/pruning calls are made.

---

### TC-STEP-03: Step 3 prunes department library correctly for luxury-residential

**What:** Same as TC-STEP-02 but with `status.department === 'luxury-residential'`. Verify:
- `Luxury Residential Documents` library creation is called
- `Commercial Documents` library creation is NOT called

**Pass criterion:** Exactly the correct library creation/pruning calls are made.

---

### TC-STEP-04: Step 3 creates correct folder tree for commercial department

**What:** Call Step 3 with `status.department === 'commercial'`. Verify `createFolderIfNotExists` is called for each Level 1 and Level 2 folder specified in T07 §6.2 under `Commercial Documents`.

**Pass criterion:** All folders from T07 §6.2 are requested via `createFolderIfNotExists`. No folders from T07 §6.3 (luxury-residential) are requested.

---

### TC-STEP-05: Step 3 creates correct folder tree for luxury-residential department

**What:** Call Step 3 with `status.department === 'luxury-residential'`. Verify `createFolderIfNotExists` is called for each folder from T07 §6.3 under `Luxury Residential Documents`.

**Pass criterion:** All folders from T07 §6.3 are requested. No folders from T07 §6.2 (commercial) are requested.

---

### TC-STEP-06: Step 3 graceful-skip for missing asset file

**What:** Mock the asset file existence check to return `false` for one manifest entry. Call Step 3. Verify:
- No upload is attempted for the missing entry
- A warning is logged (not an error)
- Step 3 completes with status `Completed` (not `Failed`)
- The missing asset is recorded in the step result output

**Pass criterion:** Step completes successfully; warning logged; no exception thrown.

---

### TC-STEP-07: Step 4 calls createDataLists with all 8 core lists

**What:** Mock `SharePointService.createDataLists`. Call Step 4. Verify `createDataLists` is called with `HB_INTEL_LIST_DEFINITIONS` (all 8 lists).

**Pass criterion:** `createDataLists` called once with the complete core list array.

---

### TC-STEP-08: Step 4 calls createDataLists with all 25 G2 workflow lists

**What:** Mock `SharePointService.createDataLists`. Call Step 4 (or Step 4b if split). Verify `createDataLists` is called with `HB_INTEL_WORKFLOW_LIST_DEFINITIONS` (all 25 lists).

**Pass criterion:** All 25 G2 lists are passed to `createDataLists`.

---

### TC-STEP-09: Step 4 result contains Completed status when all lists created

**What:** Mock `createDataLists` to return success for all calls. Call Step 4. Verify the step result has `status: 'Completed'`.

**Pass criterion:** Step result is `Completed`.

---

### TC-STEP-10: Step 4 result is Completed when all lists idempotently skipped

**What:** Mock `createDataLists` to return `idempotentSkip: true` for all calls (all lists already exist). Call Step 4. Verify the step result is still `Completed`, not `Failed`.

**Pass criterion:** Step result is `Completed` even when all operations are skips.

---

## 4. Behavior Tests — withRetry and Throttle Handling

### TC-FAIL-01: withRetry respects Retry-After header (429 response)

**What:** Mock an HTTP client that returns HTTP 429 with a `Retry-After: 5` header on the first attempt, then HTTP 200 on the second. Call `withRetry` wrapping the mocked call. Verify:
- The delay between attempts is approximately 5 seconds (from the Retry-After header), not the default `baseDelayMs`
- The second attempt succeeds
- No error is thrown

**Pass criterion:** Retry delay matches Retry-After value; operation succeeds on retry.

**Why:** This is the explicit G2.1 fix specified in T07 §2. Without this fix, SharePoint throttling causes cascading 429 failures because retries happen too fast.

---

### TC-FAIL-02: withRetry uses exponential backoff when no Retry-After header

**What:** Mock HTTP 429 response with no `Retry-After` header. Verify retry delay is `baseDelayMs * 2^(attempt-1)` (exponential backoff with jitter if implemented).

**Pass criterion:** Retry delay is at least `baseDelayMs` on first retry; increases on subsequent retries.

---

### TC-FAIL-03: withRetry exhausts maxAttempts and throws

**What:** Mock HTTP 429 for all attempts. Set `maxAttempts: 3`. Call `withRetry`. Verify:
- Three attempts are made
- An error is thrown after the third attempt
- The error message indicates max retries exceeded

**Pass criterion:** Error thrown after 3 attempts; exactly 3 calls made to the mocked function.

---

### TC-FAIL-04: Step 4 partial failure — mid-list creation abort

**What:** Mock `createDataLists` to succeed for the first 15 calls and throw an error on the 16th. Call Step 4. Verify:
- The error is propagated (step does not silently swallow it)
- The step result status is `Failed`
- The step result includes information about which list caused the failure

**Pass criterion:** Step fails cleanly with diagnostic output identifying the failing list.

---

### TC-FAIL-05: Step 4 retry after partial failure — idempotent skip of already-created lists

**What:** Use the scenario from TC-FAIL-04. After the partial failure, call Step 4 again. Mock `listExists` to return `true` for the first 15 lists and `false` for lists 16–25. Verify:
- Lists 1–15 are skipped (idempotent skip logged)
- Lists 16–25 are created
- Step completes with status `Completed`

**Pass criterion:** Step completes; exactly 10 lists created on retry; 15 skipped.

**Corresponds to:** T08 §3.5 Scenario C.

---

### TC-FAIL-06: Step 3 folder creation partial failure recovery

**What:** Mock `createFolderIfNotExists` to succeed for first 5 folders, fail on the 6th. Call Step 3. Then call again — mock all 5 previously-created folders as existing, and the remaining folders as not-yet-existing. Verify:
- Second run completes
- 5 folders are skipped
- Remaining folders are created

**Pass criterion:** Step completes on retry; correct skip/create behavior.

**Corresponds to:** T08 §3.5 Scenario D.

---

## 5. PID Contract Tests

### TC-PID-01: pid column configuration is correct on all G2 lists

**What:** For every list in `HB_INTEL_WORKFLOW_LIST_DEFINITIONS`, programmatically extract the `pid` field definition and verify:
- `internalName === 'pid'` (lowercase)
- `displayName === 'Project ID'`
- `type === 'Text'`
- `required === true`
- `indexed === true`

**Pass criterion:** All 25 G2 lists pass all five checks.

**Note:** This test overlaps with TC-SCHEMA-03 through TC-SCHEMA-05 but provides consolidated pid-specific reporting.

---

### TC-PID-02: pid default value is projectNumber, not projectId UUID

**What (integration — requires live site):** After provisioning a test project site, insert a test item into at least one G2 list (e.g., `Startup Checklist`) without explicitly setting the `pid` field. Retrieve the inserted item. Verify:
- The `pid` value equals `status.projectNumber`
- The `pid` value is not blank
- The `pid` value is not a UUID (does not match UUID regex)
- The `pid` value is not the `projectId` UUID

**Pass criterion:** `pid` value matches `projectNumber` exactly.

**Context:** T08 §2.2 explicitly requires this test. The pid alignment decision (T01 §1.2) determines what `projectNumber` looks like (e.g., `"25-001-01"`).

---

### TC-PID-03: pid contract document exists

**What:** Verify the file `docs/reference/data-model/pid-contract.md` exists on disk.

**Pass criterion:** File exists and is non-empty.

**Why:** T08 §2.3 requires the pid alignment decision to be documented in this file before pilot deployment.

---

### TC-PID-04: pid value is consistent across all list insertions in same project

**What (integration):** After provisioning a test project, insert one item into each of 5 randomly-selected G2 lists without setting `pid` explicitly. Retrieve all inserted items. Verify all `pid` values are identical and equal to `projectNumber`.

**Pass criterion:** All 5 inserted items have identical `pid` values equal to `projectNumber`.

**Why:** Cross-list queries depend on `pid` being a consistent join key. Inconsistent `pid` defaults would corrupt cross-family queries from the start.

---

## 6. Parent/Child List Structure Tests

### TC-PARENT-01: All 6 parent lists exist after provisioning

**What (integration):** After provisioning a test project site, verify each of the 6 parent lists exists:
- Startup Checklist
- Estimating Kickoff Log
- Closeout Checklist
- JHA Log
- Buyout Log
- _(Note: Closeout Checklist Items and JHA Attendees are child-only — verify their parents are in the list above)_

**Pass criterion:** All 6 parent lists exist by exact title.

---

### TC-PARENT-02: All 6 child lists exist after provisioning

**What (integration):** Verify each child list exists:
- Startup Checklist Items
- Kickoff Responsibility Items
- Closeout Checklist Items
- JHA Steps
- JHA Attendees
- Buyout Bid Lines

**Pass criterion:** All 6 child lists exist by exact title.

---

### TC-PARENT-03: Child list ParentRecord Lookup column points to correct parent

**What (integration):** For each of the 6 parent/child pairs, retrieve the `ParentRecord` column definition from the child list. Verify:
- Column exists with `InternalName: ParentRecord`
- Column type is `Lookup`
- Lookup target list title matches expected parent (per T08 §1.3)
- Lookup target field is `ID`

**Pass criterion:** All 6 pairs pass all 4 checks.

---

### TC-PARENT-04: Lookup target list is correctly created and reachable

**What (integration):** For each of the 6 child lists, attempt to query the parent list referenced by the Lookup column. Verify the query returns a valid (possibly empty) result set without a 404 or permissions error.

**Pass criterion:** All 6 parent lists are reachable and queryable.

**Why:** If the Lookup column points to a list title that doesn't exactly match the provisioned list title, SharePoint will silently fail to resolve the lookup at query time.

---

## 7. Department Library and Folder Tree Tests

### TC-DEPT-01: Commercial site has Commercial Documents library, not Luxury Residential

**What (integration):** Provision a test project with `department: 'commercial'`. Verify:
- `Commercial Documents` library exists with versioning enabled
- `Luxury Residential Documents` library does NOT exist

**Pass criterion:** Commercial library present; luxury residential library absent.

---

### TC-DEPT-02: Luxury-residential site has Luxury Residential Documents library, not Commercial

**What (integration):** Provision a test project with `department: 'luxury-residential'`. Verify:
- `Luxury Residential Documents` library exists with versioning enabled
- `Commercial Documents` library does NOT exist

**Pass criterion:** Luxury residential library present; commercial library absent.

---

### TC-DEPT-03: Core libraries exist regardless of department

**What (integration):** For both commercial and luxury-residential test projects, verify all three core libraries exist:
- `Project Documents` — versioning enabled
- `Drawings` — versioning enabled
- `Specifications` — versioning enabled

**Pass criterion:** All 3 core libraries present on both department sites.

---

### TC-DEPT-04: Commercial Documents Level 1 folders match T07 §6.2 specification

**What (integration):** For a commercial test project, list all top-level folders in `Commercial Documents`. Verify the folder list exactly matches the Level 1 folders specified in T07 §6.2. No extra folders; no missing folders.

**Pass criterion:** Exact match of folder titles at Level 1.

---

### TC-DEPT-05: Commercial Documents Level 2 folders match T07 §6.2 specification

**What (integration):** For a commercial test project, for each Level 1 folder in `Commercial Documents`, list its subfolders and verify they match the Level 2 folders specified in T07 §6.2.

**Pass criterion:** Exact match of subfolder titles under each Level 1 folder.

---

### TC-DEPT-06: Luxury Residential Documents Level 1 folders match T07 §6.3 specification

**What (integration):** Same as TC-DEPT-04 but for a luxury-residential project against T07 §6.3.

**Pass criterion:** Exact match of Level 1 folders.

---

### TC-DEPT-07: Luxury Residential Documents Level 2 folders match T07 §6.3 specification

**What (integration):** Same as TC-DEPT-05 but for a luxury-residential project against T07 §6.3.

**Pass criterion:** Exact match of Level 2 subfolders.

---

### TC-DEPT-08: No Level 3 folders are created by provisioning

**What (integration):** For both department types, traverse all folder trees and verify no folder exists at depth 3 or greater under any department library.

**Pass criterion:** Maximum folder depth is 2 (Level 1 → Level 2 only).

**Why:** The hybrid-preserve doctrine (T07 §6.1) mandates max 2-level depth. Deeper nesting was present in the source ResDir tree and was intentionally excluded.

---

## 8. Seeded File Tests

### TC-SEED-01: All manifest entries with present assets are uploaded

**What (integration):** After provisioning a test project, for every entry in `TEMPLATE_FILE_MANIFEST` where the asset file exists in `backend/functions/src/assets/templates/`, verify the file exists in the target library on the provisioned site.

**Pass criterion:** All available-asset entries are present in the target libraries.

---

### TC-SEED-02: Uploaded files are non-zero-byte

**What (integration):** For every seeded file from TC-SEED-01, verify the file size in SharePoint is greater than 0 bytes.

**Pass criterion:** All seeded files have size > 0.

**Why:** A zero-byte upload indicates the asset was found and uploaded but was empty on disk. This would corrupt the template file for the project team.

---

### TC-SEED-03: File re-run does not overwrite an existing file

**What (behavior):** Mock `getFileByServerRelativeUrl` to return HTTP 200 (file already exists) for one manifest entry. Call Step 3 again (re-run). Verify the file upload method is NOT called for that entry. Verify the step result is still `Completed`.

**Pass criterion:** Upload skipped; step completed.

**Corresponds to:** T08 §3.4 idempotency rule — no overwrite.

---

### TC-SEED-04: Missing asset file does not fail provisioning

**What (behavior):** Remove one asset file from the mocked file system (or configure the asset check to return missing for one entry). Run Step 3. Verify:
- Step 3 does not throw an unhandled exception
- Step 3 result status is `Completed`
- A warning is logged for the missing entry
- The missing file is not present in the target library

**Pass criterion:** Step completes; missing file absence logged as warning only.

---

### TC-SEED-05: Safety-critical templates are confirmed present on disk

**What (unit/disk):** Verify the following three files exist in `backend/functions/src/assets/templates/`:
- `JHA Form Template.docx` (or the exact filename from T07 §7)
- `Incident Report Form.docx`
- `Site Specific Safety Plan Template.docx`

**Pass criterion:** All three files exist and are non-zero-byte.

**Why:** T08 §5.3 elevates safety-critical operational templates as a prerequisite for pilot readiness.

---

## 9. Idempotency Tests

### TC-IDEM-01: Full clean run — all structures created

**What (integration — Scenario A):** Provision a brand-new test project site that has no G2 structures. After provisioning:
- Verify all 33 lists exist
- Verify all department library and core libraries exist
- Verify all folder trees are present
- Verify all available seeded files are present

**Pass criterion:** All expected structures exist after first run.

---

### TC-IDEM-02: Full retry — all structures idempotently skipped

**What (integration — Scenario B):** On a site already provisioned by TC-IDEM-01, run provisioning again. Verify:
- Step 4 completes with status `Completed`
- All list operations are logged as `idempotentSkip`
- No new lists are created
- No exceptions are thrown

**Pass criterion:** Step completes with all-skip behavior; no errors.

---

### TC-IDEM-03: Partial list failure recovery

**What (behavior — Scenario C):** Simulate Step 4 having created 15 lists before a failure. On the next call:
- Mock `listExists` to return `true` for lists 1–15
- Mock `listExists` to return `false` for lists 16–25
- Verify lists 1–15 are skipped
- Verify lists 16–25 are created
- Verify step result is `Completed`

**Pass criterion:** Recovery completes correctly; skip/create counts are accurate.

---

### TC-IDEM-04: Folder partial failure recovery

**What (behavior — Scenario D):** Simulate Step 3 having created 5 of 10 folders before failure. On retry:
- Mock `getFolderByServerRelativeUrl` for first 5 as HTTP 200 (exists)
- Mock for remaining 5 as HTTP 404 (not found)
- Verify first 5 are skipped
- Verify remaining 5 are created
- Verify step result is `Completed`

**Pass criterion:** Recovery completes correctly.

---

### TC-IDEM-05: Full retry with all-skip produces identical site state

**What (integration — extended Scenario B):** After TC-IDEM-02 (full retry), verify the list count, library count, folder count, and seeded file count on the test site are identical to TC-IDEM-01. No structures should have been added, removed, or duplicated.

**Pass criterion:** Site state after re-run is bit-for-bit structurally identical to post-first-run state.

---

## 10. Migration and Coexistence Validation

### TC-MCOEX-01: G2 lists are empty at provisioning time

**What (integration):** After provisioning, query each of the 25 G2 workflow lists. Verify each returns an empty result set (0 items).

**Pass criterion:** All 25 G2 lists return 0 items immediately after provisioning.

**Why:** G2 creates empty structural foundations. No data migration occurs. An unexpected non-empty list indicates either data leakage from a previous provisioning run or an unintended seed operation.

---

### TC-MCOEX-02: Empty list query does not throw an error

**What (integration):** For each G2 list, execute the expected query pattern (e.g., `GET /lists/getByTitle('Startup Checklist')/items?$filter=pid eq '25-001-01'`). Verify the query returns HTTP 200 with an empty items array (not a 404 or 500 error).

**Pass criterion:** All 25 lists return HTTP 200 with empty items arrays.

**Why:** A query against an empty list must return an empty array, not an error. If a list's field structure is malformed, SharePoint may return 400 Bad Request even for a valid empty-results query.

---

### TC-MCOEX-03: Seeded file and list coexist without conflict

**What (integration):** For a "seed now" workflow (e.g., Buyout Log):
- Verify the `Buyout Log` list exists and is empty
- Verify `Buyout Log Template.xlsx` exists in the target library
- Verify the two do not conflict (no SharePoint naming collision, no permission error accessing either)

**Pass criterion:** Both list and seeded file exist simultaneously; both are queryable/accessible.

---

### TC-MCOEX-04: No migration code is present in G2 implementation

**What (code review/unit):** Scan the G2 provisioning step files for any code patterns that read from an existing Excel file and write to a SharePoint list (data migration patterns). Verify no such patterns exist.

**Pass criterion:** No data migration code exists in any G2 provisioning step.

**Why:** T08 §4.2 explicitly defers all data migration to Wave 1. Accidental migration code in G2 would create unpredictable data state.

---

## 11. Integration Test Environment Requirements

### 11.1 Test Site Provisioning Requirements

Integration tests (TC-INTG-* and all tests marked "integration") require:

- A dedicated test SharePoint site collection in the dev/test tenant
- The provisioning saga must be callable against this site via the test runner (direct function invocation, not through the full HTTP trigger)
- The test runner must have access to the same `DefaultAzureCredential` (Managed Identity) or a test-equivalent credential
- The test site must be wiped between test runs to ensure a clean starting state (or a unique project number used per run to avoid naming collisions)

### 11.2 Environment-Specific Test Exclusions

| Test Category | Dev (local mock) | Staging (real SharePoint) | Pilot (read-only spot check) |
|---------------|-----------------|--------------------------|------------------------------|
| Unit (SCHEMA, STEP) | Run | Run | N/A |
| Behavior (FAIL, partial) | Run | Run | N/A |
| Integration (INTG, PID-02+, PARENT-01+, DEPT-01+, SEED-01+, IDEM-01+) | Skip | Run | Spot-check manually |
| Migration/Coexistence | Skip | Run | Spot-check manually |

Integration tests that require a live SharePoint site must be skipped in local development environments unless a dev-tenant SharePoint credential is configured. Tests must check for an environment variable (e.g., `SHAREPOINT_INTEGRATION_TEST_ENABLED=true`) before running and skip gracefully if not set.

### 11.3 Test Data Governance

- Every integration test must use a deterministic test project number (e.g., `TEST-G2-001`) that is distinct from any real project number
- Integration test sites must be provisioned in a dedicated test site collection, not in a production site collection
- Test items inserted for pid verification (TC-PID-02, TC-PID-04) must be deleted after the test run
- No integration test may modify or depend on data from a previous test run unless the test explicitly sets up that state as a precondition

---

## 12. Pilot Readiness Test Gate

The following tests must pass before G2 is deployed to the first pilot project. This list is the machine-checkable version of T08 §5.

### 12.1 Mandatory Passing Tests for Pilot

| Test ID | Description | Category |
|---------|-------------|----------|
| TC-SCHEMA-01 through TC-SCHEMA-14 | All config/schema unit tests | Unit |
| TC-STEP-01 through TC-STEP-10 | All step behavior tests | Unit/Behavior |
| TC-FAIL-01 through TC-FAIL-03 | withRetry Retry-After fix verified | Behavior |
| TC-PID-01 | pid column configuration correct on all 25 lists | Unit |
| TC-PID-02 | pid default value is projectNumber on live site | Integration |
| TC-PID-03 | pid-contract.md document exists | Disk check |
| TC-PARENT-01 through TC-PARENT-04 | All parent/child list structure checks | Integration |
| TC-DEPT-01 through TC-DEPT-08 | Department library pruning and folder trees | Integration |
| TC-SEED-01 through TC-SEED-04 | Seeded file upload and idempotency | Integration/Behavior |
| TC-SEED-05 | Safety-critical templates present on disk | Disk check |
| TC-IDEM-01 through TC-IDEM-05 | Full idempotency scenarios A, B, C, D | Integration/Behavior |
| TC-MCOEX-01 through TC-MCOEX-04 | Migration/coexistence validation | Integration |

### 12.2 Mandatory Documentation Checks for Pilot

These checks are not automated tests but must be manually verified as part of the pilot readiness gate:

- [ ] `docs/reference/data-model/pid-contract.md` exists and is classified
- [ ] `docs/reference/data-model/workflow-list-schemas.md` exists and is classified
- [ ] `docs/reference/provisioning/department-library-folders.md` exists and is classified
- [ ] `docs/reference/provisioning/seeded-file-manifest.md` exists and is classified
- [ ] All four reference documents have been added to `current-state-map.md §2`
- [ ] ADR-0091 (Phase 7 sign-off) exists on disk (required before any G2 implementation begins per CLAUDE.md §6.3)

### 12.3 Mechanical Gate for Pilot

All four mechanical gates must pass:

```bash
pnpm turbo run build        # Zero errors
pnpm turbo run lint         # Zero errors (boundary rules active)
pnpm turbo run check-types  # Zero TypeScript errors
pnpm turbo run test --filter=@hbc/auth-core --filter=@hbc/shell --filter=@hbc/ui-kit --filter=@hbc/shared-kernel --filter=@hbc/app-types
# All P1 package tests pass; branches: 95 maintained
```

The G2 backend unit test suite must also pass:

```bash
pnpm turbo run test --filter=@hbc/backend-functions
# (or the equivalent filter for the backend Azure Functions package)
```

---

## 13. Step 4 Duration Measurement

Before G2 is extended beyond the initial pilot cohort (T08 §6), Step 4 duration must be measured on staging.

### TC-PILOT-01: Step 4 duration within Azure Function timeout

**What:** On a staging environment, provision a new test project site. Measure the wall-clock duration of Step 4 (core list creation) and Step 4b (workflow list creation, if split) combined.

**Pass criterion:** Combined duration < 6 minutes.

**If fail:** The Step 4b contingency must be activated (separate `step4b-workflow-lists.ts` to split the load, per T07 §4) and the measurement re-run. If combined Step 4 + Step 4b still exceeds 8 minutes total, escalate as a platform risk before proceeding with G2 rollout.

---

### TC-PILOT-02: withRetry behavior under concurrent provisioning load

**What:** On staging, trigger 3 simultaneous provisioning runs for 3 different test projects. Monitor for HTTP 429 responses. Verify:
- At least one run experiences a 429 response
- All 3 runs complete successfully after retrying with the Retry-After delay
- No cascading failures (all 3 complete within 2× the single-run expected duration)

**Pass criterion:** All 3 concurrent runs complete successfully; Retry-After backoff prevents cascading failure.

---

## 14. What T09 Tests Prove

When all tests in this plan pass, the following statements are proven about the G2 implementation:

1. **The configuration is internally consistent.** Every G2 list definition is structurally correct, contains `pid`, has correct parent/child ordering, and has no naming collisions with core lists.

2. **The provisioning steps behave correctly.** Step 3 and Step 4 correctly create the expected structures, handle missing assets gracefully, and produce the correct step result statuses.

3. **`withRetry` correctly handles SharePoint throttling.** The Retry-After header is parsed and respected, preventing cascading failures under load.

4. **The pid relational contract is implemented correctly.** Every G2 list has the pid column with correct type, indexing, and default value, and that default value is `projectNumber` not a UUID.

5. **Parent/child list relationships are correctly provisioned.** Lookup columns point to the correct parent lists and the correct field.

6. **Department library pruning is correct.** Commercial and luxury-residential sites each receive exactly the correct department library with exactly the correct folder trees, and do not receive the other department's library.

7. **Seeded files are correctly uploaded and idempotency is respected.** Files are uploaded on first run, skipped on re-run, and missing assets are handled gracefully without failing provisioning.

8. **Provisioning is idempotent.** Re-running against an already-provisioned site produces the same outcome with all-skip behavior and no errors.

9. **Partial failure recovery works.** If Step 3 or Step 4 fails mid-execution, a subsequent retry completes successfully by skipping already-created items and creating only the remaining items.

10. **G2 creates empty structural foundations, not populated data.** All lists are empty at provisioning time. No data migration code exists.

---

*End of W0-G2-T09 — Testing, Validation, and Provisioning Verification v1.0*
