# W0-G2-T07 — Provisioning Saga Step 3, Step 4, and Seeding Updates

> **Doc Classification:** Canonical Normative Plan — Wave 0 Group 2 task plan governing all changes to the provisioning saga required to implement G2 list schemas, document library folder trees, seeded files, and department library pruning. This plan is the implementation bridge between T01–T06 schema decisions and the backend code.

**Phase Reference:** Wave 0 Group 2 — Backend Hardening and Workflow Data Foundations Plan
**Depends On:** T01 (schema contract), T02–T06 (all workflow-family data models finalized), G1 T01 (site template spec), G1 T05 (permission access model)
**Unlocks:** T08 (validation and idempotency rules), T09 (testing and verification plan)
**Repo Paths Governed:** `backend/functions/src/config/list-definitions.ts`, `backend/functions/src/config/template-file-manifest.ts`, `backend/functions/src/config/add-on-definitions.ts`, `backend/functions/src/functions/provisioningSaga/steps/step3-template-files.ts`, `backend/functions/src/functions/provisioningSaga/steps/step4-data-lists.ts`, `backend/functions/src/utils/retry.ts`

---

## Objective

Specify all changes to the provisioning saga and its configuration that are required to implement the Group 2 data model decisions. This plan translates the T01–T06 schema decisions into deterministic implementation instructions for every affected backend file.

This plan also resolves the open decisions flagged in T02–T06:
- Whether to pre-seed default checklist items (T02, T03, T05)
- The Draw Schedule model ambiguity (T06)
- The Safety-pack add-on / T04 seeded file coordination (T04)
- The Punch List Batches cross-reference approach (T03)

---

## Why This Task Exists

The provisioning saga's Step 3 and Step 4 are currently partially scaffolded:

- **Step 3** (`step3-template-files.ts`) calls `uploadTemplateFiles` with the first entry in `TEMPLATE_FILE_MANIFEST`. The add-on and department pruning logic exists as scaffolded comments. The actual asset files do not yet exist in `backend/functions/src/assets/templates/`.
- **Step 4** (`step4-data-lists.ts`) calls `createDataLists` with `HB_INTEL_LIST_DEFINITIONS` — the 8 confirmed core lists. No workflow-family lists are included.

G2 must activate the scaffolded functionality and extend both steps with the full G2 list and file definitions. Without this plan:
- Implementors working on Step 3/Step 4 would not know which changes are required, which are optional, and which are out of scope
- The `IFieldDefinition` type extensions (for `defaultValue`, `indexed`, `lookupListTitle`) would be added without coordination
- The department library folder tree creation — a net-new capability not in the current saga — would be invented during implementation rather than specified before it

---

## Scope

T07 covers:

1. The `withRetry` Retry-After header fix (G2.1 from Wave 0 umbrella plan)
2. `IFieldDefinition` type additions needed for G2 list schemas
3. Extension of `list-definitions.ts` with all G2 workflow-family lists
4. `TEMPLATE_FILE_MANIFEST` additions for all G2 seeded files
5. Step 3 department library pruning activation
6. Step 3 department library folder tree creation (new capability)
7. Step 4 workflow-family list provisioning extension
8. Resolution of open pre-seeding decisions from T02, T03, T05
9. Add-on coordination (T04 safety-pack overlap)
10. Department library folder tree specifications for both `commercial` and `luxury-residential`

T07 does not cover:

- Model changes to `IProvisionSiteRequest` or `IProvisioningStatus` (those are Project Setup T02 scope — T07 specifies the requirements and assumes T02 has delivered them)
- Step 6 changes (Entra ID group creation is governed by G1 T02 — T07 does not touch Step 6)
- New provisioning saga steps beyond Step 3/4 extensions (unless Step 4b is explicitly introduced per §8)
- Wave 1 features consuming the provisioned structures

---

## Governing Constraints

- **G1 T01 (site template spec):** Core template remains unchanged. 8-list core remains `HB_INTEL_LIST_DEFINITIONS`. G2 extensions are additive.
- **G2 T01 (schema contract):** All list definitions must comply with `IListDefinition` contract and include `pid` with `defaultValue` and `indexed: true`.
- **CLAUDE.md §1.5 (Guarded Commit Rule):** All changes must commit through `pnpm guarded:commit`. No direct `git commit`.
- **CLAUDE.md §6.3.3 (Mechanical Enforcement Gates):** Build, lint, typecheck, and P1 tests must pass before any commit.
- **G1 T05 (Sites.Selected):** Step 3 and Step 4 run inside the permission model T05 determines. If Path A (`Sites.Selected`) is the active model, folder and list creation will work within the per-site grant. No additional permission changes are required in Step 3/4.
- **Idempotency requirement (from G1 T01):** All provisioning operations must be idempotent. The existing `listExists`, `documentLibraryExists` patterns must be extended to `folderExists` and list-field-exists checks.

---

## 1. Priority Ordering of G2 Backend Changes

The G2 implementation changes must be sequenced in this order to minimize integration risk:

1. **`withRetry` Retry-After fix** (independent of schema work — implement first)
2. **`IFieldDefinition` type additions** (required before list definitions can use `defaultValue`, `indexed`, `lookupListTitle`)
3. **Core-library Step 2 extension** (add `Drawings` and `Specifications` libraries per G1 T01 — verify this was completed during G1 or add here)
4. **Department library `DEPARTMENT_LIBRARIES` activation in Step 3** (department pruning for Commercial vs. Luxury Residential)
5. **Department library folder creation in Step 3** (new capability — folder trees from §6 below)
6. **Template file manifest additions** (add G2 seeded files)
7. **Add-on asset file creation** (create the actual `.docx` / `.xlsx` template file assets in `backend/functions/src/assets/templates/`)
8. **Workflow-family list definitions extension** (extend `list-definitions.ts` with G2 lists)
9. **Step 4 extension** (call the extended `HB_INTEL_LIST_DEFINITIONS` + create lookup lists in correct order)

---

## 2. `withRetry` Retry-After Header Fix (G2.1)

**File:** `backend/functions/src/utils/retry.ts`

**Current state (confirmed from validation report):** The `withRetry` utility does not parse `Retry-After` headers from 429 responses. It uses a fixed `baseDelayMs: 2000` with up to `maxAttempts: 3`.

**Required change:** When a SharePoint REST API call returns HTTP 429 (Too Many Requests), the response includes a `Retry-After` header specifying how many seconds to wait before retrying. The `withRetry` utility must:
1. Catch HTTP 429 responses specifically
2. Read the `Retry-After` header value (in seconds)
3. Use `Math.max(retryAfterMs, baseDelayMs)` as the actual delay before the next attempt
4. Log the throttle event with the `Retry-After` value and the actual delay applied

**Implementation note:** PnPjs responses surface HTTP status via the response object or thrown error. The retry wrapper must inspect the error's HTTP status code and response headers. The specific mechanism depends on how PnPjs exposes the response headers on a thrown error — T09 must include a throttle simulation test to verify the implementation.

---

## 3. `IFieldDefinition` Type Extensions

**File:** `backend/functions/src/services/sharepoint-service.ts` (type definitions), and correspondingly in `packages/models` if `IListDefinition` / `IFieldDefinition` are exported from there.

**Required additions:**

```typescript
export interface IFieldDefinition {
  internalName: string;
  displayName: string;
  type: 'Text' | 'Number' | 'DateTime' | 'Boolean' | 'Choice' | 'User'
      | 'Lookup' | 'MultiLineText' | 'URL';
  required?: boolean;
  choices?: string[];
  // NEW additions for G2:
  defaultValue?: string;      // For pid default value mechanism
  indexed?: boolean;          // For pid indexing
  lookupListTitle?: string;   // For Lookup-type fields — target list title
  lookupFieldName?: string;   // For Lookup-type fields — field in target list (typically 'ID')
}
```

**`SharePointService.createDataLists()` changes required:** The `createDataLists` method must be extended to:
1. Read `field.defaultValue` and set it via PnPjs `Field.setDefaultColumnValue()` or equivalent after field creation
2. Read `field.indexed` and set the column index via PnPjs if `true`
3. For `type: 'Lookup'`, read `lookupListTitle` and `lookupFieldName` and use PnPjs `Field.addLookup()` to create the lookup column

**Provisioning order constraint:** Lists with Lookup-type fields must be created after the target list they look up. The `createDataLists` call must process parent lists before child lists. T07 specifies the ordering via the list definition array order (parent list definitions must come before child list definitions for the same family).

---

## 4. Open Decision Resolutions

### 4.1 Pre-Seeded Checklist Items (T02, T03, T05)

**Decision:** **Defer pre-seeding of checklist rows to Wave 1.**

**Rationale:**
- Pre-seeding list item rows requires a separate capability beyond `createDataLists` (list item creation via REST API) — this is more complex and more failure-prone than list structure creation
- The seeded template files (PDF checklists, Excel templates) provide the operational bridge during the transition period
- Pre-seeded rows would need to match the exact standard checklist items from the source artifacts — this creates maintenance coupling between the template asset files and the item seed set
- Wave 1 features can populate the child lists from the template items with a more robust onboarding flow

**Action:** T09 tests must verify that the child lists (`Startup Checklist Items`, `Closeout Checklist Items`) are created empty and structurally correct. The operational team uses the seeded PDF/Excel template to run checklists during the transition period.

### 4.2 Draw Schedule Model (T06)

**Decision:** **Implement the simplified row-per-budget-line model as specified in T06.**

**Rationale:** The full monthly matrix cannot be reliably represented in a SharePoint list without a complex normalized structure that adds provisioning risk and schema complexity. The Draw Schedule Template Excel provides the operational cash-flow matrix. The `Draw Schedule` list captures simplified budget line status that is sufficient for Wave 1 financial intelligence features to build against.

**Action:** List description field on `Draw Schedule` must document: "This list captures simplified budget line status. For the full monthly cash-flow schedule, refer to the Draw Schedule Template.xlsx in Project Documents. The list is the future intelligence data source; the Excel is the current operational source of truth."

### 4.3 Safety-Pack Add-On / T04 File Coordination (T04)

**Decision:** **Consolidate into a single asset file. The `safety-pack` add-on and T04's core seeded file are the same file under different names.**

**Rationale:** The G1 T01 `safety-pack` add-on provisions `Safety Plan Template.docx` (template-file-only add-on). T04 wants to seed `Site Specific Safety Plan Template.docx`. These are the same operational document — a site-specific safety plan template. Using different file names creates confusion.

**Action:**
- Rename the seeded file asset to `Site Specific Safety Plan Template.docx` as the canonical name
- Update `ADD_ON_DEFINITIONS['safety-pack'].templateFiles` to reference the same asset path: `add-ons/safety-pack/Site Specific Safety Plan Template.docx`
- Update `TEMPLATE_FILE_MANIFEST` to include `Site Specific Safety Plan Template.docx` as a core seeded file (every project gets this file regardless of whether the safety-pack add-on is selected)
- The `safety-pack` add-on remains registered for when a more elaborate safety pack is needed in the future — but for Wave 0, the template file is seeded universally

### 4.4 Punch List Batches Cross-Reference (T03)

**Decision:** **Add `PunchBatchId` as an optional text field to the core `Punch List` list as a G2 amendment to `HB_INTEL_LIST_DEFINITIONS`.**

**Rationale:** The core `Punch List` is fully owned by `HB_INTEL_LIST_DEFINITIONS`. Adding one optional text field (`PunchBatchId`) to the core list allows the T03 `Punch List Batches` parent list to group its items without requiring a cross-list lookup column. The field is optional (does not break existing usage) and is set by the Wave 1 punch list management feature.

**Action:** Add `{ internalName: 'PunchBatchId', displayName: 'Punch Batch Reference', type: 'Text', required: false }` to the `Punch List` entry in `HB_INTEL_LIST_DEFINITIONS`. Document as a G2 cross-family field addition.

---

## 5. Workflow-Family List Definitions

The following is the complete G2 extension set for `list-definitions.ts`. These lists are added to a new exported constant `HB_INTEL_WORKFLOW_LIST_DEFINITIONS` that is provisioned in Step 4 after the 8 core lists.

**Provisioning order within `HB_INTEL_WORKFLOW_LIST_DEFINITIONS`:**
Parent lists must precede their child lists. The required order is:

```
1. Startup Checklist              (T02 — parent)
2. Startup Checklist Items        (T02 — child of #1)
3. Estimating Kickoff Log         (T02 — parent)
4. Kickoff Responsibility Items   (T02 — child of #3)
5. Project Responsibility Matrix  (T02 — flat)
6. Closeout Checklist             (T03 — parent)
7. Closeout Checklist Items       (T03 — child of #6)
8. Punch List Batches             (T03 — flat, cross-references core Punch List)
9. Turnover Package Log           (T03 — flat)
10. Subcontractor Evaluations     (T03 — flat)
11. JHA Log                       (T04 — parent)
12. JHA Steps                     (T04 — child of #11)
13. JHA Attendees                 (T04 — child of #11)
14. Incident Log                  (T04 — flat)
15. Site Safety Plans             (T04 — flat)
16. Toolbox Talk Log              (T04 — flat)
17. Safety Walk Log               (T04 — flat)
18. Sub Safety Certifications     (T04 — flat)
19. Permit Log                    (T05 — flat)
20. Required Inspections          (T05 — flat)
21. Constraints Log               (T05 — flat)
22. Buyout Log                    (T06 — parent)
23. Buyout Bid Lines              (T06 — child of #22)
24. Draw Schedule                 (T06 — flat)
25. Financial Forecast Status     (T06 — flat)
26. Subcontract Compliance Log    (T06 — flat)
```

**Total list count after G2:** 8 (core) + 1 amendment (`Punch List` + `PunchBatchId` field) + 25 (workflow-family) = **33 lists** provisioned per project site.

**Provisioning duration risk:** 33 list creation calls will take significantly longer than the current 8-list Step 4. Each PnPjs list creation with field schema takes approximately 3–8 seconds against a SharePoint tenant (depending on network and tenant throttling). At 8 seconds average, 25 new lists = ~200 additional seconds (3+ minutes). With the existing 8 lists, Step 4 total duration would be approximately 4–5 minutes.

**Step 4b decision:** If 33 lists create an Azure Function timeout risk (Functions have a default 10-minute execution timeout), a `Step 4b` should be introduced for the workflow-family lists, with the core 8 lists remaining in `Step 4`. T09 must measure Step 4 duration in staging with all lists and trigger the Step 4b split if duration exceeds 6 minutes (to leave 4-minute buffer before timeout).

---

## 6. Department Library Folder Trees

### 6.1 Folder Creation in Step 3

Step 3 (`step3-template-files.ts`) must be extended to create the department-specific library folder tree after the department pruning action. The `SharePointService` must expose a `createFolderIfNotExists(siteUrl, libraryName, folderPath)` method that the step can call.

**Idempotency requirement:** `createFolderIfNotExists` must check whether the folder already exists before creating. If it exists, no-op. This prevents duplicate folder creation on retry runs.

### 6.2 Commercial Documents Folder Tree

Library name: `Commercial Documents`
Depth limit: 2 levels below library root

```
Commercial Documents/
├── Owner Files/
│   ├── Contract/
│   ├── Insurance/
│   └── Notices/
├── Engineering Reports/
│   ├── Civil/
│   ├── MEP/
│   ├── Structural/
│   └── Surveyor/
├── Permits/
│   ├── HBC Permits/
│   └── Sub Permits/
├── Testing and Inspection/
│   ├── Concrete/
│   ├── Soil/
│   └── Special Inspections/
├── Meetings/
├── Safety/
│   ├── JHA Forms/
│   └── Incident Reports/
├── Schedule/
│   ├── CPM/
│   └── 3 Week Look Ahead/
├── Accounting/
│   ├── Budget/
│   ├── Forecast/
│   └── Pay Applications/
├── Change Orders/
│   ├── PCO/
│   └── PCCO/
├── Subcontractor/
└── Closeout/
    ├── Owner Manual/
    └── Punchlist/
```

**Rationalization notes for Commercial:**
- `00-Estimating` folder (from the ResDir source) is omitted — estimating is a pre-award function and does not belong in the provisioned project site
- `02-Construction Drawings` is rationalized: drawings go in the core `Drawings` library, not in the department library
- `03-Engineering Reports` is preserved under `Engineering Reports/` with Civil, MEP, Structural, Surveyor
- `04-Permit` rationalized to `Permits/` with `HBC Permits/` and `Sub Permits/` subfolders (reducing depth vs. the ResDir pattern)
- `05-Testing and Inspection` rationalized to `Testing and Inspection/` — HVAC, Asbestos, Compaction, Pile Log, Welding are not standard in commercial; Concrete, Soil, Special Inspections are preserved
- `07-Safety` simplified to `Safety/` with `JHA Forms/` and `Incident Reports/` (Toolbox Talks and Weekly Site Walk records live in lists, not the folder)
- `09-Accounting` simplified to `Accounting/` with Budget, Forecast, Pay Applications (LienRelease is a specific document type, not a folder category in Wave 0)
- `12-Closeout` simplified to `Closeout/` with `Owner Manual/` and `Punchlist/` (Evaluation and Survey are post-closeout items)
- `13-Marketing` omitted from project site (marketing materials belong in a shared marketing library, not per-project sites)

### 6.3 Luxury Residential Documents Folder Tree

Library name: `Luxury Residential Documents`
Source: `ResDir/` library tree (hybrid-preserve)

```
Luxury Residential Documents/
├── Owner Files/
│   ├── Contract/
│   ├── Insurance/
│   ├── Notices/
│   └── Owner Direct Subcontracts/
├── Engineering Reports/
│   ├── Civil/
│   ├── MEP/
│   ├── Structural/
│   └── Surveyor/
├── Permits/
│   ├── HBC Permits/
│   └── Sub Permits/
├── Testing and Inspection/
│   ├── Concrete/
│   ├── Soil/
│   └── HVAC/
├── Meetings/
├── Safety/
│   ├── JHA Forms/
│   └── Incident Reports/
├── Schedule/
│   ├── CPM/
│   └── 3 Week Look Ahead/
├── Accounting/
│   ├── Budget/
│   ├── Forecast/
│   └── Pay Applications/
├── Change Orders/
│   ├── PCO/
│   └── PCCO/
├── Subcontractor/
│   └── Working Documents/
└── Closeout/
    ├── Owner Manual/
    ├── Punchlist/
    └── Survey/
```

**Rationalization notes for Luxury Residential:**
- Preserves `Owner Direct Subcontracts/` subfolder under `Owner Files/` — this is a luxury residential operational reality (owners often have direct contracts with specialty subs)
- `Testing and Inspection` adds HVAC (more significant in luxury residential than commercial in many cases; aligns with ResDir `/05-Testing and Inspection/HVAC`)
- `Closeout` adds `Survey/` subfolder (from `ResDir/12-Closeout/Survey/` — survey documentation is important in luxury residential)
- `Subcontractor/Working Documents/` is preserved as a single subfolder (the per-sub folder creation in `ResDir/11-Subcontractor/Working Documents (Sub Name)/` with per-sub CCO/Compliance/Contract/PayApp/Submittals is too deep and too dynamic for provisioning; Wave 1 can create per-sub folders when subcontracts are awarded)
- `00-Estimating` omitted (same reasoning as commercial)
- `13-Marketing` omitted (same reasoning)

---

## 7. Seeded File Asset Requirements

All seeded files specified in T02–T06 must exist as physical assets in `backend/functions/src/assets/templates/` before Step 3 can upload them. The current state (per `template-file-manifest.ts`) notes that "upload is a graceful skip when files are absent."

**G2 must create actual asset files.** The following assets must be created:

| Asset File Name | Location | Source Material |
|----------------|----------|----------------|
| `Project Setup Checklist.xlsx` | `assets/templates/` | Derived from startup artifacts |
| `Submittal Register Template.xlsx` | `assets/templates/` | Standard submittal template |
| `Meeting Agenda Template.docx` | `assets/templates/` | Meeting Guidelines PDF reference |
| `RFI Log Template.xlsx` | `assets/templates/` | Excel backup for RFI tracking |
| `Estimating Kickoff Template.xlsx` | `assets/templates/` | From `Estimating Kickoff.xlsx` |
| `Responsibility Matrix Template.xlsx` | `assets/templates/` | From `HB Internal Responsibility Matrix.xlsx` |
| `Project Management Plan Template.docx` | `assets/templates/` | From `PROJECT MANAGEMENT PLAN 2019.docx` |
| `Procore Startup Checklist Reference.pdf` | `assets/templates/` | From `Procore Startup Checklist Summary.pdf` |
| `Project Closeout Guide.docx` | `assets/templates/` | From `Project Closeout Guide - DRAFT.docx` |
| `Closeout Checklist Reference.pdf` | `assets/templates/` | From `Job Closeout Checklist.pdf` |
| `JHA Form Template.docx` | `assets/templates/` | From `JHA form 2026.docx` |
| `JHA Instructions.docx` | `assets/templates/` | From `JHA Instructions Sheet.docx` |
| `Incident Report Form.docx` | `assets/templates/` | From `Incident Report .docx` |
| `Site Specific Safety Plan Template.docx` | `assets/templates/` | From `Site Specific Safety Plan - NORA.docx` |
| `Required Inspections Template.xlsx` | `assets/templates/` | From `10b_20260220_RequiredInspectionsList.xlsx` |
| `Buyout Log Template.xlsx` | `assets/templates/` | From `Buyout Log_Template 2025.xlsx` |
| `Draw Schedule Template.xlsx` | `assets/templates/` | From `HB Draw Schedule -Cash Flow.xlsx` |
| `Financial Forecast Checklist.xlsx` | `assets/templates/` | From `Financial Forecast Summary & Checklist.xlsx` |
| `add-ons/safety-pack/Site Specific Safety Plan Template.docx` | `assets/templates/` | Symlink or copy of main SSSP template |
| `add-ons/closeout-pack/Close-Out Checklist.xlsx` | `assets/templates/` | From closeout checklist materials |

**Asset file creation process:** These files are not auto-generated — they must be manually created by stripping project-specific data from the source artifacts and saving as templates. This is an operational content task that should be handled by the product owner or a designated content owner, not by the provisioning implementation developer. The implementation developer can ensure the `SharePointService.uploadTemplateFiles()` method correctly uses the manifest and reports which files are present vs. absent.

---

## 8. Step 4 Extension Implementation Pattern

The current `step4-data-lists.ts` calls:
```typescript
await services.sharePoint.createDataLists(status.siteUrl!, HB_INTEL_LIST_DEFINITIONS);
```

The G2 extension pattern:
```typescript
// Step 4: Create core lists first
await services.sharePoint.createDataLists(status.siteUrl!, HB_INTEL_LIST_DEFINITIONS);

// Step 4 G2 extension: Create workflow-family lists
// Parent lists before child lists (ordering is critical for Lookup field resolution)
await services.sharePoint.createDataLists(status.siteUrl!, HB_INTEL_WORKFLOW_LIST_DEFINITIONS);
```

If Step 4b is introduced (see §5 timeout risk):
- `step4-data-lists.ts` retains the 8 core lists + `pid` amendment
- A new `step4b-workflow-lists.ts` handles the 25 workflow-family lists
- The saga orchestrator gains a Step 4b entry (between current Steps 4 and 5)
- Step 4b gets the same idempotency guard as all other steps

---

## 9. Acceptance Criteria

- [ ] `withRetry` Retry-After fix is implemented and covered by T09 throttle test
- [ ] `IFieldDefinition` type additions are implemented: `defaultValue`, `indexed`, `lookupListTitle`, `lookupFieldName`
- [ ] `SharePointService.createDataLists()` extension handles new field properties
- [ ] `HB_INTEL_WORKFLOW_LIST_DEFINITIONS` is defined in `list-definitions.ts` or a companion file with all 25 G2 lists in correct provisioning order
- [ ] `PunchBatchId` field amendment is added to core `Punch List` in `HB_INTEL_LIST_DEFINITIONS`
- [ ] `TEMPLATE_FILE_MANIFEST` is updated with all G2 seeded files
- [ ] `ADD_ON_DEFINITIONS['safety-pack']` references the consolidated `Site Specific Safety Plan Template.docx` asset
- [ ] Department pruning in Step 3 is activated (uses `status.department` from `IProvisioningStatus`)
- [ ] Department library folder tree creation is implemented in Step 3 with `createFolderIfNotExists`
- [ ] Commercial Documents folder tree matches §6.2 specification
- [ ] Luxury Residential Documents folder tree matches §6.3 specification
- [ ] Open decisions (pre-seeded items, Draw Schedule model, safety-pack coordination, Punch Batch cross-reference) are all resolved and documented
- [ ] Step 4b decision is made: introduce or defer, with specific staging duration test result as evidence
- [ ] All template asset files are created or their creation is assigned to the product owner with a named handoff date
- [ ] Guarded commit config is defined for all G2 backend changes

---

## 10. Known Risks and Pitfalls

**Risk T07-R1: Step 4 duration may exceed Function timeout.** With 33 total lists, Step 4 duration may approach or exceed 6–8 minutes. The Azure Function default timeout is 10 minutes. If staging tests show Step 4 duration > 6 minutes, Step 4b must be introduced before G2 is merged. Do not deploy G2 to staging without measuring Step 4 duration.

**Risk T07-R2: `createFolderIfNotExists` is a new SharePointService capability.** The SharePoint service currently does not expose a folder creation method. This method must be implemented and covered by a unit test before Step 3 folder creation can proceed. The method must use PnPjs `Web.getFolderByServerRelativeUrl()` to check existence before creating. T09 must include folder idempotency tests.

**Risk T07-R3: Lookup field creation ordering is strict.** SharePoint Lookup columns require the target list to exist before the column is created. If the `createDataLists` loop processes list definitions in arbitrary order, Lookup fields will fail for child lists if the parent list hasn't been created yet. The ordering in §5 is mandatory. T09 must include a test that verifies child lists with Lookup columns are structurally correct after provisioning.

**Risk T07-R4: `defaultValue` and `indexed` PnPjs support must be verified.** These are new field properties that `SharePointService.createDataLists()` must handle. The PnPjs v3 API supports `DefaultValue` in field schema and column indexing via `EnforceUniqueValues: false, Indexed: true`. If the current PnPjs version in the project does not support these, an alternative approach (post-creation field update) must be used. T09 Test TC-PID-01 validates this.

**Risk T07-R5: Template file assets may not be ready at implementation time.** The seeded file assets require content owners (not developers) to prepare redacted template versions. If assets are not ready, Step 3 will gracefully skip them. The G2 acceptance criteria must be clear: the provisioning code must be correct, but a separate content readiness check must verify that assets exist in the deployment package. T09 includes an asset-existence verification step.

---

*End of W0-G2-T07 — Provisioning Saga Step 3, Step 4, and Seeding Updates v1.0*
