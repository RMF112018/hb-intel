# Prompt 02 — Build Feed Queue, Slots, and Inspector

## Objective

Build the default `Feed Desk` workspace as the real daily operating surface.

The Feed Desk must contain:

- Feed Slots summary
- Editorial Queue
- Feed Inspector panel

## Files to Inspect

- `ContentOperationsWorkspace.tsx`
- `ContentInbox.tsx`
- `LaneBoard.tsx`
- `ContextualWorkflowPanel.tsx`
- `ManageContentEditorPanel.tsx`
- `ManagePlacementPanel.tsx`
- `foleon-management.types.ts`
- `manageLaneViewModel.ts`
- `contentInboxViewModel.ts`
- `managerOperationsViewModel.ts`

## Files to Add

- `FeedDeskWorkspace.tsx`
- `FeedSlotsSummary.tsx`
- `EditorialQueue.tsx`
- `FeedInspectorPanel.tsx`
- `feedDeskViewModel.ts`
- `feedSlotsViewModel.ts`
- `editorialQueueViewModel.ts`
- `feedInspectorViewModel.ts`

## Files to Retire

- `ContentOperationsWorkspace.tsx`
- `ContentInbox.tsx`
- `LaneBoard.tsx`

Retire only after replacement coverage is proven.

## Required Structure

```text
FeedDeskWorkspace
├── FeedSetupCallout
├── FeedSlotsSummary
├── EditorialQueue
└── FeedInspectorPanel
```

## Feed Slots

Slots:

- Project Spotlight
- Company Pulse
- Leadership Message

Each slot shows:

- live item,
- next scheduled/staged item,
- status,
- display window,
- blockers,
- next action.

## Editorial Queue

Desktop row columns:

- Status
- Title
- Feed
- Display window
- Readiness
- Action

Queue filters:

- All
- Needs attention
- Unassigned
- Ready
- Scheduled
- Live
- Archived/Expired if derivable

## Inspector

Inspector sections:

1. Selected content summary
2. Readiness / blockers
3. Placement
4. Schedule
5. Preview
6. Publish / Activate

On wide screens, inspector is persistent right-side panel. On smaller screens, drawer behavior is acceptable.

## Guardrails

- Do not separate lane placement into a top-level workspace.
- Do not render empty buckets as the main object.
- No fake data.
- Preserve existing editor and placement logic if reusable, but place them inside the inspector.

## Tests

- Feed slots render in Feed Desk.
- Queue renders as list/table.
- Selecting a row shows inspector.
- Empty state gives setup/sync guidance.
- OAuth blocked state gives admin next step.

## Commit Message

`SPFx Foleon Manager: build feed desk queue slots and inspector`

