# SF22-T09 - Testing and Deployment: Post-Bid Learning Loop

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop.md`
**Decisions Applied:** All L-01 through L-06
**Estimated Effort:** 0.7 sprint-weeks
**Depends On:** T01-T08

> **Doc Classification:** Canonical Normative Plan - SF22-T09 testing/deployment task; sub-plan of `SF22-Post-Bid-Learning-Loop.md`.

---

## Objective

Finalize SF22 with SF11-grade closure requirements: testing gates, ADR template, adoption guide, API reference, README conformance, ADR index updates, blueprint progress comment, and `current-state-map` governance updates.

---

## 3-Line Plan

1. Complete primitive and adapter validations at >=95% coverage.
2. Pass mechanical enforcement and architecture boundary gates.
3. Publish ADR-0111 and required docs/index/state-map updates with PH7 governance evidence.

---

## Pre-Deployment Checklist (30 items)

### Architecture & Boundary Verification
- [ ] lifecycle engine remains in `@hbc/post-bid-autopsy`
- [ ] BD/Estimating packages remain projection adapters only
- [ ] no route-layer imports in runtime packages
- [ ] app-shell-safe component surfaces validated
- [ ] boundary grep checks return zero prohibited matches
- [ ] PH7 shared-feature governance criteria explicitly satisfied

### Type Safety
- [ ] zero TypeScript errors in primitive and adapters
- [ ] autopsy section contracts stable end-to-end
- [ ] queue/sync/provenance contracts stable
- [ ] telemetry contracts stable

### Build & Package
- [ ] primitive and adapter builds succeed
- [ ] runtime/testing entrypoints emitted
- [ ] testing sub-path excluded from production bundles
- [ ] exports resolve in consuming surfaces
- [ ] turbo build with dependencies succeeds

### Tests
- [ ] all tests pass
- [ ] coverage thresholds met (>=95)
- [ ] trigger/assignment/escalation tests complete
- [ ] offline replay tests complete
- [ ] wizard/summary/list/dashboard tests complete
- [ ] end-to-end outcome->autopsy->seeding->benchmark update scenario passing

### Storage/API and Lifecycle
- [ ] trigger persistence validated for Won/Lost/No-Bid
- [ ] 5-day SLA and escalation behavior validated
- [ ] immutable snapshot freeze and version history validated
- [ ] approved-only downstream publish paths validated

### Integration
- [ ] BIC ownership + My Work projection validated
- [ ] notification trigger/escalation routing validated
- [ ] strategic-intelligence seeding conversion validated
- [ ] score-benchmark update signaling validated
- [ ] related-items deep-link and step-wizard integration validated
- [ ] health-indicator semantics alignment validated

### Documentation
- [ ] `docs/architecture/adr/ADR-0111-post-bid-learning-loop.md` written and accepted
- [ ] companion `@hbc/post-bid-autopsy` ADR documented and linked
- [ ] `docs/how-to/developer/post-bid-learning-loop-adoption-guide.md` written
- [ ] `docs/reference/post-bid-learning-loop/api.md` written
- [ ] primitive and adapter README conformance verified
- [ ] `docs/README.md` ADR index updated with ADR-0111 entries
- [ ] `current-state-map.md §2` updated with SF22 and ADR-0111 linkage

---

## ADR-0111: Post-Bid Learning Loop

**File:** `docs/architecture/adr/ADR-0111-post-bid-learning-loop.md`

Must document:
- autopsy trigger mechanism and SLA escalation
- 5-section structure and complexity-adaptive disclosure
- benchmark dataset update strategy
- intelligence seeding conversion strategy
- per-section BIC integration and ownership projection
- offline replay, provenance/snapshot, and AI approval guardrails

---

## Final Verification Commands

```bash
pnpm turbo run build --filter @hbc/post-bid-autopsy... --filter @hbc/features-business-development... --filter @hbc/features-estimating...
pnpm turbo run lint --filter @hbc/post-bid-autopsy... --filter @hbc/features-business-development... --filter @hbc/features-estimating...
pnpm --filter @hbc/post-bid-autopsy check-types
pnpm --filter @hbc/post-bid-autopsy test --coverage
pnpm --filter @hbc/features-business-development test --coverage
pnpm --filter @hbc/features-estimating test --coverage
rg -n "L-01|L-02|L-03|L-04|L-05|L-06|@hbc/post-bid-autopsy" docs/architecture/plans/shared-features/SF22*.md
```
