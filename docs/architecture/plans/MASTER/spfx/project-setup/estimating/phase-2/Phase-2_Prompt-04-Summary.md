# Prompt 04 Summary — Query/Write-Path Refactor and Contract Tests

> Completed: 2026-03-30

## What Changed

All persistence paths were already routed through the centralized mapper in Prompt 03. This prompt adds comprehensive contract tests that prove the data contract is correct and regression-resistant.

## Tests Added

**File:** `backend/functions/src/services/__tests__/projects-list-mapper.test.ts`

| Test Group | Tests | What It Proves |
|-----------|-------|----------------|
| `toDomain()` — full item | 1 | All 26 fields correctly deserialized from SP item |
| `toDomain()` — defaults | 1 | Missing required fields get documented defaults |
| `toDomain()` — optional fields | 1 | Missing optional fields → `undefined` |
| `toDomain()` — numeric 0 normalization | 1 | SP Number `0` in string columns → `undefined` |
| `toDomain()` — type coercion | 3 | Non-numeric values for Number columns handled gracefully |
| `toListItem()` — full request | 1 | All domain properties map to correct `field_N` |
| `toListItem()` — JSON arrays | 1 | Array fields serialized as JSON strings |
| `toListItem()` — Title computation | 1 | TBD fallback when projectNumber is missing |
| `toListItem()` — optional string nullability | 1 | Missing optional strings → `''` |
| `toListItem()` — optional number nullability | 1 | Missing optional numbers → `null` |
| `toListItem()` — optional array nullability | 1 | Missing optional arrays → `'[]'` |
| Round-trip | 1 | `toDomain(toListItem(request))` preserves all 26 mapped fields |
| `resolveSpField()` | 4 | Field resolution for filter/query, all map entries covered |
| `safeParseJsonArray()` | 7 | Edge cases: null, undefined, malformed, non-array, non-string elements |
| `PROJECTS_LIST_SELECT_FIELDS` | 3 | 26 fields, includes Title/Year, all field_1–field_24 |
| Regression guard | 1 | Adapter file has no `field_N` in executable code |

**Total: 30 new tests**

## Acceptance Criteria Status

| Criterion | Status |
|-----------|--------|
| All active persistence paths exercised through mapping layer | **Met** — round-trip test + per-path tests |
| Tests fail loudly when field contract is broken | **Met** — field-by-field assertions, select-fields count, regression guard |
| Old unsafe assumptions gone, not merely bypassed | **Met** — code-level regex guard on adapter file |
