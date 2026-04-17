# Prompt 02 — Stabilize Layout Mode Derivation

## Objective
Eliminate the self-induced layout instability in Project Sites by replacing the current content-height-driven layout-mode logic with a stable, container-aware responsiveness model.

## Governing Authorities / Relevant Docs
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md` where shell/application breakpoint doctrine is relevant
- current repo truth in:
  - `packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.ts`
  - `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`

## Critical Operating Instruction
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Exact Files and Symbols to Inspect
- `packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.ts`
  - `resolveProjectSitesLayoutMode`
  - `resolveProjectSitesContainerState`
  - `useProjectSitesContainerState`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
  - `rootRef`
  - layout-mode consumers
  - control-bar mode branches
  - grid mode branches

## Exact Defect / Instability Issue to Close
The current hook observes the component’s own rendered section and derives mode partly from content height. Because the section height changes when the UI changes, the component can flip its own mode during ordinary rerenders.

## Required Implementation Outcome
Implement a stable layout model in which:
1. Layout mode does not depend on self-observed content height in a way that can create feedback loops.
2. Any “short-height” behavior, if retained, is based on a trustworthy external constraint rather than ordinary result-count changes.
3. The hook avoids no-op state updates when the effective layout classification has not changed.
4. Wide desktop layouts remain wide when the result set is short.
5. The control bar, filters, and grid remain compositionally stable across search/filter/sort/result-count changes.

Retain the intent of responsive adaptation, but make it genuinely stable.

## Validation / Proof of Closure Requirements
Provide proof for all of the following:
- opening/closing the filter panel does not force spurious layout-mode flips
- filtering down to 1–2 cards on a wide desktop does not collapse the surface into an unintended compact mode
- repeated ResizeObserver callbacks with no effective layout change do not rerender the surface
- automated tests cover the repaired layout rules

## Explicit Non-Goals
- no unrelated visual redesign
- no change to business data semantics
- no widening into broader homepage shell work
