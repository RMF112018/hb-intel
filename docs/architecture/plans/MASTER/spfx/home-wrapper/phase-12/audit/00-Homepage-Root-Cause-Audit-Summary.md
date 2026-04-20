# 00 — Homepage Root-Cause Audit Summary

## Objective

Determine exactly why the current HB Homepage implementation still renders one app per row below the launcher instead of pairing rows on target non-handheld device classes.

## Repo-truth conclusion

The problem is primarily **source-level**, with a secondary **deployment/runtime verification** branch for hosted ultrawide behavior.

### Proven source-level blockers

1. **`tablet-landscape` is still authored as single-column.**  
   `breakpointPolicy.ts` sets `tablet-landscape` to `firstLaneColumns: 1` and `firstLanePairingAllowed: false`.

2. **The row recipes are still not eligible for `tablet-landscape`.**  
   - Row 1 and Row 2 use `feature-pair`, which is restricted to `ultrawide-desktop` and `standard-laptop`.
   - Row 3 uses `asymmetric-two-up`, which is also restricted to `ultrawide-desktop` and `standard-laptop`.

3. **The paired-width shell-fit contracts do not support the locked target across standard-laptop widths.**  
   The shell's paired layout uses a `2fr / 1fr` or `1fr / 2fr` split. Because the minor column is one-third of usable shell width:
   - Row 1 requires about `1560px` usable shell width to keep `hb-kudos` stable in the minor column.
   - Row 2 requires about `1560px` usable shell width to keep `safety-field-excellence` stable in the minor column.
   - Row 3 requires about `2160px` usable shell width to keep `people-culture-public` stable in the minor column.

4. **CSS still refuses to visually pair below `1180px`.**  
   The paired grid templates and major/minor column placement only activate at `@container homepage-shell (min-width: 1180px)`.

## What this means operationally

- `tablet-landscape` stacking is **intentional current logic**, not an accident.
- standard-laptop pairing is only partially true in source:
  - Row 1 and Row 2 can pair only at the very top end of usable standard-laptop width
  - Row 3 cannot pair anywhere inside the authored `standard-laptop` band
- the locked target from the prompt is therefore impossible under the current source tree

## Hosted ultrawide implication

If a truly full-width hosted page still stacks all rows at an ultrawide usable shell width, then a **second issue** is likely present:

- stale or mismatched deployed `.sppkg`
- page not actually authored in full-width mode
- hosted shell width materially narrower than the user expects

That branch is not proven from repo source alone, but the repo already contains a runbook and marker model for verifying it.
