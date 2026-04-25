# 00 — Objective and Decision Record

## Objective

Build a governed **Foleon Connector** application that allows selected users to manage Foleon content without directly editing SharePoint lists.

The connector must follow the `safety-record` workflow model:

- SPFx frontend is a controlled user experience, not the authority for permissions or data integrity.
- Azure Functions backend is the canonical write path.
- Backend validates Entra roles / app-role claims before mutations.
- Backend uses Graph to write to SharePoint lists.
- Backend owns external API secrets and calls to third-party services.
- Backend produces durable operational proof through run logs, validation results, and telemetry.

## Decision

The Foleon Connector will be built as a governed SPFx application surface backed by the existing HB Intel Azure Functions app.

The connector will **not** ask users to edit these SharePoint lists directly:

- `HB_FoleonContentRegistry`
- `HB_FoleonHomepagePlacements`
- `HB_FoleonInteractionEvents`
- `HB_FoleonSyncRuns`

The lists remain the storage and reporting layer. The connector becomes the user and admin workflow layer.

## Target architecture statement

```text
Selected user group
→ SPFx Foleon Connector
→ existing Azure Functions backend app
→ Foleon API + Microsoft Graph
→ HBCentral Foleon lists
→ Foleon display app consumes validated records
```

## Non-negotiable requirements

- No Foleon API secrets in SPFx.
- No direct user editing of Foleon production lists as the standard workflow.
- No frontend-only authorization.
- No bind-by-title runtime data access for production display paths.
- No save operation without backend validation.
- No publish operation without reader-gate validation.
- No homepage placement save without `ContentIdCache` consistency.
- No generic SharePoint-looking admin grid as the premium answer.
- Must meet `docs/reference/spfx-surfaces/**` and `docs/reference/ui-kit/doctrine/` standards.

## Design doctrine interpretation

The connector is a premium SPFx application surface, not a homepage hero. It must still comply with:

- host-aware SPFx design
- premium non-generic visual language
- accessibility
- explicit loading / empty / error states
- explicit breakpoint behavior
- authoring and partial-configuration safety
- evidence-backed closure

## Success condition

The connector is acceptable when selected users can safely complete the full lifecycle:

1. discover/sync Foleon Docs,
2. create or edit content registry metadata,
3. validate publish/embed/readiness,
4. publish or suppress content,
5. create homepage placements,
6. review sync status and failures,
7. prove all writes occurred through backend-governed routes.
