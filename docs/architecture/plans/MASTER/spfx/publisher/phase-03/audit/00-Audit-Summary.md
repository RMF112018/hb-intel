# 00 — Audit Summary

## Executive Summary

### Overall verdict
The current `Article Publisher` implementation is **not correctly wired overall** to the target SharePoint operating model, even though several foundational seams are correctly pointed at the right tenant resources.

### What is wired correctly
- The SPFx manifest id, runtime contract id, and mount entry are aligned.
- The publisher resolves its control-plane lists against the correct HBCentral host site.
- The list display names for the 8 target `HB Article*` lists are correct.
- The template-registry resolution seam is structurally sound.
- The destination-page binding seam is structurally sound.
- The page-creation / page-publish seam is present and appears intentionally built around SharePoint Pages REST.

### What is not trustworthy
- The workflow lifecycle is internally inconsistent.
- The team-member child-record seam is not aligned to tenant schema.
- The media child-record seam is not aligned to tenant schema.
- Publish / republish side effects are incomplete relative to the operating model.
- Archive / withdraw lifecycle behavior is operationally weak.
- UI-level drift messaging does not match policy-level republish behavior.

### Production readiness opinion
**Not production-ready for dependable editorial operations.**

It is possible to produce a working destination page in some narrow scenarios, but the current implementation is vulnerable to:
- false “published” state without a live page
- live page without corresponding workflow-state closure
- broken team/media persistence
- stale live-page exposure after withdraw/archive
- destructive child-record rewrites with no rollback

## Audit Method

### Repo scope inspected
Primary runtime and adapter files inspected:
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/articlePublisher/runtimeContract.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherListDescriptors.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherContracts.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherEnums.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRowMappers.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageBindingWriter.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/templateResolver.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishResolutionContext.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/workflowStateMachine.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/republishPolicy.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/preview/previewBuilder.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/teamViewerAdapter.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageShellService.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageCreationService.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageCompositor.ts`

### Schema authority used
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`

### Assumptions
- The repo `main` branch is implementation authority.
- The schema report is tenant authority for list names, internal field names, and required-field expectations.
- Hosted behavior is inferred from code and schema because no live transaction execution was performed in the tenant during this audit.

### Limitations
- No live list CRUD transaction was executed against the tenant.
- No direct hosted-page browser interaction was used to click through UI branches.
- Therefore, hosted symptoms are evidence-based predictions from implementation, not direct transaction proofs.

## Top Findings

### P0
1. **Workflow can be advanced to `published` without running the publish pipeline.**
   - `ArticlePublisher.tsx` exposes `→ published` as a direct workflow transition.
   - That path updates only `HB Articles.WorkflowState`, `UpdatedDateUtc`, and maybe `PublishedDateUtc`, then appends history.
   - It does **not** create/update the destination page or destination-page binding.

### P1
2. **Publish / republish does not close workflow state or append workflow history.**
3. **`HB Article Team Members` save/load seam is schema-incompatible.**
4. **`HB Article Media` save/load seam is schema-incompatible.**
5. **Archive / withdraw leaves stale live-page exposure risk.**

### P2
6. Descriptor `mvpFields` are materially drifted from tenant schema in key lists.
7. UI drift messaging says shell drift “will regenerate,” while policy performs in-place update.
8. Child replace-all writes are destructive and non-transactional.

## Closure recommendation
Fix the workflow/publish lifecycle first. Do not start with visual polish or list extraction refinements. The current highest risk is operational state corruption and false editorial status.
