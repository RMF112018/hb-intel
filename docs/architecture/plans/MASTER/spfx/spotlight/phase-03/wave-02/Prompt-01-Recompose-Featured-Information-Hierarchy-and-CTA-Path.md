# Prompt-01-Recompose-Featured-Information-Hierarchy-and-CTA-Path.md

## Objective

Upgrade the featured project body so it communicates a clearer story and a clearer next step without forcing users to hunt through a long vertical stack.

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

- `packages/ui-kit/src/HbcProjectSpotlightSurface/FeaturedSlot.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/layout-mode.ts`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/project-spotlight-surface.module.css`
- `apps/hb-webparts/src/homepage/helpers/operationalAwarenessConfig.ts`

## Current gap to close

The current featured body has solid mechanics, but the runtime still feels soft in task flow:

- title and summary do not arrive forcefully enough
- the strongest project signal is too easy to bury
- the CTA path is too dependent on authored perfection
- the body reads like stacked fields rather than a deliberately paced story

## Required implementation outcome

- make the featured body clearly read in this order:
  1. project identity
  2. strongest supporting signal
  3. short editorial explanation
  4. clear next action
- define a clean fallback CTA rule when the authored item CTA is absent but a section-level destination exists
- keep details disclosure explicit and accessible
- do not reintroduce hover-gated meaning
- preserve thin payload trimming, but make the surface feel intentional even when data is only partial

## Proof of closure required

Provide:

1. touched files
2. before/after explanation of the featured body information order
3. confirmation of CTA fallback behavior
4. screenshots at desktop and mobile widths showing the new body hierarchy
