# 13 — Wave 03 Code-Agent Prompt: Placements, Sync, Validation, and Release Proof

You are working in the live `hb-intel` repository on `main`.

## Objective

Complete the Foleon Connector by adding placement management, Foleon API sync, SyncRuns dashboard, and production-readiness proof.

## Backend work

Implement:

```text
GET    /api/foleon/placements
POST   /api/foleon/placements
PATCH  /api/foleon/placements/{id}
DELETE /api/foleon/placements/{id}
POST   /api/foleon/sync/docs
POST   /api/foleon/sync/projects
GET    /api/foleon/sync/status
GET    /api/foleon/sync/runs
POST   /api/foleon/provision-sharepoint
```

## Foleon API integration

- Add backend-only Foleon OAuth client.
- Store credentials in backend config only.
- Sync Docs first.
- Sync Projects second if available/needed.
- Preserve HB-owned fields during sync.
- Write every sync attempt to `HB_FoleonSyncRuns`.

## Placement rules

Backend must write both:

- `ContentLookup`
- `ContentIdCache`

`ContentIdCache` must equal selected content `FoleonDocId`.

Block active placement when selected content is invalid unless explicitly scheduled and valid for future display.

## Frontend work

Add:

- Placement Manager board;
- content picker;
- placement editor;
- homepage preview strip;
- Sync dashboard;
- run history;
- failed item details;
- replay/repair action where safe.

## Design proof

Validate against:

- SPFx Governing Standard;
- Homepage Overlay where homepage-adjacent;
- homepage UI/UX audit checklist;
- homepage UI/UX scorecard;
- benchmark materials under `docs/reference/spfx-surfaces/benchmark/**`.

## Required release proof

Capture:

- backend role matrix;
- hosted SharePoint screenshots;
- breakpoint evidence;
- accessibility evidence;
- package truth proof;
- backend deployment proof;
- list validation proof;
- SyncRuns proof;
- end-to-end content publish and placement proof.

## Tests required

Run and report:

- backend route tests;
- frontend tests;
- typecheck;
- lint;
- e2e/Playwright if available;
- package build;
- hosted validation where possible.

## Final response required

Return:

1. implementation summary;
2. files changed;
3. backend route proof;
4. Foleon API sync proof;
5. placement workflow proof;
6. SyncRuns proof;
7. design scorecard result;
8. hosted evidence summary;
9. risks or follow-ups.
