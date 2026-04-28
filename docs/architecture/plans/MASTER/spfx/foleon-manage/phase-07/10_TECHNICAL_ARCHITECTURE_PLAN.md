# 10 — Technical Architecture Plan

## Preserve Existing Security and Runtime Boundaries

Do not weaken:

- `withAuth`
- route authorization
- token validation
- safe-config readiness gates
- CORS security
- redacted diagnostics
- registry-first runtime configuration
- SharePoint Graph/list relationships
- package/runtime proof

## Proposed Frontend Architecture

```text
ManageOrchestrator
├── useFoleonManagerData
├── useFoleonManagerActions
├── buildContentOperationsViewModel
├── ManageOperationsShell
│   ├── CommandHeader
│   ├── ManagerPrimaryNav
│   ├── StatusSummaryStrip
│   └── WorkspaceRouter
├── ContentOperationsWorkspace
│   ├── ContentInbox
│   ├── SelectedContentSummary
│   └── QuickActions
├── LaneControlBoard
│   ├── LaneDestinationCard
│   └── LaneDetailPanel
├── PlacementWorkflowPanel
├── ReaderPreviewPanel
└── AdminConfigWorkspace
```

## View Models

Add view models instead of pushing logic into render code.

```ts
interface ContentInboxItemVm {
  id: string;
  title: string;
  thumbnailUrl?: string;
  sourceDate?: string;
  foleonDocId: number;
  status: 'new' | 'unassigned' | 'needs-review' | 'blocked' | 'staged' | 'live';
  recommendedLane?: FoleonReaderLane;
  readiness: 'ready' | 'needs-review' | 'blocked';
  nextAction: string;
  blockReasons: ManagerBlockReason[];
}

interface LaneDestinationVm {
  lane: FoleonReaderLane;
  label: string;
  live?: ContentInboxItemVm;
  staged?: ContentInboxItemVm;
  readiness: 'ready' | 'needs-review' | 'blocked' | 'empty';
  displayWindow: string;
  nextAction: string;
  canPreview: boolean;
  canActivate: boolean;
  blockReasons: ManagerBlockReason[];
}
```

## Backend

No immediate backend rewrite is required for the UI rebuild. Consider adding endpoints only if necessary:

- `GET /foleon/manager-summary`
- `POST /foleon/placements/validate`
- `POST /foleon/placements/activate`

Only add endpoints if the current content and placement endpoints cannot support a clean UI without duplicating business logic client-side.

## Data Ownership

- Foleon API: source metadata and content availability.
- Function App: OAuth, Graph writes, validation, sync, route authorization.
- SharePoint lists: governed registry, placement, interaction, sync run persistence.
- SPFx: task-specific UI and typed view models.
