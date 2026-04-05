# Phase B-04 — HB Hero Banner Redesign

## Status: Complete

## Objective

Rebuild the HB Hero Banner into a flagship homepage hero surface with stronger editorial hierarchy, premium CTA treatment, cleaner metadata structure, and more deliberate content layering.

---

## Implementation Summary

The hero banner is transformed from a basic content card with a text-link CTA into a flagship editorial surface with dramatic hierarchy and premium interaction patterns:

### Before
- Flat headline at default heading size with `hpHeadingReset`
- Supporting message with basic `hpContentParagraph`
- Text-link CTA (`variant="link"`) with trailing arrow
- Metadata row below the gradient section
- No eyebrow/kicker editorial context
- No secondary CTA support

### After
- **`HbcHomepageEyebrow`** with `tone="on-dark"` above the headline for editorial context (e.g., "This week at HB")
- **Display-level headline** at 1.75rem/700wt with tight letter-spacing (-0.02em) for flagship authority
- **Refined supporting copy** at 0.9375rem/400wt with 92% opacity and 52ch max-width for comfortable reading rhythm
- **Premium primary CTA** upgraded from `variant="link"` to `variant="button"` with `size="large"` — filled brand-colored button with increased padding, arrow indicator
- **Optional secondary CTA** with `variant="link"` for less-prominent alternative action
- **CTA row layout** with flex wrap and 12px gap for clean primary + secondary pairing
- **Metadata row** with `separated` prop for dot-separated structured output

### Config contract extensions
- **`eyebrow?: string`** — optional editorial kicker above the headline
- **`secondaryCta?: HomepageCtaLink`** — optional secondary action link
- Both fields are optional with `undefined` defaults — fully backward compatible

---

## Files Changed

| File | Change |
|------|--------|
| `apps/hb-webparts/src/webparts/hbHeroBanner/HbHeroBanner.tsx` | **Modified** — rebuilt with eyebrow, display-level headline, refined message, premium button CTA, optional secondary CTA, flex CTA row |
| `apps/hb-webparts/src/homepage/webparts/topBandContracts.ts` | **Modified** — added `eyebrow?: string` and `secondaryCta?: HomepageCtaLink` to `HbHeroBannerConfig` |
| `apps/hb-webparts/src/homepage/helpers/topBandConfig.ts` | **Modified** — extracted `normalizeCta` helper, added eyebrow and secondaryCta normalization |
| `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx` | **Modified** — added `eyebrow` and `secondaryCta` to hero sample data |
| `apps/hb-webparts/package.json` | **Modified** — version 0.0.2 → 0.0.3 |
| `docs/architecture/plans/MASTER/spfx/homepage/phase-12/Phase-B-04-HB-Hero-Banner-Redesign.md` | **New** — implementation documentation |

---

## Key Decisions

1. **Primary CTA upgraded to `variant="button"` + `size="large"`** — the hero is the homepage's flagship surface and its CTA must read as a primary action, not a subordinate text link. The `size="large"` from Prompt 02 provides increased padding (16px/24px) and font size (0.9375rem).
2. **Secondary CTA stays `variant="link"`** — creates clear visual hierarchy between primary and secondary actions without CTA noise.
3. **Eyebrow uses `tone="on-dark"`** — renders at 85% white opacity on the gradient background, matching the on-dark tone from the `HbcHomepageEyebrow` primitive.
4. **Headline at 1.75rem** (not full `display` 2rem) — matches the welcome header's name emphasis to maintain visual balance across the top band without competing for dominance.
5. **Supporting copy capped at 52ch** — prevents long messages from stretching across the full gradient width, which would hurt readability.
6. **Extracted `normalizeCta` helper** — DRYs up the CTA normalization logic that was duplicated between primary and secondary CTA handling.
7. **Removed unused `hpHeadingReset` and `hpContentParagraph` imports** — replaced by dedicated hero-specific style objects.

## Assumptions

1. `HbcHomepageCta` `variant="button"` + `size="large"` renders correctly on gradient backgrounds (white-on-brand button over brand gradient). The `colorNeutralForegroundOnBrand` token provides sufficient contrast.
2. The existing `HbcHomepageCta` renders as an `<a>` element regardless of variant, so the test assertion `screen.getByRole('link')` continues to pass with `variant="button"`.
3. The `eyebrow` and `secondaryCta` fields are optional additions — all existing hero instances that don't provide them continue to work unchanged.

## Open Issues

None.

## Acceptance Evidence

- [x] Hero no longer reads like a generic content card — display-level headline, gradient section with eyebrow, premium button CTA
- [x] Headline authority materially stronger — 1.75rem/700wt with tight letter-spacing
- [x] CTA treatment materially stronger — filled brand button at large size with arrow indicator
- [x] Metadata treatment more structured — separated dot layout via `HbcHomepageMetadataRow`
- [x] Hero complements welcome header — matching 1.75rem headline scale, but different surface treatment (gradient vs left-accent)
- [x] Accessibility preserved — `aria-label="Hero banner"`, semantic h2 heading, reduced-motion gating on transitions
- [x] Contrast preserved — white text on brand gradient, 85% opacity eyebrow
- [x] All 72 tests pass
- [x] check-types clean, lint clean, build clean (273 kB JS)
