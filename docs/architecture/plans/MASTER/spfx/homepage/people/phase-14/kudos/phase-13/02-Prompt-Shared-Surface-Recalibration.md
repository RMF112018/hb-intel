# 02 — Prompt: Shared Surface Recalibration

You are working in the live repo at:

- `https://github.com/RMF112018/hb-intel.git`

## Objective

Recalibrate the **public-facing HB Kudos shared surface composition** so the homepage module feels balanced, intentional, and efficient at 100% browser zoom.

## Mandatory scope

Audit and remediate at minimum:

- `packages/ui-kit/src/HbcPeopleCultureSurface/index.tsx`
- `packages/ui-kit/src/HbcPeopleCultureSurface/people-culture-surface.module.css`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`

## Required outcomes

The public surface must:

- remain recognizably premium and branded
- reduce hero + featured-card top-heaviness
- eliminate or rationalize duplicate `Give Kudos` CTA hierarchy
- make the featured card feel right-sized for its content payload
- improve the visual handoff from featured recognition to the secondary browse layer
- remain strong at 100% browser zoom, not only at 90%

## Required implementation direction

1. Audit the homepage-fit variant in the shared surface.
2. Tighten the hero and spotlight composition without flattening the brand character.
3. Remove or suppress CTA duplication when the hero already exposes the primary action.
4. Reduce excess vertical commitment in the featured recognition shell.
5. Preserve the best parts of the current visual language:
   - hero gradient
   - featured card distinction
   - premium hierarchy
   - branded tone

## Explicit prohibitions

Do not:
- rewrite the webpart from scratch
- flatten the public surface into generic SharePoint card styling
- solve the problem only by shrinking fonts
- preserve both `Give Kudos` CTAs if one is clearly redundant
- make the surface depend on reduced zoom to feel balanced

## Deliverables

Return:
- files changed
- concise explanation of the recalibration choices
- note on final CTA hierarchy
- note on final hero/featured/archive balance
