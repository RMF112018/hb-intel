# Prompt 04 — Close or remove the live milestoneSpotlight branch

## Objective
Resolve the fact that `milestoneSpotlight` is still exposed in the live app even though milestone-specific authoring, validation, and persistence are not closed end to end.

## Governing authority / required reference docs
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherContracts.ts`

## Files and code paths to inspect
- `ArticlePublisher.tsx`
  - content-type selector
  - authoring surface
- `validationEngine.ts`
  - required-field sets
- `publisherWriters.ts`
  - `mapArticleRowToListFields`
- `publisherContracts.ts`
- any milestone-specific template entries/tests/docs

## Exact defect to close
The live UI still exposes `milestoneSpotlight`, but milestone fields are not surfaced and the writer intentionally omits milestone persistence.

## Required implementation outcome
Pick one bounded direction and close it fully:

### Option A — fully implement milestone spotlight
- restore milestone required-field validation
- surface milestone inputs in the authoring UI
- persist milestone fields
- prove template/render behavior

### Option B — remove milestoneSpotlight from the live surface for now
- keep read compatibility if needed
- remove it from authoring affordances until the branch is ready

Use the repo-truth safest option unless milestone implementation is already substantially present.

## Validation / proof of closure requirements
- prove operators can no longer select a half-implemented content type
- or prove milestone content type is now truly end-to-end complete
- add/adjust tests accordingly

## Deliverables / closure docs to create
Create:
- `docs/architecture/plans/MASTER/spfx/publisher/closure/04-close-or-remove-the-live-milestoneSpotlight-branch.md`

## Explicit boundaries
- Do not broaden destination support
- Do not combine with promotion-rule work
- Do not change unrelated article fields

## Operating instruction
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
