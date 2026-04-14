# Prompt 03 — Realign archive / withdraw master and binding sync metadata

## Objective

Close the lifecycle drift where archive / withdraw demote the destination binding row but leave stale page-sync metadata on the master article.

## Governing authority / required reference docs

- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageBindingWriter.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherContracts.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`

## Files and code paths to inspect

- archive lifecycle path
- withdraw lifecycle path
- article update payloads
- binding update payloads
- any tests covering lifecycle transitions

## Exact defect to close

Archive / withdraw correctly demote the binding row but do not fully realign master article page-sync metadata with that downgraded state.

## Required implementation outcome

When archive / withdraw succeeds:
- the master article and the destination binding row must tell the same lifecycle story
- page-sync metadata on `HB Articles` must no longer imply a fully in-sync/live destination when the binding has been demoted to draft/pending

## Validation / proof of closure requirements

Prove:
- archive path keeps article and binding metadata coherent
- withdraw path keeps article and binding metadata coherent
- page unpublish failure behavior remains explicit
- workflow history still appends correctly

## Deliverables / closure docs

Create:
- `docs/architecture/plans/MASTER/spfx/publisher/closure/03-closure-archive-withdraw-sync.md`

## Constraint

Do not change actor attribution in this prompt.
Do not make unrelated changes.
Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
