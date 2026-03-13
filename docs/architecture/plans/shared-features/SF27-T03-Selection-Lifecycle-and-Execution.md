# SF27-T03 - Selection Lifecycle and Execution: Bulk Actions

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-27-Shared-Feature-Bulk-Actions.md`
**Decisions Applied:** L-03 through L-10
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan - SF27-T03 lifecycle/execution task; sub-plan of `SF27-Bulk-Actions.md`.

---

## Objective

Define deterministic selection, scope escalation, eligibility evaluation, confirmation, chunked execution, retry, and result aggregation behavior without ambiguous scope inference or hidden rollback assumptions.

---

## Lifecycle Contract

- bulk action lifecycle is `select -> scope escalate -> evaluate -> confirm/input -> chunk execute -> aggregate -> report`
- selection-source adapters provide selected ids and counts only; scope truth remains primitive-owned
- `select all filtered` requires an explicit user step and captures a stable snapshot of filters/views plus exact filtered count
- immediate and configured actions share the same execution lifecycle after input capture
- result reporting must distinguish complete success, partial success, and failed execution states

---

## Scope and Selection Safety Contract

- `page` scope applies only to the currently selected rows on the current page
- `visible` scope applies only to the current visible result set in the current rendered table/list context
- `filtered` scope applies to all rows matching the captured filter/view snapshot
- implicit whole-dataset selection is disallowed by default
- if a consumer needs whole-dataset semantics later, it must declare them explicitly and add an extra confirmation path in a future ADR-governed enhancement

---

## Eligibility and Confirmation Contract

- eligibility is evaluated per item before destructive or externally visible execution
- confirmation surfaces must show:
  - exact attempted count
  - current scope
  - eligible vs ineligible counts
  - permission-blocked counts
  - destructive and externally visible warnings where applicable
- configured actions collect input before the final execution confirmation step

---

## Execution Contract

- actions expose `evaluateEligibility()` and `executeChunk()` separately
- default execution is chunked and non-optimistic
- chunk sizing defaults are primitive-owned and may be overridden by the action definition where justified
- partial success is the default result posture
- rollback is never implied unless an action explicitly declares transactional semantics

---

## Retry and Aggregation Contract

- retry actions target failed or retryable subsets only by default
- skipped items remain skipped unless eligibility changes
- grouped reason patterns are computed after per-item results are known
- progress state must distinguish evaluation, confirmation, running, and final result phases

---

## Governance Contract

- execution intent must be distinguishable from actual results
- result aggregation must preserve per-item evidence for audit or troubleshooting use
- future event emission seams may attach per-item records, but SF27 MVP must not require `@hbc/activity-timeline` or `@hbc/publish-workflow`

---

## Verification Commands

```bash
pnpm --filter @hbc/bulk-actions check-types
pnpm --filter @hbc/bulk-actions test -- selection
pnpm --filter @hbc/bulk-actions test -- execution
```
