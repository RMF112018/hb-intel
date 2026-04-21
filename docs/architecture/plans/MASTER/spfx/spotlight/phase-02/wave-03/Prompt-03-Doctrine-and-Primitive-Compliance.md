# Prompt-03 — Close Doctrine Gaps Around Tokens, Hardcoded Styling, and Premium Primitive Compliance

## Objective

Bring the Project Portfolio Spotlight surface into stricter compliance with homepage doctrine by removing avoidable hardcoded styling drift and replacing weak visual mechanics that still keep the surface below benchmark quality.

## Why this prompt exists

The Spotlight is no longer failing because it lacks a mode system. It is failing because its visual implementation still carries too much local, card-like, hardcoded styling and a few weak interaction/icon choices that do not meet the premium homepage standard.

## Governing authority

Binding:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/`

## Files / seams to inspect

Primary:

- `packages/ui-kit/src/HbcProjectSpotlightSurface/project-spotlight-surface.module.css`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/FeaturedSlot.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/HistoryDisclosure.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/TeamStrip.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/Masthead.tsx`
- `packages/ui-kit/src/homepage.ts`

Inspect any nearby ui-kit token or primitive file only if required to complete the closure cleanly.

Do **not** re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Gaps to close

Close the following where repo-truth confirms them:

1. excessive hardcoded colors / transparencies / spacing / radii / heights in the Spotlight CSS where governed token usage or local documented aliases should be used instead
2. remaining pseudo-icon / glyph usage that weakens the premium surface language
3. mechanics that look locally improvised instead of part of the governed homepage surface system
4. any Spotlight-specific styling that still reads as standalone card furniture instead of one authored homepage surface

## Required implementation outcome

- tighten token discipline materially
- replace weak disclosure/close glyph treatment with proper governed icon usage where appropriate
- keep the surface premium, restrained, and host-aware
- do not over-engineer or broaden to a general ui-kit rewrite
- improve maintainability while closing doctrine violations

## Scope discipline

This prompt is not permission to refactor unrelated ui-kit families.

Keep the work tightly bounded to what materially improves:

- doctrine compliance
- premium surface quality
- maintainability of the Spotlight implementation

## Proof of closure

Return:

1. file list
2. doctrine violations closed
3. exact hardcoded styling areas replaced or reduced
4. icon / primitive changes made
5. evidence that the surface still renders correctly after the cleanup
