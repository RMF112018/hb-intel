# Prompt-01 — Flatten the Spotlight Shell and Remove Nested Featured Card Identity

## Objective

Eliminate the current **card-within-a-card** visual composition in the Project Portfolio Spotlight by removing the inner featured card identity and rebuilding the featured region as an **integrated section inside the parent Spotlight shell**.

This is the highest-priority defect.

## Why this prompt exists

The current deployed Spotlight is visually failing because the surface renders as:

- one outer Spotlight card
- one inner featured card with its own border, radius, shadow, and white-surface identity
- additional secondary container treatment below

That is directly contrary to the governing doctrine for premium homepage surfaces.

## Governing authority

You must comply with:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/`

Key doctrine implications that apply here:

- thin-border white-card repetition is prohibited
- generic enterprise card-grid outcomes are prohibited
- structural rebuild takes precedence over decorative polish
- premium homepage zones must read as authored product surfaces, not stacked default cards

## Files / seams to inspect

Start with these files and do not expand scope unless necessary:

- `packages/ui-kit/src/HbcProjectSpotlightSurface/project-spotlight-surface.module.css`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/FeaturedSlot.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/index.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/Masthead.tsx`

You may inspect other `HbcProjectSpotlightSurface/*` files only if required to complete the objective cleanly.

Do **not** re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Current problem to close

The parent `.root` already establishes a full surface shell. The inner `.featuredLayout` then re-establishes:

- its own border
- its own border radius
- its own white surface
- its own shadow
- its own isolated card posture

That makes the featured region read like a card placed inside another card. This is the wrong composition model.

## Required implementation outcome

Rebuild the featured section so:

1. the outer Spotlight root remains the **single dominant surface shell**
2. the featured region reads as an **integrated internal section**
3. the media zone, title block, disclosure control, and details region feel authored into the parent surface
4. the featured section no longer carries a standalone card identity

That means, unless you can justify a stronger doctrine-compliant alternative:

- remove the second independent box-shadow on `.featuredLayout`
- remove or neutralize the second standalone card border treatment
- stop using an internal white-card block that visually detaches from the parent shell
- reduce “inset module” treatment that makes the featured region look mounted inside another surface
- preserve hierarchy through spacing, sectional rhythm, divider logic, material changes, and editorial composition instead of nested-card furniture

## Design direction

Target a composition that feels like:

- one parent shell with masthead
- one integrated hero/media-led body region
- one details region that expands inside the same authored shell
- no separate internal card object

Good direction:

- sectional transitions
- integrated dividers
- tonal shifts that stay inside the same shell language
- edge-to-edge or near-edge hero treatment that belongs to the parent surface
- controlled internal rhythm without second-card framing

Bad direction:

- keep the current inner card but reduce the shadow slightly
- keep a faint border and call it solved
- convert the inner card into a “subtle inset card”
- preserve the same composition with only cosmetic reductions

## Guardrails

- Preserve the explicit details disclosure behavior.
- Preserve the layout-mode system.
- Preserve accessibility.
- Do not broaden into unrelated homepage surfaces.
- Do not rewrite the SPFx consumer.
- Do not change data normalization unless absolutely required.

## Proof of closure

Return:

1. exact files changed
2. exact selectors / structures changed to remove the inner card identity
3. concise explanation of why the new composition is no longer a nested-card design
4. screenshots or runtime proof from the local hosted/deployed surface showing the updated composition
5. lint / type / test / build results relevant to the touched area
