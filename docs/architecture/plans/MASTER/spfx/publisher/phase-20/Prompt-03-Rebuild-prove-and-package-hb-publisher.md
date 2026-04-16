# Prompt 03 — Rebuild, Prove, and Package the Result

Continue from the current working state.

Do not re-read files that are already in your active context or memory. Only open additional files when required to complete implementation safely.

## Objective

Rebuild `hb-publisher.sppkg`, prove the corrected package shape, and produce a clean evidence bundle showing how the rebuilt publisher package now aligns more closely with the working `hb-webparts.sppkg` package shape.

This is a closure task, not a planning task. Do not defer validation.

## Required actions

1. Increment the publisher package version in the correct source-of-truth location so SharePoint receives a materially new package version.
   - Use the next logical patch/build increment only.
   - Do not change solution IDs or component IDs.

2. Rebuild:
   - `hb-publisher` only
   - using the existing authoritative packaging path

3. Produce and inspect:
   - `dist/sppkg/hb-publisher.sppkg`
   - the package-truth proof artifact(s)
   - the shim proof artifact(s)
   - any hosted deployment/load proof artifact(s) already emitted by the pipeline

4. Extract and report a package inventory excerpt showing:
   - `shell-web-part_*.js`
   - `shell-entry-1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10-*.js`
   - `hb-publisher-app-*.js`
   - CSS asset(s)

5. Compare the rebuilt publisher package shape against `hb-webparts.sppkg` only for the narrow question of shell asset structure:
   - confirm both now preserve a canonical compiled shell asset
   - confirm publisher still correctly uses its publisher-specific shell-entry mapping

6. If the rebuild or proofs fail, fix the code now and re-run. Do not stop at first failure and do not convert known work into future work.

## Acceptance criteria

A successful completion must show all of the following:
- publisher version incremented
- package rebuilt successfully
- canonical shell asset present
- shell-entry asset present
- publisher app bundle present
- package-truth/proof artifacts pass
- no regression in publisher manifest linkage
- concise comparison showing the shell packaging shape now aligns with the working `hb-webparts` model in the specific area that mattered

## Required output

Return:
1. files changed
2. old version → new version
3. exact rebuild command(s) run
4. exact proof artifacts produced
5. a short package inventory excerpt
6. a concise go/no-go statement on whether this package is now ready for tenant re-upload
