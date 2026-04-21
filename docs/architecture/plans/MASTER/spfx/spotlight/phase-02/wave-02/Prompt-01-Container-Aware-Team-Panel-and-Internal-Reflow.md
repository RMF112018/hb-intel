# Prompt 01 — Container-Aware Team Panel and Internal Reflow

## Objective

Finish the responsive architecture of the Project Portfolio Spotlight by removing meaningful viewport-driven internal behavior and aligning the team interaction seam with the surface’s container-aware mode system.

## Governing authority

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
3. `docs/reference/spfx-surfaces/benchmark/`

## Files / seams to inspect

- `packages/ui-kit/src/HbcProjectSpotlightSurface/layout-mode.ts`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/use-spotlight-layout-mode.ts`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/TeamStrip.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/project-spotlight-surface.module.css`
- any relevant homepage/ui-kit overlay primitive or premium-stack utility you can reuse without violating import discipline

## Current gap to close

The Spotlight already has a container-aware mode system, but the team detail panel and some internal layout behaviors still rely too heavily on viewport media-query assumptions.

That is architecturally inconsistent and weakens doctrine closure.

## Required implementation outcome

Refactor the team interaction seam and any materially relevant internal reflow behavior so they follow:

- the resolved Spotlight mode
- real container constraints
- premium overlay behavior appropriate for SharePoint-hosted surfaces

The end state should support a clean distinction such as:

- wide/medium → anchored premium panel / popover behavior
- compact/minimal → governed sheet-like behavior

The exact implementation may vary, but it must no longer be primarily a viewport-switch hack underneath a container-aware surface.

## Guardrails

- Preserve keyboard dismissal, outside-click dismissal, and focus return.
- Preserve touch safety.
- Do not broaden into unrelated homepage-shell work.
- Do not flatten the team interaction into always-visible static content unless repo truth proves that is the superior final answer.
- Do not re-read files that are already in your active context or memory unless you need to confirm drift, dependencies, or uncertainty after making changes.

## Proof of closure

Return:

1. exact files changed
2. old behavior vs new behavior summary
3. mode-by-mode team-panel posture summary
4. accessibility checks performed
5. any tests/stories added or updated
