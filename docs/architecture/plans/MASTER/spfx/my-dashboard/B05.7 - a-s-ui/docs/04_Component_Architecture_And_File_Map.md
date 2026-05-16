# 04 — Component Architecture and File Map

## Architecture Goal

Keep the **shared My Work card shell generic** while building a **local Adobe-specific card composition system** that is substantial enough to meet flagship quality without prematurely promoting Adobe-only primitives into shared UI-kit territory.

## Files to Modify

### Shared layout cleanup

```text
apps/my-dashboard/src/layout/MyWorkBentoGrid.module.css
apps/my-dashboard/src/layout/MyWorkCard.tsx
apps/my-dashboard/src/layout/MyWorkCard.module.css
apps/my-dashboard/src/layout/MyWorkCard.test.tsx
```

### Adobe module implementation

```text
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx
apps/my-dashboard/src/modules/adobeSign/useAdobeSignRecentCompletionsReadModel.ts
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.test.tsx
apps/my-dashboard/src/modules/adobeSign/useAdobeSignRecentCompletionsReadModel.test.tsx
```

### View-model copy/summary helpers

```text
apps/my-dashboard/src/state/myWorkCardViewModel.ts
```

## Files to Create

```text
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.module.css
apps/my-dashboard/src/modules/adobeSign/AdobeSignViewSwitch.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignStatusRail.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignActivityRow.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignActivityList.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignStatePanel.tsx
```

## Component Responsibilities

### `AdobeSignActionQueueCard.tsx`

Remains the card orchestrator:

- consumes queue state;
- consumes Completed hook;
- resolves active view;
- composes subcomponents;
- passes correct state/copy/data;
- stamps stable data markers for tests/evidence.

### `AdobeSignViewSwitch.tsx`

Owns:

- `Action Queue` / `Completed` switching UI;
- manual tab activation semantics;
- roving focus;
- keyboard navigation;
- view-switch data attributes.

### `AdobeSignStatusRail.tsx`

Owns:

- visible status chip;
- freshness label;
- active-view contextual state display.

### `AdobeSignActivityRow.tsx`

Owns one activity row:

- title;
- metadata presentation;
- explicit row action;
- link rendering only when URL exists.

It must support:

- `variant="queue"`
- `variant="completed"`

### `AdobeSignActivityList.tsx`

Owns:

- list semantics;
- row mapping;
- list dividers/spacing;
- preview-limit context line when applicable.

### `AdobeSignStatePanel.tsx`

Owns authored states:

- loading;
- empty;
- degraded;
- authorization/configuration/principal state bodies;
- Retry slot for Completed lazy-fetch error states;
- CTA slot for Connect flow states.

## Shared Layout Decisions

### `MyWorkBentoGrid.module.css`

Add a top-alignment rule that prevents short companion cards from stretching purely to match a taller sibling.

The exact final CSS should be selected by repo truth, but the target outcome is locked:

- Adobe card height follows authored content;
- My Projects may remain taller;
- no low-value empty right column.

### `MyWorkCard.tsx`

Remove:

```ts
titleContent?: ReactNode
```

and restore card title rendering to:

```tsx
{title}
```

because the Adobe view switch is no longer embedded in the heading.

### `MyWorkCard.module.css`

Remove:

- Adobe-specific classes;
- heading flex rules added only to support inline title toggles, if no longer needed.

Keep shared card shell styling generic.

## View-Model Decisions

Enhance `myWorkCardViewModel.ts` only where pure view-model shaping is appropriate:

- summary preview-context label selectors;
- view-specific completed degradation copy if needed;
- metadata fallback formatting helpers where logic belongs in the selector rather than React rendering.

Do not move card layout logic into the view-model file.

## Hook Decision

Enhance `useAdobeSignRecentCompletionsReadModel.ts` with a **card-local retry method**.

Suggested target state shape:

```ts
export interface AdobeSignRecentCompletionsReadModelState {
  readonly status: AdobeSignRecentCompletionsRequestStatus;
  readonly envelope?: MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel>;
  readonly error?: unknown;
  readonly hasFetched: boolean;
  readonly retry: () => void;
}
```

The exact internal implementation may use:

- retry counter state;
- resetting the request guard;
- reissuing the existing request.

Do not alter backend contract semantics.

## Data Markers to Preserve or Add

Preserve current useful markers where practical, including:

```text
data-my-work-card-role="adobe-sign-action-queue"
data-adobe-sign-active-view
data-adobe-sign-completed-panel-state
data-adobe-sign-completed-item
data-my-work-agreement-item
```

Add new markers where helpful for evidence/tests, such as:

```text
data-adobe-sign-view-switch
data-adobe-sign-status-chip
data-adobe-sign-freshness
data-adobe-sign-activity-list
data-adobe-sign-activity-row
data-adobe-sign-row-open-action
data-adobe-sign-preview-context
data-adobe-sign-layout-mode
data-adobe-sign-completed-retry
```

## Non-Goals

Do not:

- create shared UI-kit components;
- add new dependencies;
- add a drawer/detail panel;
- add generic Adobe Sign footer navigation without a truthful known URL;
- alter backend read-model contracts.
