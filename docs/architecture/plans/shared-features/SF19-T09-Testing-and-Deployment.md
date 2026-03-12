# SF19-T09 - Testing and Deployment: BD Score Benchmark Adapter over `@hbc/score-benchmark`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Decisions Applied:** L-01 through L-10
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T01-T08

> **Doc Classification:** Canonical Normative Plan - SF19-T09 testing/deployment task; sub-plan of `SF19-BD-Score-Benchmark.md`.

---

## Objective

Finalize SF19 as a production-ready BD adapter over `@hbc/score-benchmark`, with closure evidence for decision-support trustworthiness, governance controls, recalibration observability, and ADR/index consistency.

---

## 3-Line Plan

1. Complete primitive + adapter validation at >=95% coverage across legacy and expanded decision-support scope.
2. Pass mechanical gates, governance checks, and architecture boundary checks.
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
- [ ] primitive contracts stable end-to-end (`IScoreBenchmark*` + confidence/similarity/recommendation/governance contracts)
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
- [ ] lifecycle/significance/confidence/similarity tests complete
- [ ] recommendation, disagreement, guardrail, and recalibration tests complete
- [ ] hook transition, panel-context, and sync replay tests complete
- [ ] overlay/indicator/filter/explainability/similar-pursuits/consensus component tests complete
- [ ] end-to-end benchmark + ownership + approval + no-bid rationale scenarios passing

### Offline / Resilience
- [ ] service worker benchmark cache behavior verified
- [ ] IndexedDB persistence via `@hbc/versioned-record` verified
- [ ] background sync replay behavior validated
- [ ] optimistic status badges (`Saved locally`, `Queued to sync`) validated
- [ ] queued governance/recommendation/no-bid audit events validated

### Integration
- [ ] data-seeding and SF22 enrichment behavior validated
- [ ] versioned-record provenance/snapshot integration validated
- [ ] complexity-tier rendering behavior validated
- [ ] BIC ownership projection and My Work placement validated
- [ ] related-items deep-link routing and return-context behavior validated
- [ ] notification-intelligence and health-indicator interoperability validated
- [ ] AI inline action citation + approval + no-bid artifact flow validated

### Governance & Decision-Quality
- [ ] benchmark confidence tiers and reason disclosure validated
- [ ] anti-shopping controls (default lock, approved cohorts, warning thresholds, audit logging) validated
- [ ] reviewer disagreement escalation behavior validated
- [ ] recommendation override capture and provenance validated
- [ ] recalibration signal emission and predictive-value telemetry validated

### Documentation & Governance
- [ ] `docs/architecture/adr/ADR-0108-bd-score-benchmark-ghost-overlay.md` written and accepted
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
- `docs/architecture/adr/ADR-0108-bd-score-benchmark-ghost-overlay.md`
- companion ADR for `@hbc/score-benchmark` primitive abstraction

### Developer Adoption Guide
- score benchmark primitive consumption
- BD adapter profile configuration
- recommendation and no-bid rationale workflow
- confidence/similarity/governance behavior expectations
- complexity behavior and offline/sync state handling
- AI action approval + artifact capture flow
- testing fixture usage for primitive and adapter

### API Reference

Must include export entries for:
- `IScorecardBenchmark`
- `IBenchmarkConfidence`
- `ISimilarityModelResult`
- `IBenchmarkRecommendation`
- `IReviewerConsensus`
- `IFilterGovernanceEvent`
- `IRecalibrationSignal`
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
rg -n "@hbc/score-benchmark|L-01|L-02|L-03|L-04|L-05|L-06|L-07|L-08|L-09|L-10" docs/architecture/plans/shared-features/SF19*.md
```

---

## Closure Comment Template

Append to `SF19-BD-Score-Benchmark.md` after all gates pass:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
SF19 completed: {DATE}
Adapter-over-primitive boundary verified (`@hbc/features-business-development` -> `@hbc/score-benchmark`).
Locked decisions L-01..L-10 validated across docs and tests.
ADR-0108 updated and companion score-benchmark ADR linked.
Confidence/similarity/recommendation/governance/recalibration contracts verified.
Offline replay, AI approval path, no-bid rationale artifact capture, BIC ownership projection, and KPI telemetry verified.
All mechanical enforcement gates passed.
-->
```
