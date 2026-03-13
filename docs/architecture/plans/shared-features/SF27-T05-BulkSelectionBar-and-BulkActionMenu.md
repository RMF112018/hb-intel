# SF27-T05 - BulkSelectionBar and BulkActionMenu

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-27-Shared-Feature-Bulk-Actions.md`
**Decisions Applied:** L-02, L-03, L-04, L-06, L-07, L-08, L-09
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T02-T04

> **Doc Classification:** Canonical Normative Plan - SF27-T05 UI surface task; sub-plan of `SF27-Bulk-Actions.md`.

---

## Objective

Define reusable selection-bar and action-menu surfaces in `@hbc/ui-kit` for active selection state, action availability, scope disclosure, and intent-safe action access.

---

## `BulkSelectionBar`

Behavior:

- appears whenever one or more items are selected
- states selected count and current selection scope clearly
- exposes clear-selection behavior consistently
- surfaces escalation path from page/visible selection to filtered selection when supported

Explainability requirements:

- must make `page`, `visible`, and `filtered` distinctions explicit
- must show exact count truth, not approximate wording
- must make it clear when the current scope is not the whole filtered set

---

## `BulkActionMenu`

Behavior:

- lists available actions for the current selection scope
- distinguishes immediate from configured actions
- visually differentiates destructive actions
- suppresses or disables unavailable actions with visible reasons

Trust requirements:

- action availability must reflect per-item eligibility summaries and permission state, not only selection count
- destructive and externally visible actions must carry stronger affordance language before the user reaches confirmation

---

## `SelectAllFilteredBanner`

Behavior:

- appears when the user can escalate from page/visible selection to filtered-set selection
- states exact filtered-set count before escalation
- allows reverting back to the narrower scope

The banner exists to prevent accidental “I thought this was only the current page” failures.

---

## UI Ownership Rule

`BulkSelectionBar`, `BulkActionMenu`, and `SelectAllFilteredBanner` are reusable visual surfaces and therefore belong in `@hbc/ui-kit`.
`@hbc/bulk-actions` supplies only runtime contracts, selectors, and composition state required to drive them.

---

## Verification Commands

```bash
pnpm --filter @hbc/ui-kit check-types
pnpm --filter @hbc/ui-kit test -- BulkSelectionBar
pnpm --filter @hbc/ui-kit test -- BulkActionMenu
pnpm --filter @hbc/ui-kit test -- SelectAllFilteredBanner
```
