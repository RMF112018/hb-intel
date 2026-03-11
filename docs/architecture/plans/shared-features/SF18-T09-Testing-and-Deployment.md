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
- [ ] SF18 runtime remains adapter-only inside `@hbc/features-estimating`
- [ ] canonical readiness computation remains in `@hbc/health-indicator`
- [ ] no direct app-route imports in package runtime
- [ ] all integrations use public Tier-1 package contracts

### Type Safety and Contracts
- [ ] zero TypeScript errors
- [ ] `IHealthIndicator*` contracts are canonical in docs and adapter types
- [ ] compatibility aliases are marked adapter-only and non-canonical
- [ ] version metadata is carried through all write paths

### Offline and Resilience
- [ ] service worker caching strategy coverage verified
- [ ] IndexedDB persistence via `@hbc/versioned-record` verified
- [ ] Background Sync replay validated with idempotency assertions
- [ ] optimistic indicators (`Saved locally`, `Queued to sync`) verified

### Integrations
- [ ] blockers-first BIC ownership and avatar projection validated
- [ ] related-items deep-links validated
- [ ] project-canvas My Work placement validated
- [ ] notification urgency path for `<48h + blockers` validated
- [ ] acknowledgment/sharepoint-docs criteria integrations validated

### Telemetry and Governance
- [ ] five KPI events emitted and queryable in telemetry consumers
- [ ] admin governance surfaces show provenance/version history
- [ ] snapshot freeze behavior validated for submission flow

### Documentation
- [ ] `docs/architecture/adr/ADR-0107-estimating-bid-readiness-signal.md` updated for adapter-over-primitive model
- [ ] companion `@hbc/health-indicator` ADR documented and linked
- [ ] API reference reflects `IHealthIndicator*` canonical contracts
- [ ] `docs/README.md` and `current-state-map.md` updated with final links

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
