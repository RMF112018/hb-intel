# Prompt-03-Rebalance-Wide-and-Medium-First-View-Hierarchy.md

## Objective

Rework the wide and medium Spotlight postures so the major homepage slot delivers the featured project’s story earlier and more decisively.

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
- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`
- `docs/reference/ui-kit/homepage-webpart-benchmark.md`

## Files / seams to inspect first

- `packages/ui-kit/src/HbcProjectSpotlightSurface/layout-mode.ts`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/index.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/FeaturedSlot.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/Masthead.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/project-spotlight-surface.module.css`

## Current gap to close

On desktop and retina laptop widths, the Spotlight takes the dominant shell slot but spends too much of it on vertical media footprint before the featured story actually begins. The result is oversized but under-informative.

The shell pairing is already directionally right. The Spotlight itself is not converting that slot into enough first-view value.

## Required implementation outcome

- tighten the masthead-to-featured rhythm
- reduce wide / medium hero height or otherwise restructure the composition so title + message enter earlier in the viewport
- keep the surface premium; do not flatten it into a timid card
- maintain row-1 authority relative to HB Kudos, but with actual content value rather than empty scale
- if title/headline/status need to partially live within the hero band to achieve this, do it cleanly
- preserve a credible CTA path

## Proof of closure required

Provide:

1. before/after row-1 screenshots at desktop and retina laptop widths
2. a concise note describing what now appears in first view that did not before
3. confirmation that the result still feels like a flagship surface, not a compressed card
