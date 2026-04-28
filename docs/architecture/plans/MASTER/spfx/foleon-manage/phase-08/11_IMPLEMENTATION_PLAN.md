# 11 — Implementation Plan

## Phase 1 — Stop the Current IA

1. Create `FeedManagerWorkspaceKey` with `feed-desk | schedule | preview | admin`.
2. Replace current primary nav labels and behavior.
3. Remove `Lane Board` as a top-level nav entry.
4. Move lane/slot information into Feed Desk.
5. Rename shell components to product-aligned names.

Likely new files:

- `FoleonFeedManagerApp.tsx`
- `FeedManagerHeader.tsx`
- `FeedManagerNav.tsx`
- `FeedDeskWorkspace.tsx`
- `FeedSlotsSummary.tsx`
- `EditorialQueue.tsx`
- `FeedInspectorPanel.tsx`
- `ScheduleWorkspace.tsx`
- `PreviewWorkspace.tsx`
- `AdminWorkspace.tsx`

## Phase 2 — Build View Models

Add:

- `feedDeskViewModel.ts`
- `editorialQueueViewModel.ts`
- `feedSlotsViewModel.ts`
- `scheduleViewModel.ts`
- `previewViewModel.ts`

Mapping must be pure and tested.

## Phase 3 — Build Feed Desk

1. Header with one primary action.
2. Setup/blocked callout.
3. Feed Slots summary.
4. Editorial Queue table/list.
5. Inspector panel.
6. Search/filter/sort.

## Phase 4 — Build Schedule

Start with list/table, not calendar.

Groups:

- Active now
- Upcoming
- Missing window
- Expired
- Blocked

## Phase 5 — Build Preview

If governed preview route exists, use it. If not, render a product-grade blocked state:

- reason,
- owner,
- next action,
- Open Foleon,
- Open Admin.

## Phase 6 — Keep Admin Separate

Wrap existing `FoleonConfigTab` inside `AdminWorkspace` initially. Do not let Admin structure leak into Feed Desk.

## Phase 7 — CSS Purge

1. Remove `.panel` from top-level sections.
2. Delete legacy classes only after grep.
3. Split CSS if feasible.
4. Validate 100%, 75%, narrow, short-height.

## Phase 8 — Version / Package

Bump to next package version because this is a material hosted UI change.

