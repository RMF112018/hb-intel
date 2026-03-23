# SF26 - Saved Views (`@hbc/saved-views`)

**Plan Version:** 1.0
**Date:** 2026-03-23
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-26-Shared-Feature-Saved-Views.md`
**Priority Tier:** 2 — Application Layer (shared package; cross-module view-state management)
**Estimated Effort:** 3–4 sprint-weeks
**ADR Required:** `docs/architecture/adr/ADR-0116-saved-views.md`

> **Doc Classification:** Canonical Normative Plan — SF26 implementation master plan for Saved Views; governs SF26-T01 through SF26-T09.

---

## Purpose

SF26 defines a shared workspace-state persistence layer that standardizes saved view contracts, scope ownership, schema reconciliation, state serialization, and view lifecycle (save, apply, default, share, delete) across HB Intel data grids and queue surfaces.
Industry baseline framing: enterprise platforms commonly offer column and filter preferences, but SF26 remains differentiated by normalized cross-module view contracts, governed team/role/system scope sharing, explicit schema compatibility handling, and first-class integration with export and bulk-action surfaces.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|---|---|
| L-01 | Storage strategy | Normalized view-state contracts owned by `@hbc/saved-views`; MVP persistence is SharePoint-backed; future Azure persistence path is a compatibility seam, not an MVP dependency |
| L-02 | Scope model | Four scopes — `personal`, `team`, `role`, `system` — with ownership and permission checks governing write/share access at each scope boundary |
| L-03 | Schema reconciliation | Schema compatibility is first-class; missing columns, invalid filter fields, and incompatible groupings reconcile gracefully with user-visible explanation via `ViewCompatibilityBanner` |
| L-04 | Module adapter contract | Modules implement `ISavedViewStateMapper<TState>` to own serialization and deserialization; `@hbc/saved-views` owns persistence, scope enforcement, and lifecycle; modules own schema identity |
| L-05 | Cross-feature co-dependency | Active saved view state feeds SF-27 bulk action selection scope and SF-24 export context; SF-26 and SF-27 are scaffolded together to establish the shared view-state handoff contract |
| L-06 | UI ownership alignment | `SavedViewPicker`, `SaveViewDialog`, `SavedViewScopeBadge`, `DefaultViewToggle`, and `ViewCompatibilityBanner` are reusable visual surfaces and belong in `@hbc/ui-kit`; `@hbc/saved-views` owns runtime, state, hooks, adapters, and thin composition shells only |

---

## Architectural Enhancement Status

This plan family aligns SF26 to the same PH7 mold-breaker standards established for trust, transparency, and cross-module coherence.

- workspace state persistence is now explicit: saved, applied, default, degraded, incompatible, and pending-reconciliation view states must explain themselves to the user
- schema evolution is first-class: modules may add, rename, or remove columns without silently breaking saved views; compatibility metadata and graceful reconciliation are required, not optional
- scope sharing is intentional: personal views do not leak to team or role scope without an explicit user action; sharing must be clear, reversible, and permission-gated
- co-dependency surface with bulk actions and export runtime is documented as a first-class integration contract rather than ad hoc coupling
- reusable visual component ownership is realigned to `@hbc/ui-kit` per `CLAUDE.md` while preserving `@hbc/saved-views` as the persistence and orchestration owner

---

## View State and Compatibility Expectations

The SF26 family must use a shared vocabulary across all tasks:

- `active-view`
- `default-view`
- `personal-view`
- `shared-view`
- `system-view`
- `compatible`
- `degraded-compatible`
- `incompatible`
- `reconciled`
- `schema-version`
- `view-owner`

The package must make it clear to the user:

- which view is currently active and who owns it
- whether a saved view is fully compatible with the current module schema
- what changed since the view was saved (missing columns, removed filter fields, deprecated groupings)
- whether a reconciled view was automatically adjusted and what was dropped
- whether the user has permission to save to team, role, or system scope
- whether a shared view has been modified by the user and whether saving will affect others

Users must not be forced to infer view compatibility from generic "view may be outdated" copy.

---

## View Scope Differentiation

SF26 must distinguish supported scope behaviors rather than relying on generic "saved view" wording.

- personal views
  - visible only to the current user; full lifecycle control; no permission gate for create/edit/delete
- team views
  - shared with a configured team or department; requires team-scope write permission to publish or modify
- role views
  - provided to everyone in a role; requires role-scope write permission; acts as a suggested default
- system views
  - admin- or module-defined defaults; read-only for most users; governs initial workspace state when no personal or role default exists

---

## UI Ownership Alignment

`@hbc/saved-views` owns persistence contracts, scope enforcement, compatibility logic, serialization hooks, storage adapters, and lifecycle state interpretation.
Reusable visual primitives and reusable presentational surfaces belong in `@hbc/ui-kit` per the active UI Ownership Rule in `CLAUDE.md`.
Feature and shared packages may provide thin composition shells only when they do not introduce a new reusable visual primitive.

SF26 task docs must therefore:

- reuse `@hbc/ui-kit` primitives first
- treat `SavedViewPicker`, `SaveViewDialog`, `SavedViewScopeBadge`, `DefaultViewToggle`, and `ViewCompatibilityBanner` as reusable surfaces owned by `@hbc/ui-kit`
- factor any reusable visual abstraction into `@hbc/ui-kit` instead of re-creating it locally in `@hbc/saved-views`

---

## Package Directory Structure

```text
packages/saved-views/
|- package.json
|- README.md
|- tsconfig.json
|- vitest.config.ts
|- src/
|  |- index.ts
|  |- types/
|  |- model/
|  |- storage/
|  |- hooks/
|  |- adapters/
|  |- telemetry/
|- testing/

packages/ui-kit/src/
|- SavedViewPicker/
|- SaveViewDialog/
|- SavedViewScopeBadge/
|- DefaultViewToggle/
|- ViewCompatibilityBanner/
```

The runtime remains persistence-first; any reusable visual expansion triggered by SF26 belongs in `@hbc/ui-kit`.

---

## Phase 3 Integration

**Phase 3 Stage:** Stage 5 — Shared Feature Infrastructure Completion (Stage 5.4)
**Phase 3 Workstream:** Workstream I — Shared Feature Infrastructure
**Governing Plan:** `docs/architecture/plans/MASTER/phase-3-deliverables/README.md`

SF26 is incorporated into Phase 3 as Workstream I item 5.4. Phase 3 module implementations depend on `@hbc/saved-views` for grid and queue workspace state across Financial, Schedule, Constraints, Permits, Safety, Reports, Project Closeout, Project Startup, and Subcontract Compliance. SF26 must be scaffolded before SF27 (Bulk Actions, Stage 5.6) begins, as the two share the `ISavedViewContext` view-state handoff contract. SF24 (Export Runtime, Stage 5.2) is scaffolded before SF26 to allow the export integration seam to be established during Stage 5.4. See P3-E1 §13 for per-module integration contracts.

---

## Definition of Done

- [ ] SF26 is documented as a shared workspace-state persistence layer over `@hbc/saved-views`
- [ ] all L-01 through L-06 decisions are represented in plan-family documents
- [ ] view state, compatibility, and scope semantics are explicit across T02–T06
- [ ] personal, team, role, and system scope behaviors are documented with ownership and permission rules
- [ ] `compatible`, `degraded-compatible`, `incompatible`, and `reconciled` states are documented with user-facing explainability expectations
- [ ] `ISavedViewStateMapper<TState>` module adapter contract is documented and type-safe
- [ ] schema compatibility/reconciliation logic and `ViewCompatibilityBanner` expectations are documented
- [ ] SharePoint-backed MVP persistence and future Azure migration seam are documented
- [ ] co-dependency contracts with SF-24 export and SF-27 bulk actions are documented
- [ ] five SF26 telemetry KPIs are documented with operational value emphasis
- [ ] SF26-T09 includes compatibility/scope/state closure criteria and PH7 governance checks
- [ ] `current-state-map.md` update requirements include SF26 and ADR-0116 linkage

---

## Task File Index

| File | Contents |
|---|---|
| `SF26-T01-Package-Scaffold.md` | package scaffold, runtime/persistence seams, ui-kit ownership boundary, and README requirements |
| `SF26-T02-TypeScript-Contracts.md` | canonical view contracts, scope model, compatibility metadata, mapper interface, and co-dependency surface types |
| `SF26-T03-View-State-and-Storage.md` | view lifecycle, SharePoint MVP persistence, schema versioning, reconciliation logic, and migration seam |
| `SF26-T04-Hooks-and-State-Model.md` | `useSavedViews`, `useViewCompatibility`, and `useWorkspaceStateMapper` — load/apply/save/default/delete/scope orchestration |
| `SF26-T05-SavedViewPicker-and-SavedViewChip.md` | view picker and chip rendering contracts, scope grouping, active indicator, quick-save action, and command bar placement |
| `SF26-T06-SaveViewDialog-and-ScopeSelector.md` | save/rename/duplicate/share dialog behavior, scope selection, replace-vs-new, default toggle, and sharing intent clarity |
| `SF26-T07-Reference-Integrations.md` | export-runtime and bulk-actions handoff contracts, complexity-driven defaults, auth scope checks, and tanstack-table mapper |
| `SF26-T08-Testing-Strategy.md` | fixtures, scope/compatibility/reconciliation scenario matrix, and quality gates |
| `SF26-T09-Testing-and-Deployment.md` | closure checklist, ADR/docs/index/state-map updates, and compatibility/scope/mapper verification commands |

---

*Last Updated: 2026-03-23 — Initial plan creation; SF26 incorporated into Phase 3 Workstream I Stage 5.3*
