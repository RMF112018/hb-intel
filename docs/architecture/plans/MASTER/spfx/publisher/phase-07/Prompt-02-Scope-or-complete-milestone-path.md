# Prompt 02 — Scope out or complete the milestone path

## Objective

Close the defect where `milestoneSpotlight` is exposed in the current authoring surface even though milestone authoring is not implemented end to end.

## Governing authority / required references

Treat the following as binding:
- `/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `/Users/bobbyfetting/hb-intel/apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `/Users/bobbyfetting/hb-intel/apps/hb-webparts/src/homepage/data/publisherAdapter/publisherEnums.ts`
- `/Users/bobbyfetting/hb-intel/apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts`
- `/Users/bobbyfetting/hb-intel/apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`

## Files and code paths to inspect

At minimum inspect:
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
  - metadata content-type selector
  - any milestone-related authoring fields or lack thereof
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherEnums.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts`
  - removed / missing milestone-required-field path
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`
  - `mapArticleRowToListFields`
- any template-registry assumptions or tests that reference milestone required-field sets

## Exact defect to close

Current behavior:
- `milestoneSpotlight` remains visible to operators in the content-type selector
- milestone required-field validation is intentionally removed
- milestone fields are intentionally not emitted on article writes
- the current UI does not provide a complete milestone authoring path

This creates a false promise in the live authoring surface.

## Required implementation outcome

Choose one path and complete it cleanly:

### Preferred path — scope it out honestly
- remove or hide milestone content type from the current authoring surface
- prevent ordinary authoring from entering a milestone-only path
- leave schema compatibility intact for read safety
- document clearly that milestone authoring is not yet supported in this sprint

### Alternative path — implement it fully
- add milestone authoring controls
- restore milestone validation
- persist milestone fields correctly
- prove preview / publish behavior is correct for milestone articles

If you choose the alternative path, keep the implementation tightly bounded to milestone support and do not broaden other content-type work.

## Validation / proof of closure requirements

Prove one of the following:
- milestone is no longer operator-selectable in the current sprint surface, **or**
- milestone is now fully authorable, validated, and persisted end to end

Also prove there is no longer a path where the UI advertises milestone while the write/validation layer does not support it.

## Deliverables / closure docs

Create:
- `/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/closure/closure-milestone-path.md`

The closure note must state:
- which path you chose
- exact files changed
- why the final state is honest and operationally sound

## Explicit instruction not to make unrelated changes

Do not broaden destination support, do not rework promotion rules, do not change scheduled workflow handling, and do not refactor unrelated UI.

## Operating instruction

Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
