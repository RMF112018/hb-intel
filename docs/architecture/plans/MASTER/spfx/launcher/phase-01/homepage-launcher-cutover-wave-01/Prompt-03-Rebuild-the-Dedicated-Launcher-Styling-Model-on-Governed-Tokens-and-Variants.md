# Prompt 03 — Rebuild the Dedicated Launcher Styling Model on Governed Tokens and Variants

## Objective
Refactor the dedicated launcher surface so it no longer relies on a raw-CSS-heavy styling posture that falls short of flagship doctrine expectations.

## Governing repo authorities
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`

## Files / seams to inspect
- `packages/homepage-launcher/src/HomepageLauncherSurface.tsx`
- `packages/homepage-launcher/src/homepage-launcher-surface.module.css`
- `packages/homepage-launcher/src/constants.ts`
- `packages/ui-kit/src/homepage.ts`
- any existing homepage token / primitive exports that can support the launcher without forcing generic card-grid behavior

## Current gap to close
The launcher concept is materially better, but the dedicated package still uses too many hardcoded values for:
- color
- spacing
- radius
- shadow
- size ramps

That weakens doctrine compliance and makes the surface feel more hand-tuned than governed.

## Required implementation outcome
Refactor the launcher to a more governed styling model while preserving:
- current cutover boundary
- current row contract
- strict peer-tile parity for `More Tools`
- current handheld `HB Toolbox` posture
- current bottom-sheet single-row rail concept

The new model should:
- introduce launcher-local semantic tokens or governed primitive wrappers
- reduce raw literals substantially
- make row tile, overflow tile, handheld trigger, and drawer shell feel like one variant family
- improve maintainability without flattening the launcher into a generic enterprise card outcome

## Proof of closure required
Provide:
- before/after summary of raw literal reduction
- the new token / variant model in plain language
- confirmation that row parity, drawer behavior, and handheld posture still hold
- screenshots or proof output from the relevant launcher tests after the refactor

## Prohibitions
- do not redesign the launcher into a different product concept
- do not introduce shell chrome
- do not degrade the current single-row drawer rail model
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
