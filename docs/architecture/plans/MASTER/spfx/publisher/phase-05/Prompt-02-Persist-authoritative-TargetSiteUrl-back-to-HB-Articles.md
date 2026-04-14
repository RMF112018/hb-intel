# Prompt 02 — Persist authoritative TargetSiteUrl back to HB Articles

## Objective

Close the successful-publish back-sync gap so `HB Articles` receives the authoritative destination `TargetSiteUrl` after publish when the binding row derives it from canonical destination mapping.

## Governing authority / required reference docs

- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/destinationSiteUrls.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherContracts.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`

## Files and code paths to inspect

- publish success path
- binding-row creation/upsert path
- master-article back-sync path
- any tests covering post-publish metadata

## Exact defect to close

The binding row gets the authoritative `TargetSiteUrl`, but the master article does not always get that same authoritative value written back during successful publish.

## Required implementation outcome

After successful publish / regenerate / in-place update, the master article must hold the authoritative destination site URL that the publish path actually used.

That outcome must be consistent with:
- tenant schema
- intended optional-authoring behavior for `TargetSiteUrl`
- destination canonicalization rules

## Validation / proof of closure requirements

Prove:
- publish success writes the same authoritative destination site URL to both:
  - `HB Article Destination Pages.TargetSiteUrl`
  - `HB Articles.TargetSiteUrl`
- existing valid authored `TargetSiteUrl` behavior is not broken
- preview remains read-only

## Deliverables / closure docs

Create:
- `docs/architecture/plans/MASTER/spfx/publisher/closure/02-closure-targetsiteurl-backsync.md`

## Constraint

Do not fix archive/withdraw drift in this prompt.
Do not make unrelated changes.
Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
