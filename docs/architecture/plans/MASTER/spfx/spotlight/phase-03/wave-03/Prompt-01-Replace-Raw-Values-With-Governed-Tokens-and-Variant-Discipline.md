# Prompt-01-Replace-Raw-Values-With-Governed-Tokens-and-Variant-Discipline.md

## Objective

Refactor the Spotlight surface family away from direct freehand literals and toward a governed local token / variant posture that matches the repo’s homepage doctrine.

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

- `packages/ui-kit/src/HbcProjectSpotlightSurface/project-spotlight-surface.module.css`
- every file under `packages/ui-kit/src/HbcProjectSpotlightSurface/`
- any existing local token / animation / radius / elevation conventions in `@hbc/ui-kit`
- relevant benchmark seams from HB Kudos

## Current gap to close

The Spotlight family is still visibly hand-tuned:

- direct hex values
- repeated rgba values
- repeated pixel spacing and radius literals
- raw separator usage
- manual overlay behavior that is not as governed as it should be for a flagship surface

## Required implementation outcome

- introduce a clean local token seam or CSS variable bridge for the Spotlight family
- replace the obvious repeated freehand values
- improve primitive hygiene where it materially helps maintainability and governance
- keep the surface premium and distinctive; do not flatten it into a generic shared primitive outcome
- do not perform a random restyle. This is a governance cleanup anchored to the already-improved runtime posture from Waves 01 and 02.

## Proof of closure required

Provide:

1. before/after description of the token cleanup
2. list of new or changed token / variant files
3. confirmation that the visual result did not regress
4. note any remaining intentional local exceptions and why they are justified
