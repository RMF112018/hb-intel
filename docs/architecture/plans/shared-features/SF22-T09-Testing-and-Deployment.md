# SF22-T09 - Testing and Deployment: Post-Bid Learning Loop

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop_UPDATED.md` (required canonical target; currently missing) and `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop.md` (interim baseline)
**Decisions Applied:** All L-01 through L-14
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T01-T08

> **Doc Classification:** Canonical Normative Plan - SF22-T09 testing/deployment task; sub-plan of `SF22-Post-Bid-Learning-Loop.md`.

---

## Objective

Finalize SF22 with closure gates for reliability, lifecycle governance, publication controls, flywheel outcomes, and documentation/index/state-map consistency.

---

## 3-Line Plan

1. Complete primitive and adapter validations at >=95% coverage across reliability/governance/flywheel scenarios.
2. Pass mechanical enforcement and architecture boundary gates.
3. Publish ADR-0112 and required docs/index/state-map updates with PH7 governance evidence.

---

## Pre-Deployment Checklist

### Architecture & Boundary Verification
- [ ] lifecycle/governance engine remains in `@hbc/post-bid-autopsy`
- [ ] BD/Estimating packages remain projection adapters only
- [ ] no route-layer imports in runtime packages
- [ ] app-shell-safe component surfaces validated
- [ ] boundary grep checks return zero prohibited matches

### Type Safety
- [ ] zero TypeScript errors in primitive and adapters
- [ ] evidence/confidence/taxonomy contracts stable end-to-end
- [ ] lifecycle/publication-gate contracts stable
- [ ] queue/sync/provenance contracts stable
- [ ] telemetry contracts stable

### Build & Package
- [ ] primitive and adapter builds succeed
- [ ] runtime/testing entrypoints emitted
- [ ] testing sub-path excluded from production bundles
- [ ] exports resolve in consuming surfaces

### Tests
- [ ] all tests pass
- [ ] coverage thresholds met (>=95)
- [ ] confidence/evidence reliability tests complete
- [ ] lifecycle and publication-gate tests complete
- [ ] disagreement/escalation tests complete
- [ ] stale/revalidation tests complete
- [ ] end-to-end outcome->review->publish->seeding->benchmark update scenario passing

### Storage/API and Lifecycle
- [ ] trigger persistence validated for Won/Lost/No-Bid
- [ ] 5-day SLA and escalation behavior validated
- [ ] immutable snapshot freeze and version history validated
- [ ] approved/published-only downstream paths validated
- [ ] supersession/archive and re-open/revise paths validated

### Integration
- [ ] BIC ownership + My Work projection validated
- [ ] notification trigger/escalation/revalidation routing validated
- [ ] strategic-intelligence seeding conversion validated
- [ ] score-benchmark update signaling validated
- [ ] related-items deep-link and step-wizard integration validated
- [ ] health-indicator semantics alignment validated

### Documentation and Governance
- [ ] `docs/architecture/adr/ADR-0112-post-bid-learning-loop.md` written and accepted
- [ ] companion `@hbc/post-bid-autopsy` ADR documented and linked
- [ ] adoption guide/API reference/README conformance verified
- [ ] `docs/README.md` ADR index updated with ADR-0112 entries
- [ ] `current-state-map.md §2` updated with SF22 and ADR-0112 linkage
- [ ] source-spec path inconsistency resolved (`_UPDATED.md` present or formal fallback documented)

---

## ADR-0112: Post-Bid Learning Loop

**File:** `docs/architecture/adr/ADR-0112-post-bid-learning-loop.md`

Must document:
- autopsy trigger and SLA escalation
- expanded lifecycle state machine and publication gate rules
- evidence/confidence/taxonomy/sensitivity model boundaries
- benchmark update + intelligence seeding strategy
- per-section BIC integration and ownership projection
- offline replay, provenance/snapshot, and AI approval guardrails
- flywheel corroboration and reinsertion expectations

---

## Final Verification Commands

```bash
pnpm turbo run build --filter @hbc/post-bid-autopsy... --filter @hbc/features-business-development... --filter @hbc/features-estimating...
pnpm turbo run lint --filter @hbc/post-bid-autopsy... --filter @hbc/features-business-development... --filter @hbc/features-estimating...
pnpm --filter @hbc/post-bid-autopsy check-types
pnpm --filter @hbc/post-bid-autopsy test --coverage
pnpm --filter @hbc/features-business-development test --coverage
pnpm --filter @hbc/features-estimating test --coverage
rg -n "L-01|L-02|L-03|L-04|L-05|L-06|L-07|L-08|L-09|L-10|L-11|L-12|L-13|L-14|@hbc/post-bid-autopsy" docs/architecture/plans/shared-features/SF22*.md
```
