# Phase Summary — Cumulative Loader-Contract Regression

## Objective

Fix the cumulative `hb-webparts` runtime regression that appeared after moving from two successful direct proof cases to the cumulative all-webparts package.

## Baseline truth

### Known-good tenant states
1. `HbHeroBannerWebPart` rendered successfully in tenant under the single-target direct-loader proof-case model.
2. `PriorityActionsRailWebPart` rendered successfully in tenant under the same single-target direct-loader proof-case model.

### New failing tenant state
After the cumulative all-webparts package was implemented, SharePoint render failures returned.

## Confirmed defect layer

The regression was caused by an **AMD `define()` module registration name mismatch** in the cumulative loader contract.

The compiled `shell-web-part_*.js` registers its module as `define("9a2f7f61-..._1.0.0", ...)` (the neutral shell manifest ID), but each webpart's manifest expects a module named `define("{webpartId}_1.0.0", ...)`. SPFx's AMD loader cannot resolve the mismatch.

### Resolution history

1. **P6-01** identified AMD shim indirection as the root cause of the original regression.
2. **P6-02** removed shims and mapped all webparts to the shared shell JS file directly. This eliminated the cross-module dependency error but introduced the define() name mismatch (all webparts point to a file that registers under the neutral ID, not their own ID).
3. **P6-03** rebuilt and verified the package structure but did not check the internal define() name.
4. **P6-04** identified the define() name mismatch as the remaining defect and resolved it by generating per-webpart shell copies with patched define() names.

## This phase accomplished three things

1. **Audited the cumulative package** (P6-01, P6-04)
   - source truth, package truth, runtime contract analysis

2. **Implemented the correct remediation** (P6-02, P6-04)
   - removed AMD shim indirection (P6-02)
   - patched define() names per-webpart (P6-04)

3. **Revalidated the cumulative package** (P6-03, P6-04)
   - package inspection: all 10 webparts verified with correct define() names
   - tenant validation: requires manual operator action

## Out of scope

- visual refinement
- homepage composition redesign
- non-blocking console-noise cleanup
- unrelated SharePoint page issues
