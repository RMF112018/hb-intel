# 01 — Repo-Truth Audit

## Audit Scope

Audited current live repo files on `main`, focusing on the current Manager implementation:

- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageOperationsShell.tsx`
- `apps/hb-intel-foleon/src/pages/manage/CommandHeader.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ContentOperationsWorkspace.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ContentInbox.tsx`
- `apps/hb-intel-foleon/src/pages/manage/LaneBoard.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageShell.module.css`
- `apps/hb-intel-foleon/src/types/foleon-management.types.ts`
- `apps/hb-intel-foleon/config/package-solution.json`

## Current Product Shape

The current product shape is still fundamentally a stitched-together admin console:

1. `ManageOrchestrator` owns load state, selected nav, diagnostics state, focus bucket, workflow panel, readiness, and the routing among Content Operations, Lane Board, Preview, and Admin.
2. `ManageOperationsShell` composes `CommandHeader`, `StatusSummaryStrip`, recommended action, banners, primary nav, preview placeholder, and active children.
3. `CommandHeader` renders a large command area with multiple action groups across the top: Sync from Foleon, Operate, Source & Admin, plus chips and sync-readiness text.
4. `ContentOperationsWorkspace` renders `ContentInbox` and `ContextualWorkflowPanel`.
5. `LaneBoard` renders a real three-column lane board.
6. `Preview` is still an explanatory placeholder.
7. `Admin / Config` still uses `FoleonConfigTab`.

## Hard Finding: The IA Is Wrong for a News Feed Manager

The primary nav currently exposes implementation abstractions:

- Content Operations
- Lane Board
- Preview
- Admin / Config

This is not how a news/feed manager should be organized. A person managing a feed needs to see:

- incoming source content,
- what needs attention,
- where content is placed,
- what is live now,
- what is scheduled next,
- what is blocked,
- preview and activate controls.

The current IA forces the user to choose between abstract surfaces instead of showing one cohesive editorial desk.

## Hard Finding: The CSS Still Encodes the Old Card System

The current `manageShell.module.css` still defines `.panel` as a card treatment and composes that treatment into major sections including `.header`, `.summaryStrip`, `.primaryNav`, `.placeholderPanel`, `.recommendedNextAction`, `.contentInbox`, and `.laneBoardColumn`.

That is the exact structural cause of the hosted visual failure. The code still treats the entire app as a set of cards rather than as an application workspace.

## Hard Finding: Header Actions Are Overexposed

The current `CommandHeader` exposes too many actions simultaneously:

- Sync Docs
- Sync Projects
- Review new content
- Manage placements
- Open Foleon
- Admin diagnostics
- Back

The visual outcome reads like an operations/debug toolbar, not an editorial product. Most of these should be contextual or moved into an overflow/menu/utility zone.

## Hard Finding: Empty State Is Not Productive

The hosted screenshots show many zeros and empty buckets. Empty-state behavior should be strongly guided:

- “Finish Foleon OAuth setup” if sync is blocked.
- “Sync Foleon content” if OAuth is ready and no content exists.
- “Assign first item” if content exists but nothing is placed.

The current layout shows empty buckets, empty lanes, and generic copy. That makes the application look broken rather than ready.

## Hard Finding: Lane Board Should Not Be a Top-Level Workspace

The Lane Board is useful, but not as a primary nav destination. It fragments the workflow. A feed manager should not switch away from the queue to manage placements. Placement state belongs beside or below the queue in the Feed Desk.

## Current Data Model Supports a Better UI

The existing typed contracts are sufficient for a proper feed desk without inventing data:

- `FoleonManagedContent` includes title, Foleon doc ID, reader key, homepage slot, active edition, publish status, visibility, homepage eligibility, URLs, thumbnail, summary, display window, published date, validation status, blockers, and open mode.
- `FoleonPlacement` includes placement key, content item ID, Foleon doc ID, active state, display window, sort rank, layout variant, validation status, and blockers.

Missing fields that should not be invented:

- created date,
- first synced date,
- author/owner,
- reviewer,
- assignee,
- approval step,
- actual Foleon last modified date unless confirmed by API mapping.

## Package Version

Current package-solution is at `1.0.33.0`. The next material hosted UI change should bump to `1.0.34.0` or next governed version.

