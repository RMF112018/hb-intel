# SF18-T09 - Testing and Deployment: Estimating Bid Readiness

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-18-Module-Feature-Estimating-Bid-Readiness.md`
**Decisions Applied:** All D-01 through D-10
**Estimated Effort:** 0.55 sprint-weeks
**Depends On:** T01-T08

> **Doc Classification:** Canonical Normative Plan - SF18-T09 testing/deployment task; sub-plan of `SF18-Estimating-Bid-Readiness.md`.

---

## Objective

Finalize SF18 with SF11-grade closure requirements: full test gates, ADR template, adoption guide, API reference, README conformance, ADR index update, blueprint progress comment, and `current-state-map` updates.

---

## 3-Line Plan

1. Complete model/hook/component/integration verification at >=95% coverage.
2. Pass mechanical enforcement gates and package boundary checks.
3. Publish ADR-0107 and all required documentation/index/state-map updates.

---

## Pre-Deployment Checklist (30 items)

### Architecture & Boundary Verification
- [ ] bid-readiness remains inside `@hbc/features-estimating`
- [ ] no direct app-route imports in package runtime
- [ ] scoring model stays pure and deterministic
- [ ] admin config writes occur only through config API contract
- [ ] app-shell-safe component usage validated
- [ ] boundary grep checks return zero prohibited matches

### Type Safety
- [ ] zero TypeScript errors: `pnpm --filter @hbc/features-estimating check-types`
- [ ] criterion and state contracts enforced end-to-end
- [ ] status threshold policy contracts stable
- [ ] config merge and override contracts stable

### Build & Package
- [ ] package build succeeds
- [ ] runtime/testing entrypoints emitted
- [ ] testing sub-path excluded from production bundle
- [ ] exports resolve in estimating consumers
- [ ] turbo build with dependencies succeeds

### Tests
- [ ] all tests pass
- [ ] coverage thresholds met (lines/branches/functions/statements >=95)
- [ ] scoring and classification tests complete
- [ ] hook transition tests complete
- [ ] component tests for signal/dashboard/checklist complete
- [ ] end-to-end readiness scenario passing

### Storage/API (Readiness Config + Triggers)
- [ ] config persistence schema validated
- [ ] config override merge behavior validated
- [ ] due-date urgency trigger behavior validated
- [ ] admin config audit fields validated

### Integration
- [ ] BIC blocker ownership integration validated
- [ ] acknowledgment CE-signoff integration validated
- [ ] sharepoint-docs criterion integration validated
- [ ] notification-intelligence urgency integration validated

### Documentation
- [ ] `docs/architecture/adr/ADR-0107-estimating-bid-readiness-signal.md` written and accepted
- [ ] `docs/how-to/developer/estimating-bid-readiness-adoption-guide.md` written
- [ ] `docs/reference/estimating-bid-readiness/api.md` written
- [ ] `packages/features/estimating/README.md` conformance verified
- [ ] `docs/README.md` ADR index updated with ADR-0107 entry
- [ ] `current-state-map.md §2` updated with SF18 and ADR-0107 linkage

---

## ADR-0107: Estimating Bid Readiness Signal

**File:** `docs/architecture/adr/ADR-0107-estimating-bid-readiness-signal.md`

```markdown
# ADR-0107 - Estimating Bid Readiness Signal

**Status:** Accepted
**Date:** 2026-03-11
**Deciders:** HB Intel Architecture Team
**Supersedes:** None
**Note:** Source spec PH7-SF-18 referenced ADR-0027. Canonical ADR number for SF18 is ADR-0107.

## Context

Estimating requires a real-time readiness indicator to prevent incomplete or risky bid submissions.

## Decisions

### D-01 - Package Alignment
Implement bid-readiness within `@hbc/features-estimating`.

### D-02 - Weighted Model
Use a weighted criterion model with score range 0-100.

### D-03 - Blocker Precedence
Incomplete blockers force non-ready classifications.

### D-04 - Status Mapping
Use four deterministic status outputs.

### D-05 - Admin Configurability
Allow admin control over criteria, weights, blocker flags, and thresholds.

### D-06 - Due Date Sensitivity
Include days-until-due and overdue semantics in computed state.

### D-07 - Complexity Behavior
Essential signal-only, Standard checklist, Expert weighted diagnostics.

### D-08 - Accountability Integrations
Map blockers to BIC ownership and urgency notification path.

### D-09 - Platform Constraints
Use app-shell-safe component composition.

### D-10 - Testing Sub-Path
Expose canonical fixtures from `@hbc/features-estimating/testing`.

## Compliance

This ADR is locked and superseded only by explicit follow-up ADR.
```

---

## Developer Adoption Guide

**File:** `docs/how-to/developer/estimating-bid-readiness-adoption-guide.md`

Required sections:

1. using `useBidReadiness` in pursuit screens
2. defining and extending readiness criteria
3. managing admin config overrides
4. wiring signal, dashboard, and checklist components
5. integrating BIC and notification urgency flows
6. using testing fixtures from `@hbc/features-estimating/testing`

---

## API Reference

**File:** `docs/reference/estimating-bid-readiness/api.md`

Must include export table entries for:

- `BidReadinessStatus`
- `IBidReadinessCriterion`
- `IBidReadinessCriterionEvaluation`
- `IBidReadinessState`
- `IBidReadinessConfig`
- `IBidReadinessThresholdPolicy`
- `useBidReadiness`
- `useBidReadinessCriteria`
- `useBidReadinessConfig`
- `BidReadinessSignal`
- `BidReadinessDashboard`
- `BidReadinessChecklist`
- testing exports (`createMockBidReadinessCriterion`, `createMockBidReadinessState`, `createMockEstimatingPursuitForReadiness`, `mockBidReadinessStates`)

---

## Package README Conformance

**File:** `packages/features/estimating/README.md`

Verify README contains:

- bid-readiness overview
- quick-start setup
- scoring/configuration architecture summary
- exports table
- boundary rules
- links to SF18 master, T09, ADR-0107, adoption guide, API reference

---

## ADR Index Update

**File:** `docs/README.md`

Append ADR row:

```markdown
| [ADR-0107](architecture/adr/ADR-0107-estimating-bid-readiness-signal.md) | Estimating Bid Readiness Signal | Accepted | 2026-03-11 |
```

---

## current-state-map Update Requirement

**File:** `docs/architecture/blueprint/current-state-map.md`

At implementation closure, update section 2 with:

- SF18 plan-family row
- ADR-0107 row linkage
- optional doc rows (if authored in same pass):
  - `docs/how-to/developer/estimating-bid-readiness-adoption-guide.md`
  - `docs/reference/estimating-bid-readiness/api.md`
- next unreserved ADR number after ADR-0107 allocation

---

## Final Verification Commands

```bash
# Mechanical enforcement gates
pnpm turbo run build --filter @hbc/features-estimating...
pnpm turbo run lint --filter @hbc/features-estimating...
pnpm --filter @hbc/features-estimating check-types
pnpm --filter @hbc/features-estimating test --coverage

# Boundary checks
rg -n "from 'apps/" packages/features/estimating/src
rg -n "bid-readiness" packages/features/estimating/src

# Documentation checks
test -f docs/architecture/adr/ADR-0107-estimating-bid-readiness-signal.md
test -f docs/how-to/developer/estimating-bid-readiness-adoption-guide.md
test -f docs/reference/estimating-bid-readiness/api.md
test -f packages/features/estimating/README.md
```

---

## Blueprint Progress Comment

Append to `SF18-Estimating-Bid-Readiness.md` after all gates pass:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
SF18 completed: {DATE}
T01-T09 implemented.
All four mechanical enforcement gates passed.
ADR created: docs/architecture/adr/ADR-0107-estimating-bid-readiness-signal.md
Documentation added:
  - docs/how-to/developer/estimating-bid-readiness-adoption-guide.md
  - docs/reference/estimating-bid-readiness/api.md
  - packages/features/estimating/README.md
docs/README.md ADR index updated: ADR-0107 row appended.
current-state-map.md section 2 updated with SF18 and ADR-0107 rows.
-->
```
