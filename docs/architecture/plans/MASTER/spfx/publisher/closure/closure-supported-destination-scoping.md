# Prompt-05 Closure: Isolate Unsupported Destinations from Current Surface

## Final scoping rule
The current Article Publisher surface is explicitly scoped to supported destinations only.

- Article list queries now include destination scope (`WorkflowState` + `Destination in SUPPORTED_DESTINATIONS`).
- This surface currently supports `projectSpotlight` only.
- Unsupported destination rows remain schema-compatible on read (`getByArticleId`), but are no longer presented as ordinary list-pane items in normal browsing.

## Before / After
Before:
1. List-pane load queried by workflow state only.
2. Unsupported destination rows (for example `companyPulse`) could appear as normal selectable rows in the same UI surface.
3. Unsupported destination handling was largely deferred to validation-time failure.

After:
1. List-pane load is destination-scoped to supported destinations.
2. ArticlePublisher includes defense-in-depth filtering and explicit unsupported-destination messaging.
3. Editing/publish actions are disabled when an unsupported row is directly loaded, so unsupported rows are not presented as ordinary supported items.

## Changed files
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.ts`
  - Added optional destination scope to `articles.listByWorkflowState` and query filter composition.
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.test.ts`
  - Added repository query-contract tests for destination-scoped and workflow-only list filters.
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
  - List load now calls destination-scoped article query.
  - Added unsupported destination notice helper and action disablement for directly loaded unsupported rows.
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.test.tsx`
  - Added destination posture test for unsupported destination notice behavior.

## Proof mapping
1. Unsupported rows excluded from ordinary list-pane surface:
   - `publisherRepositories.test.ts` destination-scoped query assertion + `ArticlePublisher.tsx` scoped list call.
2. Unsupported rows no longer behave as normal editable/publishable items:
   - `ArticlePublisher.tsx` unsupported-destination notice + save/preview/publish/transition disablement.
3. Supported destination flows remain intact:
   - Existing `publishOrchestrator.test.ts`, `validationEngine.test.ts`, and `destinationSiteUrls.test.ts` stay green with `projectSpotlight` behavior unchanged.
