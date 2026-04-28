# Phase 08 — Prompt 02: Build Feed Queue, Slots, Inspector

## Context

Prompt 01 hard-reset the shell and IA but left Feed Desk as a target-structure scaffold (Feed Slots, Editorial Queue, Inspector as labeled empty regions). Prompt 02 builds the **real working surface** — the daily operating console for placing Foleon-produced content into HB Central feeds.

This prompt also retires the legacy operating surface (`ContentOperationsWorkspace`, `ContentInbox`, `LaneBoard`, `ContextualWorkflowPanel`) and the legacy Inbox view-model. Existing reusable panels (`ManageContentEditorPanel`, `ManagePlacementPanel`, `ManageFieldPrimitives`) are mounted inside the new Feed Inspector — preserving editor, placement, validation, write-path, sync, and degraded-mode behavior.

Schedule fields exist on records (`FoleonManagedContent.displayFrom` / `displayThrough` and same on `FoleonPlacement`), so the Editorial Queue's "Display window" column is record-backed — no invented data.

Hosted proof remains a later, explicit gate.

## Approach

### Composition

```
ManageOrchestrator (owns data, readiness, auth, sync, safe-origin, header model)
  └─ FoleonFeedManagerApp ('feed-desk' workspace)
     └─ FeedDeskWorkspace
        ├─ FeedSetupCallout         (when no content / sync blocked / OAuth degraded)
        ├─ FeedSlotsSummary         (Project Spotlight, Company Pulse, Leadership Message rows)
        ├─ EditorialQueue           (filter rail + table; selecting a row populates the Inspector)
        └─ FeedInspectorPanel       (persistent at >= 1100px container, drawer below)
            ├─ Summary section
            ├─ Readiness section    (PublishChecklist + BlockingReasons)
            ├─ Placement section    (ManagePlacementPanel — focused lane context)
            ├─ Schedule section     (displayFrom / displayThrough display)
            ├─ Preview section      (publishedUrl, embedUrl, safe-origin Open Foleon)
            └─ Publish & Activate   (ManageContentEditorPanel — full editor, Save/Validate/Publish/Suppress)
```

Inspector is the new wrapper. The legacy `ContextualWorkflowPanel` modal pattern is retired; focus management lives inside `FeedInspectorPanel`. On wide screens it sits as a persistent right-side panel inside `FeedDeskWorkspace`; below the breakpoint, it slides over as a drawer (Esc closes; focus returns to the originating queue row).

### State ownership

- **ManageOrchestrator** keeps owning data, readiness, auth, sync workflow, safe-origin, message dispatch, and re-adds: selected record id (passed down). Or — since selection is a Feed-Desk concern — `selectedRecordId` lives in `FeedDeskWorkspace` local state. Decision: **selection lives in `FeedDeskWorkspace`** (Inspector is a Feed-Desk-local concern; orchestrator stays focused on app data).
- **FeedDeskWorkspace** owns `selectedRecordId`, `queueFilter`, `inspectorDrawerOpen` (small-screen).
- **FoleonFeedManagerApp** receives a new `feedDeskBody` slot prop instead of rendering the inline scaffold.

### Filters

Filters in the prompt: All / Needs attention / Unassigned / Ready / Scheduled / Live / Archived/Expired (if derivable).

Filter classification (in `editorialQueueViewModel.ts`):
- **Live** — content's `foleonDocId` referenced by an `isActive` placement.
- **Scheduled** — content has a `displayFrom` in the future (or `displayThrough` in the future and `displayFrom` past — i.e., currently within window but not yet attached to an active placement); also covers placements with future `displayFrom`.
- **Ready** — `isPublicReadyReaderRecord(record) === true` AND not Live AND not Scheduled.
- **Unassigned** — `foleonDocId` not referenced by any placement.
- **Needs attention** — `validationStatus === 'blocked'` OR `blockingReasons.length > 0` OR record-lane warnings present.
- **Archived/Expired** — `displayThrough` is in the past (record-backed; only render if any record matches; otherwise filter is hidden).
- **All** — everything.

A record may match multiple categories (e.g., Live + Needs attention). Filter rendering: **All** shows everything; other filters are disjunctive over the record's classifications.

### Slot panel

`feedSlotsViewModel.ts` composes one summary row per lane (project-spotlight, company-pulse, leadership-message) by reusing `buildFoleonLaneViewModels`. Each row exposes:

- **live item** — `lane.activeContent?.title` or "—"
- **next scheduled/staged item** — `lane.stagedContent?.title` or sorted candidate's title or "—"
- **status** — `displayLaneState(lane.state)`
- **display window** — formatted `displayFrom..displayThrough` from `lane.activeContent` or `lane.placement` (whichever is the load-bearing window); "Not scheduled" when neither has a window
- **blockers** — count of `lane.warnings` + `activeContent.blockingReasons` + `placement.blockingReasons`
- **next action** — `lane.nextAction` (already a plain-language string)

Slot rows are clickable → focus the matching record in the Editorial Queue (selects active record id, applies a filter that surfaces it). No silent no-op: if no record exists for the lane, the slot row's primary action becomes "Sync from Foleon" (when sync-ready) or "Open admin diagnostics" (when not).

### Inspector sections

`feedInspectorViewModel.ts` composes section data from the selected record + the global content/placements list:

1. **Summary** — title, lane (via `readerLaneLabel(readerLaneForContent(record))`), publishStatus, isVisible, isHomepageEligible, foleonDocId, sharePointItemId.
2. **Readiness** — `buildPublishChecklist(record, placement, readiness, warnings)` + `blockingReasons` from record and placement.
3. **Placement** — render `<ManagePlacementPanel ... focusedLane={lane} focusedContent={record} />` so creates default to the selected record's lane.
4. **Schedule** — record's `displayFrom`/`displayThrough` formatted; placement's window if present; explicit "Not scheduled" when missing. Edits live in the Publish section (editor) since `ManageContentEditorPanel` already owns these fields.
5. **Preview** — `publishedUrl` (linked text only when `safeFoleonOpenUrl` allowlists the origin; otherwise plain), `embedUrl` summary, `openMode`, "Open Foleon" button (uses orchestrator's safe-origin path; structured disabled reason when no allowlist).
6. **Publish & Activate** — `<ManageContentEditorPanel ... />` (full editor with Save/Validate/Publish/Suppress + `aria-describedby` write/publish reasons).

When **no record is selected**, Inspector shows a quiet empty state: heading "Inspector", body "Select an item from the queue to see readiness, placement, schedule, preview, and publish controls." Schedule/Preview/Publish sections are hidden until a selection exists.

### Setup callout

`FeedSetupCallout.tsx` shows when:
- token-degraded → "API approval required to load feed content. Open admin diagnostics for next steps." (one primary action: Open admin diagnostics)
- sync blocked → "Sync from Foleon is unavailable. Resolve sync readiness in admin to load feed content." (Open admin diagnostics)
- ready and content list is empty → "No Foleon content has been synced yet. Run Sync from Foleon to bring in content." (Sync from Foleon)
- ready and content > 0 → callout hidden (queue carries the surface)

The callout is a small banner-style block above the slots panel; never the whole workspace.

## File Plan

### Add

- `apps/hb-intel-foleon/src/pages/manage/feedDeskViewModel.ts`
  - `FeedDeskState = 'token-degraded' | 'sync-blocked' | 'empty' | 'ready'` resolver (input: `tokenAcquisitionDegraded`, `canSync`, `contentLoaded`)
  - `FeedSetupCalloutModel` (kicker, message, primary action label + id) — pure resolver feeding `FeedSetupCallout`
  - `data-feed-desk-state` attribute helper

- `apps/hb-intel-foleon/src/pages/manage/feedSlotsViewModel.ts`
  - `FeedSlotSummary` interface (lane, label, liveTitle, nextTitle, statusLabel, displayWindow, blockerCount, nextAction)
  - `buildFeedSlotSummaries({ lanes, content, placements })` — composes from `buildFoleonLaneViewModels` output
  - `formatDisplayWindow(displayFrom, displayThrough): string` (locale-formatted; "Not scheduled" when both missing)

- `apps/hb-intel-foleon/src/pages/manage/editorialQueueViewModel.ts`
  - `EditorialQueueRow` interface (id, status, title, feedLabel, displayWindow, readinessLabel, primaryAction, classifications)
  - `EditorialQueueFilterId = 'all' | 'needs-attention' | 'unassigned' | 'ready' | 'scheduled' | 'live' | 'archived'`
  - `buildEditorialQueueRows({ content, placements, lanes, readiness, managerReadPathProven })` — returns rows with classifications
  - `filterEditorialQueueRows(rows, filterId)` — filter logic
  - `availableEditorialQueueFilters(rows): ReadonlyArray<{ id, label, count }>` — only surfaces archived when it has rows
  - `summarizeReadiness(record, lane)` — short readiness label

- `apps/hb-intel-foleon/src/pages/manage/feedInspectorViewModel.ts`
  - `FeedInspectorSummary`, `FeedInspectorReadiness`, `FeedInspectorSchedule`, `FeedInspectorPreview` interfaces
  - `buildFeedInspectorSummary(record, placement)` — pure
  - `buildFeedInspectorReadiness({ record, placement, readiness, warnings })` — composes `buildPublishChecklist` + blocking reasons
  - `buildFeedInspectorSchedule(record, placement)` — formatted strings; "Not scheduled" fallback
  - `buildFeedInspectorPreview(record, safeFoleonOpenUrl)` — preview rows + computed `openFoleonDisabledReason`

- `apps/hb-intel-foleon/src/pages/manage/FeedSetupCallout.tsx`
  - Renders heading + body + one primary action (variant follows model)
  - `data-feed-desk-callout={state}` marker

- `apps/hb-intel-foleon/src/pages/manage/FeedSlotsSummary.tsx`
  - Renders the three slot rows; each row is `<article role="listitem" data-feed-slot={lane}>`
  - Click → `onSelectSlot(lane)` (sets queue filter to match lane + selects active record if any)

- `apps/hb-intel-foleon/src/pages/manage/EditorialQueue.tsx`
  - Filter rail (`role="radiogroup"`, each filter a radio button with count badge); active filter is `aria-checked="true"`
  - Table with `role="table"`; rows are `role="row"` with cells `role="cell"`; first column carries selectable button
  - Each row marker `data-editorial-queue-row={contentId}`, status pill `data-editorial-queue-status={classification[0]}`
  - Selection: `aria-pressed="true"` on selected row's button; click calls `onSelectRow(contentId)`
  - Empty state when filter yields no rows: quiet "No items match this filter." line — record-backed copy, never dev/process language
  - Mobile: same table-as-rows layout, columns stack via CSS

- `apps/hb-intel-foleon/src/pages/manage/FeedInspectorPanel.tsx`
  - Wide-mode (default): persistent `<aside aria-label="Feed Inspector">` next to queue, no overlay, no Esc-close
  - Drawer mode (small): same aside but with `data-feed-inspector-drawer="open"`, Esc-close, focus return to triggering row, no `role="dialog"` (non-modal)
  - Header: title (record or "Inspector"), close button when in drawer mode
  - Six sections, each `<section aria-label="...">` with marker `data-feed-inspector-section={id}`
  - Empty (no selection) state: only Header + empty-state body

- `apps/hb-intel-foleon/src/pages/manage/FeedDeskWorkspace.tsx`
  - Top-level body of the Feed Desk workspace
  - Owns `selectedRecordId`, `queueFilter`, `drawerOpen` (small)
  - Composes: `FeedSetupCallout`, `FeedSlotsSummary`, `EditorialQueue`, `FeedInspectorPanel`
  - Receives orchestrator props (contract, content, placements, lanes (computed here), api, canSync, canWrite, writeBlockReason, managerReadPathProven, refresh, setMessage, safeFoleonOpenUrl, openFoleonUnavailableReason, onOpenAdminDiagnostics, onSyncDocs)
  - Computes `lanes = useMemo(() => buildFoleonLaneViewModels({...}), [content, placements, readiness, managerReadPathProven])`

### Modify

- `apps/hb-intel-foleon/src/pages/manage/FoleonFeedManagerApp.tsx`
  - Replace inline `FeedDeskScaffold` with new `feedDeskBody?: React.ReactNode` slot prop. Keep Schedule and Preview workspace placeholders unchanged (Prompt 03 owns those). Admin slot unchanged.
  - When `selectedKey === 'feed-desk'`, render the slot inside the existing `data-feed-manager-workspace="feed-desk"` panel.

- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
  - Re-import data dependencies needed by FeedDeskWorkspace: nothing new at the API level (already loaded), but pass through `content`, `placements`, `runs`, `managerReadPathProven`, `api`, `canSync`, `canWrite`, `writeBlockReason`, `safeFoleonOpenUrl`, `openFoleonUnavailableReason`, refresh, setMessage, openAdminDiagnostics, onSyncDocs.
  - Compute `canWrite` from `props.contract.hostMode !== 'sharepoint' || (props.contract.foleonReadiness?.writePathReady === true && state.managerReadPathProven)`.
  - Compute `writeBlockReason = plainLanguageWriteBlockReason(props.contract, state.managerReadPathProven)` when not write-ready (re-add `manageWritePathMessage` import).
  - Build `feedDeskBody = <FeedDeskWorkspace ... />` and pass as slot prop into `FoleonFeedManagerApp`.
  - Header model: `onSyncDocs` already wired; preserve.

- `apps/hb-intel-foleon/src/pages/manage/manageShell.module.css`
  - Append classes for FeedDeskWorkspace layout, FeedSlotsSummary rows, EditorialQueue table + filter rail, FeedInspectorPanel sections + drawer mode, FeedSetupCallout. Reuse `.statusChip` and existing primitives where natural.
  - Container queries for inspector drawer/persistent split (`@container (max-width: 1100px)` triggers drawer mode).

- `apps/hb-intel-foleon/src/pages/manage/FoleonConfigTab.tsx` — no changes (Admin diagnostics preserved; mounted unchanged).

- `apps/hb-intel-foleon/src/pages/__tests__/ManagePage.test.tsx`
  - Keep all current Prompt-01 shell-level assertions (default Feed Desk, nav order, no Lane Board / Content Operations, header primary action, token-degraded path, admin diagnostics, sanitized banners, blocked states, canvas escape, redacted proof, required admin actions ordering). The Feed Desk default-renders test now also passes after the new body mounts (queue + slots).
  - Replace the Feed Desk target-structure assertion (currently looks for empty `region` names "Feed Slots / Editorial Queue / Inspector"): assert the new structure is present:
    1. Feed Slots region with the three slot rows (`data-feed-slot="project-spotlight" / "company-pulse" / "leadership-message"`).
    2. Editorial Queue region with role="table" or list rows (depending on chosen primitive — assert by `data-editorial-queue-row` count or by filter-rail presence).
    3. Inspector region with `aria-label="Feed Inspector"` present (drawer-or-persistent).
  - Add new tests:
    - "feed slots render with three lanes and surface live/next/status copy from record-backed data"
    - "editorial queue renders rows from synced content with display window column"
    - "selecting an editorial queue row opens the inspector with summary + readiness sections"
    - "feed desk shows setup callout when no content has been synced yet" (empty state, sync-ready)
    - "feed desk setup callout routes to admin diagnostics when sync is blocked / token-degraded"
    - "filtering editorial queue to Unassigned shows only records without an active placement"
    - "inspector preview section disables Open Foleon with a structured reason when no safe origin is configured"
    - "inspector publish & activate section embeds the editor and surfaces write-block reason in disabled Save"
  - Drop tests that exercised the legacy modal workflow panel (`ContextualWorkflowPanel` is gone) — the equivalent flow is now: select queue row → inspector renders editor section. Test coverage moves with the surface.

### Retire (delete)

- `apps/hb-intel-foleon/src/pages/manage/ContentOperationsWorkspace.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ContentInbox.tsx`
- `apps/hb-intel-foleon/src/pages/manage/LaneBoard.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ContextualWorkflowPanel.tsx`
- `apps/hb-intel-foleon/src/pages/manage/contentInboxViewModel.ts`
- `apps/hb-intel-foleon/src/pages/manage/__tests__/contentInboxViewModel.test.ts`
- `apps/hb-intel-foleon/src/pages/manage/LimitedModeWorkspaceNotice.tsx` — only consumer was ContentOperationsWorkspace; the new Inspector surfaces limited-mode via `aria-describedby` + `plainLanguagePublishDisabledReason` already, so the standalone notice is orphan. **Decision: retire.** If a Feed-Desk-level limited-mode banner is wanted later, Prompt 03 / 04 can add it.

### Reused (unchanged)

- `manageLaneViewModel.ts`, `managerOperationsViewModel.ts`, `manageMutationUtils.ts`, `manageWorkflows.ts`, `manageDegradedCopy.ts`, `manageWritePathMessage.ts`, `manageHeaderStatusModel.ts`, `manageFields.module.css`, `foleonManageTokens.css`
- `ManageContentEditorPanel.tsx` — embedded directly inside FeedInspectorPanel's "Publish & Activate" section
- `ManagePlacementPanel.tsx` — embedded directly inside FeedInspectorPanel's "Placement" section
- `ManageFieldPrimitives.tsx` — kept as dependency
- `FoleonConfigTab.tsx`, `ManageRegistryPanel.tsx`, `ManageSyncPanel.tsx`, `ManageMetricCards.tsx` — Admin surface, untouched
- `FeedManagerHeader.tsx`, `FeedManagerNav.tsx`, `FoleonFeedManagerApp.tsx`, `feedManagerViewModel.ts` — Prompt 01 shell, modified only at the slot-prop seam

## Markers (new)

Per memory `feedback_no_legacy_marker_preservation` and `feedback_per_lane_marker_assertions`, all new markers are net-new and per-lane / per-row scoped:

- `data-feed-desk-state="ready" | "empty" | "sync-blocked" | "token-degraded"` on FeedDeskWorkspace root
- `data-feed-desk-callout={state}` on FeedSetupCallout
- `data-feed-slot="project-spotlight" | "company-pulse" | "leadership-message"` per slot row
- `data-editorial-queue-filter={filterId}` per filter button
- `data-editorial-queue-row={contentId}` per queue row
- `data-editorial-queue-status={classification}` per row status pill
- `data-feed-inspector-section="summary" | "readiness" | "placement" | "schedule" | "preview" | "publish"` per section
- `data-feed-inspector-drawer="open" | "closed"` on inspector when in drawer mode

## Decisions

1. **Inspector is the new wrapper.** `ContextualWorkflowPanel` retires entirely. Inspector inherits its focus / Esc / focus-return behaviors only when in drawer mode (small). On wide screens it's persistent — no Esc-close, no focus trap.
2. **Selection lives in `FeedDeskWorkspace`**, not the orchestrator. The orchestrator stays focused on data, readiness, auth, sync.
3. **`contentInboxViewModel` retires.** New queue classification lives in `editorialQueueViewModel`. Buckets/inbox vocabulary is gone from the active surface.
4. **`LimitedModeWorkspaceNotice` retires.** Limited-mode messaging is already covered by the orchestrator's token-degraded banner + `aria-describedby` write/publish reasons inside the editor.
5. **Schedule fields are record-backed only.** No invented schedule data; "Not scheduled" / "—" when fields are absent.
6. **Archived/Expired filter renders only when at least one record qualifies** (`displayThrough` in past). Memory: `feedback_no_invented_record_fields`.
7. **Slot row interaction is honest.** When a lane has no record, the slot's primary action is the orchestrator's appropriate next-step action (Sync or Open admin diagnostics), not a silent no-op. Memory: `feedback_no_silent_action_noops`.
8. **No hosted proof claim.** Verification scope: typecheck + lint + vitest at `@hbc/spfx-hb-intel-foleon`. Memory: `feedback_no_implicit_hosted_proof`.

## Critical Files

- Add: `feedDeskViewModel.ts`, `feedSlotsViewModel.ts`, `editorialQueueViewModel.ts`, `feedInspectorViewModel.ts`, `FeedSetupCallout.tsx`, `FeedSlotsSummary.tsx`, `EditorialQueue.tsx`, `FeedInspectorPanel.tsx`, `FeedDeskWorkspace.tsx`
- Modify: `FoleonFeedManagerApp.tsx`, `ManageOrchestrator.tsx`, `manageShell.module.css`, `ManagePage.test.tsx`, `FoleonWebPart.manifest.json`, `package-solution.json`, `runtimeContract.ts`, `validate-foleon-feature-assets.ts`, `__tests__/FoleonWebPartManifest.test.ts`
- Delete: `ContentOperationsWorkspace.tsx`, `ContentInbox.tsx`, `LaneBoard.tsx`, `ContextualWorkflowPanel.tsx`, `contentInboxViewModel.ts`, `__tests__/contentInboxViewModel.test.ts`, `LimitedModeWorkspaceNotice.tsx`

## Verification

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon test
```

Verify in test output:
- Existing 24 shell tests still pass.
- New ~8 Feed-Desk tests pass (slots, queue, inspector selection, setup callout, filter, empty/blocked states, write-block).
- Manifest version tests pass (FOLEON_PACKAGE_VERSION = 1.0.36.0; manifest + solution + feature versions match).
- Typecheck clean (no orphan imports after deletions; verify `ContentOperationsWorkspace`/`LaneBoard` orphan-import patches from Prompt 01 are removed by the file deletion).
- Lint clean (0 errors; pre-existing warning count unchanged).

Honest scope: package-scope verification only. Hosted proof and full package proof remain explicit later gates.

## Manifest

Version bump: `1.0.35.0 → 1.0.36.0` (4-part SharePoint scheme).

- `FoleonWebPart.manifest.json`: `version` and every `expectedPackageVersion` (5 preconfigured entries).
- `package-solution.json`: `solution.version` + `features[0].version`.
- `runtimeContract.FOLEON_PACKAGE_VERSION = '1.0.36.0'`.
- `validate-foleon-feature-assets.EXPECTED_VERSION = '1.0.36.0'`.

Manager preconfigured entry title and description remain "HB Intel Foleon Feed Manager" / feed-placement copy from Prompt 01.

## Commit

Title: `SPFx Foleon Manager 1.0.36.0: build feed desk queue slots and inspector`

Body: notes the new Feed Desk surface (slots / queue / inspector), retired legacy surfaces (ContentOperationsWorkspace, ContentInbox, LaneBoard, ContextualWorkflowPanel, contentInboxViewModel, LimitedModeWorkspaceNotice), preserved editor / placement / write-path / sync / safe-origin / admin diagnostics, version bump, package-scope verification, no hosted proof claim.
