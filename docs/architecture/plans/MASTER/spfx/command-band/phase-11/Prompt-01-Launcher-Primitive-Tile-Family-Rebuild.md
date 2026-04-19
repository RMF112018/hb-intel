# Prompt 01 — Launcher Primitive Tile Family Rebuild

## Objective

Replace the current `HbcHomepageLauncher` chip-band primitive with a true launcher tile family that reads as a premium homepage launcher, not as a row of branded buttons.

## Why this prompt exists

The live homepage path has already been cut over away from the old flagship rail.
That part is not the problem.

The problem is that the current replacement primitive is still explicitly designed and implemented as:
- a chip band
- a capsule-button strip
- a dense quick-action row

That outcome is materially below the required launcher standard.

This is not a spacing tweak.
This is not a color pass.
This is a primitive-family rebuild.

## Current problem state

The current surface:
- uses a `HomepageLauncherChipModel`
- renders pill/capsule anchors
- constrains items to compact chip dimensions
- reads as a quick-action strip instead of a launcher
- under-delivers the required authority for a homepage work-hub entry surface

The wrapper/data seams are mostly acceptable.
The visible primitive is not.

## Inspect these seams first

- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncher.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherChip.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/types.ts`
- `packages/ui-kit/src/HbcHomepageLauncher/homepage-launcher.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.tsx`
- `apps/hb-webparts/src/homepage/data/priorityActionsLauncherAdapter.ts`

Do **not** re-read files already in active context unless you need to confirm drift, dependencies, or uncertainty after changes.

## Required future state

Build a launcher tile family with these qualities:

- clearly tile-shaped rather than pill-shaped
- visibly stronger silhouette and spatial authority
- same-family icon + label anatomy with more credible launcher presence
- premium but operational, not editorial
- appropriate for the Tool Launcher / Work Hub persona
- container-aware and breakpoint-aware
- still compatible with the current hosted homepage launcher band integration

The final surface should read like a premium intranet launcher family, not a row of oversized buttons.

## Required implementation changes

### 1. Replace chip semantics with tile semantics
Refactor the primary primitive so it is no longer named or conceptualized as a chip where that wording drives the surface outcome.

If renaming improves clarity, do it within the `HbcHomepageLauncher` family.

### 2. Introduce explicit tile-family variants
Use an explicit variant model rather than ad hoc classes.
At minimum, support:
- primary
- secondary overflow-entry
- mobile-entry

You may use `class-variance-authority` if it materially improves readability and control.

### 3. Redesign silhouette and layout
The launcher items must no longer be compact capsules.

They should become:
- more rectangular / tile-like
- more stable in width/height
- visibly related across the family
- still compact enough to live beneath the hero without becoming bloated

### 4. Upgrade tile anatomy
Keep one dominant click target per tile, but strengthen the anatomy:
- icon treatment
- label hierarchy
- spacing
- internal balance
- hover / press refinement

Optional supporting text is allowed only if it materially improves scanability and does not bloat the row.

### 5. Preserve hosted integration contracts where possible
Do not break `HbHomepageLauncherBand` unnecessarily.
Adapt the launcher contract cleanly if richer tile semantics are needed.

## Guardrails

- Do not revert to the old homepage flagship rail surface.
- Do not widen scope into unrelated hero/shell work.
- Do not keep capsule-button proportions and call them tiles.
- Do not solve this with only border-radius and padding edits.
- Do not introduce decorative complexity without launcher value.

## Proof of closure

You are done only when all of the following are true:

1. Desktop/tablet primary launcher items no longer read as chip buttons.
2. The launcher visibly reads as a premium tile family.
3. The hosted homepage path still runs through `HbHomepageLauncherBand` → `HbcHomepageLauncher`.
4. Runtime markers still expose authoritative counts/device state.
5. Updated tests and screenshots show the new tile outcome clearly.
