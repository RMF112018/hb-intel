# Prompt 04 — SPPKG Rebuild and Package-Truth Verification

## Objective

Perform a clean rebuild of the relevant SharePoint webparts package and verify that the corrected Spotlight image-resolution behavior survives into the packaged output.

## Why This Prompt Exists

Source truth alone is not enough. The fix must survive bundling and packaging into the deployed `.sppkg`.

## Target

Primary package:
- `hb-webparts.sppkg`

Relevant bundle / packaging seams:
- the Spotlight webpart entry
- the shared bundled JS that contains the corrected resolver
- any manifest or package artifact that could preserve stale logic

## Required Actions

1. Perform a clean rebuild using the repo’s actual build/package path.
2. Generate a fresh `.sppkg`.
3. Inspect the packaged output enough to prove:
   - the Spotlight webpart is still present
   - the corrected resolver logic is present in the emitted JS bundle
   - no stale bundle is being packaged
4. Confirm manifest-seeded fallback behavior remains intact.

## Hard Constraints

- Do **not** modify packaging architecture unless the rebuild proves it is necessary.
- Do **not** widen into generalized SPFx packaging modernization.
- Do **not** re-read files that are already in your active context window; use current context first and only open additional files when needed to complete the task safely and correctly.

## Deliverables

Produce a package-verification note with:

- `Build Path Used`
- `Artifacts Generated`
- `How Package Truth Was Verified`
- `Evidence the Corrected Resolver Survived Bundling`
- `Anything Still Requiring Tenant Validation`

## Standards / Best Practices

- clean rebuild, not incremental wishful thinking
- verify emitted artifact content, not just build success
- verify the package that will actually be deployed

## Validation Gate

Do not proceed to runtime closeout until you can prove:

- the rebuilt `.sppkg` includes the corrected logic
- no stale package artifact remains in play
