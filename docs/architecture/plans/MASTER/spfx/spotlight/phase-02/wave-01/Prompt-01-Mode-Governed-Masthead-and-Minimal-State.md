# Prompt 01 — Mode-Governed Masthead and Minimal-State Tightening

## Objective

Refine the current Project Portfolio Spotlight so compact and minimal modes become more selective by default, with particular focus on masthead furniture and repeated section-level CTA behavior.

## Governing authority

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
3. `docs/reference/spfx-surfaces/benchmark/`
4. `packages/ui-kit/src/HbcProjectSpotlightSurface/**`
5. `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx`

## Files / seams to inspect

- `packages/ui-kit/src/HbcProjectSpotlightSurface/layout-mode.ts`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/index.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/Masthead.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/HistoryDisclosure.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/SupportingRail.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/project-spotlight-surface.module.css`

## Current gap to close

The current Spotlight already has a real mode system and explicit disclosures, but compact/minimal states still carry slightly too much masthead furniture relative to the locked compactness philosophy.

The smallest supported state should read as intentionally selective, not merely “the same module with smaller padding.”

Specific symptoms to address:

- masthead dateline is still too available in smaller modes
- section-level “View all projects” affordances can over-furnish the surface
- the smallest modes should clearly prioritize:
  - image
  - title
  - compact milestone signal
  - `Show spotlight details`
  - `Show past spotlights`

## Required implementation outcome

Implement a mode-governed masthead and CTA posture such that:

- `wide` and `medium` can retain fuller editorial masthead treatment
- `compact` and `minimal` reduce non-essential masthead furniture
- section-level “View all projects” behavior is deliberate and non-redundant
- the smallest modes no longer read as carrying excess chrome

You may revise:
- what the masthead shows by mode
- where the section-level CTA appears
- whether the rail footer CTA is suppressed when another equivalent CTA is already present
- any related visibility contract needed to make the behavior explicit and testable

## Guardrails

- Do not remove the explicit details disclosure.
- Do not remove the explicit past-spotlights disclosure.
- Do not flatten the Spotlight into a generic card.
- Do not do unrelated homepage-shell work.
- Do not re-read files that are already in your active context or memory unless you need to confirm drift, dependencies, or uncertainty after making changes.

## Proof of closure

Return:

1. exact files changed
2. final mode-by-mode visibility summary
3. why the new compact/minimal state is more compliant
4. tests or story coverage added/updated
5. note any intentionally accepted exception that remains
