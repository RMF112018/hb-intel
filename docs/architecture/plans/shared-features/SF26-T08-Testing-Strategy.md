# SF26-T08 - Testing Strategy: Fixtures, Scenario Matrix, and Quality Gates

**Phase Reference:** Phase 3 — Workstream I (Shared Feature Infrastructure)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-26-Shared-Feature-Saved-Views.md`
**Decisions Applied:** L-01, L-02, L-03, L-04, L-05
**Estimated Effort:** 0.4 sprint-weeks
**Depends On:** SF26-T07

> **Doc Classification:** Canonical Normative Plan — SF26-T08 testing strategy task; sub-plan of `SF26-Saved-Views.md`.

---

## Objective

Define the shared test fixtures, scenario matrix, and quality gate requirements for `@hbc/saved-views`, covering view lifecycle, scope permissions, schema compatibility, reconciliation, and co-dependency surface contracts.

---

## Shared Fixtures

All fixtures live in `packages/saved-views/testing/`.

```typescript
// Exported from @hbc/saved-views/testing
export const mockPersonalView: ISavedViewDefinition = { /* personal scope, compatible schema */ };
export const mockTeamView: ISavedViewDefinition = { /* team scope */ };
export const mockRoleView: ISavedViewDefinition = { /* role scope, isDefault: true */ };
export const mockSystemView: ISavedViewDefinition = { /* system scope, admin-authored */ };
export const mockDegradedView: ISavedViewDefinition = { /* schema version behind current; columns removed */ };
export const mockIncompatibleView: ISavedViewDefinition = { /* all filter fields removed */ };
export const mockPermissionsPersonalOnly: ISavedViewScopePermissions = { /* personal write only */ };
export const mockPermissionsTeamWriter: ISavedViewScopePermissions = { /* personal + team write */ };
export const mockSchemaV1: ISavedViewSchemaDescriptor = { schemaVersion: 1, /* columns, filter fields, group fields */ };
export const mockSchemaV2: ISavedViewSchemaDescriptor = { schemaVersion: 2, /* one column removed */ };
export const mockStorageAdapter: ISavedViewsStorageAdapter = { /* in-memory implementation for tests */ };
```

---

## Core Scenario Matrix

### View Lifecycle

| Scenario | Expected Behavior |
|---|---|
| Load views for module workspace | all views for module+workspace returned, grouped by scope |
| Apply compatible view | workspace state updated; active view set; no compatibility banner |
| Apply degraded-compatible view | compatibility check runs; banner shown before apply; user confirms |
| Attempt apply incompatible view | apply blocked; incompatible message shown; no state change |
| Save current view (overwrite) | persisted view updated; active view remains |
| Save as new view | new view created; applied as active |
| Set default view | `isDefault` set; default view indicator updates |
| Delete personal view | view removed; if was active/default, state resets |
| Duplicate view | new view created with personal scope, "Copy of" title |

### Scope and Permissions

| Scenario | Expected Behavior |
|---|---|
| User with personal-only permissions opens save dialog | team/role/system scopes hidden |
| User with team-write permission saves team-scope view | view persisted with team scope; overwrite warning shown |
| User without team-write attempts team scope save | save blocked; error message shown |
| Deleting shared team view | scope-aware warning shown before delete proceeds |

### Schema Compatibility

| Scenario | Expected Behavior |
|---|---|
| Apply view with matching schema version | `compatible` result; no banner |
| Apply view with one removed column | `degraded-compatible` result; banner names removed column |
| Apply view with multiple removed filter fields | `degraded-compatible` result; banner lists all removed fields |
| Apply view where all filter fields removed | `incompatible` result; apply blocked |
| Module increments schema version | all older views trigger compatibility check on next apply |

### Co-dependency Surface

| Scenario | Expected Behavior |
|---|---|
| Export initiated with active view | `ISavedViewContext` snapshot passed to export request |
| Bulk action initiated with active view | `ISavedViewContext` snapshot passed to bulk action context |
| Active view cleared | `activeViewContext` reflects empty filter/sort/group state |

---

## Quality Gates

- coverage thresholds: `95/95/95/95` (lines/branches/functions/statements)
- all lifecycle state transitions must have unit test coverage
- all compatibility result types (`compatible`, `degraded-compatible`, `incompatible`) must have scenario coverage
- all scope permission guards must have test coverage
- `ISavedViewContext` co-dependency handoff must have unit test coverage
- `createTanStackTableMapper` serialize/deserialize round-trip must have test coverage
- `mockStorageAdapter` in-memory implementation must be usable by downstream consumer test suites

---

## Verification Commands

```bash
pnpm --filter @hbc/saved-views test --coverage
pnpm --filter @hbc/saved-views check-types
```
