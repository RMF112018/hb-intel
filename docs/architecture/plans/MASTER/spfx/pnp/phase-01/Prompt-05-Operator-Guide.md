# PnP Operations Webpart — Operator Guide

## Purpose
`PnP Operations` is a read-only operator webpart that runs governed SharePoint extraction actions through backend admin APIs and returns run evidence/artifacts for download.

## Prerequisites
- Access to HB Central page hosting the `PnP Operations` webpart.
- Authorized backend access for `/api/admin/*` (delegated/admin gate).
- Webpart config with:
  - `backendUrl`
  - `backendAudience` (for SPFx bearer token acquisition)
- Target SharePoint site URL in format: `https://<tenant>.sharepoint.com/sites/<site>` (or `/teams/<site>`).

## Supported Actions (Prompt-04 catalog)
- `sharepoint-control:extraction:site-template` (site-only)
- `sharepoint-control:extraction:list-schema` (requires `listFilters`)
- `sharepoint-control:extraction:page-layout` (requires `pageFilters`)
- `sharepoint-control:extraction:site-inventory` (site-only)
- `sharepoint-control:extraction:library-folder-tree` (requires `listFilters`)
- `sharepoint-control:extraction:site-groups-summary` (site-only)
- `sharepoint-control:extraction:page-webpart-inventory` (requires `pageFilters`)

All are advisory/read-only export operations.

## Operating Steps
1. Open `PnP Operations` in SharePoint.
2. Select an action from the catalog.
3. Enter `Target SharePoint Site URL`.
4. Enter optional filters required by the action:
   - list actions: comma-separated list names in `List Filters`
   - page actions: comma-separated page names/patterns in `Page Filters`
5. Run **Preflight** and resolve blocking issues.
6. Run **Launch Extraction Run**.
7. Monitor run status/steps until terminal state.
8. Open artifact manifest and download bundle/files.

## Output and Downloads
Per successful run, backend publishes evidence references and typically includes:
- `raw.json`
- `normalized.json`
- `summary.md`
- `artifact-manifest.json`
- preferred single download: `artifact-bundle.zip` (when multi-file output is present)

Downloads appear in the webpart artifact section and map to:
- `/api/admin/runs/{runId}/evidence`
- `/api/admin/runs/{runId}/artifacts/{evidenceId}/download`

## Known Limits
- No browser-side privileged PnP execution.
- Live run success requires runtime backend configuration and valid token audience wiring.
- Actions remain read-only in this phase; mutating/admin-center operations are deferred.
- If backend metadata is unavailable, the webpart falls back to locked local catalog definitions.

## Recommended Next Actions
1. Validate one live run per input mode (`site-only`, `site-and-list-filter`, `site-and-page-filter`) in a tenant-integrated environment.
2. Capture operator screenshots and run IDs for deployment handoff.
3. Keep CI/CD explicit for `BACKEND_MODE` and backend audience settings to avoid environment drift.
