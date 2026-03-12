# SF25-T09 - Testing and Deployment: Publish Workflow

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-25-Shared-Feature-Publish-Workflow.md`
**Decisions Applied:** All L-01 through L-06
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T01-T08

> **Doc Classification:** Canonical Normative Plan - SF25-T09 testing/deployment task; sub-plan of `SF25-Publish-Workflow.md`.

---

## Objective

Finalize SF25 with SF11-grade closure requirements: testing gates, ADR template, adoption guide, API reference, README conformance, ADR index updates, blueprint progress comment, and `current-state-map` governance updates.

---

## 3-Line Plan

1. Complete primitive and adapter validations at >=95% coverage.
2. Pass mechanical enforcement and architecture boundary gates.
3. Publish ADR-0109 and required docs/index/state-map updates with PH7 governance evidence.

---

## Pre-Deployment Checklist (30 items)

### Architecture & Boundary Verification
- [ ] lifecycle engine remains in `@hbc/publish-workflow`
- [ ] module packages remain projection adapters only
- [ ] no route-layer imports in runtime packages
- [ ] app-shell-safe component surfaces validated
- [ ] boundary grep checks return zero prohibited matches
- [ ] PH7 shared-feature governance criteria explicitly satisfied

### Type Safety
- [ ] zero TypeScript errors in primitive and adapters
- [ ] publish lifecycle and rule contracts stable end-to-end
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
- [ ] lifecycle transition tests complete
- [ ] offline replay tests complete
- [ ] panel/target/checklist/receipt tests complete
- [ ] end-to-end publish->supersede/revoke scenario with audit traces passing

### Storage/API and Lifecycle
- [ ] readiness and approval gate persistence validated
- [ ] supersession and revocation chain persistence validated
- [ ] immutable snapshot freeze and version history validated
- [ ] approved-only downstream publish paths validated

### Integration
- [ ] BIC ownership + My Work projection validated
- [ ] notification routing validated
- [ ] related-items deep-link and record-form interoperability validated
- [ ] score-benchmark and health-indicator interoperability validated
- [ ] strategic-intelligence and post-bid-autopsy boundaries validated
- [ ] export-runtime generation vs publish-workflow governance boundary validated

### Documentation
- [ ] `docs/architecture/adr/0109-publish-workflow.md` written and accepted
- [ ] companion `@hbc/publish-workflow` ADR documented and linked
- [ ] `docs/how-to/developer/publish-workflow-adoption-guide.md` written
- [ ] `docs/reference/publish-workflow/api.md` written
- [ ] primitive and adapter README conformance verified
- [ ] `docs/README.md` ADR index updated with ADR-0109 entries
- [ ] `current-state-map.md §2` updated with SF25 and ADR-0109 linkage

---

## ADR-0109: Publish Workflow

**File:** `docs/architecture/adr/0109-publish-workflow.md`

Must document:
- shared publish workflow boundary and adapter projection rules
- publish state machine and full panel visibility policy
- offline replay strategy and optimistic status indicators
- readiness/approval/supersession/revocation/acknowledgment governance model
- per-step BIC integration and ownership projection
- AI inline actions, source citation, and explicit approval guardrails
- receipt traceability model and KPI telemetry contract

---

## Final Verification Commands

```bash
pnpm turbo run build --filter @hbc/publish-workflow... --filter @hbc/features-business-development... --filter @hbc/features-estimating...
pnpm turbo run lint --filter @hbc/publish-workflow... --filter @hbc/features-business-development... --filter @hbc/features-estimating...
pnpm --filter @hbc/publish-workflow check-types
pnpm --filter @hbc/publish-workflow test --coverage
pnpm --filter @hbc/features-business-development test --coverage
pnpm --filter @hbc/features-estimating test --coverage
rg -n "L-01|L-02|L-03|L-04|L-05|L-06|@hbc/publish-workflow|Saved locally|Queued to sync|ADR-0109" docs/architecture/plans/shared-features/SF25*.md
```

