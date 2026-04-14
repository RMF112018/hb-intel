# Prompt 04 — Close or remove the stranded scheduled workflow branch

## Objective

Normalize the `scheduled` workflow branch so the product surface and the actual implementation tell the same story.

## Governing authority / required references

Treat the following as binding:
- `/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `/Users/bobbyfetting/hb-intel/apps/hb-webparts/src/homepage/data/publisherAdapter/workflowStateMachine.ts`
- `/Users/bobbyfetting/hb-intel/apps/hb-webparts/src/homepage/data/publisherAdapter/publisherEnums.ts`
- `/Users/bobbyfetting/hb-intel/apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `/Users/bobbyfetting/hb-intel/apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`

## Files and code paths to inspect

At minimum inspect:
- `apps/hb-webparts/src/homepage/data/publisherAdapter/workflowStateMachine.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherEnums.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
  - workflow-state filters
  - transition buttons
- any logic that assumes `scheduled` exists or can be loaded
- any tests or docs that reference scheduled behavior

## Exact defect to close

Current behavior:
- tenant schema includes `scheduled`
- the current state machine explicitly forbids inbound scheduling
- no scheduler / timed publish executor exists
- the app therefore carries a schema-complete but operationally dead branch

## Required implementation outcome

Choose one path and complete it cleanly:

### Preferred path — scope it out
- keep read compatibility if needed
- remove `scheduled` from operator-facing filters / transitions / narratives where appropriate
- make the product surface honest about what is actually supported now

### Alternative path — implement scheduled publishing
Only choose this if you can close it properly in bounded scope. That means:
- legal transition into `scheduled`
- scheduled-publish execution path
- correct state changes, page lifecycle, binding writes, and workflow-history writes

Do not leave the branch half alive.

## Validation / proof of closure requirements

Prove one of the following:
- `scheduled` is now truly supported end to end, **or**
- `scheduled` is intentionally out of the current product surface and no longer behaves like a pseudo-supported branch

## Deliverables / closure docs

Create:
- `/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/closure/closure-scheduled-workflow.md`

The closure note must include:
- which path you chose
- exact files changed
- why the resulting workflow model is internally consistent

## Explicit instruction not to make unrelated changes

Do not broaden destination support and do not combine this work with milestone or promotion-rule cleanup.

## Operating instruction

Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
