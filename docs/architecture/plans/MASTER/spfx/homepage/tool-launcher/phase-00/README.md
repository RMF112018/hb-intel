# Phase 00 Package — Doctrine Lock and Surface Reset

## Objective

Lock the Tool Launcher / Work Hub implementation to the correct target before additional development proceeds.

This phase exists to prevent the implementation from drifting back into a grouped quick-links surface or a generic SharePoint utility card. The package is grounded in the current repo truth and in the updated architecture direction that now treats the live SharePoint list **`Tool Launcher Contents`** as the content source and the launcher architecture brief as the UI hierarchy source.

## Why this phase exists

The current implementation already renders a launcher surface, but it is still fundamentally built around a local grouped configuration seam:

- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/ToolLauncherWorkHub.tsx`
- `apps/hb-webparts/src/homepage/helpers/utilityConfig.ts`
- `apps/hb-webparts/src/homepage/webparts/utilityContracts.ts`
- `packages/ui-kit/src/HbcLauncherSurface/index.tsx`

That implementation is good enough to prove a launcher exists, but it is not yet the premium marketplace-style launcher defined in the updated planning work.

This phase therefore does **not** add new features. It establishes the correct target, documents the current-vs-target gap, and retires stale assumptions so that Phase 01 can replace the data seam cleanly.

## Scope

This package should result in:

1. a repo-truth audit of the current Tool Launcher surface
2. a doctrine lock against the SPFx governing standard and homepage overlay
3. a current-vs-target gap map
4. a retirement plan for obsolete grouped-tile assumptions
5. a locked target contract for the next implementation phases

## Explicit exclusions

This phase must **not**:

- build live SharePoint list wiring
- implement the final flagship stage
- create the all-platforms overlay
- redesign unrelated homepage webparts
- re-open the already-settled schema-creation problem

## Package contents

- `phase-00-package-summary.md`
- `prompt-01-repo-truth-and-doctrine-lock.md`
- `prompt-02-current-launcher-gap-map-and-retirement-plan.md`
- `prompt-03-surface-reset-and-target-contract.md`
- `phase-00-validation-checklist.md`
- `phase-00-completion-notes-template.md`

## Prompt execution order

1. Prompt 01
2. Prompt 02
3. Prompt 03

## Required working posture for all prompts

- repo truth first
- do not re-read files still in current context unless needed
- do not broaden scope
- keep homepage work aligned to `apps/hb-webparts`
- treat the list as the content source and the architecture brief as the UI hierarchy source
- preserve SharePoint host awareness and authoring safety
- update documentation as part of the work
