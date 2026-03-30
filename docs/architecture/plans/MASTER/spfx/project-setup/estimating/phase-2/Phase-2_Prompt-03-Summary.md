# Prompt 03 Summary — SharePoint Field Mapping and Serialization

> Completed: 2026-03-30

## What Changed

The `SharePointProjectRequestsAdapter` no longer embeds the production Projects list schema directly. All `field_N` knowledge is centralized in two modules:

| Module | Purpose |
|--------|---------|
| `projects-list-contract.ts` | Types (`IProjectsListItem`), field map constant, select-fields list |
| `projects-list-mapper.ts` | `toDomain()`, `toListItem()`, `resolveSpField()`, `safeParseJsonArray()` |

### Adapter Before (Prompt 02)
- 165 lines of inline `field_N` mapping in private `toListItem()` and `fromListItem()` methods
- Hardcoded `field_1`, `field_9` strings in filter expressions
- Hardcoded 26-field `.select()` call
- Local `PROJECTS_LIST_NAME` constant
- Local `safeParseJsonArray()` helper

### Adapter After (Prompt 03)
- 0 inline `field_N` references
- Filter expressions use `resolveSpField('requestId')`, `resolveSpField('state')`
- `.select()` uses `PROJECTS_LIST_SELECT_FIELDS` derived from the field map
- All serialization/deserialization via imported `toDomain()` / `toListItem()`
- Adapter reduced from ~210 lines to ~138 lines

## Files Changed

| File | Action | Details |
|------|--------|---------|
| `backend/functions/src/services/projects-list-mapper.ts` | Created | `toDomain()`, `toListItem()`, `resolveSpField()`, `safeParseJsonArray()`, read helpers with normalization rules |
| `backend/functions/src/services/project-requests-repository.ts` | Refactored | Removed `toListItem()`, `fromListItem()`, `safeParseJsonArray()`, schema comment block, local `PROJECTS_LIST_NAME`; imports from contract/mapper |
| `backend/functions/src/services/projects-list-contract.ts` | Updated | Removed "Prompt 03 will implement" comment |

## Normalization Improvements

The new `toDomain()` function improves on the original `fromListItem()`:

| Field Type | Old Behavior | New Behavior |
|-----------|-------------|-------------|
| String-in-Number (field_20, field_21, field_22) | `String(value ?? '')` — returns `"0"` for numeric zero | `readOptionalStringFromNumber()` — filters `0` → `undefined` |
| Optional strings | Mixed `??` and `\|\|` patterns | Consistent `readOptionalString()` helper |
| Required strings | Inconsistent fallbacks | Consistent `readString()` helper |

## Acceptance Criteria Status

| Criterion | Status |
|-----------|--------|
| Full Projects list field contract findable in one place | **Met** — `projects-list-contract.ts` |
| Service-layer code no longer embeds production list schema | **Met** — 0 inline `field_N` references in adapter |
| Field-map is human-auditable and easy to update safely | **Met** — single `PROJECTS_LIST_FIELD_MAP` constant with inline docs |
