# Prompt 02 — Disclosure Controls and Icon Compliance

## Objective

Remove residual pseudo-icon usage from the Project Portfolio Spotlight and ensure all disclosure and dismissal affordances comply with the governed premium icon posture.

## Governing authority

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
3. `docs/reference/spfx-surfaces/benchmark/`

## Files / seams to inspect

- `packages/ui-kit/src/HbcProjectSpotlightSurface/FeaturedSlot.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/HistoryDisclosure.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/TeamStrip.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/project-spotlight-surface.module.css`
- `packages/ui-kit/src/homepage.ts`

## Current gap to close

The Spotlight still uses Unicode-style pseudo-icons in a doctrine-governed premium homepage surface.

That is not acceptable for closure.

At minimum, inspect and correct:

- details disclosure chevron
- history disclosure chevron
- team panel close affordance
- any other residual pseudo-icon or text-glyph substitute inside the Spotlight surface

## Required implementation outcome

Replace pseudo-icons with governed iconography re-exported through `@hbc/ui-kit/homepage`, keeping the current accessibility behavior intact or improved.

The finished result must:

- retain clear affordance
- keep keyboard and touch usability
- maintain visible open/closed state
- avoid regressions in reduced-motion or focus handling

## Guardrails

- Do not introduce ad hoc icon imports that violate homepage import discipline.
- Do not do unrelated visual restyling beyond what is necessary to integrate the correct iconography cleanly.
- Do not re-read files that are already in your active context or memory unless you need to confirm drift, dependencies, or uncertainty after making changes.

## Proof of closure

Return:

1. exact pseudo-icons removed
2. exact icon replacements used
3. files changed
4. a brief accessibility check summary
5. screenshots or story/test evidence if available
