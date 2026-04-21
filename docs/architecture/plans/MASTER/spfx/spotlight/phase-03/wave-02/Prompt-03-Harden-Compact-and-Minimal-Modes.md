# Prompt-03-Harden-Compact-and-Minimal-Modes.md

## Objective

Make the Spotlight’s compact and minimal modes positively selective instead of mechanically compressed.

## Non-negotiable rules

- Use the live `main` branch as repo truth.
- Do not preserve a weak visual or interaction pattern just because it already exists.
- Do not broaden scope beyond the files and seams named below unless a dependency proves unavoidable.
- Do not re-read files that are still within your active context or memory unless you need to confirm drift, dependencies, or uncertainty after making changes.
- Preserve the thin-webpart ownership boundary: data / normalization local, presentation shared unless the prompt explicitly says otherwise.
- Provide proof of closure: touched-file list, before/after explanation, test or story updates, and hosted/runtime evidence where requested.
- Do not stop at “compiles.” Close the runtime behavior.


## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/ui-kit/homepage-webpart-benchmark.md`

## Files / seams to inspect first

- `packages/ui-kit/src/HbcProjectSpotlightSurface/layout-mode.ts`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/FeaturedMedia.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/FeaturedSlot.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/HistoryDisclosure.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/project-spotlight-surface.module.css`

## Current gap to close

The compact/minimal system exists, but the runtime still reads too much like a shrunken desktop surface:

- image footprint is still too generous
- the title is not authoritative enough
- the smallest states still need faster clarity
- missing-media minimal mode especially needs a better answer

## Required implementation outcome

- compact and minimal modes must show less information, not just tighter information
- minimal mode should feel instantly readable on phones
- missing-media minimal mode must be especially selective and story-first
- buttons must remain obvious and tappable
- no control should drift below a reasonable first screen just because the media zone stayed too tall

## Proof of closure required

Provide:

1. before/after screenshots for 430x932 and 390x844 class widths
2. a mode-by-mode note listing what is now suppressed, collapsed, or reprioritized
3. confirmation that touch targets and focus behavior remain credible
