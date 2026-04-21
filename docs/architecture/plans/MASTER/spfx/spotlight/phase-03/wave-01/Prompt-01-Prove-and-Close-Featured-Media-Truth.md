# Prompt-01-Prove-and-Close-Featured-Media-Truth.md

## Objective

Conduct a repo-truth and runtime-truth investigation of the Project Portfolio Spotlight featured media seam and close the actual cause of the missing-image / placeholder-dominant hosted result.

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

- `apps/hb-webparts/src/homepage/data/projectSpotlightListSource.ts`
- `apps/hb-webparts/src/homepage/data/useProjectSpotlightData.ts`
- `apps/hb-webparts/src/homepage/helpers/operationalAwarenessConfig.ts`
- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/FeaturedMedia.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/types.ts`
- any story or test seam already covering Spotlight media states

## Current gap to close

The hosted runtime shows the Spotlight’s major slot being consumed by a giant placeholder state. That is unacceptable for a flagship homepage module. The code claims the list-backed image seam is live and that `PrimaryImage` maps through to the surface, but the hosted screenshots show the opposite outcome.

You must determine exactly which of the following is true:

- the list data does not actually contain valid image URLs
- the list mapping is wrong for one or more live `PrimaryImage` shapes
- the surface is receiving image data but failing to render it
- image URLs are valid in source but failing at runtime because of permissions / tenant / host shape
- the runtime is behaving as designed, but the design has no acceptable missing-media posture

Do not guess. Prove it.

## Required implementation outcome

- close the real image-truth issue if it is a data or mapping bug
- if live content can legitimately be image-thin, formalize that contract and stop pretending a missing-image hero can still behave like a full editorial hero
- add or update tests / stories so each supported image input shape and no-image path is covered
- keep the webpart thin; do not shove presentation logic back down into the webpart

## Proof of closure required

Return all of the following in your completion note:

1. exact root cause
2. files changed
3. before/after behavior of each supported image input shape
4. proof for no-image behavior
5. hosted or local runtime screenshots showing:
   - desktop major-slot state
   - tablet or compact state
   - handheld state
6. confirmation that there are no dead console errors in the tested path
