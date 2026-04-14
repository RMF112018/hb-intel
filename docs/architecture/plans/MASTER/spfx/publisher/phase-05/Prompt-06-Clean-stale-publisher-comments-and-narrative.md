# Prompt 06 — Clean stale publisher comments and narrative

## Objective

Remove stale or drifted comments so the repo narrative matches the corrected implementation.

## Governing authority / required reference docs

- corrected implementation after Prompts 01–05
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherEnums.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherContracts.ts`

## Files and code paths to inspect

- runtime mount comments
- adapter barrel comments
- enum comments
- contract comments
- any other stale “phase” or “not yet realigned” comments still present in the touched publisher seams

## Exact defect to close

The current comments still describe partially obsolete behavior and status.

## Required implementation outcome

After this cleanup:
- comments accurately describe the current runtime behavior
- no stale list-name or “not yet aligned” narrative remains in the corrected seams
- comments do not over-promise future functionality

## Validation / proof of closure requirements

Prove:
- every touched comment reflects current behavior
- no functional changes were introduced in this cleanup-only prompt

## Deliverables / closure docs

Create:
- `docs/architecture/plans/MASTER/spfx/publisher/closure/06-closure-comment-cleanup.md`

## Constraint

No functional changes.
Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
