# SF24-T09 - Testing and Deployment: Export Runtime

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-24-Shared-Feature-Export-Runtime.md`
**Decisions Applied:** All L-01 through L-06
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T01-T08

> **Doc Classification:** Canonical Normative Plan - SF24-T09 testing/deployment task; sub-plan of `SF24-Export-Runtime.md`.

---

## Objective

Finalize SF24 with SF11-grade closure requirements: testing gates, ADR template, adoption guide, API reference, README conformance, ADR index updates, blueprint progress comment, and `current-state-map` governance updates.

---

## 3-Line Plan

1. Complete primitive and adapter validations at >=95% coverage.
2. Pass mechanical enforcement and architecture boundary gates.
3. Publish ADR-0114 and required docs/index/state-map updates with PH7 governance evidence.

---

## Pre-Deployment Checklist

### Architecture & Boundary Verification

- [ ] lifecycle engine remains in `@hbc/export-runtime`
- [ ] module packages remain projection adapters only
- [ ] no route-layer imports in runtime packages
- [ ] reusable visual primitives land in `@hbc/ui-kit`
- [ ] boundary grep checks return zero prohibited matches
- [ ] PH7 shared-feature governance criteria explicitly satisfied

### Type Safety

- [ ] zero TypeScript errors in primitive and adapters
- [ ] export lifecycle, truth-state, and explainability contracts stable end-to-end
- [ ] receipt, review-step, queue/sync, and provenance contracts stable
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
- [ ] lifecycle transition tests complete
- [ ] export-truth and unavailable-format explainability tests complete
- [ ] offline replay and receipt recovery tests complete
- [ ] menu/picker/progress/receipt tests complete
- [ ] retry/failure and clear/dismiss guard tests complete
- [ ] end-to-end table->report export scenario with handoff and audit traces passing

### Storage/API and Lifecycle

- [ ] CSV/XLSX/PDF/Print persistence and retrieval validated
- [ ] local request vs remote artifact vs restored receipt distinctions validated
- [ ] review and approval-state transitions validated
- [ ] immutable snapshot freeze and version history validated
- [ ] approved-only downstream publish paths validated
- [ ] no contradictory artifact-truth messaging across menu, progress, and receipt surfaces

### Integration

- [ ] BIC ownership + My Work projection validated
- [ ] notification routing validated
- [ ] related-items deep-link and record-form interoperability validated
- [ ] session-state queue and restore boundaries validated
- [ ] score-benchmark and health-indicator interoperability validated
- [ ] strategic-intelligence and post-bid-autopsy boundaries validated
- [ ] renderer context stamps validated against versioned-record metadata
- [ ] project-canvas visibility of downstream export ownership validated

### Documentation

- [ ] trust/explainability behavior documented and verified
- [ ] progress/receipt/recovery behavior documented and verified
- [ ] review/handoff semantics documented and verified
- [ ] telemetry usefulness confirmed for friction reduction and artifact consistency
- [ ] no hidden destructive clear/dismiss actions remain undocumented
- [ ] `docs/architecture/adr/ADR-0114-export-runtime.md` written and accepted
- [ ] companion `@hbc/export-runtime` ADR documented and linked
- [ ] `docs/how-to/developer/export-runtime-adoption-guide.md` written
- [ ] `docs/reference/export-runtime/api.md` written
- [ ] primitive and adapter README conformance verified
- [ ] `docs/README.md` ADR index updated with ADR-0114 entries
- [ ] `current-state-map.md §2` updated with SF24 and ADR-0114 linkage

---

## ADR-0114: Export Runtime

**File:** `docs/architecture/adr/ADR-0114-export-runtime.md`

Must document:

- shared export runtime boundary and adapter projection rules
- lifecycle model, artifact-confidence model, and complexity-adaptive disclosure
- export-truth/context explainability contract
- offline replay strategy, retry/conflict semantics, and optimistic status indicators
- export context/version/filter/column/selection stamping and artifact traceability model
- per-step BIC integration, owner attribution, reassignment history, and downstream projection
- AI inline actions, source citation, and explicit approval guardrails
- renderer pipeline strategy (CSV/XLSX/PDF/Print), naming conventions, and KPI telemetry contract
- UI ownership alignment with `@hbc/ui-kit`

---

## Final Verification Commands

```bash
pnpm turbo run build --filter @hbc/export-runtime... --filter @hbc/features-business-development... --filter @hbc/features-estimating...
pnpm turbo run lint --filter @hbc/export-runtime... --filter @hbc/features-business-development... --filter @hbc/features-estimating...
pnpm --filter @hbc/export-runtime check-types
pnpm --filter @hbc/export-runtime test --coverage
pnpm --filter @hbc/features-business-development test --coverage
pnpm --filter @hbc/features-estimating test --coverage
rg -n "L-01|L-02|L-03|L-04|L-05|L-06|@hbc/export-runtime|Saved locally|Queued to sync|ADR-0114" docs/architecture/plans/shared-features/SF24*.md
```
