# Plan Summary — Homepage Canvas Cutover from Quick Links to PriorityActionsRail

## Objective
Close the exact homepage gap between **webpart/package existence** and **live page-canvas reality**.

The repo already supports `PriorityActionsRail` as a valid homepage webpart. The remaining uncertainty is whether the live SharePoint homepage canvas was actually re-authored so the middle action layer uses `PriorityActionsRail` instead of OOB Quick Links.

## Repo-Truth Summary
The local code agent must work from these truths:

1. `PriorityActionsRail` is a real independent SPFx homepage webpart and is part of the intended homepage stack.
2. The homepage architecture is per-webpart, not one monolithic renderer.
3. SharePoint page-canvas cutover is separate from package/build proof.
4. OOB Quick Links remaining on the page means the homepage canvas has not yet been conclusively proven or completed as cut over.

## Required Outcome
The agent must leave the repo and the tenant in a state where one of these is true:

- **Proof path:** the current homepage already has `PriorityActionsRail` in the action layer and no OOB Quick Links instance remains, with documented proof artifacts in-repo.
- **Completion path:** the agent creates or extends a repeatable automation seam and uses it to replace the OOB Quick Links instance with `PriorityActionsRail`, preserving the page order and publishing the page.

## Mandatory Operating Rules
- Do not address Project Spotlight in any way.
- Do not redesign the shell.
- Do not widen this into a homepage UX initiative.
- Do not stop at toolbox/package/build verification.
- Do not rely on screenshots alone when a programmatic page-canvas proof can be produced.
- Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Preferred Technical Direction
Use the repo’s existing SharePoint/PnP automation seams if possible.

Preferred order of implementation choice:
1. extend an existing page authoring / PnP runner seam
2. add a tightly scoped homepage-cutover automation seam in the same operational family
3. only if unavoidable, add a new narrow script/tool dedicated to homepage canvas cutover and proof

## Exact Page Target
The homepage must read, top to bottom:

1. full-width section → HB Signature Hero
2. standard/flexible section → PriorityActionsRail
3. full-width section → hbHomepage

## Definition of Done
Done means all of the following are true:
- homepage page canvas has been inspected programmatically
- OOB Quick Links is either proven absent or removed
- `PriorityActionsRail` is either proven present or inserted
- hero + action rail + homepage shell are in the correct top-to-bottom order
- the page is published after any mutation
- there is a rerunnable repo-resident command/script/runbook for validation and re-application
- documentation and evidence are committed locally
