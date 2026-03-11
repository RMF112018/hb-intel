# SF19-T07 - Reference Integrations

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T03-T06

> **Doc Classification:** Canonical Normative Plan - SF19-T07 integration task; sub-plan of `SF19-BD-Score-Benchmark.md`.

---

## Objective

Provide boundary-safe integration contracts across the SF19 BD adapter, the `@hbc/score-benchmark` primitive, and dependent Tier-1 primitives.

---

## Integration Contracts

- `@hbc/score-benchmark`
  - canonical benchmark computation/state/filter/version/telemetry contracts
- `@hbc/bic-next-move`
  - per-criterion gap ownership, blockers-first sequencing, avatar projection
- `@hbc/complexity`
  - controls Essential/Standard/Expert benchmark surface behavior
- `@hbc/versioned-record`
  - immutable provenance, audit history, snapshot freeze, and offline replay
- `@hbc/related-items`
  - criterion-level deep-links for direct remediation actions
- `@hbc/project-canvas`
  - auto placement of actionable benchmark gaps in role-aware My Work lane
- `@hbc/notification-intelligence`
  - urgency-aware alerts for critical benchmark regressions and overdue gap closures
- `@hbc/health-indicator`
  - interoperable threshold/status semantics and KPI cross-surface comparability (SF18 alignment)
- `@hbc/ai-assist`
  - inline benchmark actions with citation, approval, and BIC auto-creation pipeline
- SF22 post-bid learning loop
  - completed autopsies enrich benchmark datasets for subsequent recompute cycles

---

## Boundary Rules

- no raw pursuit detail exposure through benchmark adapter APIs
- benchmark primitive does not own domain outcome writes; it consumes published outcome streams
- BD adapter does not duplicate primitive scoring engine
- all integrations consume public contracts only and remain app-shell-safe

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- integrations
pnpm --filter @hbc/score-benchmark test -- integrations
rg -n "from 'apps/" packages/features/business-development/src packages/score-benchmark/src
```
