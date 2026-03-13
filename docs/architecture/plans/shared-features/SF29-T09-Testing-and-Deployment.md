# SF29-T09 - Testing and Deployment: My Work Feed

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-29-Shared-Feature-My-Work-Feed.md`
**Decisions Applied:** L-01 through L-10
**Estimated Effort:** 0.85 sprint-weeks
**Depends On:** T01-T08

> **Doc Classification:** Canonical Normative Plan - SF29-T09 testing/deployment task; sub-plan of `SF29-My-Work-Feed.md`.

---

## Objective

Finalize SF29 with closure requirements covering testing gates, ADR-0114, adoption/reference docs, boundary enforcement, index/state-map updates, and PH7 governance evidence.

---

## 3-Line Plan

1. Complete runtime, surface, and offline validations at >=95% coverage.
2. Pass architecture boundary and consistency enforcement across all My Work surfaces.
3. Publish ADR-0114 and required docs/index/state-map updates with verification evidence.

---

## Pre-Deployment Checklist

### Architecture and Boundary Verification

- [ ] canonical runtime remains in `@hbc/my-work-feed`
- [ ] My Work-specific composite surfaces remain package-owned
- [ ] reusable primitives are consumed from `@hbc/ui-kit` first
- [ ] no route-layer imports exist inside `packages/my-work-feed/src`
- [ ] no duplicate count logic exists outside canonical hooks/selectors
- [ ] PH7 shared-feature governance criteria explicitly satisfied

### Type Safety and Build

- [ ] zero TypeScript errors in `@hbc/my-work-feed`
- [ ] runtime and testing entrypoints resolve correctly
- [ ] public barrels export only intended contracts and surfaces
- [ ] testing sub-path is excluded from production bundles

### Tests

- [ ] all tests pass
- [ ] coverage thresholds met (>=95)
- [ ] ranking, dedupe, supersession, and explainability tests complete
- [ ] offline cached-feed and replay tests complete
- [ ] panel, tile, feed, and team-feed parity tests complete
- [ ] end-to-end urgent-item consistency and inline-action scenarios passing

### Integration and Trust

- [ ] BIC, handoff, acknowledgment, notification, and draft-resume adapters validated
- [ ] shell launcher/panel integration validated
- [ ] project-canvas tile integration validated
- [ ] related-items deep-link integration validated
- [ ] partial-source diagnostics and queue-health indicators validated
- [ ] telemetry metrics validated for time-to-first-action, queue age, suppressed duplicate rate, stale-item detection, and inline-action completion rate

### Documentation

- [ ] `docs/architecture/adr/ADR-0114-my-work-feed.md` written and accepted
- [ ] `docs/how-to/developer/my-work-feed-adoption-guide.md` written
- [ ] `docs/reference/my-work-feed/api.md` written
- [ ] `docs/README.md` updated with ADR-0114 entries
- [ ] `current-state-map.md §2` updated with SF29 and ADR-0114 linkage
- [ ] blueprint and foundation plan receive comment-only progress updates if implementation proceeds

---

## ADR-0114: My Work Feed

**File:** `docs/architecture/adr/ADR-0114-my-work-feed.md`

Must document:

- elevation of My Work from earlier hook-level concept to dedicated shared package
- registry-driven multi-source aggregation architecture
- deterministic ranking, dedupe, and supersession model
- explanation contract for why-here, why-ranked, can/can't-act, and what-next
- offline-safe feed strategy using TanStack Query persistence plus `@hbc/session-state`
- boundary rule that design-system-grade primitives stay in `@hbc/ui-kit` while My Work-specific composite surfaces remain in-package
- manager/delegation projections over one canonical item model

---

## Final Verification Commands

```bash
pnpm turbo run build --filter @hbc/my-work-feed...
pnpm turbo run lint --filter @hbc/my-work-feed...
pnpm --filter @hbc/my-work-feed check-types
pnpm --filter @hbc/my-work-feed test --coverage
rg -n "L-01|L-02|L-03|L-04|L-05|L-06|L-07|L-08|L-09|L-10|ADR-0114|@hbc/my-work-feed|@hbc/ui-kit" docs/architecture/plans/shared-features/SF29*.md
```
