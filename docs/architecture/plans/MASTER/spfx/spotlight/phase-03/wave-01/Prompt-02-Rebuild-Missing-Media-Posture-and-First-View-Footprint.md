# Prompt-02-Rebuild-Missing-Media-Posture-and-First-View-Footprint.md

## Objective

Redesign the Spotlight’s missing-media and low-media posture so the featured story remains authoritative when the hero image is absent, unresolved, or intentionally not provided.

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

- `packages/ui-kit/src/HbcProjectSpotlightSurface/FeaturedMedia.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/FeaturedSlot.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/layout-mode.ts`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/project-spotlight-surface.module.css`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/index.tsx`

## Current gap to close

The current no-image state still allocates the footprint and emotional weight of a flagship hero image, which turns the empty area into the dominant object. That is the opposite of what a homepage spotlight should do.

The current placeholder text “Project Image” is also too loud. It calls attention to absence instead of maintaining editorial credibility.

## Required implementation outcome

Implement a deliberate no-image / image-error posture with the following constraints:

- when image content is missing or fails, the surface becomes **title-led**
- the media zone height is reduced materially in every mode, especially `compact` and `minimal`
- the placeholder treatment becomes quiet, premium, and obviously subordinate
- the featured title, at least one project signal, and the next best action move materially higher into first view
- the redesign must work in the row-1 major slot beside HB Kudos, not just in isolation
- do not introduce fake shell chrome, decorative filler panels, or loud generic empty-state language

You may change the internal composition materially if needed. Nothing about the current missing-media posture is protected.

## Proof of closure required

Provide:

1. before/after screenshots at:
   - 2560x1440
   - 1920x1080
   - 430x932 or equivalent
2. a short note explaining the new no-image hierarchy
3. confirmation that the major slot no longer reads as a blank billboard
4. story/test updates that pin the no-image behavior
