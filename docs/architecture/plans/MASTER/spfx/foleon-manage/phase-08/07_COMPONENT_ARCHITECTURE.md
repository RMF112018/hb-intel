# 07 — Component Architecture

## Replace Current Manage Architecture

Retire or replace the current component chain:

- `ManageOperationsShell`
- `CommandHeader`
- `StatusSummaryStrip`
- `RecommendedNextActionBand`
- `ContentOperationsWorkspace`
- `ContentInbox`
- `LaneBoard`
- `ManagerPrimaryNav` as currently modeled

Do not preserve them as wrappers unless a specific subcomponent remains useful after renaming and repurposing.

## New Component Tree

```text
ManageOrchestrator
└── FoleonFeedManagerApp
    ├── FeedManagerHeader
    │   ├── SystemReadinessPillGroup
    │   ├── PrimaryActionButton
    │   └── UtilityMenu
    ├── FeedManagerNav
    │   ├── Feed Desk
    │   ├── Schedule
    │   ├── Preview
    │   └── Admin
    ├── FeedDeskWorkspace
    │   ├── FeedSetupCallout
    │   ├── FeedSlotsSummary
    │   │   ├── FeedSlotCard(Project Spotlight)
    │   │   ├── FeedSlotCard(Company Pulse)
    │   │   └── FeedSlotCard(Leadership Message)
    │   ├── EditorialQueue
    │   │   ├── QueueToolbar
    │   │   ├── QueueStatusFilters
    │   │   └── QueueTable / QueueList
    │   └── FeedInspectorPanel
    │       ├── ContentSummary
    │       ├── ReadinessPanel
    │       ├── PlacementEditor
    │       ├── ScheduleEditor
    │       ├── PreviewActions
    │       └── PublishActions
    ├── ScheduleWorkspace
    │   ├── ScheduleFilters
    │   └── PlacementScheduleList
    ├── PreviewWorkspace
    │   ├── PreviewSelector
    │   ├── PreviewBlockedState / PreviewFrame
    │   └── PreviewActions
    └── AdminWorkspace
        └── FoleonConfigTab or refactored AdminConfigContent
```

## New View Models

Add:

- `feedDeskViewModel.ts`
- `feedSlotsViewModel.ts`
- `editorialQueueViewModel.ts`
- `feedInspectorViewModel.ts`
- `scheduleViewModel.ts`
- `previewViewModel.ts`

## Core Types

```ts
type FeedManagerWorkspaceKey = 'feed-desk' | 'schedule' | 'preview' | 'admin';

type FeedChannelKey = 'project-spotlight' | 'company-pulse' | 'leadership-message';

type EditorialQueueStatus =
  | 'needs-attention'
  | 'unassigned'
  | 'ready'
  | 'scheduled'
  | 'live'
  | 'expired'
  | 'archived';

interface EditorialQueueItem {
  id: string;
  title: string;
  foleonDocId: number;
  channel: FeedChannelKey | null;
  status: EditorialQueueStatus;
  readiness: 'ready' | 'needs-review' | 'blocked';
  displayWindowLabel: string;
  publishedUrl?: string;
  thumbnailUrl?: string;
  primaryAction: 'assign' | 'schedule' | 'validate' | 'preview' | 'activate' | 'open';
  blockers: readonly string[];
}

interface FeedSlotViewModel {
  channel: FeedChannelKey;
  label: string;
  liveItem: EditorialQueueItem | null;
  nextItem: EditorialQueueItem | null;
  status: 'empty' | 'live' | 'scheduled' | 'blocked';
  nextActionLabel: string;
  blockers: readonly string[];
}
```

## Keep Existing Security/API Services

Do not alter:

- `FoleonManagementApi`
- backend routes
- auth middleware
- safe-config gate
- redacted diagnostics

The new architecture is a frontend IA/view-model rebuild.

