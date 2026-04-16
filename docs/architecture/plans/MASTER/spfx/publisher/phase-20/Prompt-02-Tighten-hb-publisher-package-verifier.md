# Prompt 02 — Tighten the `hb-publisher` Package Verifier

Continue from the current working state.

Do not re-read files that are already in your active context or memory. Only open additional files when required to complete implementation safely.

## Objective

Now that the packaging shape has been corrected, harden the verification and proof logic so `hb-publisher` can never again ship as a shell-entry-only package without the canonical compiled shell asset.

The end state is not a soft warning. It must be a hard failure if the package shape regresses.

## Files to inspect and modify as needed

Primary:
- `tools/build-spfx-package.ts`

Secondary only if needed:
- `apps/hb-publisher/deployment/README.md`

## Required implementation changes

1. Update `.sppkg` verification logic so that `hb-publisher` explicitly requires presence of the canonical compiled shell asset:
   - `ClientSideAssets/shell-web-part_*.js`
   - in addition to the publisher `shell-entry-*.js`

2. Update any existing package inspection logic that currently treats a `shell-entry-only` shape as acceptable for `hb-publisher`.

3. Update proof output to record, for `hb-publisher`, at minimum:
   - canonical shell asset filename
   - shell-entry filename
   - publisher app bundle filename
   - whether all three were found in the final package

4. If `apps/hb-publisher/deployment/README.md` currently implies or tolerates the shell-entry-only package shape, correct that documentation so it matches the implemented package truth.

5. Keep the validation strict and implementation-grade. No “warning only” posture.

## Acceptance criteria

The verification/proof path must fail if any of the following are missing from `hb-publisher.sppkg`:
- canonical `shell-web-part_*.js`
- publisher `shell-entry-*.js`
- publisher app bundle

The proof artifacts for `hb-publisher` must make the corrected package shape obvious without manual interpretation.

## Required output

Return:
1. exact validation/proof changes made
2. the specific failure conditions now enforced
3. the proof artifact fields that demonstrate the corrected package shape
