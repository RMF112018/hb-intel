# Phase 00 — Package Summary

## Phase Title

Doctrine Lock and Surface Reset

## Objective

Freeze the Tool Launcher / Work Hub implementation target against the current repo truth and the governing homepage doctrine so the next implementation phase can replace the existing grouped-config seam without ambiguity.

## Repo-truth baseline

The current Tool Launcher implementation is already present in the homepage product lane and is part of the cumulative `apps/hb-webparts` package. It currently flows through:

- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/ToolLauncherWorkHub.tsx`
- `apps/hb-webparts/src/homepage/helpers/utilityConfig.ts`
- `apps/hb-webparts/src/homepage/webparts/utilityContracts.ts`
- `packages/ui-kit/src/HbcLauncherSurface/index.tsx`

The current shape is still:

- heading
- groups
- items
- icon-led grouped tiles

That is not yet the intended premium marketplace hierarchy.

## What has already been solved

- the launcher exists in the repo
- the homepage lane architecture already exists
- homepage doctrine already exists
- the new architecture direction has already been defined
- the SharePoint list is already created and seeded
- the asset-manifest direction for platform brand treatment already exists

## What this phase must solve

- eliminate ambiguity about the target launcher model
- document exactly what the current implementation is doing
- map which current elements can survive into the next phases
- identify what must be retired or replaced
- lock the next phase to live-list wiring rather than schema ideation

## Deliverables

1. Doctrine lock memo
2. Current-vs-target gap map
3. Surface reset memo
4. Updated implementation notes for the next phase

## Dependencies

None. This is the reset and alignment phase.

## Risks addressed

- grouped-tile regression
- doctrine drift
- mistaken assumption that data modeling is still a greenfield task
- UI polishing on top of the wrong structural contract
