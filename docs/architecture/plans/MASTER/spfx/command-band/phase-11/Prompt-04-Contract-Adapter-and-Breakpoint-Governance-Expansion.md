# Prompt 04 — Contract, Adapter, and Breakpoint Governance Expansion

## Objective

Expand launcher contracts and breakpoint governance so the rebuilt tile family, inline overflow tile, and small-handheld launcher mode are first-class implementation concepts rather than brittle local special cases.

## Why this prompt exists

The current launcher contracts are still shaped around:
- chips
- primary items
- overflow items
- overflow modality

That is too narrow for the required target state.

The new launcher needs first-class support for:
- tile variants
- secondary overflow-entry tile
- small-handheld single-entry mode
- all-tools drawer content
- inspectable breakpoint decisions

## Inspect these seams first

- `packages/ui-kit/src/HbcHomepageLauncher/types.ts`
- `packages/ui-kit/src/HbcHomepageLauncher/constants.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsLauncherAdapter.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsNormalization.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.tsx`

Do **not** re-read files already in active context unless you need to confirm drift, dependencies, or uncertainty after changes.

## Required future state

The launcher system should expose enough semantics to support:

- primary desktop/tablet launcher tiles
- inline secondary overflow-entry tile
- explicit small-handheld mobile-entry tile
- all-tools drawer content model
- inspectable breakpoint and mode decisions
- stable runtime markers proving which mode is active

## Required implementation changes

### 1. Replace or expand chip-shaped contracts
Refactor the contract names and fields as needed so the launcher is no longer conceptually trapped in chip semantics.

### 2. Add tile variant semantics
The model should explicitly distinguish:
- primary tile
- overflow-entry tile
- mobile-entry tile

### 3. Add handheld mode semantics
The presentation layer should be able to say:
- current mode is standard tile row
- current mode is small-handheld entry tile
- drawer content source is full tool set

### 4. Reconcile breakpoint policy
Keep existing doctrine-aligned count governance where it still applies, but add explicit rules for the small-handheld mode.

### 5. Expand runtime markers
Expose enough markers on the DOM to prove:
- launcher mode
- breakpoint/device class
- primary tile count when applicable
- whether all-tools drawer mode is active

## Guardrails

- Do not bury the new behavior behind CSS-only hacks.
- Do not keep confusing contract names if they materially obscure the new architecture.
- Do not widen scope into unrelated shell policy beyond what the launcher needs.

## Proof of closure

You are done only when all of the following are true:

1. The launcher contract can express all required tile/mode states cleanly.
2. Breakpoint behavior is explicit and inspectable.
3. `HbHomepageLauncherBand` remains the authoritative hosted integration seam.
4. Runtime markers prove the active launcher mode clearly.
