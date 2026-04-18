# Prompt-02-Stabilize-Container-State-and-Short-Height-Behavior

## Objective

Stabilize the container-state seam so the refreshed responsive contract has a clean technical foundation, especially around short-height behavior and measured container updates.

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.ts`
- `packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.test.ts`

## Exact repo files / seams / symbols to inspect

- `packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.ts`
  - `readViewportHeight`
  - `normalizePositiveDimension`
  - `resolveProjectSitesLayoutMode`
  - `resolveProjectSitesContainerState`
  - `useProjectSitesContainerState`
- `packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.test.ts`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
  - data attributes that expose layout state

## Current gap to close

The current layout-state seam is sound, but it still reflects the earlier coarse contract. As the responsive contract becomes richer, the container-state seam must remain stable, predictable, and free from content-height feedback loops or noisy rerender behavior.

## Required implementation outcome

Refine the container-state seam so it cleanly supports the refreshed contract. That includes:
- keeping measured container width authoritative for width-sensitive behavior
- keeping short-height logic intentionally isolated from ordinary content growth/shrink feedback
- ensuring any new mode or sub-mode responsibilities derive predictably from the container state
- preserving or improving rerender stability

If the best result is to keep the existing architecture largely intact, do so. The goal is not novelty. The goal is a cleaner foundation for the richer responsive system.

## Proof of closure required

- tests prove width and short-height behavior for the refreshed contract
- repeated observer callbacks with no effective state change do not cause unnecessary rerenders
- root data attributes or equivalent diagnostics still truthfully expose layout state

## Constraints

- do not replace the measured-container foundation with viewport-only logic
- do not let content-height changes become the primary layout-mode authority
- do not introduce brittle observer complexity for cosmetic gain

## Context retention directive

Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.

## Local code agent prompt

```text
Objective:
Stabilize the container-state seam so the refreshed responsive contract has a clean technical foundation, especially around short-height behavior and measured container updates.

Governing Authorities:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.ts`
- `packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.test.ts`

Exact Repo Files / Seams / Symbols to Inspect:
- `packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.ts`
  - `readViewportHeight`
  - `normalizePositiveDimension`
  - `resolveProjectSitesLayoutMode`
  - `resolveProjectSitesContainerState`
  - `useProjectSitesContainerState`
- `packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.test.ts`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
  - data attributes that expose layout state

Current Gap:
The current layout-state seam is sound, but it still reflects the earlier coarse contract. As the responsive contract becomes richer, the container-state seam must remain stable, predictable, and free from content-height feedback loops or noisy rerender behavior.

Required Outcome:
Refine the container-state seam so it cleanly supports the refreshed contract. That includes:
- keeping measured container width authoritative for width-sensitive behavior
- keeping short-height logic intentionally isolated from ordinary content growth/shrink feedback
- ensuring any new mode or sub-mode responsibilities derive predictably from the container state
- preserving or improving rerender stability

If the best result is to keep the existing architecture largely intact, do so. The goal is not novelty. The goal is a cleaner foundation for the richer responsive system.

Proof of Closure:
- tests prove width and short-height behavior for the refreshed contract
- repeated observer callbacks with no effective state change do not cause unnecessary rerenders
- root data attributes or equivalent diagnostics still truthfully expose layout state

Constraints:
- do not replace the measured-container foundation with viewport-only logic
- do not let content-height changes become the primary layout-mode authority
- do not introduce brittle observer complexity for cosmetic gain

Special Instruction:
Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

Execution Notes:
- Reuse the current observer pattern unless the refreshed contract clearly requires a better seam.
- Keep this prompt tightly focused on state derivation and state stability, not on control-bar styling or card-density work.
```
