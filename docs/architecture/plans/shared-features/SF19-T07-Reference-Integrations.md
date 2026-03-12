# SF19-T07 - Reference Integrations

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Decisions Applied:** L-01 through L-10
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T03-T06

> **Doc Classification:** Canonical Normative Plan - SF19-T07 integration task; sub-plan of `SF19-BD-Score-Benchmark.md`.

---

## Objective

Provide boundary-safe integration contracts across the SF19 BD adapter, the `@hbc/score-benchmark` primitive, and dependent Tier-1 primitives with explicit decision-support governance and recalibration flows.

---

## Integration Contracts

- `@hbc/score-benchmark`
  - canonical benchmark computation/state/confidence/similarity/recommendation/filter-governance/recalibration contracts
- `@hbc/bic-next-move`
  - per-criterion gap ownership, blockers-first sequencing, avatar projection, recommendation-reason action mapping
- `@hbc/complexity`
  - controls Essential/Standard/Expert benchmark surface behavior
- `@hbc/versioned-record`
  - immutable provenance, audit history, snapshot freeze, offline replay, filter/no-bid/recommendation audit event persistence
- `@hbc/related-items`
  - criterion-level deep-links and panel return-context links for explainability/similar-pursuits flows
- `@hbc/project-canvas`
  - auto placement of actionable benchmark gaps and disagreement escalations in role-aware My Work lane
- `@hbc/notification-intelligence`
  - urgency-aware alerts for critical benchmark regressions, disagreement escalations, and overdue no-bid rationale approvals
- `@hbc/health-indicator`
  - interoperable threshold/status semantics and KPI cross-surface comparability
- `@hbc/ai-assist`
  - inline benchmark actions with citation, approval, and governed no-bid rationale draft pipeline
- SF22 post-bid learning loop
  - completed autopsies enrich benchmark datasets and emit recalibration/predictive-drift input signals

---

## Boundary Rules

- no raw pursuit detail exposure through benchmark adapter APIs
- benchmark primitive does not own domain outcome writes; it consumes published outcome streams
- BD adapter does not duplicate primitive scoring, recommendation, or governance engines
- all integrations consume public contracts only and remain app-shell-safe
- no-bid rationale artifacts are immutable/governed records, not transient UI notes

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- integrations
pnpm --filter @hbc/score-benchmark test -- integrations
rg -n "from 'apps/" packages/features/business-development/src packages/score-benchmark/src
```
