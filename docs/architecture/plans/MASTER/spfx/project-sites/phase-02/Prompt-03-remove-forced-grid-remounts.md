# Prompt 03 — Remove Forced Grid Remounts and Transition Replay

## Objective
Stop the Project Sites grid from remounting on ordinary scope and sort changes, and ensure motion does not make stable updates look like glitches.

## Governing Authorities / Relevant Docs
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`

## Critical Operating Instruction
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Exact Files and Symbols to Inspect
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
  - success-grid wrapper
  - grid `key`
  - grid animation styling
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`
  - card motion / hover behavior only where materially relevant

## Exact Defect / Instability Issue to Close
The grid container is keyed by scope and sort state, which forces subtree remounts. The same surface also uses entry animation, so normal interactions visibly replay transition effects.

## Required Implementation Outcome
Implement a stable update path in which:
1. scope and sort changes do not force a full grid remount
2. the DOM is reconciled incrementally where possible
3. motion is limited to first paint or truly stable transitions
4. sort changes feel like reordering/updating, not flashing
5. scope changes feel like content refresh, not tree replacement

## Validation / Proof of Closure Requirements
Provide proof for all of the following:
- removing or replacing the remount key does not break accessibility or layout
- scope changes do not replay an avoidable full-grid mount animation
- sort changes no longer present as visible flicker
- tests or instrumentation demonstrate that the grid subtree is not being remounted unnecessarily

## Explicit Non-Goals
- no redesign of card content
- no changes to search/filter logic beyond what is strictly needed for transition stability
