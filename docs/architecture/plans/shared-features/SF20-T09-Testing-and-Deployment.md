# SF20-T09 - Testing and Deployment: SF20 adapter over `@hbc/strategic-intelligence`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.7 sprint-weeks
**Depends On:** T01-T08

> **Doc Classification:** Canonical Normative Plan - SF20-T09 testing/deployment task; sub-plan of `SF20-BD-Heritage-Panel.md`.

---

## Objective

Finalize SF20 as a production-ready BD adapter over `@hbc/strategic-intelligence`, with closure evidence for governance, offline resilience, cross-primitive integrations, and KPI telemetry.

---

## 3-Line Plan

1. Complete primitive+adapter validation at >=95% coverage.
2. Pass mechanical gates and architecture boundary checks.
3. Publish ADR/docs/index/state-map updates with PH7 governance closure evidence.

---

## Pre-Deployment Checklist

### Architecture & Boundary Verification
- [ ] canonical heritage/intelligence lifecycle remains in `@hbc/strategic-intelligence`
- [ ] BD module only implements adapter profile/projections and UX composition
- [ ] no app-route imports into runtime packages
- [ ] app-shell-safe component composition validated
- [ ] boundary grep checks return zero prohibited matches

### Type Safety
- [ ] zero TypeScript errors in primitive and adapter packages
- [ ] primitive contracts stable end-to-end (`IStrategicIntelligence*`)
- [ ] adapter projection contracts stable end-to-end
- [ ] approval/sync/provenance contracts stable

### Build & Package
- [ ] primitive and adapter builds succeed
- [ ] runtime/testing entrypoints emitted correctly
- [ ] testing sub-path excluded from production bundles
- [ ] exports resolve in BD/Estimating/Project Hub consumers
- [ ] turbo build with dependencies succeeds

### Tests
- [ ] all tests pass
- [ ] coverage thresholds met (>=95)
- [ ] permissions/lifecycle tests complete
- [ ] hook transitions + offline replay tests complete
- [ ] panel/feed/form/queue/AI-action tests complete
- [ ] end-to-end contributor -> approver -> approved scenario passing

### Offline / Resilience
- [ ] service worker cache behavior validated
- [ ] IndexedDB persistence via `@hbc/versioned-record` validated
- [ ] background replay behavior validated
- [ ] optimistic badges (`Saved locally`, `Queued to sync`) validated

### Integration
- [ ] workflow-handoff source integration validated
- [ ] BIC ownership projection and My Work placement validated
- [ ] acknowledgment/admin approval authority integration validated
- [ ] notification-intelligence routing validated
- [ ] related-items deep-link behavior validated
- [ ] health-indicator + score-benchmark interop contracts validated

### Documentation & Governance
- [ ] `docs/architecture/adr/0105-bd-heritage-living-strategic-intelligence.md` written and accepted
- [ ] companion `@hbc/strategic-intelligence` ADR documented and linked
- [ ] `docs/how-to/developer/bd-heritage-strategic-intelligence-adoption-guide.md` updated
- [ ] `docs/reference/bd-heritage-strategic-intelligence/api.md` updated
- [ ] primitive and adapter README conformance verified
- [ ] `docs/README.md` ADR index updated with 0105 and companion ADR entries
- [ ] `current-state-map.md §2` updated with SF20 + ADR linkages
- [ ] PH7 shared-feature governance criteria explicitly cited in closure note

---

## Final Verification Commands

```bash
pnpm turbo run build --filter @hbc/strategic-intelligence... --filter @hbc/features-business-development...
pnpm turbo run lint --filter @hbc/strategic-intelligence... --filter @hbc/features-business-development...
pnpm --filter @hbc/strategic-intelligence check-types
pnpm --filter @hbc/features-business-development check-types
pnpm --filter @hbc/strategic-intelligence test --coverage
pnpm --filter @hbc/features-business-development test --coverage
rg -n "@hbc/strategic-intelligence|L-01|L-02|L-03|L-04|L-05|L-06" docs/architecture/plans/shared-features/SF20*.md
```

---

## Closure Comment Template

Append to `SF20-BD-Heritage-Panel.md` after all gates pass:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
SF20 completed: {DATE}
Adapter-over-primitive boundary verified (`@hbc/features-business-development` -> `@hbc/strategic-intelligence`).
Locked decisions L-01..L-06 validated across docs and tests.
ADR-0105 updated and companion strategic-intelligence ADR linked.
Offline replay, inline AI approval path, BIC ownership projection, and KPI telemetry verified.
All mechanical enforcement gates passed.
-->
```
