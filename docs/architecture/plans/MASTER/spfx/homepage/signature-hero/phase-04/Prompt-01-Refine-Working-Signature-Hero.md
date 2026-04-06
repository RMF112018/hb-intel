# Prompt 01 — Refine the Working Signature Hero

## Objective

Refine the now-working `HbSignatureHero` visual composition without reopening packaging or runtime CSS work.

The current hero is finally loading and styling correctly in SharePoint.
Do not destabilize that.

This is a narrow visual refinement pass.

## Starting Point

Use the current working hero implementation as the base.

Current issues to correct:
1. hero is too tall
2. logo is underweighted
3. `HB Central` still appears in the hero
4. text hierarchy/order is wrong
5. hero still uses the fallback plate instead of the intended default banner image

Do not re-read files that are still within your current context window or memory. Re-open files only when necessary to verify changed or unresolved details.

## Required Changes

### 1. Reduce hero height
Reduce the overall hero height to roughly 2/3 of the current size.

Current source is around ~380px desktop height.
Target roughly ~250–260px desktop height.

Implementation guidance:
- desktop: approximately 256px min-height
- tablet: reduced proportionally
- mobile: reduced again, but still usable

Do not compress the background image.
The shorter height must rely on center-crop behavior, not distortion.

### 2. Remove `HB Central`
Remove the `HB Central` text label from the hero entirely.

Keep only the logo mark / lockup image.

### 3. Rebalance the logo
Increase the logo size from the current underweighted state so it feels intentional and premium.

The logo should:
- be more present than it is now
- still remain clearly subordinate to the main text content
- not dominate the hero

### 4. Reorder the text
Change the text order so the hero reads:

1. `Good {time of day}, {User first name}.`
2. `Build with GRIT.`

### 5. Preserve the minimalist flagship posture
The hero must remain:
- quiet
- premium
- minimal
- non-promotional
- non-editorial

Do not add:
- CTA
- metadata
- badges
- links
- support copy
- alert copy
- secondary modules

## Visual Guidance

The greeting should be the warm entry line.
The tagline should be the stronger brand statement beneath it.

Recommended hierarchy:
- greeting: smaller, refined, personal
- tagline: larger, bolder, more assertive

## Deliverables

- updated `HbSignatureHero.tsx`
- updated `signature-hero.module.css`
- concise note summarizing the refinement decisions

## Validation

Before finishing, prove:
- hero height is reduced materially
- `HB Central` is removed
- logo is more balanced
- text order is now greeting first, tagline second
- runtime CSS behavior was not regressed
