# Prompt 03 — Small Handheld Single Entry Tile and Drawer

## Objective

Replace the current small-handheld launcher behavior with a purpose-fit mobile launcher mode:
- one entry tile
- one drawer / sheet
- all tools inside that drawer / sheet

## Why this prompt exists

The current phone behavior is not a dedicated handheld launcher mode.
It is a reduced desktop-row model:
- 3 primary items
- separate overflow trigger
- overflow sheet shows only overflow items

That is explicitly not the required future state.

## Current problem state

At small handheld widths, the launcher currently:
- stacks multiple primary items vertically
- keeps a separate overflow trigger
- shows only overflow items in the sheet
- continues to think in desktop primary/overflow terms

This is structurally wrong for the requested mobile behavior.

## Inspect these seams first

- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncher.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherOverflow.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/homepage-launcher.module.css`
- `packages/ui-kit/src/HbcHomepageLauncher/types.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsLauncherAdapter.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- `packages/ui-kit/src/HbcHomepageLauncher/constants.ts`

Do **not** re-read files already in active context unless you need to confirm drift, dependencies, or uncertainty after changes.

## Required future state

On **small handheld devices only**:

- the homepage launcher shows a single launcher entry tile
- that entry tile opens a drawer / bottom sheet / sheet containing **all** tools
- the drawer content feels like the same launcher family, adapted for mobile
- the mobile launcher is finger-safe, scan-friendly, and quick to understand
- no reduced desktop-row primary tiles remain visible in this mode

## Required implementation changes

### 1. Add a true handheld launcher mode
This must be an explicit mode, not accidental CSS stacking.

### 2. Define the triggering breakpoint clearly
Use explicit small-handheld logic.
Do not hide this behind ambiguous CSS only.

### 3. Replace overflow-only content strategy
The handheld drawer must contain **all** launcher tools, not only the overflow subset.

### 4. Build a mobile-first drawer surface
The drawer/sheet must include:
- focus management
- dismissal via backdrop / Escape where applicable
- touch-safe close affordance if needed
- proper title / semantics
- content structure that remains easy to scan

A tile grid or tile-list hybrid is acceptable if it is clearly the stronger handheld answer.

### 5. Make the entry tile a real family member
The handheld entry tile should feel like the launcher’s mobile form, not a random utility button.

## Guardrails

- Do not keep 3 visible primary tiles on small handheld.
- Do not keep overflow-only sheet content.
- Do not rely on desktop/tablet assumptions in this mode.
- Do not degrade accessibility to get the drawer working.

## Proof of closure

You are done only when all of the following are true:

1. Small handheld shows a single launcher entry tile only.
2. Activating it opens a drawer/sheet with all tools.
3. The drawer content is scan-friendly and touch-safe.
4. Focus and dismissal behavior are correct.
5. No reduced desktop row remains in the small-handheld mode.
