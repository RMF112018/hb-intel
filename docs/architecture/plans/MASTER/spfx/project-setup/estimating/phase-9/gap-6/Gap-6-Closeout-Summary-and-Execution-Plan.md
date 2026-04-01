# Gap 6 Closeout Summary and Execution Plan

## Purpose

This file is the authoritative summary and execution-plan anchor for closing Gap 6: the SharePoint schema / environment gap for Project Setup, as revised by the latest schema evidence and clarified field semantics.

## Original gap

Gap 6 originally identified a mismatch between the repo-owned `Projects` contract and the live SharePoint environment, especially for JSON-array fields stored as `Text (255)` instead of `MultiLineText`, along with several missing fields.

The original validation (`docs/architecture/reviews/project-setup-sharepoint-schema-environment-gap-validation.md`) found:
- 0 of 8 JSON-array fields matched the repo contract (all were `Text` instead of `Note`)
- 3 fields entirely absent from the live schema (`field_17`, `field_18`, `field_19`)
- D0 deployment prerequisite not completed
- Active truncation risk for `clarificationItems` and multi-UPN fields

## Re-baseline completed — 2026-04-01

The environment and intended contract have both changed materially since the original validation. A full re-baseline was performed against the latest schema exports.

**See:** `Gap-6-Rebaseline-and-Target-Contract-Freeze.md` for the complete analysis, evidence tables, and target field semantics.

### Environment changes (all resolved)

- **D0 prerequisite completed:** All JSON-array fields are now `Note` (MultiLineText) — `field_10`, `field_11`, `supportingEstimatorUpns`, `sageAccessUpns`, `clarificationItems`, `addOns`, `viewerUPNs`
- **Truncation risk eliminated:** All JSON-array fields now have the 63K-char ceiling
- **`viewerUPNs` column exists** as a named column `viewerUPNs` (Note) — not as the legacy `field_18`
- **`addOns` column exists** as a named column `addOns` (Note) — not as the legacy `field_19`
- **`projectViewerGroups` list created** with the correct semantic shape for department-based default viewer-group policy

### Semantic changes (locked decisions)

- `leadEstimatorUpn` supersedes the old `projectLeadId` concept
- `additionalTeamMemberUpns` removed — overlapped with `groupMembers`
- `viewerUPNs` redefined as project-level additive read-only exceptions only
- `groupMembers` = standard read/write members / core project team members
- `groupLeaders` = elevated workflow/project leaders
- `addOns` retained using the actual internal name `addOns`

### Original findings disposition

| Category | Count | Status |
|----------|-------|--------|
| JSON-array type mismatches | 6 | **CLOSED** — all migrated to Note |
| Missing fields (field_17, field_18, field_19) | 3 | **CLOSED** — field_17 intentionally absent; field_18/field_19 replaced by named columns |
| D0 prerequisite | 1 | **CLOSED** |
| Choice vs Text cosmetic mismatches | 5 | **NO CHANGE** — non-blocking |

## Current target architecture for Gap 6 closure

### Projects list

Retained key semantics:
- `groupMembers` = standard read/write members / core project team members (SP: `field_10`, Note)
- `groupLeaders` = elevated workflow/project leaders (SP: `field_11`, Note)
- `viewerUPNs` = project-level additive read-only exceptions only (SP: `viewerUPNs` named column, Note)
- `addOns` = retained JSON-array field using the actual internal name `addOns` (SP: `addOns` named column, Note)
- `leadEstimatorUpn` = authoritative replacement for the old `projectLeadId` concept (SP: `leadEstimatorUpn`, Text)

Removed from target model:
- `projectLeadId` — superseded by `leadEstimatorUpn`; `field_17` intentionally absent from live schema
- `additionalTeamMemberUpns` — overlapped with `groupMembers`; removed from live schema

### projectViewerGroups list

Purpose: authoritative default viewer-group policy by department.

Live schema shape:
- `Title` — department key (Text)
- `DefaultViewerGroupIdsJson` — JSON array of default viewer-group IDs (Note)
- `DefaultViewerGroupNames` — human-readable group names / labels (Text)
- `IsActive` — active flag (Choice: Yes/No, default No)
- `LastReviewedAt` — review timestamp (DateTime)
- `Notes` — free-form notes (Note)

Seeded departments: Commercial, Luxury Residential. Data not yet populated (environment residual).

### Effective viewer model

Effective read-only membership should be computed as:

`department default viewer groups (from projectViewerGroups) + project-level viewerUPNs exceptions`

## Closure strategy (updated)

The remaining Gap 6 work is **repo-contract reconciliation**, not environment remediation. The environment is aligned; the repo must catch up.

1. ~~Re-baseline the gap against the latest environment evidence~~ **DONE** (P9-G6-01)
2. ~~Reconcile the repo-owned `Projects` contract, mapper, validation, tests, and docs to the new intended field model~~ **DONE** (P9-G6-02)
3. ~~Add / align a repo-owned contract and adapter layer for `projectViewerGroups`~~ **DONE** (P9-G6-03)
4. ~~Reconcile all affected docs / reports / runbooks~~ **DONE** (P9-G6-04)
5. Produce a final closure audit that states exactly what is closed and what, if anything, remains environment-gated

## Repo-contract mismatches to resolve (Prompts 2-5)

| # | Mismatch | Type | Prompt |
|---|---|---|---|
| 1 | ~~`viewerUPNs` mapped to `field_18` — should be named column `viewerUPNs`~~ | ~~Remap~~ | ~~2~~ **DONE** |
| 2 | ~~`addOns` mapped to `field_19` — should be named column `addOns`~~ | ~~Remap~~ | ~~2~~ **DONE** |
| 3 | ~~`projectLeadId` / `field_17` still in contract and domain model~~ | ~~Remove~~ | ~~2~~ **DONE** |
| 4 | ~~`additionalTeamMemberUpns` still in contract and domain model~~ | ~~Remove~~ | ~~2~~ **DONE** |
| 5 | ~~No repo-owned contract for `projectViewerGroups`~~ | ~~Add~~ | ~~3~~ **DONE** |
| 6 | ~~Original gap validation doc and related docs not updated~~ | ~~Docs~~ | ~~4~~ **DONE** |

## Environment residuals (not closable by repo work)

| # | Residual | Owner |
|---|---|---|
| 1 | `projectViewerGroups` data not populated | SharePoint Admin / Business |
| 2 | Choice columns remain Text in live schema | SharePoint Admin (cosmetic) |

## Explicit questions this closeout must answer

- ~~Which originally reported Gap 6 findings are now fully closed?~~ **Answered** — see re-baseline memo
- ~~Which original fields must be removed from the repo contract because the target model changed?~~ **Answered** — `projectLeadId` and `additionalTeamMemberUpns`
- Does the repo now align with the latest `Projects` list schema? — **Not yet** (Prompt 2)
- Does the repo now align with the latest `projectViewerGroups` schema? — **Not yet** (Prompt 3)
- Are any remaining environment actions still required? — **Yes** — `projectViewerGroups` data population
- Can Gap 6 be honestly marked closed after repo reconciliation, or only substantially closed with specific residuals? — **TBD** (Prompt 5)

## Final output expectation

This file should be updated during each prompt execution and used as the reference point for later documentation reconciliation and final closure.
