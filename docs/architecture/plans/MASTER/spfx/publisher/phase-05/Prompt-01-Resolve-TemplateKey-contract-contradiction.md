# Prompt 01 — Resolve the TemplateKey contract contradiction

## Objective

Close the contradiction between:
- the authoring UI’s intentional blank-`TemplateKey` strategy
- the tenant `HB Articles.TemplateKey` required-column contract
- the row mapper’s non-empty requirement
- the validator’s non-empty requirement
- the resolver’s blank-means-auto-select behavior

Do not work on any unrelated lifecycle or audit-trail issue in this prompt.

## Governing authority / required reference docs

- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/templateResolver.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRowMappers.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishResolutionContext.ts`

## Files and code paths to inspect

- new-draft creation
- save path
- article upsert path
- article read path
- template resolution path
- validation path
- any tests covering template resolution and article persistence

## Exact defect to close

The implementation currently allows blank `TemplateKey` in the editor while simultaneously requiring non-empty `TemplateKey` in persisted article reads and validation. That leaves the master-record contract incoherent.

## Required implementation outcome

Choose and implement one coherent model end to end:

Either:
1. blank `TemplateKey` remains a valid transient authoring state, but the app resolves and persists a real `TemplateKey` onto `HB Articles` before/at save time

Or:
2. blank `TemplateKey` becomes a valid persisted state and every relevant seam is updated accordingly, if that can be made consistent with the real tenant schema

You must keep the final design consistent with the tenant schema authority.

## Validation / proof of closure requirements

Prove all of the following:
- a newly created article can be saved and re-read without disappearing or failing mapping
- validation behavior matches the final chosen contract
- template resolution still works correctly
- no code path still assumes the old contradictory behavior
- publish-resolution context still builds successfully for saved drafts

## Deliverables / closure docs

Create:
- `docs/architecture/plans/MASTER/spfx/publisher/closure/01-closure-templatekey-contract.md`

Include:
- final contract decision
- files changed
- before/after behavior
- evidence that save → reload → resolve is coherent

## Constraint

Do not make unrelated changes.
Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
