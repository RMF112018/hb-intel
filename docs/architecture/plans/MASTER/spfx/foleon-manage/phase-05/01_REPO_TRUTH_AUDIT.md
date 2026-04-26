# 01 — Repo-Truth Audit

## Current Application Shape

The Foleon app is a single SPFx package with a route-driven React app loaded through the shared SPFx shell. The route selection is driven by `foleonRoute` and supports:

- `highlights`
- `reader`
- `hub`
- `manage`
- `projectSpotlight`
- `companyPulse`
- `leadershipMessage`

There is no standalone `FoleonWebPart.ts` source file in the application path that was listed in the prompt. The live package uses the generic shell webpart at:

- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`

The Foleon-specific app code is mounted through:

- `apps/hb-intel-foleon/src/mount.tsx`
- `apps/hb-intel-foleon/src/FoleonApp.tsx`

## What the Current Foleon Manager Actually Does

Current Manager route:

- Initializes through `FoleonApp.tsx` when `nav.route === 'manage'`.
- Renders `ManagePage`, which delegates into `ManageOrchestrator`.
- Uses `createFoleonManagementApi(contract)` to call backend functions.
- Loads:
  - content registry rows;
  - homepage placements;
  - sync status;
  - sync runs.
- Renders:
  - management header;
  - registry table;
  - metric cards;
  - preview guidance panel;
  - content editor;
  - placement panel;
  - sync panel.

## What Marketing Users Can Currently Edit

The current UI exposes operational editing of Foleon content and placements once the backend API is reachable:

- Content title and metadata.
- Foleon document ID / URL fields through the content mutation path.
- Publish status and visibility workflow.
- Homepage eligibility.
- Reader lane metadata through content fields.
- Placement data through the placement panel.
- Sync operations for Foleon Docs and Projects.

The UI does **not** currently present the required product workflow as a dedicated `Homepage Foleon Content` tab with lane-level status cards for Project Spotlight, Company Pulse, and Leadership Message.

## What Admins Can Currently Configure

Admin configuration is currently split across:

1. Webpart page properties through the SPFx property pane:
   - `contentRegistryListId`
   - `placementsListId`
   - `eventsListId`
   - `acceptedFoleonOrigins`
   - `allowPreview`
   - `expectedManifestId`
   - `expectedPackageVersion`
   - `foleonRoute`
   - `foleonDocId`
   - `foleonReaderRoutePath`
   - `foleonApiBaseUrl`
   - `foleonApiResource`

2. Azure Functions app settings:
   - `HB_FOLEON_SHAREPOINT_SITE_URL`
   - `HB_FOLEON_GRAPH_SITE_ID`
   - `HB_FOLEON_CONTENT_REGISTRY_LIST_ID`
   - `HB_FOLEON_HOMEPAGE_PLACEMENTS_LIST_ID`
   - `HB_FOLEON_SYNC_RUNS_LIST_ID`
   - `HB_FOLEON_CLIENT_ID`
   - `HB_FOLEON_CLIENT_SECRET`
   - `HB_FOLEON_TOKEN_URL`
   - `HB_FOLEON_DOCS_URL`
   - `HB_FOLEON_PROJECTS_URL`
   - `HB_FOLEON_ALLOWED_ORIGINS`

There is no dedicated Config tab in the Manager UI that clearly separates editable non-secret configuration, read-only runtime proof, derived values, environment-specific values, and secret references.

## Data the Manager Currently Reads/Writes

Frontend client routes in `FoleonManagementApi.ts`:

- `GET /api/foleon/content`
- `POST /api/foleon/content`
- `PATCH /api/foleon/content/{id}`
- `POST /api/foleon/content/{id}/validate`
- `POST /api/foleon/content/{id}/publish`
- `POST /api/foleon/content/{id}/suppress`
- `GET /api/foleon/placements`
- `POST /api/foleon/placements`
- `PATCH /api/foleon/placements/{id}`
- `DELETE /api/foleon/placements/{id}`
- `POST /api/foleon/sync/docs`
- `POST /api/foleon/sync/projects`
- `GET /api/foleon/sync/status`
- `GET /api/foleon/sync/runs`

Backend routes also expose:

- `POST /api/foleon/provision-sharepoint`
- `POST /api/foleon/validate-sharepoint`
- `GET /api/foleon/config`

The current frontend does not fully surface those admin readiness endpoints as a Config tab.

## SharePoint Lists Involved

Canonical list titles:

- `HB_FoleonContentRegistry`
- `HB_FoleonHomepagePlacements`
- `HB_FoleonInteractionEvents`
- `HB_FoleonSyncRuns`

The frontend runtime also carries event list ID for telemetry, but backend `foleonGraphConfigured()` currently requires content, placements, and sync-runs list IDs, not interaction-events list ID.

## Configuration Shape Drift

There are two live config shapes:

### Standalone Foleon package / Manager shape

- `contentRegistryListId`
- `placementsListId`
- `eventsListId`
- `acceptedFoleonOrigins`
- `allowPreview`
- `expectedManifestId`
- `expectedPackageVersion`
- `foleonApiBaseUrl`
- `foleonApiResource`

### Homepage embedded Foleon shape

- `foleonContentRegistryListId`
- `foleonPlacementsListId`
- `foleonEventsListId`
- `foleonAcceptedOrigins`
- `foleonAllowPreview`
- `foleonExpectedManifestId`
- `foleonExpectedPackageVersion`
- `foleonApiBaseUrl`
- `foleonApiResource`

This split is a long-term drift risk. The centralized registry should normalize these into one canonical schema and allow adapters to project app-specific config shapes.

## Schema Risk Identified

The declared sync-runs schema and backend write code appear inconsistent:

- Schema declares `RunKind`, `StartedUtc`, `EndedUtc`, `TriggerSource`, `ItemsFetched`, `ItemsWritten`, `ErrorCount`, `ErrorsJson`.
- Backend `writeSyncRun()` writes `RunType`, `StartedAtUtc`, `CompletedAtUtc`, `RequestedBy`, `ItemsScanned`, `ItemsCreated`, `ItemsUpdated`, `ItemsFailed`, `Message`, `FailedItemsJson`.

This may be historical drift or an active defect. It should be verified before relying on sync-run proof in the Manager.

## Files Likely to Change

- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManagePage.tsx`
- `apps/hb-intel-foleon/src/pages/manage/**`
- `apps/hb-intel-foleon/src/services/FoleonManagementApi.ts`
- `apps/hb-intel-foleon/src/runtime/foleonRuntimeContract.ts`
- `apps/hb-intel-foleon/src/mount.tsx`
- `apps/hb-intel-foleon/src/types/foleon-runtime.types.ts`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `tools/spfx-shell/src/webparts/shell/foleonRuntimeConfigBridge.ts`
- `apps/hb-intel-foleon/src/schema/foleonListSchemas.ts`
- `backend/functions/src/functions/adminApi/foleon-routes.ts`
- `backend/functions/src/services/foleon-service.ts`
- `backend/functions/src/config/foleon-list-definitions.ts`
- `docs/reference/sharepoint/list-schemas/hbcentral/**`
- `docs/architecture/plans/MASTER/spfx/foleon/**`

{repo_map}
