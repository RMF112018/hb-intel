# PH7-SF-27: Bulk Actions — Shared Multi-Select Action Framework for Work Queues & Record Tables

**Priority Tier:** 2 — Application Layer (shared package; cross-module operational utility)
**Module:** Platform / Shared Infrastructure (cross-module)
**Interview Decision:** Addendum A — Recommended package candidate (not yet interview-locked)
**Mold Breaker Source:** UX-MB §4 (Universal Next Move); con-tech §13 (Attention Management)

---

## Problem Solved

Across HB Intel, users will repeatedly need to act on more than one record at a time:

- assign multiple records
- acknowledge multiple items
- publish or export a selected set
- move multiple notifications to done
- change status on a queue subset
- apply routing, tags, or ownership in bulk
- archive or close records that share the same operational outcome

Without a shared bulk-action framework, every module that introduces a queue or large table will invent its own approach to selection, eligibility checking, confirmation, execution, and result reporting. The consequences are predictable:

- inconsistent multi-select UX
- poor feedback on which records were eligible vs skipped
- duplicated confirmation dialogs and mutation logic
- inconsistent “select all filtered” behavior
- operational risk when users cannot clearly see what will happen before running a mass action

The **Bulk Actions** package is the shared framework that standardizes how the platform selects many records, validates eligibility, executes actions, and reports mixed outcomes.

---

## Mold Breaker Rationale

The Universal Next Move principle says the system should help the user advance work efficiently. Attention Management says the platform should reduce repetitive friction and let users process work in focused batches rather than one record at a time where that is operationally unnecessary.

`@hbc/bulk-actions` applies those ideas to queue-heavy workflows:

1. It makes common operational actions scalable.
2. It reduces repetitive clicks and context switching.
3. It creates predictable confirmation and error-reporting patterns.
4. It allows modules to define what a bulk action means without rewriting the multi-select machinery each time.

The package should not assume that every action will succeed uniformly. A hallmark of good bulk processing is clear reporting when some records succeed, some fail, and some were never eligible to begin with.

---

## Bulk Action Model

The package should separate four concerns:

### 1. Selection
- current page selection
- select all visible
- select all filtered dataset
- clear selection

### 2. Eligibility Evaluation
For each record:
- eligible
- ineligible with reason
- requires elevated permission
- requires confirmation because it is destructive or externally visible

### 3. Execution
- run one action against many items
- allow batching where API/storage constraints require it
- track per-item result, not just overall result

### 4. Result Reporting
- success count
- skipped count with reasons
- failed count with reasons
- optional follow-up next move links

---

## Bulk Action Structure

The package should support two operational patterns:

### Pattern A — Immediate Bulk Action
For:
- mark complete
- assign owner
- change status
- acknowledge
- archive / restore

### Pattern B — Configured Bulk Action
For:
- publish selected items
- export selected rows
- apply workflow handoff
- mass tag / route / categorize
- actions requiring a small input form before execution

Configured bulk actions should open a shared confirmation/input surface before execution.

---

## Interface Contract

```typescript
export type BulkActionExecutionStatus = 'pending' | 'running' | 'complete' | 'failed';

export interface IBulkActionItemRef {
  id: string;
  label?: string;
  moduleKey: string;
}

export interface IBulkEligibilityResult {
  itemId: string;
  eligible: boolean;
  reason?: string;
}

export interface IBulkActionContext {
  actionKey: string;
  currentUserId: string;
  workspaceKey: string;
  selectedCount: number;
}

export interface IBulkActionDefinition<TInput = unknown> {
  key: string;
  label: string;
  description?: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  requiresInput?: boolean;
  evaluateEligibility: (
    items: IBulkActionItemRef[],
    context: IBulkActionContext
  ) => Promise<IBulkEligibilityResult[]>;
  execute: (
    items: IBulkActionItemRef[],
    input: TInput | undefined,
    context: IBulkActionContext
  ) => Promise<IBulkActionExecutionResult>;
}

export interface IBulkActionExecutionResult {
  status: BulkActionExecutionStatus;
  succeededItemIds: string[];
  failed: { itemId: string; reason: string }[];
  skipped: { itemId: string; reason: string }[];
  message?: string;
}
```

---

## Component Architecture

```
packages/bulk-actions/src/
├── components/
│   ├── BulkSelectionBar.tsx            # appears when one or more items are selected
│   ├── BulkActionMenu.tsx              # available actions for selected items
│   ├── BulkActionConfirmDialog.tsx     # confirmation / warning / summary before execute
│   ├── BulkActionInputDialog.tsx       # small form for configured actions
│   ├── BulkActionResultsPanel.tsx      # mixed outcome reporting after execution
│   └── SelectAllFilteredBanner.tsx     # indicates whether scope is page-only or filtered-set
├── hooks/
│   ├── useBulkSelection.ts             # selection state and select-all logic
│   ├── useBulkActions.ts               # eligibility + execution orchestration
│   └── useBulkActionResults.ts
├── adapters/
│   ├── tableSelectionAdapter.ts
│   └── queueSelectionAdapter.ts
├── types.ts
└── index.ts
```

---

## Component Specifications

### `BulkSelectionBar` — Shared Multi-Select Command Surface

```typescript
interface BulkSelectionBarProps {
  selectedCount: number;
  totalFilteredCount?: number;
  onClearSelection: () => void;
}
```

**Visual behavior:**
- appears consistently whenever one or more rows are selected
- states whether the user selected specific rows or all filtered records
- surfaces the currently available bulk actions without requiring deep navigation
- keeps high-risk actions visually distinct

### `BulkActionConfirmDialog` — Pre-Execution Truth Surface

Shows:
- action label and description
- selected count
- eligible vs ineligible count
- destructive warning if applicable
- whether execution applies only to selected rows or the filtered data set

The user should know exactly what will happen before the action runs.

### `BulkActionInputDialog` — Shared Parameter Capture

Supports lightweight action inputs such as:
- assignee
- status target
- due date
- publish target
- tag or category
- export format

This prevents every module from inventing a custom mini-form for bulk actions that require a small amount of user input.

### `BulkActionResultsPanel` — Mixed Outcome Reporting

Shows:
- count succeeded
- count skipped and why
- count failed and why
- optional links to view affected records or rerun on failures

This is critical because operational batch actions rarely have uniform outcomes.

---

## Select-All Semantics

The package must clearly distinguish:

- **selected rows on current page**
- **all currently filtered rows across the workspace**
- **all rows in the underlying dataset** (usually disallowed unless explicitly supported)

This matters for safety. A user who intends to act on 20 visible rows should not accidentally affect 2,000 filtered rows without an explicit state change and confirmation.

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/ui-kit` | selection bars, menus, dialogs, results panels |
| `@hbc/saved-views` | active filters/views define the selection universe |
| `@hbc/bic-next-move` | bulk assignment and ownership changes |
| `@hbc/notification-intelligence` | optional downstream notifications from bulk actions |
| `@hbc/publish-workflow` | publish selected items or records in controlled bulk flows |
| `@hbc/activity-timeline` | emit per-item action events where appropriate |
| `@hbc/auth` | permission checks for high-impact actions |
| table/grid abstractions | source of selection state and filtered counts |

---

## Expected Consumers

- notification and work-item queues
- Business Development lists and pursuit work surfaces
- Estimating issue / task / benchmark queues
- Project Hub logs, action lists, and review queues
- Admin governance/configuration tables
- future staffing, scheduler, and quality workflows

---

## Priority & ROI

**Priority:** P2 — implement once queue-heavy modules and major shared table patterns are active  
**Estimated build effort:** 3–4 sprint-weeks (selection layer, action contracts, confirm/input/results surfaces, filtered-set semantics, mixed-result reporting)  
**ROI:** major productivity improvement for operational users, fewer repetitive clicks, safer mass actions, and strong reduction in duplicated queue-action plumbing across modules

---

## Definition of Done

- [ ] bulk action contracts and eligibility model defined
- [ ] shared selection state hook implemented
- [ ] page selection vs filtered-set selection behavior implemented and clearly surfaced
- [ ] shared selection bar and action menu implemented
- [ ] confirm dialog implemented with eligibility summary
- [ ] input dialog implemented for parameterized actions
- [ ] mixed outcome results panel implemented
- [ ] permission and destructive-action warnings supported
- [ ] event emission hook available for timeline tracking
- [ ] first module integration proven with at least one immediate and one configured bulk action
- [ ] unit tests on selection semantics, eligibility resolution, execution batching, and result reporting
- [ ] E2E test: select filtered records → run bulk status change → see mixed success/failure report

---

## ADR Reference

Create `docs/architecture/adr/0036-bulk-actions.md` documenting the selection semantics, per-item eligibility/result contract, the distinction between immediate and configured bulk actions, and the rationale for centralizing queue-scale action handling as a shared platform package.
