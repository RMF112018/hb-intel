# SF28-T09 - Testing and Deployment: Activity Timeline

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-28-Shared-Feature-Activity-Timeline.md`
**Decisions Applied:** All L-01 through L-10
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T01-T08

> **Doc Classification:** Canonical Normative Plan - SF28-T09 testing/deployment task; sub-plan of `SF28-Activity-Timeline.md`.

---

## Objective

Finalize SF28 with SF11-grade closure requirements: testing gates, ADR template, adoption guide, API reference, README conformance, docs/index/state-map updates, and PH7 transparency-governance evidence.

---

## 3-Line Plan

1. Complete primitive and ui-kit validations at >=95% coverage.
2. Pass architecture boundary gates for runtime, storage adapters, and reusable UI ownership.
3. Publish ADR-0114 and required docs/index/state-map updates with PH7 transparency evidence.

---

## Pre-Deployment Checklist

### Architecture & Boundary Verification

- [ ] normalization and query lifecycle remains in `@hbc/activity-timeline`
- [ ] reusable visual primitives land in `@hbc/ui-kit`
- [ ] no route-layer imports in runtime packages
- [ ] append-only evidence boundary is preserved
- [ ] boundary grep checks return zero prohibited matches
- [ ] PH7 shared-feature governance criteria explicitly satisfied

### Type Safety

- [ ] zero TypeScript errors in primitive and ui-kit surfaces
- [ ] event, attribution, provenance, and filter contracts stable end-to-end
- [ ] confidence, replay, and dedupe contracts stable
- [ ] telemetry contracts stable

### Build & Package

- [ ] primitive and ui-kit builds succeed
- [ ] runtime/testing entrypoints emitted
- [ ] testing sub-path excluded from production bundles
- [ ] exports resolve in consuming surfaces
- [ ] turbo build with dependencies succeeds

### Tests

- [ ] all tests pass
- [ ] coverage thresholds met (>=95)
- [ ] normalization tests complete
- [ ] diff summarization and suppression tests complete
- [ ] filter and grouping tests complete
- [ ] replay/pending-event reconciliation tests complete
- [ ] source-adapter and no-op seam upgrade tests complete
- [ ] end-to-end record->related->workspace timeline scenario passing

### Storage/API and Lifecycle

- [ ] SharePoint-backed append-only storage validated
- [ ] authoritative vs queued-local vs replayed vs degraded distinctions validated
- [ ] dedupe remains projection-only and non-destructive
- [ ] record, related, and workspace query projections validated
- [ ] no contradictory audit-truth messaging across surfaces

### Integration

- [ ] versioned-record integration validated
- [ ] workflow-handoff and acknowledgment integration validated
- [ ] related-items governance adapter upgrade path validated
- [ ] session-state replay boundaries validated
- [ ] project-canvas consumption validated
- [ ] notification-intelligence and query-hooks boundaries validated

### Documentation

- [ ] trust/transparency behavior documented and verified
- [ ] filter/diff/replay behavior documented and verified
- [ ] adapter/emitter semantics documented and verified
- [ ] telemetry usefulness confirmed for troubleshooting and audit navigation
- [ ] `docs/architecture/adr/ADR-0114-activity-timeline.md` written and accepted
- [ ] companion `@hbc/activity-timeline` ADR documented and linked
- [ ] `docs/how-to/developer/activity-timeline-adoption-guide.md` written
- [ ] `docs/reference/activity-timeline/api.md` written
- [ ] primitive and ui-kit README conformance verified
- [ ] `docs/README.md` ADR index updated with ADR-0114 entries
- [ ] `current-state-map.md §2` updated with SF28 and ADR-0114 linkage

---

## ADR-0114: Activity Timeline

**File:** `docs/architecture/adr/ADR-0114-activity-timeline.md`

Must document:

- shared activity-timeline boundary and projection rules
- append-only evidence model and narrative-projection model
- actor attribution and system-vs-user transparency contract
- SharePoint MVP storage strategy and Azure future seam
- replay, dedupe, and queued-local event semantics
- current and future adapter boundaries across versioned-record, workflow-handoff, acknowledgment, related-items, export, and publish
- telemetry contract and transparency KPIs
- UI ownership alignment with `@hbc/ui-kit`

---

## Final Verification Commands

```bash
pnpm turbo run build --filter @hbc/activity-timeline... --filter @hbc/ui-kit...
pnpm turbo run lint --filter @hbc/activity-timeline... --filter @hbc/ui-kit...
pnpm --filter @hbc/activity-timeline check-types
pnpm --filter @hbc/activity-timeline test --coverage
pnpm --filter @hbc/ui-kit test --coverage
rg -n "L-01|L-02|L-03|L-04|L-05|L-06|L-07|L-08|L-09|L-10|@hbc/activity-timeline|ADR-0114|queued local event|event confidence" docs/architecture/plans/shared-features/SF28*.md
```
