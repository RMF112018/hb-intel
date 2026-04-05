# Phase Summary — Cumulative Loader-Contract Regression

## Objective

Fix the cumulative `hb-webparts` runtime regression that appeared after moving from two successful direct proof cases to the cumulative all-webparts package.

## Baseline truth

### Known-good tenant states
1. `HbHeroBannerWebPart` rendered successfully in tenant under the single-target direct-loader proof-case model.
2. `PriorityActionsRailWebPart` rendered successfully in tenant under the same single-target direct-loader proof-case model.

### New failing tenant state
After the cumulative all-webparts package was implemented, SharePoint render failures returned.

## Most likely defect layer

The most likely regression layer is the **cumulative loader contract**, including some combination of:

- neutral shell manifest base module identity
- per-webpart `entryModuleId` emission
- per-webpart `scriptResources` emission
- generated AMD shim file content and naming
- packaged asset presence / packaged manifest truth
- SharePoint runtime request path vs packaged alias path
- regression from direct single-target loader path to cumulative multi-manifest path

## This phase must do three things

1. **Audit the latest cumulative package**
   - source truth
   - package truth
   - tenant/runtime evidence

2. **Implement the smallest correct remediation**
   - at the cumulative loader-contract layer

3. **Revalidate the cumulative package**
   - package inspection
   - tenant regression check for hero + rail
   - tenant validation path for remaining webparts

## Out of scope

- visual refinement
- homepage composition redesign
- non-blocking console-noise cleanup
- unrelated SharePoint page issues
