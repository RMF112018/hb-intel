# SF29 - My Work Feed (`@hbc/my-work-feed`)

**Plan Version:** 1.0
**Date:** 2026-03-12
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-29-Shared-Feature-My-Work-Feed.md`
**Priority Tier:** 2 - Application Layer (shared package; cross-module personal work orchestration)
**Estimated Effort:** 5-6 sprint-weeks
**ADR Required:** `docs/architecture/adr/ADR-0114-my-work-feed.md`

> **Doc Classification:** Canonical Normative Plan - SF29 implementation master plan for My Work Feed; governs SF29-T01 through SF29-T09.

---

## Purpose

SF29 defines a shared cross-module personal work orchestration package that aggregates actionable signals across platform primitives into one normalized queue, one deterministic prioritization model, one explainability model, and several consistent disclosure surfaces.
Industry baseline framing: enterprise task systems commonly provide assigned-work views, but SF29 differentiates through deterministic dedupe/supersession, lifecycle explainability, offline continuity, and manager oversight over the same canonical work-item model.

---

## Locked Decisions

| # | Decision | Locked Choice |
|---|---|---|
| L-01 | Package ownership | `@hbc/my-work-feed` owns canonical contracts, registry, ranking, dedupe, supersession, explainability, hooks, My Work-specific surfaces, and telemetry |
| L-02 | UI-kit boundary | `@hbc/ui-kit` owns only shared, reusable, design-system-grade primitives; SF29-specific composite surfaces remain in `@hbc/my-work-feed` |
| L-03 | Source integration model | All sources enter through a registry-driven adapter pattern; no ad hoc module aggregation |
| L-04 | Priority model | Deterministic ranking based on overdue state, BIC urgency, blocked state, freshness, dependency impact, project weighting, and source weight |
| L-05 | Queue hygiene | Deduplication merges overlapping signals with traceability; supersession hides older signals but preserves diagnostics/history |
| L-06 | Explainability | Every item must answer why it surfaced, why it is ranked here, whether the user can act, and what happens next |
| L-07 | Multi-surface consistency | badge, launcher, tile, panel, feed, and team feed consume one canonical item contract and one count model |
| L-08 | Offline resilience | TanStack Query owns retrieval/freshness; `@hbc/session-state` owns connectivity, queued local actions, and replay-safe mutation persistence |
| L-09 | Inline action boundary | replay-safe micro-actions happen inline; heavy/source-owned workflows deep-link to the owning module |
| L-10 | Oversight and telemetry | personal, delegated-by-me, my-team, and escalation-candidate views are projections over one canonical model with queue-health telemetry |

---

## Package Directory Structure

```text
packages/my-work-feed/
|- package.json
|- README.md
|- tsconfig.json
|- tsconfig.build.json
|- vitest.config.ts
|- src/
|  |- index.ts
|  |- types/
|  |- constants/
|  |- registry/
|  |- normalization/
|  |- adapters/
|  |- api/
|  |- hooks/
|  |- store/
|  |- components/
|  |- telemetry/
|- testing/
```

Design-system-grade primitives remain in `@hbc/ui-kit`; SF29 consumes them rather than recreating them. Composite My Work surfaces remain package-owned unless an abstraction is clearly reusable beyond SF29.

---

## Definition of Done

- [ ] all SF29 docs use locked L-01 through L-10 and no legacy decision-ID semantics
- [ ] `packages/my-work-feed/` is defined as a first-class workspace package with runtime, components, telemetry, and testing exports
- [ ] canonical work-item contracts, registry contracts, explainability contracts, and team-view projections are documented
- [ ] deterministic ranking, dedupe, and supersession rules are documented and test-covered
- [ ] My Work-specific composite surfaces remain in-package while reusing `@hbc/ui-kit` primitives first
- [ ] offline strategy includes cached feed snapshots, last-sync state, replay-safe local mutations, and partial-source trust indicators
- [ ] personal, delegated-by-me, my-team, and escalation-candidate views are documented as projections over one canonical model
- [ ] My Work count semantics remain consistent across badge, launcher, tile, panel, and full feed
- [ ] queue-health telemetry and trust diagnostics are documented
- [ ] SF29-T09 includes ADR-0114, docs/index/state-map updates, and PH7 governance checks

---

## Task File Index

| File | Contents |
|---|---|
| `SF29-T01-Package-Scaffold.md` | package scaffold, exports, README, dependency and UI-boundary rules |
| `SF29-T02-TypeScript-Contracts.md` | canonical work-item, query, action, explainability, and team-view contracts |
| `SF29-T03-Work-Aggregation-Lifecycle.md` | registry, normalization, ranking, dedupe, supersession, and queue lifecycle |
| `SF29-T04-Hooks-and-State-Model.md` | feed hooks, query keys, partial-success handling, and replay-safe mutations |
| `SF29-T05-MyWorkPanel-and-Launcher.md` | launcher, badge, panel, planning bar, and offline banner contracts |
| `SF29-T06-MyWorkFeed-and-TeamFeed.md` | full feed, team feed, tile, reason drawer, source health, and empty state contracts |
| `SF29-T07-Source-Adapter-Integrations.md` | source adapters and Tier-1 integration boundaries |
| `SF29-T08-Testing-Strategy.md` | fixtures, scenario matrix, quality gates, Storybook and E2E coverage |
| `SF29-T09-Testing-and-Deployment.md` | closure checklist, ADR/docs/index/state-map updates, and verification commands |
