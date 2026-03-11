# SF18-T03 - Readiness Model and Configuration

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-18-Module-Feature-Estimating-Bid-Readiness.md`
**Decisions Applied:** D-02 through D-06
**Estimated Effort:** 0.85 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan - SF18-T03 model/config task; sub-plan of `SF18-Estimating-Bid-Readiness.md`.

---

## Objective

Define deterministic scoring, blocker precedence, status classification, and admin override config merge behavior.

---

## Scoring and Classification

- evaluate all criteria against the pursuit snapshot
- compute weighted score from completed criteria (`sum(weight of complete criteria) * 100`)
- normalize score to integer `0..100`
- identify incomplete blockers (`criterion.isBlocker && !isComplete`)

Status mapping:

- `ready-to-bid`: score `>= readyMinScore` and no incomplete blockers and not overdue
- `nearly-ready`: score `>= nearlyReadyMinScore` and no incomplete blockers
- `attention-needed`: score `>= attentionNeededMinScore` or any incomplete blocker
- `not-ready`: below attention threshold or critical blocker gap

Due-date adjustment:

- compute `daysUntilDue` from pursuit deadline
- set `isOverdue` if due date is in the past
- overdue state cannot classify above `attention-needed`

---

## Configuration Model

- default config provides the six baseline criteria and threshold policy
- admin override may:
  - change weights,
  - toggle `isBlocker`,
  - add custom criteria,
  - set `tradeCoverageThreshold`
- merge order: default baseline -> admin override
- validation rules:
  - weights must be non-negative
  - total effective weights must equal 1 after normalization
  - threshold ordering must be descending (`ready > nearly > attention`)

---

## Persistence/API Contract

`BidReadinessConfigApi` methods:

- `getConfig()`
- `upsertConfig(config)`
- `resetToDefault()`

Config writes are auditable and owned by admin roles.

---

## Verification Commands

```bash
pnpm --filter @hbc/features-estimating test -- computeBidReadiness
pnpm --filter @hbc/features-estimating test -- mergeBidReadinessConfig
```
