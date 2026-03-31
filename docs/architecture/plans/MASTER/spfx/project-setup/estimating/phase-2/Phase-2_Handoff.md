# Phase 2 — Final Handoff: Data Contract Complete

> **Original handoff:** 2026-03-30 (26-field contract for CSV-import columns)
> **Schema reconciliation:** 2026-03-31 (P2-07 through P2-11 — 17 new columns, 43 total fields)
> Package: `@hbc/spfx-project-setup` (apps/estimating)
> Backend: `backend/functions/`
> Version at handoff: 0.2.20
>
> **Reconciliation note (2026-03-31):** This handoff originally covered the 26 CSV-import columns only. The 16 unmapped domain properties listed in Section 2 as "intentionally deferred" have since been resolved in repo-owned code and tests: the field contract and mapper were extended to 43 fields, a submit handler field-loss bug was fixed (P2-08), misleading mock tests were restructured (P2-09), and legacy-row compatibility was confirmed safe without backfill (P2-10). Phase 2 planning docs also refer to an external SharePoint schema export from P2-07, but that export is not checked into the repo, so live-list closure remains external / not repo-evidenced. The gap document `Phase-2_Data-Contract-Gaps.md` is now historical context.

## 1. What Phase 2 Accomplished

### Field-Map Baseline (Prompt 01)
- Inventoried all 26 SharePoint columns in the HBCentral Projects list (`field_1`–`field_24` + `Title` + `Year`)
- Identified 16 domain properties in `IProjectSetupRequest` with no corresponding SP column (silently dropped on persist)
- Documented 5 SP Number columns that store string data due to CSV import origin
- Produced authoritative field-map baseline and data-contract gap analysis

### Canonical Data Contract (Prompt 02)
- Created `IProjectsListItem` persistence DTO matching the exact SP schema
- Created `PROJECTS_LIST_FIELD_MAP` constant linking domain properties to SP internal names
- Created `PROJECTS_LIST_SELECT_FIELDS` derived from the field map
- Defined normalization rules for all field categories (strings, numbers, JSON arrays, dates, enums, string-in-number columns)

### Centralized Mapping (Prompt 03)
- Created `projects-list-mapper.ts` with `toDomain()`, `toListItem()`, `resolveSpField()`, `safeParseJsonArray()`
- Refactored `SharePointProjectRequestsAdapter` to use centralized mapper — zero inline `field_N` references remain in adapter code
- Adapter reduced from ~210 lines to ~138 lines

### Contract Tests (Prompt 04)
- Added 30 contract tests covering full read/write mapping, round-trip preservation, field resolution, JSON parsing edge cases, normalization rules, and a regression guard
- Fixed vitest config to discover `services/__tests__/` test files (also enabled 6 pre-existing tests)

### Runtime Validation (Prompt 05)
- Added `validateSpItem()` for schema drift detection (missing critical fields, type mismatches)
- Enhanced `toDomain()` and `safeParseJsonArray()` with optional `ILogger` diagnostics
- Created operator troubleshooting guide for field-contract warnings

### Test Coverage Summary

| Suite | Before Phase 2 | After Phase 2 | Delta |
|-------|---------------|---------------|-------|
| Backend tests | 468 | 514 | +46 |
| Frontend tests | 126 | 126 | 0 (no frontend changes) |

## 2. Originally Deferred Items at Handoff Time

| Item | Reason | Phase |
|------|--------|-------|
| 16 unmapped domain properties | **Historical handoff state only.** Later repo-owned Phase 2 work extended the contract and mapper to cover these properties; current residual proof gap is the live external SharePoint list, not missing repo-owned mapping. | Historically Phase 3+, later reconciled in P2-07 through P2-11 |
| Structured location fields (5) | **Historical handoff state only.** Later repo-owned Phase 2 work added coverage for `projectStreetAddress`, `projectCity`, `projectCounty`, `projectState`, `projectZip`; current residual proof gap is external-list validation. | Historically Phase 3+, later reconciled |
| Team assignment fields (6) | **Historical handoff state only.** Later repo-owned Phase 2 work added coverage for `projectExecutiveUpn`, `projectManagerUpn`, `leadEstimatorUpn`, etc.; current residual proof gap is external-list validation. | Historically Phase 3+, later reconciled |
| Clarification lifecycle (3) | Repo-owned mapping now exists for `clarificationRequestedAt`, `requesterRetryUsed`, and `clarificationItems`, but `clarificationItems` still rides an SP Text column with a 255-character ceiling. | Partially deferred follow-up |
| Setup script alignment | `scripts/create-projects-list.ts` cannot recreate production schema (15 of 26 fields) | Low priority |
| Full auth-model redesign | Out of Phase 2 scope | Phase 3+ |
| `GET /api/users/me/preferences` endpoint | Deferred from Phase 1; ComplexityProvider degrades gracefully | Phase 3+ |

## 3. Verification Status

| Check | Status | Details |
|-------|--------|---------|
| Backend tsc | **Passed** | 0 errors |
| Backend tests | **Passed** | 45 files, 514 passed, 22 skipped, 24 todo |
| Frontend check-types | **Passed** | Full turbo |
| Frontend lint | **Passed** | 0 errors |
| Frontend build | **Passed** | |
| Frontend test | **Passed** | 18 files, 126 passed, 2 todo |
| Adapter regression guard | **Passed** | No `field_N` in adapter executable code |
| Round-trip contract test | **Passed** | All 26 fields survive `toListItem → toDomain` |
| Schema validation tests | **Passed** | Critical field detection, type mismatch detection |

**Overall: Phase 2 verification PASSED.**

## 4. Reconciled Data-Contract Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Live external SharePoint list may not match the repo-owned 43-field contract | **Medium** | Repo-owned contract/mapper/tests are now aligned; closure of the live list still depends on external schema proof or live integration evidence |
| SP Number columns storing strings | **Low** | `readOptionalStringFromNumber()` handles numeric `0` → `undefined` conversion; tested |
| ~~`clarificationItems` storage ceiling~~ | ~~**Medium**~~ | **CLOSED (P6-01).** Migrated to MultiLineText in repo-owned contract along with 3 other json-array gap fields. D0 deployment prerequisite added to runbook for live list column migration. |

## 5. Recommended Next Phase Entry Point

**First task for Phase 3:** Obtain external proof that the live SharePoint `Projects` list still matches the repo-owned 43-field contract, and decide whether `clarificationItems` needs a larger storage target than the current SP Text column.

The highest-value remaining follow-up is no longer missing repo-owned field mapping. It is end-to-end live-environment proof plus the bounded `clarificationItems` storage-scale caveat.

## Phase 2 Artifacts

| Artifact | Location |
|----------|----------|
| Field-Map Baseline | `phase-2/Phase-2_Field-Map-Baseline.md` |
| Data-Contract Gaps | `phase-2/Phase-2_Data-Contract-Gaps.md` |
| Normalization Rules | `phase-2/Phase-2_Normalization-Rules.md` |
| Troubleshooting Guide | `phase-2/Phase-2_Troubleshooting-Field-Contract.md` |
| Persistence DTO & Field Map | `backend/functions/src/services/projects-list-contract.ts` |
| Centralized Mapper | `backend/functions/src/services/projects-list-mapper.ts` |
| Contract Tests | `backend/functions/src/services/__tests__/projects-list-mapper.test.ts` |
| Prompt Summaries | `phase-2/Phase-2_Prompt-0{2,3,4,5}-Summary.md` |
| This Handoff | `phase-2/Phase-2_Handoff.md` |
