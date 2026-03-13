# SF27-T09 - Testing and Deployment: Bulk Actions

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-27-Shared-Feature-Bulk-Actions.md`
**Decisions Applied:** All L-01 through L-10
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T01-T08

> **Doc Classification:** Canonical Normative Plan - SF27-T09 testing/deployment task; sub-plan of `SF27-Bulk-Actions.md`.

---

## Objective

Finalize SF27 with SF11-grade closure requirements: testing gates, ADR template, adoption guide, API reference, README conformance, docs/index/state-map updates, and PH7 selection/result transparency evidence.

---

## 3-Line Plan

1. Complete primitive and ui-kit validations at >=95% coverage.
2. Pass architecture boundary gates for selection truth, reusable UI ownership, and mixed-result semantics.
3. Publish ADR-0114 and required docs/index/state-map updates with PH7 bulk-action safety evidence.

---

## Pre-Deployment Checklist

### Architecture & Boundary Verification

- [ ] selection and execution lifecycle remains in `@hbc/bulk-actions`
- [ ] reusable visual primitives land in `@hbc/ui-kit`
- [ ] no route-layer imports in runtime packages
- [ ] page/visible/filtered scope semantics are preserved end-to-end
- [ ] boundary grep checks return zero prohibited matches
- [ ] PH7 shared-feature governance criteria explicitly satisfied

### Type Safety

- [ ] zero TypeScript errors in primitive and ui-kit surfaces
- [ ] selection, eligibility, execution, and result contracts stable end-to-end
- [ ] destructive-warning, permission, and retryability contracts stable
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
- [ ] selection truth tests complete
- [ ] per-item eligibility tests complete
- [ ] destructive confirmation tests complete
- [ ] configured-input validation tests complete
- [ ] chunking and mixed-result tests complete
- [ ] retryable subset tests complete
- [ ] end-to-end filtered-set bulk action scenario passing

### Selection/API and Lifecycle

- [ ] page vs visible vs filtered selection distinctions validated
- [ ] exact attempted count truth validated
- [ ] no implicit full-dataset actions validated by default
- [ ] partial-success-first execution validated
- [ ] no contradictory result messaging across confirm and results surfaces

### Integration

- [ ] `HbcDataTable` row-selection integration validated
- [ ] `ListLayout` bulk-bar seam validated
- [ ] auth permission gating validated
- [ ] BIC reassignment action seam validated
- [ ] query-hooks/data-access refresh and mutation boundaries validated
- [ ] session-state boundary posture validated

### Documentation

- [ ] selection truth and explainability behavior documented and verified
- [ ] destructive safety and permission behavior documented and verified
- [ ] mixed-result reporting behavior documented and verified
- [ ] telemetry usefulness confirmed for productivity and confusion reduction
- [ ] `docs/architecture/adr/ADR-0114-bulk-actions.md` written and accepted
- [ ] companion `@hbc/bulk-actions` ADR documented and linked
- [ ] `docs/how-to/developer/bulk-actions-adoption-guide.md` written
- [ ] `docs/reference/bulk-actions/api.md` written
- [ ] primitive and ui-kit README conformance verified
- [ ] `docs/README.md` ADR index updated with ADR-0114 entries
- [ ] `current-state-map.md §2` updated with SF27 and ADR-0114 linkage

---

## ADR-0114: Bulk Actions

**File:** `docs/architecture/adr/ADR-0114-bulk-actions.md`

Must document:

- shared bulk-actions boundary and selection-source projection rules
- page/visible/filtered selection semantics and filtered-scope safety contract
- per-item eligibility and grouped result model
- immediate vs configured action contract
- chunked execution, retry, and partial-success semantics
- current and future integration boundaries across data tables, saved views, publish, and activity timeline
- telemetry contract and productivity/safety KPIs
- UI ownership alignment with `@hbc/ui-kit`

---

## Final Verification Commands

```bash
pnpm turbo run build --filter @hbc/bulk-actions... --filter @hbc/ui-kit...
pnpm turbo run lint --filter @hbc/bulk-actions... --filter @hbc/ui-kit...
pnpm --filter @hbc/bulk-actions check-types
pnpm --filter @hbc/bulk-actions test --coverage
pnpm --filter @hbc/ui-kit test --coverage
rg -n "L-01|L-02|L-03|L-04|L-05|L-06|L-07|L-08|L-09|L-10|@hbc/bulk-actions|ADR-0114|filtered selection|mixed result" docs/architecture/plans/shared-features/SF27*.md
```
