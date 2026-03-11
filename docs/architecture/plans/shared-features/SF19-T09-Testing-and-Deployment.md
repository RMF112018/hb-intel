# SF19-T09 - Testing and Deployment: BD Score Benchmark Adapter over `@hbc/score-benchmark`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.65 sprint-weeks
**Depends On:** T01-T08

> **Doc Classification:** Canonical Normative Plan - SF19-T09 testing/deployment task; sub-plan of `SF19-BD-Score-Benchmark.md`.

---

## Objective

Finalize SF19 as a production-ready BD adapter over `@hbc/score-benchmark`, with closure evidence for integrations, offline resilience, provenance governance, and KPI telemetry.

---

## 3-Line Plan

1. Complete primitive + adapter validation at >=95% coverage.
2. Pass mechanical gates and architecture boundary checks.
3. Publish ADR/documentation/index/state-map updates for SF19 and companion primitive governance.

---

## Pre-Deployment Checklist

### Architecture & Boundary Verification
- [ ] canonical benchmark computation remains in `@hbc/score-benchmark`
- [ ] BD module only implements profile/adapters/UI composition
- [ ] no app-route imports into runtime packages
- [ ] benchmark read contracts remain governance-safe and provenance-aware
- [ ] boundary grep checks return zero prohibited matches

### Type Safety
- [ ] zero TypeScript errors in primitive and adapter packages
- [ ] primitive contracts stable end-to-end (`IScoreBenchmark*`)
- [ ] adapter projection contracts stable end-to-end
- [ ] sync/provenance metadata contracts stable

### Build & Package
- [ ] primitive package build succeeds
- [ ] adapter package build succeeds
- [ ] runtime/testing entrypoints emitted correctly
- [ ] testing sub-path excluded from production bundles
- [ ] turbo build with dependencies succeeds

### Tests
- [ ] all tests pass
- [ ] coverage thresholds met (lines/branches/functions/statements >=95)
- [ ] lifecycle/significance tests complete
- [ ] hook transition and sync replay tests complete
- [ ] overlay/indicator/filter/AI action component tests complete
- [ ] end-to-end benchmark + ownership + approval scenarios passing

### Offline / Resilience
- [ ] service worker benchmark cache behavior verified
- [ ] IndexedDB persistence via `@hbc/versioned-record` verified
- [ ] background sync replay behavior validated
- [ ] optimistic status badges (`Saved locally`, `Queued to sync`) validated

### Integration
- [ ] data-seeding enrichment behavior validated
- [ ] versioned-record provenance/snapshot integration validated
- [ ] complexity-tier rendering behavior validated
- [ ] BIC ownership projection and My Work placement validated
- [ ] related-items deep-link routing validated
- [ ] notification-intelligence and health-indicator interoperability validated
- [ ] AI inline action citation + approval + BIC creation flow validated

### Documentation & Governance
- [ ] `docs/architecture/adr/0103-bd-score-benchmark-ghost-overlay.md` written and accepted
- [ ] companion `@hbc/score-benchmark` primitive ADR documented and linked
- [ ] `docs/how-to/developer/bd-score-benchmark-adoption-guide.md` updated
- [ ] `docs/reference/bd-score-benchmark/api.md` updated
- [ ] `packages/score-benchmark/README.md` and BD README conformance verified
- [ ] `docs/README.md` ADR index updated with SF19 and primitive ADR entries
- [ ] `current-state-map.md §2` updated with SF19 + ADR linkages
- [ ] PH7 Shared Features Evaluation governance criteria explicitly cited in closure note

---

## Documentation Update Requirements

### ADR
- `docs/architecture/adr/0103-bd-score-benchmark-ghost-overlay.md`
- companion ADR for `@hbc/score-benchmark` primitive abstraction

### Developer Adoption Guide
- score benchmark primitive consumption
- BD adapter profile configuration
- complexity behavior and offline/sync state handling
- AI action approval + BIC creation flow
- testing fixture usage for primitive and adapter

### API Reference
Must include export entries for:
- `IScorecardBenchmark`
- `IBenchmarkFilterContext`
- `IScoreGhostOverlayState`
- `IScoreBenchmarkTelemetryState`
- primitive hooks/components/APIs
- BD adapter hooks/components
- testing exports from primitive and adapter testing paths

---

## Final Verification Commands

```bash
pnpm turbo run build --filter @hbc/score-benchmark... --filter @hbc/features-business-development...
pnpm turbo run lint --filter @hbc/score-benchmark... --filter @hbc/features-business-development...
pnpm --filter @hbc/score-benchmark check-types
pnpm --filter @hbc/features-business-development check-types
pnpm --filter @hbc/score-benchmark test --coverage
pnpm --filter @hbc/features-business-development test --coverage
rg -n "@hbc/score-benchmark|L-01|L-02|L-03|L-04|L-05|L-06" docs/architecture/plans/shared-features/SF19*.md
```

---

## Closure Comment Template

Append to `SF19-BD-Score-Benchmark.md` after all gates pass:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
SF19 completed: {DATE}
Adapter-over-primitive boundary verified (`@hbc/features-business-development` -> `@hbc/score-benchmark`).
Locked decisions L-01..L-06 validated across docs and tests.
ADR-0103 updated and companion score-benchmark ADR linked.
Offline replay, AI approval path, BIC ownership projection, and KPI telemetry verified.
All mechanical enforcement gates passed.
-->
```
