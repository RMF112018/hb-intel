# Prompt 02 Summary — Canonical Data Contract and Types

> Completed: 2026-03-30

## Design Decision: Why This Shape

The data contract separates concerns into three layers:

1. **Domain model** (`IProjectSetupRequest` in `@hbc/models`) — unchanged, consumed by 200+ files across frontend, backend, and packages. This is the canonical business type.

2. **Persistence DTO** (`IProjectsListItem` in `backend/functions/src/services/projects-list-contract.ts`) — represents the exact SharePoint Projects list schema with `field_N` internal names. Only the backend persistence layer touches this type.

3. **Field map** (`PROJECTS_LIST_FIELD_MAP` in same file) — a single constant linking domain property names to SP internal names, types, and serialization categories. This is the authoritative mapping that Prompt 03 will use to build centralized serialization/deserialization functions.

### Why not merge DTO into `@hbc/models`?

SharePoint internal field names (`field_1`, `field_2`, etc.) are storage implementation details. Exposing them in the shared models package would leak persistence concerns into the domain layer. The DTO stays in the backend where it belongs.

### Why a field map constant instead of just type annotations?

The field map is data, not just types. It can be iterated at runtime to build `.select()` field lists, generate mapping functions, and validate schema coverage in tests. A type-only approach would require duplicating the field knowledge in every function.

## Artifacts Created

| File | Purpose |
|------|---------|
| `backend/functions/src/services/projects-list-contract.ts` | `IProjectsListItem` DTO, `PROJECTS_LIST_FIELD_MAP`, `PROJECTS_LIST_NAME`, `PROJECTS_LIST_SELECT_FIELDS` |
| `phase-2/Phase-2_Normalization-Rules.md` | Type conversion rules for each field category (strings, numbers, JSON arrays, dates, string-in-number columns, URLs, enums) |
| `phase-2/Phase-2_Prompt-02-Summary.md` | This design note |

## What Prompt 03 Will Do

Using the types and field map defined here, Prompt 03 will:
- Implement `toDomain(item: IProjectsListItem): IProjectSetupRequest` (replaces `fromListItem`)
- Implement `toListItem(request: IProjectSetupRequest): IProjectsListItem` (replaces current `toListItem`)
- Derive `.select()` fields from `PROJECTS_LIST_SELECT_FIELDS`
- Remove ad hoc `field_N` references from `project-requests-repository.ts`

## Acceptance Criteria Status

| Criterion | Status |
|-----------|--------|
| Domain logic no longer needs to know SP internal field names | **Met** — `PROJECTS_LIST_FIELD_MAP` encapsulates field name knowledge; domain code uses `IProjectSetupRequest` properties |
| SP persistence logic no longer masquerades as domain model | **Met** — `IProjectsListItem` is a separate type with SP-native field names |
| Contract is explicit, typed, and maintainable | **Met** — field map is a typed constant with `satisfies` check, serialization categories, and derived select-field list |
