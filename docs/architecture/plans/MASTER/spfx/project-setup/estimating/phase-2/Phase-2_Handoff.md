# Phase 2 — Final Handoff: Data Contract Complete

> Completed: 2026-03-30
> Package: `@hbc/spfx-project-setup` (apps/estimating)
> Backend: `backend/functions/`
> Version at handoff: 0.2.20

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

## 2. What Remains Intentionally Deferred

| Item | Reason | Phase |
|------|--------|-------|
| 16 unmapped domain properties | No corresponding SP columns exist; requires SP list schema changes or alternative storage | Phase 3+ |
| Structured location fields (5) | `projectStreetAddress`, `projectCity`, `projectCounty`, `projectState`, `projectZip` — newer wizard additions not in production SP list | Phase 3+ |
| Team assignment fields (6) | `projectExecutiveUpn`, `projectManagerUpn`, `leadEstimatorUpn`, etc. — role-specific metadata not persisted | Phase 3+ |
| Clarification lifecycle (3) | `clarificationRequestedAt`, `requesterRetryUsed`, `clarificationItems` — complex nested data needing storage decision | Phase 3+ |
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

## 4. Unresolved Data-Contract Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| 16 unmapped domain properties lost on SP persist | **Medium** | UI Review mode (mock repo) preserves all fields; production mode loses them; documented in gap analysis |
| SP Number columns storing strings | **Low** | `readOptionalStringFromNumber()` handles numeric `0` → `undefined` conversion; tested |
| `clarificationItems` has no persist path | **Medium** | Complex nested array; may need Azure Table Storage instead of SP list column |

## 5. Recommended Next Phase Entry Point

**First task for Phase 3:** Decide the persistence strategy for the 16 unmapped domain properties:
- **Option A:** Add new columns to the SP Projects list and extend the field map
- **Option B:** Serialize overflow properties into a single JSON column
- **Option C:** Accept some properties as session-scoped (frontend-only, not persisted)

The structured location fields and team assignment fields are the highest priority — they carry data collected during the wizard that cannot be recovered after the SP round-trip.

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
