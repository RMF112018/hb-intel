# HB Publisher Packaging Prompt Package

## Objective

This package contains a sequenced set of implementation prompts for a local code agent to correct the `hb-publisher.sppkg` packaging shape so it more closely aligns with the working `hb-webparts.sppkg` shell asset structure.

The specific focus is to:

- preserve the canonical compiled `shell-web-part_*.js` asset in the final `hb-publisher.sppkg`
- keep the publisher-specific `shell-entry-*.js` asset and manifest linkage intact
- harden verification/proof logic so the package cannot regress back to a shell-entry-only shape
- rebuild and validate the corrected publisher package with proof artifacts

## Files Included

1. `Prompt-01-Canonicalize-hb-publisher-shell-packaging-shape.md`
2. `Prompt-02-Tighten-hb-publisher-package-verifier.md`
3. `Prompt-03-Rebuild-prove-and-package-hb-publisher.md`

## Recommended Execution Order

Run the prompts in this order, in the same local code-agent thread:

1. Prompt 01
2. Prompt 02
3. Prompt 03

Keeping them in the same thread helps the agent preserve context and reduces unnecessary file re-reading.

## Expected End State

A successful completion should result in:

- a rebuilt `dist/sppkg/hb-publisher.sppkg`
- canonical `shell-web-part_*.js` present in the package
- publisher `shell-entry-*.js` present in the package
- publisher app bundle present in the package
- verification/proof logic that hard-fails if the canonical shell asset is missing
- proof artifacts clearly showing the corrected package shape

## Notes

- These prompts are intentionally implementation-grade and do not allow deferral of known work.
- They are narrowly focused on the shell packaging shape issue and the related proof/validation path.
- They do not instruct metadata churn or unnecessary ID changes.
