# SF18-T09 - Testing and Deployment: Estimating Bid Readiness Adapter

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-18-Module-Feature-Estimating-Bid-Readiness.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.55 sprint-weeks
**Depends On:** T01-T08

> **Doc Classification:** Canonical Normative Plan - SF18-T09 testing/deployment task; sub-plan of `SF18-Estimating-Bid-Readiness.md`.

---

## Objective

Finalize SF18 as a production-ready Estimating adapter over `@hbc/health-indicator`, with closure evidence for integrations, offline resilience, provenance governance, and KPI telemetry.

---

## 3-Line Plan

1. Complete adapter model/hook/component/integration verification at >=95% coverage.
2. Pass mechanical enforcement gates, boundary checks, and offline replay checks.
3. Publish ADR/doc/index/state-map updates for SF18 and companion primitive governance.

---

## Pre-Deployment Checklist

### Architecture and Boundaries
- [x] SF18 runtime remains adapter-only inside `@hbc/features-estimating`
- [x] canonical readiness computation remains in `@hbc/health-indicator`
- [x] no direct app-route imports in package runtime
- [x] all integrations use public Tier-1 package contracts

### Type Safety and Contracts
- [x] zero TypeScript errors
- [x] `IHealthIndicator*` contracts are canonical in docs and adapter types
- [x] compatibility aliases are marked adapter-only and non-canonical
- [x] version metadata is carried through all write paths

### Offline and Resilience
- [x] service worker caching strategy coverage verified
- [x] IndexedDB persistence via `@hbc/versioned-record` verified
- [x] Background Sync replay validated with idempotency assertions
- [x] optimistic indicators (`Saved locally`, `Queued to sync`) verified

### Integrations
- [x] blockers-first BIC ownership and avatar projection validated
- [x] related-items deep-links validated
- [x] project-canvas My Work placement validated
- [x] notification urgency path for `<48h + blockers` validated
- [x] acknowledgment/sharepoint-docs criteria integrations validated

### Telemetry and Governance
- [x] five KPI events emitted and queryable in telemetry consumers
- [x] admin governance surfaces show provenance/version history
- [x] snapshot freeze behavior validated for submission flow

### Documentation
- [x] `docs/architecture/adr/ADR-0107-estimating-bid-readiness-signal.md` updated for adapter-over-primitive model
- [x] companion `@hbc/health-indicator` ADR documented and linked
- [x] API reference reflects `IHealthIndicator*` canonical contracts
- [x] `docs/README.md` and `current-state-map.md` updated with final links

---

## ADR-0107 Update Requirements

`ADR-0107` must explicitly state:

- SF18 is an Estimating adapter, not a standalone readiness engine
- decision lock on `@hbc/health-indicator` primitive abstraction
- blockers-first BIC ownership, complexity behavior, offline strategy, inline AI controls, and KPI telemetry
- dependency and governance alignment with PH7 shared-feature rule

---

## API Reference Requirements

API docs must include:

- canonical primitive contracts referenced by name (`IHealthIndicatorCriterion`, `IHealthIndicatorState`, `IHealthIndicatorProfile`, `IHealthIndicatorTelemetry`)
- adapter-level types (`IBidReadinessViewState`, profile defaults, telemetry mapping)
- hook exports and testing fixtures
- integration contracts for related-items/project-canvas/versioned-record

---

## Final Verification Commands

```bash
pnpm turbo run build --filter @hbc/features-estimating...
pnpm turbo run lint --filter @hbc/features-estimating...
pnpm --filter @hbc/features-estimating check-types
pnpm --filter @hbc/features-estimating test --coverage

rg -n "legacy|IBidReadiness|ready-to-bid" docs/architecture/plans/shared-features/SF18*.md
rg -n "@hbc/health-indicator|@hbc/versioned-record|@hbc/project-canvas|@hbc/related-items|Saved locally|Queued to sync" docs/architecture/plans/shared-features/SF18*.md
```

---

## Blueprint Progress Comment

Append to `SF18-Estimating-Bid-Readiness.md` after all gates pass:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
SF18 completed: {DATE}
T01-T09 implemented.
Adapter-over-primitive boundary verified (`@hbc/features-estimating` -> `@hbc/health-indicator`).
Offline replay and optimistic indicators verified.
KPI telemetry validated for all five required metrics.
ADR-0107 updated and companion health-indicator ADR linked.
Documentation/index/state-map updates completed.
-->
```

---

## Implementation Progress

### 2026-03-12 - SF18-T09 completed

<!-- IMPLEMENTATION PROGRESS & NOTES
SF18-T09 completed: 2026-03-12
- Added deterministic release-hardening scripts in `@hbc/features-estimating`:
  - `verify:boundaries`
  - `verify:docs`
  - `test:storybook:ci`
  - `test:playwright:smoke`
  - `verify:release`
- Added package-level Playwright smoke configuration and smoke scenarios targeting runnable Storybook bid-readiness states.
- Added ADR closure artifacts:
  - `ADR-0107-estimating-bid-readiness-signal.md`
  - `ADR-0111-health-indicator-readiness-primitive-runtime.md` (companion primitive ADR)
- Added SF18 API/adoption documentation:
  - `docs/reference/estimating/api.md`
  - `docs/how-to/developer/estimating-bid-readiness-adoption-guide.md`
- Updated ADR indexes and current-state map to reflect authored ADR-0107/ADR-0111 and SF18 completion status.
- Final T09 verification gates executed with zero errors, including type-check, lint, build, coverage test, boundary/doc checks, Storybook CI validation, and Playwright smoke.
-->
