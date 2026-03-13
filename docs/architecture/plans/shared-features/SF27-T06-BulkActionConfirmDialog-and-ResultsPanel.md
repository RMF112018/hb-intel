# SF27-T06 - BulkActionConfirmDialog and ResultsPanel

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-27-Shared-Feature-Bulk-Actions.md`
**Decisions Applied:** L-04 through L-10
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T02-T05

> **Doc Classification:** Canonical Normative Plan - SF27-T06 confirm/results UI task; sub-plan of `SF27-Bulk-Actions.md`.

---

## Objective

Define reusable confirm, input, and results surfaces that make selection truth, safety warnings, eligibility summaries, and mixed outcomes explicit before and after bulk execution.

---

## `BulkActionConfirmDialog`

Behavior:

- displays action label, action description, exact attempted count, and current scope
- summarizes eligible, ineligible, permission-blocked, warning-gated, and retryable counts where applicable
- highlights destructive or externally visible warnings prominently

Trust requirements:

- users must know exactly what will happen before execution
- page vs visible vs filtered distinctions must remain visible in the dialog
- if execution is chunked, the dialog may explain that execution occurs in batches without implying rollback

---

## `BulkActionInputDialog`

Behavior:

- captures lightweight parameters for configured actions
- preserves selected scope and count while collecting input
- validates action-specific payload before allowing final confirmation

It exists so modules do not invent one-off mini-forms for batch operations.

---

## `BulkActionResultsPanel`

Behavior:

- shows succeeded count, skipped count, failed count, and retryable count
- groups repeated reason patterns to reduce noise
- preserves drill-down references to affected items where policy allows
- exposes retry actions scoped to failed/retryable subsets

Mixed-result requirements:

- mixed results are the primary design case, not an exception
- skipped items must remain visible and explainable
- success summaries must not imply that skipped or failed items also succeeded

---

## UI Ownership Rule

`BulkActionConfirmDialog`, `BulkActionInputDialog`, and `BulkActionResultsPanel` are reusable visual surfaces and belong in `@hbc/ui-kit`.
`@hbc/bulk-actions` remains responsible for confirm-state logic, input schemas, result grouping, and retry semantics.

---

## Verification Commands

```bash
pnpm --filter @hbc/ui-kit check-types
pnpm --filter @hbc/ui-kit test -- BulkActionConfirmDialog
pnpm --filter @hbc/ui-kit test -- BulkActionResultsPanel
```
