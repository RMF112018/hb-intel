# Prompt 03 — Rail and Metadata Refinement After Runtime Validation

## Objective

Perform the final Spotlight-local polish pass after Waves 01 and 02 core changes land, tightening any remaining metadata density or rail hierarchy issues without disturbing the core architecture.

## Governing authority

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
3. `docs/reference/spfx-surfaces/benchmark/`

## Files / seams to inspect

- `packages/ui-kit/src/HbcProjectSpotlightSurface/Masthead.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/FeaturedMedia.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/SupportingRail.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/project-spotlight-surface.module.css`
- any stories/tests used to validate mode posture

## Current gap to close

Once the earlier waves are complete, there may still be smaller hierarchy issues that are not severe enough to justify redesign but are still worth closing, including:

- marginal metadata excess in tighter modes
- supporting-rail density that could be cleaner
- duplicated or competing section-level affordances
- rail/meta posture that is still slightly more generous than needed

## Required implementation outcome

Use runtime-validated evidence to tighten the remaining Spotlight-local hierarchy so that:

- compact/minimal states feel deliberate and selective
- the supporting rail reads clearly as secondary history
- metadata never competes with the featured spotlight in constrained modes
- the final surface feels premium and intentional rather than merely compliant

## Guardrails

- Do not invent new product scope.
- Do not broaden into list-schema or backend work.
- Do not destabilize the explicit details/history disclosure model.
- Do not re-read files that are already in your active context or memory unless you need to confirm drift, dependencies, or uncertainty after making changes.

## Proof of closure

Return:

1. exact files changed
2. what was tightened and why
3. mode-by-mode behavior summary after the polish pass
4. evidence that the rail still reads as secondary rather than competing primary content
