# Gap 6 Re-baseline and Target Contract Freeze

## 1. Executive Summary

Gap 6 has been re-baselined against the latest live SharePoint schema exports (2026-04-01) and the clarified business semantics for the Project Setup field model.

**Key outcome:** The environment has been materially updated since the original Gap 6 validation. The D0 deployment prerequisite (Text-to-Note migration for JSON-array columns) is now **complete**, and the previously missing `viewerUPNs` and `addOns` columns now exist as **named columns** (not under the legacy `field_N` naming scheme). The `projectLeadId` field (`field_17`) remains absent — this is now **intentional**, as the business model has replaced it with `leadEstimatorUpn`. The `additionalTeamMemberUpns` field has been **intentionally removed** from the environment because it overlapped with `groupMembers`.

**Remaining Gap 6 work is repo-contract reconciliation, not environment remediation.** Four specific mismatches between the repo-owned contract and the live schema must be resolved in code, tests, and documentation (Prompts 2-5).

---

## 2. What Changed Since the Original Gap 6 Validation

The original validation (`docs/architecture/reviews/project-setup-sharepoint-schema-environment-gap-validation.md`) was performed against an older schema export and found:

- 0 of 8 JSON-array fields matched (all were `Text` instead of `Note`)
- 3 fields entirely absent (`field_17`, `field_18`, `field_19`)
- D0 deployment prerequisite uncompleted
- Active truncation risk for `clarificationItems` and multi-UPN fields

### 2.1 Environment changes

| Change | Original State | Current State |
|--------|---------------|---------------|
| D0 column migration (4 P2-07 JSON-array fields) | Not completed — all `Text (255)` | **Completed** — all `Note` (MultiLineText) |
| Legacy JSON-array fields (`field_10`, `field_11`) | `Text` (not covered by D0) | **Migrated** to `Note` |
| `viewerUPNs` column | Absent (`field_18` did not exist) | **Exists** as named column `viewerUPNs` (Note) |
| `addOns` column | Absent (`field_19` did not exist) | **Exists** as named column `addOns` (Note) |
| `field_17` (projectLeadId) | Absent | **Still absent** — now intentional |
| `additionalTeamMemberUpns` column | Present as `Text (255)` | **Removed** from live schema — intentional |
| `projectViewerGroups` list | Did not exist | **Exists** with correct semantic shape |

### 2.2 Business semantic changes

| Decision | Detail |
|----------|--------|
| `leadEstimatorUpn` supersedes `projectLeadId` | The old `projectLeadId` concept is replaced. `leadEstimatorUpn` is the authoritative lead assignment field. |
| `additionalTeamMemberUpns` removed | Overlapped with `groupMembers`. The `groupMembers` field is the single authoritative field for standard read/write project team members. |
| `viewerUPNs` redefined | Now means **project-level additive read-only exceptions only**. Department-based default audiences come from the `projectViewerGroups` list. |
| `addOns` retained with actual internal name | The live column uses `addOns` as its SP internal name (not `field_19`). |
| Effective viewer model clarified | Effective read-only membership = department default viewer groups (from `projectViewerGroups`) + project-level `viewerUPNs` exceptions. |

---

## 3. Current Target Field Semantics

These are the frozen intended meanings for Gap 6 closure. Subsequent prompts must align the repo to these semantics.

### `groupMembers`
- **Meaning:** Standard read/write site members — the core project team members.
- **SP internal name:** `field_10` (legacy CSV-import name; display name `GroupMembersJson`).
- **SP type:** Note (MultiLineText). JSON-serialized `string[]`.
- **Status:** Retained. No semantic change.

### `groupLeaders`
- **Meaning:** Elevated workflow/project leaders — not a generic site-membership catchall.
- **SP internal name:** `field_11` (legacy CSV-import name; display name `GroupLeadersJson`).
- **SP type:** Note (MultiLineText). JSON-serialized `string[]`.
- **Status:** Retained. No semantic change.

### `viewerUPNs`
- **Meaning:** Project-level additive read-only exceptions only. These are individual UPNs granted read-only access beyond the department default viewer groups.
- **SP internal name:** `viewerUPNs` (named column — **not** `field_18`).
- **SP type:** Note (MultiLineText). JSON-serialized `string[]`.
- **Status:** Retained with redefined semantics and new SP column name.

### `leadEstimatorUpn`
- **Meaning:** Authoritative replacement for the old `projectLeadId` concept. The lead estimator assigned to the project.
- **SP internal name:** `leadEstimatorUpn` (named column, P2-07).
- **SP type:** Text.
- **Status:** Retained. Supersedes `projectLeadId`.

### `addOns`
- **Meaning:** Selected add-on pack slugs for the project.
- **SP internal name:** `addOns` (named column — **not** `field_19`).
- **SP type:** Note (MultiLineText). JSON-serialized `string[]`.
- **Status:** Retained with new SP column name.

### `projectLeadId` — REMOVED
- **Decision:** Remove from repo contract and domain model.
- **Reason:** Superseded by `leadEstimatorUpn`. The SP column (`field_17`) was never created in the live schema and is no longer needed.

### `additionalTeamMemberUpns` — REMOVED
- **Decision:** Remove from repo contract and domain model.
- **Reason:** Overlapped with `groupMembers`. The SP column has been removed from the live schema.

---

## 4. Current Environment Evidence Summary

### 4.1 Projects list — full field inventory

**Source:** `Projects-list-schema.csv` (Gap 6 evidence pack)

| # | SP Internal Name | Display Name | Live SP Type | Repo Contract Match? | Notes |
|---|---|---|---|---|---|
| 1 | Title | Title | Text | YES | Computed: `"{projectNumber} — {projectName}"` |
| 2 | field_1 | ProjectId | Text | YES | |
| 3 | field_2 | ProjectNumber | Text | YES | |
| 4 | field_3 | ProjectName | Text | YES | |
| 5 | field_4 | ProjectLocation | Text | YES | |
| 6 | field_5 | ProjectType | Text | Cosmetic — repo says Choice | Non-blocking |
| 7 | field_6 | ProjectStage | Text | Cosmetic — repo says Choice | Non-blocking |
| 8 | field_7 | SubmittedBy | Text | YES | |
| 9 | field_8 | SubmittedAt | Number | YES | |
| 10 | field_9 | RequestState | Text | Cosmetic — repo says Choice | Non-blocking |
| 11 | field_10 | GroupMembersJson | Note | YES | Was Text; now migrated |
| 12 | field_11 | GroupLeadersJson | Note | YES | Was Text; now migrated |
| 13 | field_12 | Department | Text | Cosmetic — repo says Choice | Non-blocking |
| 14 | field_13 | EstimatedValue | Number | YES | |
| 15 | field_14 | ClientName | Text | YES | |
| 16 | field_15 | StartDate | Number | YES | |
| 17 | field_16 | ContractType | Text | Cosmetic — repo says Choice | Non-blocking |
| 18 | field_20 | ClarificationNote | Number | YES | |
| 19 | field_21 | CompletedBy | Number | YES | |
| 20 | field_22 | CompletedAt | Number | YES | |
| 21 | field_23 | SiteUrl | Text | Cosmetic — repo says URL | Non-blocking |
| 22 | field_24 | RetryCount | Number | YES | |
| 23 | Year | Year | Number | YES | |
| 24 | officeDivision | officeDivision | Text | YES | P2-07 |
| 25 | procoreProject | procoreProject | Text | YES | P2-07 |
| 26 | clarificationRequestedAt | clarificationRequestedAt | DateTime | YES | P2-07 |
| 27 | requesterRetryUsed | requesterRetryUsed | Text | YES | P2-07 |
| 28 | clarificationItems | clarificationItems | Note | YES | Was Text; now migrated |
| 29 | projectStreetAddress | projectStreetAddress | Text | YES | P2-07 |
| 30 | projectCity | projectCity | Text | YES | P2-07 |
| 31 | projectCounty | projectCounty | Text | YES | P2-07 |
| 32 | projectState | projectState | Text | YES | P2-07 |
| 33 | projectZip | projectZip | Number | YES | P2-07 |
| 34 | projectExecutiveUpn | projectExecutiveUpn | Text | YES | P2-07 |
| 35 | projectManagerUpn | projectManagerUpn | Text | YES | P2-07 |
| 36 | leadEstimatorUpn | leadEstimatorUpn | Text | YES | P2-07 |
| 37 | supportingEstimatorUpns | supportingEstimatorUpns | Note | YES | Was Text; now migrated |
| 38 | timberscanApproverUpn | timberscanApproverUpn | Text | YES | P2-07 |
| 39 | sageAccessUpns | sageAccessUpns | Note | YES | Was Text; now migrated |
| 40 | addOns | addOns | Note | **NAME MISMATCH** — repo maps to `field_19` | Remap required |
| 41 | viewerUPNs | viewerUPNs | Note | **NAME MISMATCH** — repo maps to `field_18` | Remap required |

**Absent from live schema (present in repo contract):**

| Repo SP Internal Name | Domain Property | Reason Absent | Action |
|---|---|---|---|
| `field_17` | `projectLeadId` | Superseded by `leadEstimatorUpn` | Remove from contract |
| `field_18` | `viewerUPNs` | Replaced by named column `viewerUPNs` | Remap in contract |
| `field_19` | `addOns` | Replaced by named column `addOns` | Remap in contract |
| `additionalTeamMemberUpns` | `additionalTeamMemberUpns` | Removed — overlaps with `groupMembers` | Remove from contract |

**Absent from repo contract (present in live schema):**

| Live SP Internal Name | Notes |
|---|---|
| `submittedByOid` | Present in repo contract via P9-G5-05. Absent from live schema CSV — SP column creation required (Text, 255). **Reconciled (P9-G6-05):** field retained, added to `PROJECTS_LIST_FIELD_MAP`. Graceful UPN fallback in `checkOwnership()` until column is provisioned. |
| `completedByOid` | Same as `submittedByOid`. **Reconciled (P9-G6-05):** field retained, added to field map. |

### 4.2 projectViewerGroups list

**Source:** `projectViewerGroups-list-schema.csv` (Gap 6 evidence pack)

| SP Internal Name | Display Name | Live SP Type | Notes |
|---|---|---|---|
| Title | Department | Text | Department key (row identifier). `LinkTitle` computed field has `DisplayName="Department"`. |
| DefaultViewerGroupIdsJson | DefaultViewerGroupIdsJson | Note | JSON-serialized array of default viewer-group IDs. |
| DefaultViewerGroupNames | DefaultViewerGroupNames | Text (255) | Human-readable group names/labels. |
| IsActive | IsActive | Choice (Yes/No) | Default: No. |
| LastReviewedAt | LastReviewedAt | DateTime | Review timestamp. |
| Notes | Notes | Note | Free-form notes. |

**Seeded data:** Two department rows exist ("Commercial", "Luxury Residential") but all data columns are empty — no viewer group IDs, names, or active flags are populated yet.

**Assessment:** The list shape matches the target semantic model described in the execution plan. The empty data is an **environment residual** — it does not block repo-owned contract work but must be populated before the effective viewer model is functional in production.

---

## 5. Repo-Contract Mismatches Requiring Code/Doc Reconciliation

These are the specific mismatches that Prompts 2-5 must resolve.

### 5.1 Remap: `viewerUPNs` (field_18 → named column)

- **Current:** `PROJECTS_LIST_FIELD_MAP.viewerUPNs` maps to `field_18`; `IProjectsListItem.field_18` is the DTO property
- **Target:** Map to SP internal name `viewerUPNs`; rename DTO property accordingly
- **Affected files:** `projects-list-contract.ts` (interface + field map), `projects-list-mapper.ts` (read/write), all tests referencing `field_18`
- **Classification:** Repo contract cleanup + mapper cleanup + test cleanup

### 5.2 Remap: `addOns` (field_19 → named column)

- **Current:** `PROJECTS_LIST_FIELD_MAP.addOns` maps to `field_19`; `IProjectsListItem.field_19` is the DTO property
- **Target:** Map to SP internal name `addOns`; rename DTO property accordingly
- **Affected files:** Same as 5.1 but for `field_19`/`addOns`
- **Classification:** Repo contract cleanup + mapper cleanup + test cleanup

### 5.3 Remove: `projectLeadId` (field_17)

- **Current:** `PROJECTS_LIST_FIELD_MAP.projectLeadId` maps to `field_17`; `IProjectsListItem.field_17` exists; `IProjectSetupRequest.projectLeadId` exists; mapper reads/writes it; tests assert round-trip behavior
- **Target:** Remove entirely from contract, DTO, field map, mapper, domain model, and tests
- **Affected files:** `projects-list-contract.ts`, `projects-list-mapper.ts`, `IProvisioning.ts` (`@hbc/models`), all tests referencing `projectLeadId` or `field_17`, request-lifecycle tests
- **Classification:** Repo contract cleanup + domain model cleanup + mapper cleanup + test cleanup + documentation cleanup

### 5.4 Remove: `additionalTeamMemberUpns`

- **Current:** `PROJECTS_LIST_FIELD_MAP.additionalTeamMemberUpns` maps to named column; `IProjectsListItem.additionalTeamMemberUpns` exists; `IProjectSetupRequest.additionalTeamMemberUpns` exists; mapper reads/writes it; tests assert round-trip behavior; `toListItem()` JSON-array ceiling guard includes it
- **Target:** Remove entirely from contract, DTO, field map, mapper, domain model, and tests
- **Affected files:** Same scope as 5.3
- **Classification:** Repo contract cleanup + domain model cleanup + mapper cleanup + test cleanup + documentation cleanup

---

## 6. Original Gap 6 Findings — Disposition

### Findings now CLOSED

| # | Original Finding | Evidence of Closure |
|---|---|---|
| 1 | 6 JSON-array fields remain `Text (255)` instead of `Note` | All 7 JSON-array fields in the live schema are now `Type="Note"` per schema CSV |
| 2 | D0 prerequisite not completed | The 4 P2-07 columns (`supportingEstimatorUpns`, `additionalTeamMemberUpns`, `sageAccessUpns`, `clarificationItems`) are all `Note`. D0 is done. Note: `additionalTeamMemberUpns` was subsequently removed entirely. |
| 3 | `field_10`/`field_11` Text instead of Note (not covered by D0) | Both now `Note` per schema CSV |
| 4 | Truncation risk for `clarificationItems` and multi-UPN fields | Resolved — all are now `Note` (63K char ceiling) |
| 5 | `field_18` (viewerUPNs) absent | **Closed differently** — `viewerUPNs` now exists as a named column. `field_18` was never created; the named column replaces it. |
| 6 | `field_19` (addOns) absent | **Closed differently** — `addOns` now exists as a named column. `field_19` was never created; the named column replaces it. |

### Findings now SUPERSEDED by new target semantics

| # | Original Finding | Reason Superseded |
|---|---|---|
| 7 | `field_17` (projectLeadId) absent — recommended creating it | `projectLeadId` is no longer part of the target model. `leadEstimatorUpn` supersedes it. The absence of `field_17` is now intentional. |
| 8 | Original remediation 8.3 recommended creating `field_17`, `field_18`, `field_19` | `field_17` is intentionally absent; `field_18`/`field_19` were replaced by named columns instead. |

### Findings with NO CHANGE (non-blocking)

| # | Original Finding | Current Status |
|---|---|---|
| 9 | Choice vs Text mismatches (`field_5`, `field_6`, `field_9`, `field_12`, `field_16`) | Still cosmetic. PnPjs reads/writes string values identically for both types. Non-blocking. |
| 10 | `field_23` (SiteUrl) is Text instead of URL | Still cosmetic. Non-blocking. |

### New finding from re-baseline

| # | Finding | Severity |
|---|---|---|
| 11 | `projectViewerGroups` list exists but data is not populated (no viewer group IDs, names, or active flags) | **Environment residual** — does not block repo contract work but blocks production viewer-group functionality |
| 12 | `submittedByOid` and `completedByOid` (P9-G5-05) are in the repo contract but absent from the live schema CSV | **Reconciled (P9-G6-05)** — fields retained, added to `PROJECTS_LIST_FIELD_MAP`. SP column creation required (environment residual). |

---

## 7. Implementation Order for Remaining Gap 6 Repo Work

The following sequence must be executed in order (Prompts 2-5):

### Prompt 2: Projects Contract, Mapper, and Tests Reconciliation

1. Remove `projectLeadId` from `IProjectSetupRequest` (`@hbc/models`)
2. Remove `additionalTeamMemberUpns` from `IProjectSetupRequest` (`@hbc/models`)
3. Remove `field_17` from `IProjectsListItem` and `PROJECTS_LIST_FIELD_MAP`
4. Remove `additionalTeamMemberUpns` from `IProjectsListItem` and `PROJECTS_LIST_FIELD_MAP`
5. Remap `viewerUPNs` from `field_18` to named column `viewerUPNs` in `IProjectsListItem` and `PROJECTS_LIST_FIELD_MAP`
6. Remap `addOns` from `field_19` to named column `addOns` in `IProjectsListItem` and `PROJECTS_LIST_FIELD_MAP`
7. Update `projects-list-mapper.ts` read/write paths for all 4 changes
8. Update `toListItem()` JSON-array ceiling guard to remove `additionalTeamMemberUpns` and update `field_18`/`field_19` references
9. Update all affected tests in `projects-list-mapper.test.ts`, `sp-field-mapping.test.ts`, and `request-lifecycle.test.ts`
10. Run `@hbc/functions` check-types, lint, and tests

### Prompt 3: projectViewerGroups Contract, Adapter, and Usage Alignment

1. Create a repo-owned contract/adapter for the `projectViewerGroups` list
2. Align with the effective viewer model: department defaults + project-level exceptions
3. Add tests
4. Verify

### Prompt 4: Documentation, Runbook, and Review Reconciliation

1. Update `project-setup-sharepoint-schema-environment-gap-validation.md` to reflect current state
2. Update any affected runbooks, deployment docs, and review docs
3. Update inline comments in contract/mapper files
4. Reconcile the original D0 prerequisite documentation

### Prompt 5: Final Closure Audit and Evidence Pack

1. Produce final closure audit stating exactly what is closed and what remains environment-gated
2. Compile evidence pack
3. Mark Gap 6 as closed (or substantially closed with explicit residuals)

---

## 8. Environment Residuals (Not Closable by Repo Work Alone)

| # | Residual | Owner | Impact |
|---|---|---|---|
| 1 | `projectViewerGroups` data not populated (no viewer group IDs or active flags) | SharePoint Admin / Business | Viewer-group policy will not function until populated |
| 2 | `submittedByOid` / `completedByOid` Text columns absent from Projects list | SharePoint Admin (P9-G5-05) | OID fields read as `undefined`; authorization falls back to UPN comparison until columns are provisioned |
| 3 | Choice columns remain Text in live schema | SharePoint Admin | Cosmetic only; no runtime impact |
