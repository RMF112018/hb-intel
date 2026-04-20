# HB Homepage Row-Pairing Root-Cause Audit Package

This package captures the completed repo-truth audit of the HB Homepage row-pairing defect on `main`.

## What this package concludes

The current source tree does **not** support the locked target behavior defined in the prompt:

- `tablet-landscape` is still explicitly authored as a single-column state.
- `feature-pair` and `asymmetric-two-up` recipes are still ineligible for `tablet-landscape`.
- the paired-width / shell-fit math makes Row 1 and Row 2 pair only at roughly `>= 1560px` usable shell width
- the paired-width / shell-fit math makes Row 3 pair only at roughly `>= 2160px` usable shell width
- CSS does not activate paired grids below `1180px`, so `tablet-landscape` cannot visually pair even if runtime policy were loosened

## Package contents

- `00-Homepage-Root-Cause-Audit-Summary.md`
- `01-Current-Homepage-Implementation-Map.md`
- `02-Root-Cause-Investigation.md`
- `03-Proven-Root-Cause-Register.md`
- `04-Minimal-Correction-Path.md`
- `05-Recommended-Verification-Flow.md`

## Scope discipline

This is a root-cause package, not a redesign package. It focuses only on the seams that govern row pairing below the launcher.
