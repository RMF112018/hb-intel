# SF18 - Estimating Bid Readiness (`@hbc/features-estimating`)

**Plan Version:** 2.1
**Date:** 2026-03-12
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-18-Module-Feature-Estimating-Bid-Readiness.md`
**Priority Tier:** 2 - Application Layer (estimating differentiator)
**Estimated Effort:** 2-3 sprint-weeks
**ADR Required:** `docs/architecture/adr/ADR-0107-estimating-bid-readiness-signal.md` + companion `@hbc/health-indicator` ADR

> **Doc Classification:** Canonical Normative Plan - SF18 implementation master plan for Estimating Bid Readiness; governs SF18-T01 through SF18-T09.

---

## Purpose

SF18 now implements Estimating Bid Readiness as a domain adapter over the reusable Tier-1 `@hbc/health-indicator` primitive. Estimating owns profile defaults, UX composition, and module fit; core scoring/state/versioning/telemetry contracts are owned by the primitive.

---

## Architectural Realignment Status

Realignment patch applied: 2026-03-12

- Coordinated signal model adopted
- Transitional compatibility layer required
- Primitive extraction staged before T06 completion
- T05-T06 tasks rebaselined to updated feature summary
- T01-T04 produced a deterministic scaffold and compile-safe baseline.
- The scaffold must be realigned to the updated feature summary before T05 implementation:
  - coordinated signals (`Submission Eligibility`, `Bid Readiness Score`, `Estimate Confidence`)
  - explainability (`Why this score?`) contracts
  - bid-day/team-state model expansion for T06 scope
- Full primitive extraction to `@hbc/health-indicator` is not a T05 start blocker, but is a mandatory checkpoint before T06 sign-off.

---

## Coordinated Signal Model (Locked for T05+)

SF18 must expose and compose three distinct outputs:

1. Submission Eligibility
2. Bid Readiness Score
3. Estimate Confidence Indicator

These outputs remain coordinated but not conflated. Readiness scoring does not replace eligibility, and confidence does not replace readiness.

---

## Locked Decisions

| # | Decision | Locked Choice |
|---|---|---|
| L-01 | Primitive abstraction | Entire readiness model is provided by Tier-1 `@hbc/health-indicator` |
| L-02 | Criterion ownership | Per-criterion BIC ownership via `@hbc/bic-next-move`; blockers-first ordering |
| L-03 | Progressive disclosure | `@hbc/complexity` controls Essential/Standard/Expert behavior for Signal, Dashboard, Checklist |
| L-04 | Offline resilience | Service worker caching + IndexedDB persistence via `@hbc/versioned-record` + Background Sync + optimistic indicators |
| L-05 | AI embedding | Checklist rows expose inline AI actions with cited sources and explicit approval; no sidecar chat |
| L-06 | Deep-linking, provenance, telemetry | `@hbc/related-items` deep-links, `@hbc/project-canvas` My Work placement, immutable `@hbc/versioned-record` provenance, five UX KPIs |

---

## Governance Alignment (PH7 Shared Features Evaluation)

SF18 aligns with the PH7 shared-feature governance rule: capabilities become shared primitives only when configuration-driven, reused across modules, domain-agnostic, and materially reducing duplicated implementation. `@hbc/health-indicator` satisfies this rule; SF18 is now a bounded Estimating profile over that primitive.

---

## Blocking Classification Map

| Recommended Change | Classification |
|---|---|
| Add explicit Submission Eligibility signal/contracts | required before T05 |
| Add explicit Estimate Confidence signal/contracts | required before T05 |
| Separate eligibility/readiness/confidence outputs in hook state | required before T05 |
| Add explainability payload contracts (`Why this score?`) | required before T05 |
| Replace T05/T06 task docs to updated feature-summary scope | required before T05 |
| Implement non-stub Signal/Dashboard components with triple-signal display | required before T05 |
| Add bid-day mode state model and hook output | required before T06 |
| Add eligibility profile model by project/bid type with immutable/conditional gates | required before T06 |
| Add admin/governance model for profile lifecycle and immutable gate enforcement | required before T06 |
| Expand subcontractor coverage from boolean to quality model | required before T06 |
| Expand addenda model to impact workflow and reviewer assignment | required before T06 |
| Add team bid-room overlay contracts (`waiting-on`, `reviewer`, approvals) | required before T06 |
| Telemetry schema realignment to updated metrics | required before T06 |
| Full primitive extraction to `@hbc/health-indicator` runtime ownership | required before T06 |
| T07 integration depth | can defer until post-T06 |
| T08 full scenario-matrix hardening | can defer until post-T06 |
| T09 closure artifacts and final docs/index/state-map sync | can defer until post-T06 |

---

## Migration Strategy

### What remains stable

- Package boundary remains `@hbc/features-estimating`.
- Existing T02 naming and barrels remain as compatibility layer.
- Deterministic helper and hook orchestration patterns from T03/T04 remain valid.
- `./testing` entrypoint stays stable.

### What gets deprecated

- Single-signal interpretation of readiness summary as complete feature output.
- Boolean-only domain inputs (`subcontractorCoverageMet`, `addendaAcknowledged`) as long-term canonical model.
- Current KPI set where it diverges from updated feature-summary metrics.

### What gets renamed / evolved

- `IReadinessSummaryPayload` remains, but is wrapped in a coordinated aggregate model (eligibility + readiness + confidence + explainability).
- Profile model splits into readiness scoring profile and eligibility-gate profile.
- Hook result envelopes expand while preserving backward-compatible fields during transition.

### Test migration strategy

- Keep existing T03/T04 tests as regression baseline.
- Add parallel coordinated-signal tests before removing legacy assumptions.
- Migrate in phases:
  - phase 1: compatibility assertions remain
  - phase 2: new signal/explainability assertions added
  - phase 3: default paths flip after T05/T06 consumers adopt coordinated contracts

---

## Primitive Timing Decision and Gate

- Primitive extraction is not strictly required before T05 starts.
- Primitive extraction is mandatory before T06 can be marked complete.
- Non-negotiable guardrails:
  - define explicit primitive seam contracts before T05 implementation
  - do not add parallel/duplicate scoring engines during T05/T06
  - move canonical evaluation/profile/telemetry runtime ownership to `@hbc/health-indicator` before T06 sign-off

---

## Package Directory Structure

```text
packages/features/estimating/
|- src/
|  |- bid-readiness/
|  |  |- profiles/
|  |  |  |- estimatingBidReadinessProfile.ts
|  |  |- adapters/
|  |  |  |- mapPursuitToHealthIndicatorItem.ts
|  |  |  |- mapHealthIndicatorStateToBidReadinessView.ts
|  |  |- hooks/
|  |  |  |- useBidReadiness.ts
|  |  |- components/
|  |  |  |- BidReadinessSignal.tsx
|  |  |  |- BidReadinessDashboard.tsx
|  |  |  |- BidReadinessChecklist.tsx
|  |  |- telemetry/
|  |  |  |- bidReadinessKpiEmitter.ts
|  |  |- index.ts
|  |- testing/
|     |- createMockHealthIndicatorState.ts
|     |- createMockBidReadinessProfile.ts
```

Core health computation, version lifecycle, and telemetry schema live in `@hbc/health-indicator`.

---

## Definition of Done

- [ ] all SF18 docs use the six locked decisions and no legacy decision-ID semantics
- [ ] coordinated-signal model (eligibility/readiness/confidence) is implemented and documented
- [ ] primitive seam contracts are in place before T05 runtime work
- [ ] primitive extraction to `@hbc/health-indicator` completes before T06 sign-off
- [ ] SF18 contracts reference `IHealthIndicator*` as canonical core contracts
- [ ] BIC blockers-first ownership and avatar projection into Signal/My Work are documented
- [ ] complexity behavior is explicit for Essential/Standard/Expert across all three surfaces
- [ ] offline strategy includes SW caching, IndexedDB, Background Sync, optimistic state badges
- [ ] inline AI action behavior includes source citation + explicit approval constraints
- [ ] `@hbc/related-items`, `@hbc/project-canvas`, `@hbc/versioned-record`, and KPI telemetry contracts are documented
- [ ] T09 closure includes companion primitive ADR and KPI validation evidence

---

## Task File Index

| File | Contents |
|---|---|
| `SF18-T01-Package-Scaffold.md` | adapter scaffold, exports, README and dependency boundaries | <!-- ✅ completed 2026-03-12 -->
| `SF18-T02-TypeScript-Contracts.md` | `IHealthIndicator*` canonical contracts + SF18 adapter aliases — **COMPLETE 2026-03-12** |
| `SF18-T03-Readiness-Model-and-Configuration.md` | estimating profile defaults, admin controls, provenance and KPI contracts — **COMPLETE 2026-03-12** |
| `SF18-T04-Hooks-and-State-Model.md` | hook orchestration from primitive state to estimating UX state — **COMPLETE 2026-03-12** |
| `SF18-T05-BidReadinessSignal-and-Dashboard.md` | coordinated-signal signal/dashboard behavior (`eligibility + readiness + confidence`) over adapter output — **COMPLETE 2026-03-12** |
| `SF18-T06-BidReadinessChecklist-and-AdminConfig.md` | eligibility profiles, immutable/conditional gates, bid-day/team-state admin/checklist UX; primitive extraction gate enforced — **COMPLETE 2026-03-12** |
| `SF18-T07-Reference-Integrations.md` | tier-1 integration contracts and boundary rules — **COMPLETE 2026-03-12** |
| `SF18-T08-Testing-Strategy.md` | fixtures, scenario matrix, offline and KPI verification |
| `SF18-T09-Testing-and-Deployment.md` | closure checklist, ADR/docs/index/state-map updates |
