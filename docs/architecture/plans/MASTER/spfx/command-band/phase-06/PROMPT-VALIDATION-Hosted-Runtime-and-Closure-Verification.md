# Validation Prompt — Hosted SharePoint Validation and Hard Closure

## Objective

Validate the remediated `PriorityActionsRail + hbHomepage` result in the real SharePoint host and determine whether the work is actually closed.

## Validation posture

Do not treat local screenshots, unit tests, or code-path reasoning as final closure by themselves. The real closure gate is the hosted SharePoint outcome.

## Required validation matrix

### A. Host states
- normal view mode
- SharePoint edit mode

### B. Width / usable-space states
- standard desktop
- wider desktop / ultrawide if available
- narrower tablet-like width
- higher zoom (125% or 150%)
- short-height constrained state if available

### C. Interaction states
- default closed overflow state
- overflow open state
- keyboard traversal state
- reduced-motion check if practical

### D. Technical checks
- console cleanliness
- build/package proof retained
- no new runtime regressions in related surfaces

## Pass criteria

The result passes only if all of the following are true:
- the rail is still wrapper-owned and pre-shell
- the rail does not read as a timid bordered card inside a larger white container
- the rail reads as a command band / premium utility layer
- hero, primary actions, and the beginning of the first shell lane are visible on first view in the required states
- overflow remains governed and usable
- no material accessibility regression is observed
- no new console/runtime defect blocks release confidence

## Failure criteria

The result fails if any of the following are still true:
- the rail still reads as a nested card or utility panel
- the shell seems to own the rail or the rail was reclassified into shell semantics
- primary actions are buried, crowded, or hard to scan
- overflow is awkward, inaccessible, or visually generic
- the first shell lane is not meaningfully visible on first load where required
- hosted console errors remain

## Required output

Produce a hard-closure note that includes:
- build/package status
- screenshot inventory
- console review result
- pass/fail call per validation category
- any remaining defects, explicitly listed
- final closure verdict: `Closed`, `Closed with named non-blocking residue`, or `Not closed`

## Mandatory directive

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
