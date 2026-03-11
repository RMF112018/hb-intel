# SF19-T07 - Reference Integrations

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Decisions Applied:** D-07 through D-09
**Estimated Effort:** 0.65 sprint-weeks
**Depends On:** T03-T06

> **Doc Classification:** Canonical Normative Plan - SF19-T07 integration task; sub-plan of `SF19-BD-Score-Benchmark.md`.

---

## Objective

Provide boundary-safe integration patterns across shared features and outcome data pipelines.

---

## Integration Contracts

- `@hbc/data-seeding`
  - seeded historical outcomes immediately populate benchmark aggregates
- `@hbc/versioned-record`
  - closed scorecard outcomes feed aggregation source stream
- `@hbc/ai-assist`
  - risk-assessment action may consume benchmark summary context (read-only)
- `@hbc/complexity`
  - controls hidden/summary/full overlay behavior by tier
- SF22 post-bid learning loop
  - completed autopsies enrich outcome dataset for next aggregation cycle

---

## Boundary Rules

- no raw pursuit detail exposure through benchmark overlay APIs
- benchmark package does not own outcome writes; it consumes published outcomes
- AI assist integration remains optional and consumes stable summary contracts only

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- integrations
rg -n "from 'apps/" packages/features/business-development/src
```
