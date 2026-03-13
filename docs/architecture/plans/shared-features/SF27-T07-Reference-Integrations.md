# SF27-T07 - Reference Integrations: Bulk Actions

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-27-Shared-Feature-Bulk-Actions.md`
**Decisions Applied:** L-01 through L-10
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T03-T06

> **Doc Classification:** Canonical Normative Plan - SF27-T07 integration task; sub-plan of `SF27-Bulk-Actions.md`.

---

## Objective

Document boundary-safe selection-source patterns and current/future integration seams across `@hbc/bulk-actions`, shared platform primitives, and current table/list surfaces.

---

## Current Integration Contracts

- `@hbc/ui-kit`
  - reusable bulk-action surfaces and current selection-source seams via `HbcDataTable` and `ListLayout`
- `@hbc/auth`
  - permission gating and elevated-action visibility
- `@hbc/bic-next-move`
  - ownership and reassignment-oriented bulk action definitions
- `@hbc/notification-intelligence`
  - optional downstream notifications from completed bulk actions
- `@hbc/query-hooks`
  - shared query refresh/invalidation seams after batch completion
- `@hbc/data-access`
  - repository and mutation adapter boundaries for per-item and chunk execution
- `@hbc/session-state`
  - queued operation continuity and future offline-safe batch semantics where supported
- `@hbc/project-canvas`
  - queue/tile host surface expectations for bulk-enabled list views

---

## Current Selection-Source Seams

- `HbcDataTable`
  - primary table selection source via controlled `rowSelection`
- `ListLayout`
  - current reusable bulk-bar host seam to be upgraded, not replaced
- `savedViewsConfig` in `HbcDataTable`
  - current saved-view proxy seam only; do not require `@hbc/saved-views` for MVP delivery

---

## Future Seams Only

The following are documented as future integration seams and must not be MVP dependencies:

- `@hbc/saved-views`
- `@hbc/publish-workflow`
- `@hbc/activity-timeline`

They are planned in repo documentation but are not current package truth under `current-state-map.md`.

---

## Boundary Rules

- adapters do not re-implement selection scope logic, eligibility aggregation, execution chunking, or result grouping
- action definitions may be consumer-owned, but execution semantics remain primitive-owned
- future audit/event emission contracts may be reserved now, but not required for initial package delivery
- modules must not assume “all filtered” support without explicit primitive scope escalation

---

## Verification Commands

```bash
pnpm --filter @hbc/bulk-actions check-types
pnpm --filter @hbc/bulk-actions test -- integrations
rg -n "bulkActions|rowSelection|savedViewsConfig" packages/ui-kit
```
