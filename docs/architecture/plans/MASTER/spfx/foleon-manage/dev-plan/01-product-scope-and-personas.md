# 01 — Product Scope and Personas

## Product scope

The Foleon Connector manages Foleon content configuration for the HB Central Foleon display app.

It is not the Foleon reader itself. It is not a replacement for Foleon authoring. It is not a raw SharePoint list editor.

## Primary personas

### Foleon Editor

Typical users: Marketing / Communications staff.

Can:
- browse synced Foleon Docs;
- create draft content registry records;
- edit display metadata;
- add summaries, thumbnails, region, sector, project metadata, tags;
- request validation;
- submit content for publication if workflow is later added.

Cannot:
- force publish if not assigned publisher role;
- run provisioning;
- edit backend settings;
- bypass validation gates.

### Foleon Publisher

Typical users: Marketing lead / Communications lead / designated approver.

Can:
- approve/publish content;
- set `IsVisible`;
- set `PublishStatus`;
- allow inline reader or force external open;
- manage homepage eligibility;
- suppress content.

### Foleon Homepage Manager

Can:
- create or modify homepage placements;
- assign content to Hero, Primary Card, Secondary Card, Carousel, or Archive Rail;
- set sort rank, layout variant, display window;
- activate/deactivate placements.

### Foleon Operator

Can:
- run Foleon Doc sync;
- run Project sync;
- review sync runs;
- replay failed sync jobs;
- validate SharePoint list contract and runtime config.

### Foleon Admin

Can:
- configure connector settings;
- run or validate SharePoint provisioning;
- update accepted Foleon origins;
- manage role access policy;
- view operational diagnostics.

## Core user journeys

### Journey 1 — Add a Foleon Doc manually

1. User clicks **Add Content**.
2. User enters Foleon Doc ID or published URL.
3. Connector calls backend validation.
4. Backend validates URL, origin, publish/embed state where possible.
5. User completes metadata.
6. Backend saves draft content record.
7. Connector displays validation status and next steps.

### Journey 2 — Sync Docs from Foleon

1. Operator clicks **Sync Docs**.
2. Backend authenticates to Foleon API using server-side credentials.
3. Backend fetches Docs and maps candidates to registry DTOs.
4. Backend creates or updates content records based on sync policy.
5. Backend writes `HB_FoleonSyncRuns`.
6. UI displays added/updated/skipped/error counts.

### Journey 3 — Publish content

1. Publisher opens a draft or synced record.
2. Connector shows readiness checklist.
3. Publisher resolves any blocking issues.
4. Publisher clicks **Publish**.
5. Backend runs final validation.
6. Backend updates `PublishStatus`, `IsVisible`, `AllowEmbed`, and related fields.
7. UI confirms published state.

### Journey 4 — Add homepage placement

1. Homepage Manager opens **Placements**.
2. Selects published content.
3. Chooses placement type and layout variant.
4. Backend writes lookup + `ContentIdCache`.
5. Backend validates no conflicting active placement if rule applies.
6. Highlights route displays the configured card.

### Journey 5 — Diagnose failures

1. Operator opens **Sync Status**.
2. Reviews latest run and errors.
3. Opens failed items.
4. Replays sync or repairs metadata.
5. Backend logs correlation ID and final status.
