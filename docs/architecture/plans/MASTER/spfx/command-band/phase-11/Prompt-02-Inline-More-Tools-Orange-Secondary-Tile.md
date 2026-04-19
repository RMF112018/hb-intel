# Prompt 02 — Inline `More Tools` Orange Secondary Tile

## Objective

Replace the current detached white outlined `More Tools` control with an inline secondary launcher tile that belongs to the same launcher family and uses the application’s secondary orange brand posture appropriately.

## Why this prompt exists

The current overflow trigger is intentionally implemented as a separate utility control:
- white surface
- outlined
- uppercase utility language
- separate family posture

That is exactly the wrong visual and structural message.

This is not just a color issue.
This is a hierarchy and family-membership issue.

## Current problem state

The existing `More Tools` trigger:
- is not an inline launcher tile
- does not share the same visual family as the primary items
- reads as a detached control rather than part of the launcher
- fails the required “inline family” target state

## Inspect these seams first

- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherOverflow.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/homepage-launcher.module.css`
- `packages/ui-kit/src/HbcHomepageLauncher/types.ts`
- any variant helpers introduced by Prompt 01

Do **not** re-read files already in active context unless you need to confirm drift, dependencies, or uncertainty after changes.

## Required future state

`More Tools` must become:

- inline with the primary launcher tiles
- unmistakably part of the same family
- clearly secondary in hierarchy
- orange-brand aligned
- keyboard reachable
- touch-safe
- premium on desktop and tablet
- not an outlined white control

## Required implementation changes

### 1. Convert overflow trigger to a launcher tile variant
Do not leave it as an unrelated button primitive.

Implement it as the tile-family’s secondary overflow-entry variant.

### 2. Use the secondary orange posture intentionally
This should not become a loud destructive orange.
It should become a premium, controlled, secondary brand treatment.

The tile should remain visibly secondary while still clearly belonging to the launcher family.

### 3. Keep hierarchy intelligible
The user must still be able to distinguish:
- direct launch tiles
- overflow-entry tile

But the distinction must be achieved **within** a shared family, not by breaking the family.

### 4. Retain overflow count only if it helps
If count treatment remains, it must support scanability without pulling the tile back toward “utility button” styling.

### 5. Preserve accessibility
Retain correct:
- focus-visible behavior
- keyboard activation
- `aria-haspopup`
- `aria-expanded`
- dismissal behavior for opened overflow content

## Guardrails

- Do not leave the overflow trigger white/outlined.
- Do not place `More Tools` outside the launcher family.
- Do not over-style it into a novelty CTA.
- Do not degrade desktop/tablet overflow usability.

## Proof of closure

You are done only when all of the following are true:

1. `More Tools` sits inline with the primary tiles.
2. It visibly belongs to the same family.
3. It uses an orange secondary brand posture.
4. It no longer reads as a detached utility button.
5. Desktop/tablet overflow still opens correctly and accessibly.
