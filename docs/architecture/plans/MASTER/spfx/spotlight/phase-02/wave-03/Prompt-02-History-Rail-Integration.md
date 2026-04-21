# Prompt-02 — Integrate the History Rail into the Parent Surface

## Objective

Remove the current **third-container** feel created by the history section so “past spotlights” reads as a subordinated section of the same Spotlight surface, not another inset card mounted below the featured region.

## Why this prompt exists

Even after the featured block is flattened, the current history treatment can still undermine the result because the rail itself is rendered as its own bordered container. That continues the repeated-card language the doctrine rejects.

## Governing authority

Use the same governing authority as Prompt-01:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/`

## Files / seams to inspect

Start here:

- `packages/ui-kit/src/HbcProjectSpotlightSurface/project-spotlight-surface.module.css`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/HistoryDisclosure.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/SupportingRail.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/index.tsx`

Do **not** re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Current problem to close

The current history experience still reads like:

- disclosure button
- separate bordered rail container
- repeated card-like tile treatment inside that container

The result is too modularized and too card-centric for a flagship homepage editorial surface.

## Required implementation outcome

Rebuild the history area so it reads as:

- a section of the parent surface
- clearly subordinate to the featured spotlight
- present only when explicitly requested in tighter modes
- visually integrated through rhythm, section rules, hierarchy, and spacing
- not a separate inset card

Required posture:

1. disclosure stays explicit and touch/keyboard safe
2. expanded history is visually subordinate to the featured section
3. supporting projects can still be individually tile-like where justified, but the **rail container itself** must stop reading as another full card
4. the history section should feel like a continuation of the parent editorial surface

Potential acceptable directions:

- sectional divider + integrated list region
- soft background band within the same shell
- compact editorial list with numbered entries and reduced container chrome
- tighter rail footprint in compact and minimal modes

Unacceptable directions:

- leaving the current bordered rail block mostly intact
- simply shrinking paddings/radii
- preserving the rail as another standalone white module

## Additional guidance

Be especially careful that compact and minimal modes remain selective:

- history stays collapsed by default where appropriate
- when expanded, it should not visually overpower the featured project
- the section should remain clean on tight widths

## Proof of closure

Return:

1. files changed
2. exact explanation of how the history area stopped reading as a separate card
3. how hierarchy between featured content and past spotlights improved
4. runtime proof in at least one wide and one constrained state
5. relevant test/build evidence
