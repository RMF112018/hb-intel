# SF26-T09 - Testing and Deployment: Closure Checklist, ADR, and State Map Updates

**Phase Reference:** Phase 3 — Workstream I (Shared Feature Infrastructure)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-26-Shared-Feature-Saved-Views.md`
**Decisions Applied:** L-01, L-02, L-03, L-04, L-05, L-06
**Estimated Effort:** 0.3 sprint-weeks
**Depends On:** SF26-T08

> **Doc Classification:** Canonical Normative Plan — SF26-T09 closure task; sub-plan of `SF26-Saved-Views.md`.

---

## Objective

Define the closure checklist, required documentation updates, and final verification commands to confirm SF26 is complete and integrated correctly into Phase 3.

---

## Closure Checklist

### Package Completeness

- [ ] `packages/saved-views/` scaffold is complete with all required directories and entrypoints
- [ ] all canonical TypeScript contracts from SF26-T02 are exported from `src/index.ts`
- [ ] `ISavedViewStateMapper<TState>` module adapter interface is published and type-safe
- [ ] `ISavedViewContext` co-dependency handoff type is exported
- [ ] SharePoint storage adapter is implemented and tested
- [ ] Azure migration seam is stubbed with interface-only implementation
- [ ] `testing/index.ts` exports all required fixtures for downstream consumer test suites

### Scope and Compatibility

- [ ] personal/team/role/system scope ownership and permission checks are implemented
- [ ] compatibility reconciliation (`compatible`, `degraded-compatible`, `incompatible`) is fully implemented
- [ ] user-facing explanation strings for degraded and incompatible views are implemented
- [ ] schema version tracking and per-field removal detection are implemented

### Hooks

- [ ] `useSavedViews` lifecycle hook is implemented with all lifecycle actions
- [ ] `useViewCompatibility` hook is implemented with confirmation gate for degraded views
- [ ] `useWorkspaceStateMapper` adapter composition hook is implemented

### UI Kit Components

- [ ] `SavedViewPicker` is implemented in `@hbc/ui-kit` with scope grouping and unsaved-changes indicator
- [ ] `SavedViewChip` is implemented in `@hbc/ui-kit` with active view display and picker trigger
- [ ] `SaveViewDialog` is implemented in `@hbc/ui-kit` for all four modes (save, save-as-new, rename, duplicate)
- [ ] `SavedViewScopeBadge` is implemented in `@hbc/ui-kit`
- [ ] `DefaultViewToggle` is implemented in `@hbc/ui-kit`
- [ ] `ViewCompatibilityBanner` is implemented in `@hbc/ui-kit` with specific field removal list

### Integrations

- [ ] `createTanStackTableMapper` is implemented and round-trip tested
- [ ] `ISavedViewContext` handoff contract is tested for export and bulk-actions consumers
- [ ] complexity-level default view selection is implemented
- [ ] auth capability checks for scope permission resolution are implemented

### Testing and Verification

- [ ] all SF26-T08 scenario matrix cases have passing tests
- [ ] coverage thresholds pass at `95/95/95/95`
- [ ] all SF26-T07 integration boundaries have type-safe contracts

---

## Required Documentation Updates

### ADR

Create `docs/architecture/adr/ADR-0116-saved-views.md` documenting:
- the decision to implement a normalized workspace-state contract as a shared package
- the boundary between saved-view persistence and grid implementation
- the personal/team/role/system scope ownership model
- the `ISavedViewContext` handoff surface for export and bulk-actions co-dependency
- the decision to defer Azure persistence in favor of SharePoint MVP

### `current-state-map.md`

Add `@hbc/saved-views` to the shared packages inventory with:
- status: implemented (Phase 3)
- dependencies: `@hbc/auth`, `@hbc/ui-kit`, `@hbc/complexity`
- consumers: all Phase 3 modules with data grid or queue surfaces
- ADR reference: ADR-0116

### Package Index

Add `@hbc/saved-views` entry to the workspace package index if one exists.

### SF26 Master Plan Footer

Update SF26-Saved-Views.md footer to reflect closure date when all items above are confirmed.

---

## PH7 Governance Checks

- [ ] no reusable visual component is defined inside `packages/saved-views/` (all belong in `@hbc/ui-kit`)
- [ ] `@hbc/saved-views` does not take a runtime dependency on `@hbc/export-runtime` or `@hbc/bulk-actions`
- [ ] module adapters implement `ISavedViewStateMapper<TState>` and do not bypass the module adapter contract
- [ ] shared view scopes do not silently modify other users' views without explicit user action
- [ ] schema compatibility handling never silently discards view evidence — all removals must be surfaced to the user

---

## Final Verification Commands

```bash
pnpm --filter @hbc/saved-views check-types
pnpm --filter @hbc/saved-views build
pnpm --filter @hbc/saved-views test --coverage
pnpm --filter @hbc/ui-kit check-types
pnpm --filter @hbc/ui-kit test --coverage
pnpm --filter @hbc/export-runtime check-types
pnpm --filter @hbc/bulk-actions check-types
```
