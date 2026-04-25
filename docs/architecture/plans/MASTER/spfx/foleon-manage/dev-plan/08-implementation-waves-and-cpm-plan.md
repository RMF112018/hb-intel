# 08 — Implementation Waves and CPM Plan

## Critical path summary

```text
Backend role gates
→ backend SharePoint contract/provision validation
→ content read/write API
→ connector shell UI
→ content editor workflow
→ validation workflow
→ placement manager
→ Foleon API sync
→ Sync Runs dashboard
→ hosted proof and design audit closure
```

## Wave 01 — Backend foundation

### Objective

Create secure backend Foleon route foundation using the existing Functions app and Safety Records-style route enforcement.

### Tasks

1. Add Foleon route group scaffolding.
2. Add role constants and route gate helpers.
3. Add Foleon config validation.
4. Add SharePoint list contract descriptors.
5. Add content read API.
6. Add content create/update API with validation.
7. Add eTag conflict handling.
8. Add SyncRuns write helper.
9. Add backend tests for role gates and validation.

### Exit criteria

- Unauthorized users receive deterministic 403.
- Authorized editor can create draft content through backend.
- Backend writes to `HB_FoleonContentRegistry` through Graph.
- Backend logs correlation IDs.

## Wave 02 — Connector SPFx shell and content workflow

### Objective

Build premium SPFx connector UI for content management.

### Tasks

1. Create connector route/webpart shell.
2. Build dashboard.
3. Build content list/search/filter.
4. Build content detail/edit panel.
5. Build validation checklist UI.
6. Build publish/suppress action flow.
7. Build loading/empty/error/blocked states.
8. Implement breakpoint modes.
9. Add accessibility and keyboard behavior.

### Exit criteria

- Selected users can manage content without opening SharePoint lists.
- UI meets doctrine-level design standard.
- All primary flows work with backend APIs.

## Wave 03 — Placement manager and validation hardening

### Objective

Build homepage placement workflow and ensure only displayable content is placed.

### Tasks

1. Add placement API routes.
2. Add placement board UI.
3. Add content picker.
4. Add automatic `ContentIdCache` handling.
5. Add conflict detection.
6. Add display/reader preview state.
7. Add tests for placement validation.

### Exit criteria

- Homepage managers can create/update/deactivate placements.
- Display app Highlights route resolves placement records correctly.

## Wave 04 — Foleon API sync

### Objective

Add backend sync from Foleon API to SharePoint registry.

### Tasks

1. Add Foleon OAuth client.
2. Add Docs sync route.
3. Add Projects sync route.
4. Add field ownership mapping.
5. Add sync conflict policy.
6. Add SyncRuns dashboard UI.
7. Add replay/repair action.

### Exit criteria

- Operator can sync Foleon Docs.
- Sync writes records and SyncRuns proof.
- Failures are visible and actionable.

## Wave 05 — Production readiness and release proof

### Objective

Close hosted SharePoint, accessibility, design, package, backend, and security proof.

### Tasks

1. Hosted SharePoint test page.
2. Role matrix validation.
3. Breakpoint screenshots/evidence.
4. Accessibility audit.
5. UI doctrine scorecard.
6. Package truth proof.
7. Backend readiness proof.
8. Release notes and runbook.

### Exit criteria

- No scorecard category below 2.
- Homepage-grade/premium SPFx acceptance target met.
- No critical security or accessibility gaps.
- Hosted proof captured.

## Suggested timeline logic

- Wave 01 blocks all write-capable UI.
- Wave 02 can start with mocked backend DTOs after route contracts are stable.
- Wave 03 depends on content API and content validation.
- Wave 04 depends on backend secrets/config and Foleon API credentials.
- Wave 05 depends on all earlier waves.

## Definition of done

The development plan is complete only when:

- backend routes exist and enforce roles;
- connector UI replaces direct list editing for selected users;
- Foleon API sync is backend-only;
- list writes are through Graph/backend;
- design doctrine audit passes;
- hosted SharePoint evidence exists;
- operational runbook is documented.
