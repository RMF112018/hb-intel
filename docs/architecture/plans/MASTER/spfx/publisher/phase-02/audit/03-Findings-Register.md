# 03 — Findings Register

## P0-01 — Publisher repositories are bound to the wrong SharePoint list titles
### Files
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherListDescriptors.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageBindingWriter.ts`

### Issue
The code reads/writes `Project Spotlight *` list titles, but the tenant actually exposes `HB Article*` list titles.

### Consequence
Core reads and writes fail against the tenant before business logic even begins.

### Fix direction
Replace the list-descriptor layer with the actual tenant list titles and rebuild every dependent repository/writer test against that reality.

---

## P0-02 — Master-record contract is built around `PostId` / `Project Spotlight Posts`, not `ArticleId` / `HB Articles`
### Files
- `publisherContracts.ts`
- `publisherRowMappers.ts`
- `publisherWriters.ts`
- `ArticlePublisher.tsx`

### Issue
The master record is modeled as `PublisherPostRow` rather than the tenant’s article record.

### Consequence
Load/save/workflow/publish behavior cannot correctly persist or retrieve tenant article data.

### Fix direction
Replace the master contract with an `HB Articles`-aligned contract keyed by `ArticleId` and tenant field names.

---

## P0-03 — Child-list relationships are keyed by `PostId`, but tenant relationships use `ArticleId`
### Files
- `publisherContracts.ts`
- `publisherRepositories.ts`
- `publisherWriters.ts`
- `publisherRowMappers.ts`

### Issue
Team, media, binding, history, and error repositories all assume `PostId`.

### Consequence
Child rows are structurally incompatible with tenant data and cannot maintain correct referential integrity.

### Fix direction
Rebuild all child-row contracts and replace-all writers around `ArticleId`.

---

## P0-04 — Template registry contract and resolver are built against a non-tenant schema
### Files
- `publisherContracts.ts`
- `publisherListDescriptors.ts`
- `publisherRowMappers.ts`
- `templateResolver.ts`
- `publishResolutionContext.ts`
- `validationEngine.ts`

### Issue
The code expects fields like `TemplateStatus`, `TemplateVersion`, `ValidationProfileKey`, and `RenderProfileKey` that do not match the actual template-registry schema.

### Consequence
Template resolution, validation, preview, and publish decisions cannot work correctly against the tenant.

### Fix direction
Rebuild template-registry typing and resolution rules against:
- `IsActive`
- `VersionLabel`
- `ContentTypes`
- `Destination`
- `PageShellTemplateKey`
- profile keys and show/hide toggles

---

## P0-05 — Page-binding contract is incompatible with `HB Article Destination Pages`
### Files
- `publisherContracts.ts`
- `publisherRowMappers.ts`
- `publisherRepositories.ts`
- `pageBindingWriter.ts`

### Issue
The code expects a `Project Spotlight Page Bindings` schema with `PostId`, `TargetSiteKey`, `BindingStatus`, `TemplateVersion`, and `LastOperation*` fields.

### Consequence
Republish/regeneration/binding-sync logic cannot reliably read or write the actual tenant binding registry.

### Fix direction
Rebuild the binding contract around:
- `ArticleId`
- `BindingId`
- `PageTemplateKey`
- `PublishStatus`
- `SyncStatus`
- `LastSyncDateUtc`
- `LastSyncMessage`
- `RenderVersion`

---

## P0-06 — Workflow-history writes use the wrong state value and wrong field model
### Files
- `workflowStateMachine.ts`
- `ArticlePublisher.tsx`
- `publisherContracts.ts`
- `publisherWriters.ts`
- `publisherRowMappers.ts`

### Issue
The code uses `inReview` and writes `FromState`, `ToState`, `Action`, `Note`.

### Consequence
Tenant history rows do not align to the actual `HB Article Workflow History` schema.

### Fix direction
Realign to:
- `review`
- `PreviousState`
- `NewState`
- `ActionNote`
and remove any dependency on a non-existent `Action` field unless the tenant schema is deliberately extended.

---

## P1-01 — Publishing-error logging is intentionally unimplemented
### Files
- `publisherRepositories.ts`

### Issue
`publishingErrors.append()` throws a not-implemented error.

### Consequence
Operational publish failures are not captured in the authoritative error list.

### Fix direction
Implement a real error-log repository/writer against `HB Article Publishing Errors`.

---

## P1-02 — Promotion Rules list is completely unwired
### Files
- `publisherAdapter/index.ts`
- `publisherListDescriptors.ts`
- `ArticlePublisher.tsx`
- `publishOrchestrator.ts`

### Issue
No promotion-rule repository, mapper, or consumer exists.

### Consequence
Promotion defaults and destination/homepage rollup logic are absent from the current implementation.

### Fix direction
Add a real `HB Article Promotion Rules` seam and decide exactly where its effects should apply:
- authoring defaults
- publish-time rollup flags
- manual override gating

---

## P1-03 — “Publish” path does not prove final page-publish semantics
### Files
- `pageCreationService.ts`
- `pageShellService.ts`
- `publishOrchestrator.ts`

### Issue
The current pipeline creates or updates page canvas content, but does not clearly execute the final page publish action.

### Consequence
The hosted surface may report a successful publish flow without actually making the modern page live.

### Fix direction
Add and verify the final publish step for the modern page lifecycle.

---

## P1-04 — Publish orchestration does not fully update the master article record after publish
### Files
- `publishOrchestrator.ts`
- `ArticlePublisher.tsx`

### Issue
No full tenant-aligned post-publish master-row persistence was found for article page metadata.

### Consequence
`HB Articles` can drift from destination-page reality.

### Fix direction
After successful publish/republish/regenerate, update the master `HB Articles` row with the authoritative destination metadata.

---

## P1-05 — Archive and withdraw are only state changes, not full operational flows
### Files
- `ArticlePublisher.tsx`
- `workflowStateMachine.ts`
- `publishOrchestrator.ts`

### Issue
Archive and withdraw are handled as simple transitions rather than full lifecycle actions.

### Consequence
Stale pages, stale bindings, or stale rollup exposure can remain.

### Fix direction
Define explicit archive/withdraw orchestration with binding, page, sync, history, and promotion side effects.

---

## P2-01 — Validation engine is structurally rich but bound to the wrong schema
### Files
- `validationEngine.ts`

### Issue
Validation depends on fields and template metadata that do not match the tenant model.

### Consequence
Validation results may block valid tenant data or pass invalid tenant data.

### Fix direction
Rebuild validation profiles against the actual tenant field model and template registry.

---

## P2-02 — Team Viewer integration is split across two incompatible models
### Files
- `teamViewerAdapter.ts`
- `teamViewerListRegistry.ts`
- `teamViewerListSource.ts`
- `publisherAdapter/*`

### Issue
The Team Viewer consumer side understands `HB Article*` schema, while the publisher side still emits `PostId`-based structures.

### Consequence
Publisher output and Team Viewer runtime expectations can drift even after partial fixes.

### Fix direction
Use one shared article-domain contract across publisher + Team Viewer.

---

## P3-01 — Terminology drift still obscures the app-versus-destination boundary
### Files
- `ArticlePublisher.tsx`
- `publisherContracts.ts`
- `publisherListDescriptors.ts`
- `publisherEnums.ts`

### Issue
Even after the app-level rebrand to Article Publisher, the code still mixes:
- Article Publisher (app identity)
- Project Spotlight (current destination identity)
- Post
- Article
- Shell
- Template
without a single tenant-aligned ubiquitous language.

### Consequence
Future fixes are more error-prone because developers must mentally translate between mismatched models.

### Fix direction
Standardize terminology around the tenant-authoritative article model before further expansion.
