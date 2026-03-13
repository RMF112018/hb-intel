# SF27-T08 - Testing Strategy: Bulk Actions

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-27-Shared-Feature-Bulk-Actions.md`
**Decisions Applied:** All L-01 through L-10
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T01-T07

> **Doc Classification:** Canonical Normative Plan - SF27-T08 testing task; sub-plan of `SF27-Bulk-Actions.md`.

---

## Objective

Define fixture exports and scenario matrix for selection truth, eligibility, destructive warnings, configured-input validation, chunked execution, mixed-result reporting, and current table/list seam compatibility.

---

## Testing Exports

Primitive (`@hbc/bulk-actions/testing`):

- `createMockBulkActionItemRef(overrides?)`
- `createMockSelectionSnapshot(overrides?)`
- `createMockEligibilityResult(overrides?)`
- `createMockExecutionResult(overrides?)`
- `createMockBulkActionDefinition(overrides?)`
- `mockBulkGroupedFailureReasons`

Canonical scenarios:

1. page-only selection
2. visible selection
3. explicit filtered-set escalation with exact filtered count
4. mixed eligibility across selected items
5. destructive immediate action with elevated warning
6. configured action with validated input payload
7. permission-blocked action
8. chunked execution with partial success
9. retryable failure subset
10. grouped failure reason patterns in results
11. `HbcDataTable` row-selection integration
12. `ListLayout` bulk-bar host integration

---

## Unit Tests

- scope snapshot capture and scope mismatch guards
- eligibility reason-code mapping
- grouped reason aggregation
- chunk planning and deterministic execution ordering
- retry subset selection logic
- telemetry schema validation

---

## Hook and UI Tests

- hook transitions across idle/evaluating/confirming/running/partial/complete/failed
- clear page vs filtered scope messaging in selection and confirm surfaces
- configured-input validation and submission behavior
- results panel mixed-success rendering and retry affordances
- destructive warning and permission suppression rendering

---

## Storybook and Playwright

Storybook matrix:

- page vs visible vs filtered scope
- immediate vs configured actions
- destructive vs non-destructive actions
- full success vs partial vs failed result sets

Playwright flow:

1. select rows in a table
2. escalate to filtered-set selection
3. open configured bulk action
4. confirm exact count and warning language
5. execute chunked action
6. verify mixed-result reporting and retry flow

---

## Quality Gates

- lines >= 95
- branches >= 95
- functions >= 95
- statements >= 95

---

## Verification Commands

```bash
pnpm --filter @hbc/bulk-actions test --coverage
pnpm --filter @hbc/ui-kit test -- BulkSelectionBar
pnpm --filter @hbc/ui-kit test -- BulkActionResultsPanel
```
