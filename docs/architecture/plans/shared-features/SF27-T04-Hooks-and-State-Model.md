# SF27-T04 - Hooks and State Model: Bulk Actions

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-27-Shared-Feature-Bulk-Actions.md`
**Decisions Applied:** L-01 through L-10
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan - SF27-T04 hooks/state task; sub-plan of `SF27-Bulk-Actions.md`.

---

## Objective

Define primitive hooks and derived state for selection truth, eligibility, execution orchestration, results, and telemetry without duplicating bulk-action logic in tables or consuming modules.

---

## Hooks to Define

- `useBulkSelection()`
  - canonical selection state and clear/reset behavior
- `useBulkActionEligibility()`
  - per-item eligibility evaluation and grouped eligibility summaries
- `useBulkActionExecution()`
  - chunk planning, running state, retry handling, and final aggregation
- `useBulkActionResults()`
  - grouped reason summaries, drill-down references, and result-state interpretation
- `useBulkActionScope()`
  - page/visible/filtered scope escalation and snapshot capture
- `useBulkActionTelemetry()`
  - usage, cancellation, partial-success, and retry instrumentation hooks

---

## Cache and State Keys

- `['bulk-actions', 'selection', scopeKey]`
- `['bulk-actions', 'eligibility', actionKey, scopeKey]`
- `['bulk-actions', 'execution', actionKey, runKey]`
- `['bulk-actions', 'results', actionKey, runKey]`

---

## Derived State Requirements

Primitive state must derive:

- exact selected/attempted count state
- current scope label and scope warning state
- grouped eligibility summaries
- destructive/external visibility warning state
- grouped failure reason summaries
- retryable subset state
- action availability and suppression reasons

These derived fields are mandatory so every consuming surface does not invent its own bulk-action interpretation locally.

---

## Adapter Boundary Rules

- selection-source adapters map current table/list state into the primitive selection contract only
- adapters must not recompute scope truth, execution phase, grouped results, or warning logic outside primitive selectors
- action definitions may contribute action-specific messages and chunk sizing, but the execution engine remains primitive-owned

---

## State Guarantees

- stable return shape across idle/evaluating/confirming/running/partial/complete/failed phases
- explicit distinction between intent, attempted count, and actual result count
- no contradictory “all selected” messaging when only page or visible selection is active
- no hidden assumption that skipped items were attempted successfully

---

## Verification Commands

```bash
pnpm --filter @hbc/bulk-actions check-types
pnpm --filter @hbc/bulk-actions test -- hooks
pnpm --filter @hbc/bulk-actions test -- telemetry
```
