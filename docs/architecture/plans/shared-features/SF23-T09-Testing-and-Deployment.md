# SF23-T09 - Testing and Deployment: Record Form

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-23-Shared-Feature-Record-Form.md`
**Decisions Applied:** All L-01 through L-06
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T01-T08

> **Doc Classification:** Canonical Normative Plan - SF23-T09 testing/deployment task; sub-plan of `SF23-Record-Form.md`.

---

## Objective

Finalize SF23 with SF11-grade closure requirements: testing gates, ADR template, adoption guide, API reference, README conformance, ADR index updates, blueprint progress comment, and `current-state-map` governance updates.

---

## 3-Line Plan

1. Complete primitive and adapter validations at >=95% coverage.
2. Pass mechanical enforcement and architecture boundary gates.
3. Publish ADR-0111 and required docs/index/state-map updates with PH7 governance evidence.

---

## Pre-Deployment Checklist (30 items)

### Architecture & Boundary Verification
- [ ] lifecycle engine remains in `@hbc/record-form`
- [ ] module packages remain projection adapters only
- [ ] no route-layer imports in runtime packages
- [ ] app-shell-safe component surfaces validated
- [ ] boundary grep checks return zero prohibited matches
- [ ] PH7 shared-feature governance criteria explicitly satisfied

### Type Safety
- [ ] zero TypeScript errors in primitive and adapters
- [ ] lifecycle and validation contracts stable end-to-end
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
- [ ] form/review/submit/recovery tests complete
- [ ] end-to-end create->review->submit->handoff scenario passing

### Storage/API and Lifecycle
- [ ] create/edit/duplicate/template persistence validated
- [ ] review and approval-state transitions validated
- [ ] immutable snapshot freeze and version history validated
- [ ] approved-only downstream publish paths validated

### Integration
- [ ] BIC ownership + My Work projection validated
- [ ] notification routing validated
- [ ] related-items deep-link and step-wizard integration validated
- [ ] session-state recovery semantics validated
- [ ] health-indicator and score-benchmark interoperability validated
- [ ] post-bid-autopsy reuse boundary validated

### Documentation
- [ ] `docs/architecture/adr/ADR-0111-record-form.md` written and accepted
- [ ] companion `@hbc/record-form` ADR documented and linked
- [ ] `docs/how-to/developer/record-form-adoption-guide.md` written
- [ ] `docs/reference/record-form/api.md` written
- [ ] primitive and adapter README conformance verified
- [ ] `docs/README.md` ADR index updated with ADR-0111 entries
- [ ] `current-state-map.md §2` updated with SF23 and ADR-0111 linkage

---

## ADR-0111: Record Form

**File:** `docs/architecture/adr/ADR-0111-record-form.md`

Must document:
- shared record authoring boundary and adapter projection rules
- lifecycle model and complexity-adaptive disclosure
- offline replay strategy and optimistic status indicators
- per-step BIC integration and ownership projection
- AI inline actions, source citation, and explicit approval guardrails
- versioned provenance/snapshot model and KPI telemetry contract

---

## Final Verification Commands

```bash
pnpm turbo run build --filter @hbc/record-form... --filter @hbc/features-business-development... --filter @hbc/features-estimating...
pnpm turbo run lint --filter @hbc/record-form... --filter @hbc/features-business-development... --filter @hbc/features-estimating...
pnpm --filter @hbc/record-form check-types
pnpm --filter @hbc/record-form test --coverage
pnpm --filter @hbc/features-business-development test --coverage
pnpm --filter @hbc/features-estimating test --coverage
rg -n "L-01|L-02|L-03|L-04|L-05|L-06|@hbc/record-form|Saved locally|Queued to sync|ADR-0111" docs/architecture/plans/shared-features/SF23*.md
```
