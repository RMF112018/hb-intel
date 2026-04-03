# SharePoint Schema / Environment Gap Validation — Project Setup

---

## P9-G6 Reconciliation Notice (2026-04-01)

> **This document was written against an older schema state.** The environment and the repo-owned contract have both changed materially since this validation was performed. The findings below are preserved as historical truth, but the current authoritative state is documented in the Gap 6 re-baseline and reconciliation artifacts:
>
> - **Re-baseline memo:** `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/Gap-6-Rebaseline-and-Target-Contract-Freeze.md`
> - **Contract reconciliation:** `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/Gap-6-Projects-Contract-Reconciliation.md`
> - **Viewer groups design:** `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/Gap-6-projectViewerGroups-Design-and-Adapter-Alignment.md`
> - **Final field semantics:** `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/Gap-6-Final-Field-Semantics.md`
>
> **Key changes since this validation:**
>
> | Original Finding | Current Status |
> |---|---|
> | D0 prerequisite not completed | **CLOSED** — all JSON-array fields migrated to Note |
> | 6 JSON-array fields remain Text (255) | **CLOSED** — all now Note (MultiLineText) |
> | field_17 (projectLeadId) absent | **SUPERSEDED** — `projectLeadId` removed from target model; `leadEstimatorUpn` is the authoritative replacement |
> | field_18 (viewerUPNs) absent | **CLOSED** — `viewerUPNs` now exists as a named column; repo contract remapped |
> | field_19 (addOns) absent | **CLOSED** — `addOns` now exists as a named column; repo contract remapped |
> | additionalTeamMemberUpns truncation risk | **SUPERSEDED** — field removed from target model and live schema (overlapped with `groupMembers`) |
> | Section 8.3 recommends creating field_17/18/19 | **SUPERSEDED** — field_17 intentionally absent; field_18/19 replaced by named columns |
> | Repo-owned contract: 43 fields | **Updated** — now 41 fields after removing `projectLeadId` and `additionalTeamMemberUpns` |

---

## Executive Summary (Original — written against pre-migration schema)

**Verdict: Confirmed gap — the live SharePoint `Projects` list schema does not match the repo-owned 43-field contract.**

A fresh schema export of the live HBCentral `Projects` list reveals:

- **6 JSON-array fields remain `Text` (255-char ceiling)** instead of `MultiLineText` — including all 4 P2-07 fields (`clarificationItems`, `supportingEstimatorUpns`, `additionalTeamMemberUpns`, `sageAccessUpns`) plus 2 legacy fields (`field_10`/groupMembers, `field_11`/groupLeaders).
- **3 fields are completely absent** from the live schema (`field_17`/projectLeadId, `field_18`/viewerUPNs, `field_19`/addOns).
- The D0 deployment prerequisite (column migration from Text to MultiLineText) documented in Phase-5_Deployment-Runbook.md has **not been completed**.

The remediation reports were truthful — they explicitly documented the live column migration as external, deployment-gated, and "not yet proven." The gap is in the environment, not in the reports or repo-owned code.

This is a **true production-readiness concern**: JSON-array fields that exceed 255 characters will be silently truncated on write by SharePoint, causing data loss and corrupted JSON on subsequent reads. The `clarificationItems` field is the highest-risk target, as a single structured clarification record can approach the 255-char ceiling.

---

## 1. Remediation-Report Claims

### Phase 1-5 gap report — D0 documented as "not yet proven"

**File:** `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

> Line 348: "the repo does not contain a checked-in schema export or live integration run proving the external SharePoint list currently has the required columns."

> Line 1574: "Added D0 deployment prerequisite for SP column migration"

> Line 1584: "The remaining deployment prerequisite (D0: SP column migration) is environment-gated and documented in the deployment runbook."

> Line 1675: "| D0: SP column migration (4 json-array cols) | **Not yet proven** | Runbook D0 prerequisite (P6-01) |"

### Phase 7 report — external proof explicitly excluded

**File:** `docs/architecture/reviews/project-setup-phase-7-production-alignment-remediation-report.md`

> Line 218: "Storage ceiling resolved — 4 json-array columns migrated from Text (255 chars) to MultiLineText (63k chars) (P6-01)"

> Line 220: "**External live SharePoint list proof remains outside repo evidence** (environment-gated)"

> Line 710: "| SP column migration (Text → MultiLineText for 4 JSON columns) | SharePoint Admin | Deployment prerequisite D0 |"

### Phase 5 deployment runbook — D0 prerequisite defined

**File:** `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Deployment-Runbook.md`

> Lines 13-25: "Migrate four JSON-serialized array columns from `Text` (255-char limit) to `Note` (MultiLineText) in the HBCentral **Projects** list. Required before deploying P6-01 backend changes to prevent JSON truncation on write."

The runbook lists 4 columns requiring migration: `supportingEstimatorUpns`, `additionalTeamMemberUpns`, `sageAccessUpns`, `clarificationItems`. Checkboxes are unchecked.

**Confirmed: Reports were truthful and explicit about the external gap. No report overclaimed live schema closure.**

---

## 2. Repo-Owned Contract Evidence

### 2.1 Field contract — 43 fields, 8 JSON-array as MultiLineText

**File:** `backend/functions/src/services/projects-list-contract.ts`

The `PROJECTS_LIST_FIELD_MAP` defines 43 domain-to-SharePoint field mappings. Eight fields are typed `MultiLineText` with `json-array` serialization:

| Domain Property | SP Internal Name | Repo SP Type | Serialization | Origin |
|----------------|-----------------|-------------|---------------|--------|
| groupMembers | field_10 | MultiLineText | json-array | Legacy |
| groupLeaders | field_11 | MultiLineText | json-array | Legacy |
| viewerUPNs | field_18 | MultiLineText | json-array | Legacy |
| addOns | field_19 | MultiLineText | json-array | Legacy |
| supportingEstimatorUpns | supportingEstimatorUpns | MultiLineText | json-array | P2-07 |
| additionalTeamMemberUpns | additionalTeamMemberUpns | MultiLineText | json-array | P2-07 |
| sageAccessUpns | sageAccessUpns | MultiLineText | json-array | P2-07 |
| clarificationItems | clarificationItems | MultiLineText | json-array | P2-07 |

### 2.2 Mapper diagnostic guards

**File:** `backend/functions/src/services/projects-list-mapper.ts`

The `toListItem()` function includes a P6-01 diagnostic guard (lines 203-214) that warns if any JSON-array field exceeds 50,000 characters (the SP MultiLineText actual ceiling). This guard assumes the columns are MultiLineText — if the columns are still Text, truncation occurs at 255 characters, far below the guard's threshold.

### 2.3 Round-trip tests prove >255-char payloads

**File:** `backend/functions/src/services/__tests__/projects-list-mapper.test.ts`

Lines 427-455 prove that 5 complex clarification items and 8 supporting estimator UPNs exceed 255 characters and survive round-trip intact. These tests validate the code-side contract but cannot detect live schema mismatches.

---

## 3. Live SharePoint Schema-Export Evidence

**File:** `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/Projects-list-schema.csv`

The schema export contains a `ListSchema` JSON with XML `<Field>` definitions for each column in the live `Projects` list.

### 3.1 JSON-array fields — all still Text

| SP Internal Name | Live Type | Live MaxLength | Evidence |
|-----------------|-----------|---------------|----------|
| `field_10` | `Type="Text"` | default (255) | `<Field Type="Text" DisplayName="GroupMembersJson" Name="field_10" .../>` |
| `field_11` | `Type="Text"` | default (255) | `<Field Type="Text" DisplayName="GroupLeadersJson" Name="field_11" .../>` |
| `supportingEstimatorUpns` | `Type="Text"` | `MaxLength="255"` | `<Field ... Type="Text" ... MaxLength="255" Name="supportingEstimatorUpns" .../>` |
| `additionalTeamMemberUpns` | `Type="Text"` | `MaxLength="255"` | `<Field ... Type="Text" ... MaxLength="255" Name="additionalTeamMemberUpns" .../>` |
| `sageAccessUpns` | `Type="Text"` | `MaxLength="255"` | `<Field ... Type="Text" ... MaxLength="255" Name="sageAccessUpns" .../>` |
| `clarificationItems` | `Type="Text"` | `MaxLength="255"` | `<Field ... Type="Text" ... MaxLength="255" Name="clarificationItems" .../>` |

**None of the 6 present JSON-array fields are MultiLineText (Note).** All are `Type="Text"` with a 255-character ceiling.

### 3.2 Missing fields — 3 absent from live schema

| SP Internal Name | Repo Contract | Live Schema | Status |
|-----------------|---------------|-------------|--------|
| `field_17` | Text (projectLeadId) | Not present | **Missing** |
| `field_18` | MultiLineText (viewerUPNs) | Not present | **Missing** |
| `field_19` | MultiLineText (addOns) | Not present | **Missing** |

These fields are defined in the repo contract but do not exist in the live SharePoint list. The CSV data columns confirm their absence — the header row jumps from `field_16` (ContractType) to `field_20` (ClarificationNote).

### 3.3 Additional type mismatches (lower severity)

| SP Internal Name | Repo Type | Live Type | Impact |
|-----------------|-----------|-----------|--------|
| `field_23` (SiteUrl) | URL | Text (MaxLength=255) | Low — URLs typically under 255 chars; PnPjs reads/writes strings either way |
| `field_5` (ProjectType) | Choice | Text | Negligible — PnPjs reads/writes string values identically |
| `field_6` (ProjectStage) | Choice | Text | Negligible |
| `field_9` (RequestState) | Choice | Text | Negligible |
| `field_12` (Department) | Choice | Text | Negligible |
| `field_16` (ContractType) | Choice | Text | Negligible |

Choice vs Text mismatches do not affect read/write behavior through PnPjs — both store and return string values. The repo contract marks these as `Choice` for documentation accuracy, not for runtime enforcement.

---

## 4. Field-by-Field Comparison — JSON-Array Fields

| Domain Property | SP Name | Repo Type | Live Type | Match? | Truncation Risk |
|----------------|---------|-----------|-----------|--------|-----------------|
| groupMembers | field_10 | MultiLineText | Text | **NO** | **Yes** — 2+ UPNs exceed 255 chars |
| groupLeaders | field_11 | MultiLineText | Text | **NO** | **Yes** — 2+ UPNs exceed 255 chars |
| viewerUPNs | field_18 | MultiLineText | **Missing** | **NO** | N/A — field does not exist |
| addOns | field_19 | MultiLineText | **Missing** | **NO** | N/A — field does not exist |
| supportingEstimatorUpns | supportingEstimatorUpns | MultiLineText | Text (255) | **NO** | **Yes** — multiple UPNs exceed 255 chars |
| additionalTeamMemberUpns | additionalTeamMemberUpns | MultiLineText | Text (255) | **NO** | **Yes** — multiple UPNs exceed 255 chars |
| sageAccessUpns | sageAccessUpns | MultiLineText | Text (255) | **NO** | **Yes** — multiple UPNs exceed 255 chars |
| clarificationItems | clarificationItems | MultiLineText | Text (255) | **NO** | **Yes** — a single clarification item approaches 255 chars |

**0 of 8 JSON-array fields match the repo-owned contract.**

---

## 5. Gap Analysis

### 5.1 Severity tiers

**Tier 1 — Active truncation risk (production blocker):**

The 4 P2-07 JSON-array fields (`clarificationItems`, `supportingEstimatorUpns`, `additionalTeamMemberUpns`, `sageAccessUpns`) are used by the Project Setup request lifecycle. When production mode activates:
- `clarificationItems`: A single structured clarification record (with `question`, `response`, `resolvedBy`, `resolvedAt` fields) approaches the 255-char ceiling. Multiple items will be silently truncated, causing corrupted JSON on read.
- `supportingEstimatorUpns` / `additionalTeamMemberUpns` / `sageAccessUpns`: 4+ UPN entries (each ~40 chars) will exceed 255 characters and be truncated.

The repo-owned mapper's `safeParseJsonArray()` will return `[]` when it encounters corrupted JSON, silently losing data.

**Tier 2 — Latent truncation risk (existing rows):**

The 2 legacy JSON-array fields (`field_10`/groupMembers, `field_11`/groupLeaders) are also `Text` instead of `MultiLineText`. Existing rows with 6+ group members already risk truncation. However, the live data shows these fields currently contain small arrays (2 entries in the sample row), so truncation has not yet occurred in practice.

**Tier 3 — Missing fields (read path returns undefined):**

`field_17` (projectLeadId), `field_18` (viewerUPNs), and `field_19` (addOns) do not exist in the live schema. The mapper's `toDomain()` reads these as `undefined`/`[]`, which is safe for the read path. The write path will attempt to set these fields, which PnPjs may silently ignore or error on depending on the SharePoint API version.

**Tier 4 — Cosmetic type mismatches (non-blocking):**

Choice vs Text and URL vs Text mismatches do not affect runtime behavior through PnPjs.

### 5.2 D0 prerequisite status

The D0 deployment prerequisite defined in Phase-5_Deployment-Runbook.md is **not completed**. The live schema export proves that all 4 target columns remain `Text` with a 255-character ceiling.

### 5.3 Report accuracy

The remediation reports were **accurate and not misleading**:
- They described the repo-owned contract migration correctly
- They explicitly documented D0 as an external deployment prerequisite
- They never claimed the live list was migrated
- Phase 7 line 220 explicitly states "External live SharePoint list proof remains outside repo evidence"

---

## 6. Verdict

**Confirmed gap — the live SharePoint `Projects` list schema does not match the repo-owned contract for any of the 8 JSON-array fields.**

| Dimension | Assessment |
|-----------|-----------|
| D0 prerequisite completed | **No** — all 4 target columns remain Text |
| Legacy JSON-array columns migrated | **No** — field_10 and field_11 also remain Text |
| Missing fields provisioned | **No** — field_17, field_18, field_19 absent |
| Production truncation risk | **Yes** — clarificationItems and multi-UPN fields will silently truncate |
| Reports accurate | **Yes** — reports truthfully documented this as external/unproven |
| Repo-owned code aligned | **Yes** — code correctly expects MultiLineText |

---

## 7. Why the Verdict Is Correct

1. **The schema export is unambiguous.** Every JSON-array field in the live schema is `Type="Text"` with `MaxLength="255"`. None are `Type="Note"` (MultiLineText). The XML field definitions are authoritative SharePoint schema truth.

2. **The D0 prerequisite checkboxes are unchecked.** Phase-5_Deployment-Runbook.md (lines 23-24) shows both verification items as unchecked `- [ ]`.

3. **The truncation risk is real, not theoretical.** The mapper test suite (lines 427-455) proves that realistic payloads exceed 255 characters. A single clarification item with `question`, `response`, `resolvedBy`, and `resolvedAt` fields approaches the ceiling. Multiple items will exceed it.

4. **The repo-owned code has no truncation guard on write.** The P6-01 diagnostic guard (50K chars) only warns; it does not prevent the write. Even if it did, it checks against the MultiLineText ceiling, not the Text ceiling. Data written to a Text column is silently truncated by SharePoint with no error returned to the caller.

5. **Three fields are entirely absent.** The live list has no `field_17`, `field_18`, or `field_19` columns. The repo contract maps `projectLeadId`, `viewerUPNs`, and `addOns` to these fields.

---

## 8. Remediation Targets

The following environment changes would close the gap. **Not implemented in this validation.**

### 8.1 D0 — Migrate 4 P2-07 columns from Text to Note (MultiLineText)

| Column Internal Name | Current Type | Target Type |
|---------------------|-------------|-------------|
| `supportingEstimatorUpns` | Text (255) | Note (MultiLineText) |
| `additionalTeamMemberUpns` | Text (255) | Note (MultiLineText) |
| `sageAccessUpns` | Text (255) | Note (MultiLineText) |
| `clarificationItems` | Text (255) | Note (MultiLineText) |

SharePoint preserves existing data when converting Text to Note. This is a safe migration.

### 8.2 Migrate 2 legacy JSON-array columns from Text to Note

| Column Internal Name | Current Type | Target Type |
|---------------------|-------------|-------------|
| `field_10` (groupMembers) | Text | Note (MultiLineText) |
| `field_11` (groupLeaders) | Text | Note (MultiLineText) |

Not covered by D0 but subject to the same truncation risk.

### 8.3 Create 3 missing columns

| Column Internal Name | Target Type | Purpose |
|---------------------|-------------|---------|
| `field_17` | Text | projectLeadId (legacy UPN) |
| `field_18` | Note (MultiLineText) | viewerUPNs (JSON array) |
| `field_19` | Note (MultiLineText) | addOns (JSON array) |

These columns must be created in the live list to match the repo-owned contract. Column creation is more complex than type migration and should be verified for PnPjs compatibility.

### 8.4 Consider URL type for SiteUrl

| Column Internal Name | Current Type | Target Type |
|---------------------|-------------|-------------|
| `field_23` (SiteUrl) | Text (255) | URL |

Low priority. The repo contract expects URL type, but Text works functionally for URL storage unless URLs exceed 255 characters.

---

## 9. Unresolved Questions

| # | Question | Why It Matters |
|---|----------|---------------|
| 1 | Have any existing live rows already suffered truncation in field_10 or field_11? | If so, data may already be corrupted and require repair |
| 2 | Does PnPjs silently ignore writes to nonexistent columns (field_17, field_18, field_19)? | If it throws, production-mode write operations will fail for requests with these fields |
| 3 | Can the column migration (Text → Note) be performed while the list is in use? | SharePoint generally supports this safely, but should be confirmed for the specific list size and content type configuration |
| 4 | Should the legacy field_10/field_11 migration be added to D0 or tracked separately? | The D0 prerequisite only covers the 4 P2-07 fields, but field_10 and field_11 have the same risk |
| 5 | Are Choice columns needed for field_5, field_6, field_9, field_12, field_16? | The repo contract types them as Choice but the live list uses Text. Functionally equivalent, but Choice provides SharePoint-native validation |

---

## Appendix: Evidence Index

| Evidence | Source | Type |
|----------|--------|------|
| 8 JSON-array fields typed MultiLineText in contract | `backend/functions/src/services/projects-list-contract.ts` lines 184-185, 194-195, 228-229, 231, 236 | Confirmed repo fact |
| P6-01 diagnostic guard at 50K chars | `backend/functions/src/services/projects-list-mapper.ts` lines 203-214 | Confirmed repo fact |
| Round-trip tests prove >255 char payloads | `backend/functions/src/services/__tests__/projects-list-mapper.test.ts` lines 427-455 | Confirmed repo fact |
| D0 prerequisite defined with unchecked boxes | `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Deployment-Runbook.md` lines 13-25 | Confirmed repo fact |
| "Not yet proven" D0 status | `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md` line 1675 | Confirmed report claim |
| "External live SharePoint list proof remains outside repo evidence" | `docs/architecture/reviews/project-setup-phase-7-production-alignment-remediation-report.md` line 220 | Confirmed report claim |
| All 6 present JSON-array fields are `Type="Text"` | `Projects-list-schema.csv` schema XML | Confirmed live SP fact |
| field_17, field_18, field_19 absent from live schema | `Projects-list-schema.csv` schema XML and CSV header | Confirmed live SP fact |
| supportingEstimatorUpns `Type="Text" MaxLength="255"` | `Projects-list-schema.csv` schema XML | Confirmed live SP fact |
| clarificationItems `Type="Text" MaxLength="255"` | `Projects-list-schema.csv` schema XML | Confirmed live SP fact |
