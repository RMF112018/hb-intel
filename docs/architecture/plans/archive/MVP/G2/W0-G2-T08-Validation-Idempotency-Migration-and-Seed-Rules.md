# W0-G2-T08 — Validation, Idempotency, Migration, and Seed Rules

> **Doc Classification:** Canonical Normative Plan — Wave 0 Group 2 task plan defining the validation requirements, idempotency rules, migration and coexistence posture, and seeded-file governance for all G2 provisioned structures. This plan governs what must be true for G2 provisioning to be considered correct and complete.

**Phase Reference:** Wave 0 Group 2 — Backend Hardening and Workflow Data Foundations Plan
**Depends On:** T07 (provisioning saga update specifications)
**Unlocks:** T09 (test cases derive from T08 validation rules)
**Repo Paths Governed:** `backend/functions/src/functions/provisioningSaga/steps/`, `backend/functions/src/config/`, `backend/functions/src/services/sharepoint-service.ts`

---

## Objective

Define the authoritative rules for what a correctly provisioned G2 project site looks like, how to detect and recover from partial provisioning, how to handle the coexistence of file-backed workflows and list-backed workflows during the transition period, and what conditions must be satisfied before G2 provisioning can be considered ready for pilot deployment.

T08 is the specification that T09 translates into test cases. If T08 says "every G2 list must have the `pid` column indexed," then T09 writes a test that verifies that property on every list. T08 drives T09 — they are paired documents.

---

## Scope

T08 covers:

1. Structural validation requirements — what lists, columns, and folder trees must exist and how they must be structured
2. Idempotency rules — what must happen when provisioning is re-run against a site that already has G2 structures
3. `pid` column validation — specific checks required for the relational column contract
4. Migration and coexistence posture — how file-backed and list-backed workflows coexist during the Wave 0 transition period
5. Seeded-file validation — what must be true for seeded files to be considered correctly provisioned
6. Partial-failure recovery posture — what happens when Step 4 or Step 3 fails partway through G2 list/folder creation
7. Readiness gates — what must be validated before G2 is considered ready for pilot

T08 does not cover:

- Data quality validation (the correctness of data entered into the lists by users — that is a Wave 1 concern)
- UI validation (forms, routes, components — those are G4/G5 scope)
- Performance optimization of queries against the lists (Wave 1 concern)

---

## 1. Structural Validation Requirements

### 1.1 Core List Preservation

After G2 provisioning runs, all 8 core lists from `HB_INTEL_LIST_DEFINITIONS` must still be present and structurally intact:

| List | Required Present | Required Fields Present |
|------|----------------|------------------------|
| RFI Log | Yes | All original fields from `HB_INTEL_LIST_DEFINITIONS` |
| Submittal Log | Yes | All original fields |
| Meeting Minutes | Yes | All original fields |
| Daily Reports | Yes | All original fields |
| Issues Log | Yes | All original fields |
| Punch List | Yes | All original fields PLUS `PunchBatchId` (Text, optional) |
| Safety Log | Yes | All original fields |
| Change Order Log | Yes | All original fields |

G2 must not alter the structure of any core list. The `PunchBatchId` addition to `Punch List` is an additive change (new optional field) and must not change any existing field.

### 1.2 G2 Workflow-Family List Presence

Every G2 list from `HB_INTEL_WORKFLOW_LIST_DEFINITIONS` must be present after provisioning. The complete required list is specified in T07 §5 (25 lists). Validation must verify:

- List exists by its exact title
- `pid` column is present with `InternalName: pid`, `Type: Text`, `Required: true`
- `pid` column is indexed (`Indexed: true`)
- `Status` column is present as a Choice type on every list
- All required fields (per T02–T06 schemas) are present
- Parent/child lookup columns on child lists point to the correct parent list

### 1.3 Parent/Child Structural Validation

For each confirmed parent/child pair, validation must verify:
- The parent list exists
- The child list exists
- The child list has a `ParentRecord` Lookup column
- The Lookup column's target list matches the parent list title
- The Lookup column's target field is `ID`

| Parent List | Child List | Lookup Target |
|-------------|-----------|---------------|
| Startup Checklist | Startup Checklist Items | Startup Checklist.ID |
| Estimating Kickoff Log | Kickoff Responsibility Items | Estimating Kickoff Log.ID |
| Closeout Checklist | Closeout Checklist Items | Closeout Checklist.ID |
| JHA Log | JHA Steps | JHA Log.ID |
| JHA Log | JHA Attendees | JHA Log.ID |
| Buyout Log | Buyout Bid Lines | Buyout Log.ID |

### 1.4 Department Library Presence and Folder Tree Validation

After provisioning for `department: 'commercial'`:
- `Commercial Documents` library exists with versioning enabled
- `Luxury Residential Documents` library does NOT exist (pruned by Step 3)
- All Level 1 folders from T07 §6.2 are present in `Commercial Documents`
- All Level 2 folders from T07 §6.2 are present under their respective Level 1 parents

After provisioning for `department: 'luxury-residential'`:
- `Luxury Residential Documents` library exists with versioning enabled
- `Commercial Documents` library does NOT exist (pruned)
- All Level 1 folders from T07 §6.3 are present in `Luxury Residential Documents`
- All Level 2 folders from T07 §6.3 are present

Core libraries must exist regardless of department:
- `Project Documents` — with versioning enabled
- `Drawings` — with versioning enabled
- `Specifications` — with versioning enabled

### 1.5 Seeded File Validation

For every file in `TEMPLATE_FILE_MANIFEST` where the asset exists in `backend/functions/src/assets/templates/`:
- The file exists in the target library of the provisioned site
- The file name matches exactly
- The file is readable (not zero-byte)

Where an asset file does not yet exist on disk (graceful skip behavior), validation must:
- Log a warning, not an error
- Record the missing asset in a "missing assets" report
- Not fail the provisioning run (Step 3 graceful skip is correct behavior)

---

## 2. PID Column Validation Rules

### 2.1 PID Presence Check

Every G2 workflow-family list must have the `pid` column. Validation must verify:
- `InternalName` is exactly `pid` (lowercase)
- `DisplayName` is `Project ID`
- `Type` is `Text` (single-line)
- `Required` is `true`
- `Indexed` is `true`

### 2.2 PID Default Value Verification

After a provisioning run completes and at least one test item is inserted into a G2 list:
- The `pid` value of the inserted item must equal `status.projectNumber`
- The `pid` value must not be blank
- The `pid` value must not be the UUID `projectId` (the UUID is not the intended `pid` value)

**Verification method:** T09 Test TC-PID-02 must insert a test item into at least one G2 list after provisioning and verify the `pid` default value was applied correctly.

### 2.3 PID Alignment Verification

Before G2 is deployed to pilot:
- The `pid` alignment decision from T01 §1.2 must be locked (either `projectNumber` or a designated alternative)
- The locked value must be documented in `docs/reference/data-model/pid-contract.md`
- The `SharePointService.createDataLists()` implementation must reference `status.projectNumber` (or the locked alternative) as the default value source

---

## 3. Idempotency Rules

### 3.1 Definition of Idempotency for G2

A provisioning run is idempotent if running it twice against the same project site produces the same result as running it once. For G2 structures specifically:

- If a list already exists, `createDataLists` must skip creation and log `idempotentSkip: true`
- If a list already exists and has all required fields, no fields are added or modified
- If a folder already exists, `createFolderIfNotExists` must return without creating a duplicate
- If a template file already exists in the target library, the upload must be skipped (not overwritten)
- The overall step result must be `Completed`, not `Failed`, when all items are idempotently skipped

### 3.2 List Existence Check Pattern

The existing `listExists(siteUrl, listTitle)` method in `SharePointService` is the reference pattern. For G2:
- `createDataLists` already checks `listExists` per the current implementation comment (D-PH6-05: `createDataLists enforces internal idempotency`)
- The extension to `HB_INTEL_WORKFLOW_LIST_DEFINITIONS` must use the same idempotency check
- New fields added to an existing list (e.g., the `PunchBatchId` addition) must check whether the field already exists before creating it

### 3.3 Folder Existence Check Pattern

The `createFolderIfNotExists` method (new in G2) must implement:
```
1. Call SharePoint REST: GET /web/getFolderByServerRelativeUrl('{libraryName}/{folderPath}')
2. If HTTP 200 (folder exists): return, log idempotentSkip
3. If HTTP 404 (folder not found): create folder, log created
4. If HTTP other: throw error, let withRetry handle it
```

### 3.4 Template File Upload Idempotency

When a template file is uploaded, the check is:
```
1. Check if file exists in target library: GET /web/getFileByServerRelativeUrl('{libraryUrl}/{fileName}')
2. If file exists: skip upload, log idempotentSkip
3. If file does not exist: upload from assets directory
```

**Decision on file overwrite:** Wave 0 must NOT overwrite existing files. If a project team has modified a template file after provisioning, re-running provisioning must not destroy their changes. The idempotency rule is: if the file exists, do not touch it.

### 3.5 Re-Run Scenarios

The following re-run scenarios must be validated by T09:

**Scenario A (Full clean run):** First provisioning of a new project site. All lists, folders, and files are created from scratch. All steps complete with `status: Completed`.

**Scenario B (Full retry):** Provisioning saga retry on a site that already has all G2 structures from a successful previous run. All list/folder/file operations skip idempotently. Step result is `Completed` with all items logged as `idempotentSkip`.

**Scenario C (Partial failure, mid-list-creation):** Step 4 fails after creating 15 of 25 G2 lists. On retry, the first 15 lists are skipped (already exist). The remaining 10 lists are created. Step completes.

**Scenario D (Step 3 folder failure):** Step 3 fails after creating some but not all folders. On retry, already-created folders are skipped. Remaining folders are created. Step completes.

---

## 4. Migration and Coexistence Posture

### 4.1 Coexistence Doctrine

During the Wave 0 transition period, the following coexistence model applies to all "seed now" workflows:

| Active Source | List State | File State | Phase |
|--------------|-----------|-----------|-------|
| File is active operational source | List exists, empty | Template file seeded | Wave 0 transition |
| Both transitioning | List partially populated | File still in use | Wave 1 feature launch |
| List is active source | List fully operational | File is archive | Wave 1+ |

**Critical rule:** G2 must never document or instruct users to keep the file and the list synchronized. The file is operational; the list is structural. They are not synchronized. Wave 1 features perform the migration from file to list as part of their rollout.

### 4.2 File-to-List Migration Responsibilities

G2 does not perform any data migration. G2 creates empty list structures alongside seeded template files. Migration of historical data (e.g., existing buyout logs, previous permit records) is out of G2 scope. Migration planning is a Wave 1 responsibility for each workflow family.

The following migration scenarios are explicitly deferred to Wave 1:
- Loading existing `Buyout Log_Template 2025.xlsx` data into the `Buyout Log` list
- Loading existing required inspections from an existing project's Excel into the `Required Inspections` list
- Migrating historical safety incidents into the `Incident Log`

### 4.3 Seeded File Governance Rules

Once a seeded template file is uploaded to a project site:
1. The file is owned by the project team — they may modify it
2. Re-running provisioning must not overwrite the modified file (idempotency rule §3.4)
3. If HBC wants to update the template globally, a separate "template refresh" operation must be defined (out of G2 scope; this is a future Wave 1 or administrative feature)
4. The file version in `backend/functions/src/assets/templates/` is the provisioning-time version — it does not automatically update project sites when the template changes

### 4.4 Empty List Acceptance

For "list only" and "seed now" workflows, the lists will be empty at provisioning time and may remain empty for the entire Wave 0 pilot. This is expected and correct behavior. Validation must confirm:
- The list structure is correct (fields, types, required status)
- The list is accessible via SharePoint permissions (readable by the project team group, writable by the project leaders group)
- The list does not cause errors when queried with an empty result set

A list that is empty but structurally correct satisfies the G2 acceptance criteria for that workflow.

---

## 5. Readiness Gates for Pilot

Before G2 is considered ready for pilot deployment, the following conditions must be satisfied:

### 5.1 Structural Readiness

- [ ] All 33 lists (8 core + 25 G2) are provisioned correctly on a staging project site
- [ ] `pid` column is present and indexed on all 25 G2 lists
- [ ] `pid` default value is `projectNumber` (or the locked alternative) — verified by T09 Test TC-PID-02
- [ ] All 6 parent/child Lookup column relationships are structurally correct
- [ ] Department library pruning is verified: `commercial` sites have `Commercial Documents`, not `Luxury Residential Documents`; `luxury-residential` sites have the reverse
- [ ] Department library folder trees match T07 §6.2 and §6.3 specifications

### 5.2 Idempotency Readiness

- [ ] Full idempotency re-run verified: Scenario B from §3.5 passes without errors
- [ ] Partial-failure recovery verified: Scenario C from §3.5 passes
- [ ] File upload idempotency verified: re-run does not overwrite existing files

### 5.3 Seeded File Readiness

- [ ] All template asset files exist in `backend/functions/src/assets/templates/` or their absence is documented with a named content owner and handoff date
- [ ] At minimum, the safety-critical operational templates (JHA Form, Incident Report Form, Site Specific Safety Plan) are present and correctly seeded

### 5.4 `withRetry` Readiness

- [ ] Retry-After header fix is implemented (T07 §2) and verified by T09 throttle test

### 5.5 Documentation Readiness

- [ ] `docs/reference/data-model/pid-contract.md` exists and is classified
- [ ] `docs/reference/data-model/workflow-list-schemas.md` exists and is classified
- [ ] `docs/reference/provisioning/department-library-folders.md` exists and is classified
- [ ] `docs/reference/provisioning/seeded-file-manifest.md` exists and is classified
- [ ] All four reference documents are added to `current-state-map.md §2`

### 5.6 Mechanical Gate Readiness

- [ ] `pnpm turbo run build` — zero errors
- [ ] `pnpm turbo run lint` — zero errors (boundary rules active)
- [ ] `pnpm turbo run check-types` — zero TypeScript errors
- [ ] P1 test suite passes: `pnpm turbo run test --filter=@hbc/auth-core --filter=@hbc/shell --filter=@hbc/ui-kit --filter=@hbc/shared-kernel --filter=@hbc/app-types`
- [ ] G2 backend unit tests pass (T09 test suite)

---

## 6. What Must Be Validated Before Broader Rollout

The pilot readiness gate (§5 above) applies to the initial 2–3 project pilot cohort. Before G2 provisioning is extended to the general Wave 0 rollout population (beyond the pilot cohort), additional validation is required:

1. **Step 4 duration measurement:** Staging measurement of Step 4 + Step 4b (if introduced) combined duration. Must be < 6 minutes to maintain Azure Function timeout buffer.
2. **Throttling behavior under load:** If multiple provisioning runs are triggered concurrently, the `withRetry` Retry-After fix must successfully back off and not produce cascading failures.
3. **Pilot site post-mortem:** After the first 2–3 pilot projects are provisioned, a spot-check must verify: lists are usable by the project team, seeded files are present, folder trees are navigable.
4. **Content readiness confirmation:** All template asset files must be confirmed present by the product owner before general rollout.

---

## 7. Follow-On Groups: What G2 Leaves for Later

G2 explicitly defers the following to post-G2 groups:

| Deferred Item | Owning Future Group |
|--------------|---------------------|
| UI forms for entering data into G2 lists | G4 (SPFx surfaces) / G5 (PWA surfaces) |
| SignalR real-time progress for Step 4 workflow lists | G3 (platform wiring) |
| Migration of existing file-based workflow data into lists | G4 / Wave 1 per-feature |
| Pre-seeded checklist rows in Startup/Closeout child lists | Wave 1 startup/closeout features |
| Per-subcontractor folder creation in document libraries | Wave 1 subcontract management feature |
| Draw Schedule monthly matrix expansion | Wave 1 financial feature |
| Lessons Learned Report list | Wave 2 / `@hbc/post-bid-autopsy` |
| Option A1 automation for per-site access bootstrap | Wave 0 GA (before pilot cohort expansion) — G1 T05 requirement |

These items are not blocked or forgotten — they are explicitly allocated to appropriate future work. Any G2 implementor who encounters a temptation to implement one of these items must log it as a future group task and proceed with the G2 scope only.

---

*End of W0-G2-T08 — Validation, Idempotency, Migration, and Seed Rules v1.0*
