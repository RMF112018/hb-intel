# Phase B-05 — Homepage Top-Band Integration and Polish

## Status: Complete

## Objective

Integrate the redesigned Personalized Welcome Header and HB Hero Banner into a coherent top-band composition, then complete spacing, hierarchy, responsive, motion, and polish work.

---

## Implementation Summary

### Composition restructuring
- **Removed `HbcHomepageSectionShell` wrapper** from `HomepageTopBandPair` — the section shell rendered a visible "Homepage Top Band" heading with subtitle text that is inappropriate for a flagship surface. The top band IS the visual anchor; it does not need a labeling heading above it. Replaced with a clean `<section aria-label="Homepage top band">` for accessibility without visual noise.
- **Increased gap** from `HP_SPACE.xl` (12px) to `HP_SPACE['2xl']` (16px) between welcome and hero — more breathing room for the redesigned surfaces with their stronger visual presence.
- **Changed alignment** from `stretch` to `flex-start` — the welcome header now has variable height (eyebrow + split greeting + optional alert), and stretch alignment caused visual imbalance. `flex-start` lets each surface find its natural height.
- **Inlined rail layout** into `HomepageTopBandPair` — removed the `HomepageRailShell` dependency since the top band needs its own alignment and gap tuning.
- **Removed redundant zone wrapper** from `ReferenceHomepageComposition` — `HomepageTopBandPair` already applies `hpZoneSection('topBand')`.

### Hero CTA on-dark treatment
- **Added `.heroCtaOnDark` CSS class** for secondary/link CTAs rendered on the hero gradient background. The shared `HbcHomepageCta` link variant uses brand-foreground theme tokens that are invisible on the brand gradient. The on-dark override provides white text at 92% opacity with proper hover (full opacity), focus-visible (white outline), and reduced-motion compliance.
- **Wired the CSS module class** into `HbHeroBanner.tsx` for the secondary CTA only. The primary button CTA uses `colorNeutralForegroundOnBrand` which already contrasts correctly on the gradient.

### Token and responsive refinement
- **Added `HP_LAYOUT.topBandGap = 16`** — documents the composed gap between welcome and hero as a named layout token for readability and future reference.

### Bug fix
- **Fixed smart/curly quotes** (U+2018, U+2019) in `ReferenceHomepageComposition.tsx` that were introduced in earlier prompts — replaced all with straight quotes, used double quotes for the `Let's` string to avoid apostrophe escaping.

### Test updates
- **`compositionPreview.test.tsx`** — updated zone 1 assertion from `screen.getAllByText('Homepage Top Band')` to `container.querySelector('[aria-label="Homepage top band"]')` to match the new section shell-less structure.
- **`interactiveStates.test.ts`** — updated focus-visible brand-blue assertion to exempt on-dark variants (`heroCtaOnDark`) which correctly use white outlines for gradient backgrounds.

---

## Files Changed

| File | Change |
|------|--------|
| `apps/hb-webparts/src/homepage/shared/HomepageTopBandPair.tsx` | **Modified** — removed section shell wrapper, replaced with accessible `<section>`, inlined rail layout, increased gap to 16px, flex-start alignment |
| `apps/hb-webparts/src/homepage/homepage-interactive.module.css` | **Modified** — added `.heroCtaOnDark` class with on-dark hover/focus/reduced-motion; added to reduced-motion blanket |
| `apps/hb-webparts/src/homepage/homepage-interactive.module.css.d.ts` | **Modified** — added `heroCtaOnDark` type declaration |
| `apps/hb-webparts/src/homepage/tokens.ts` | **Modified** — added `HP_LAYOUT.topBandGap = 16` |
| `apps/hb-webparts/src/webparts/hbHeroBanner/HbHeroBanner.tsx` | **Modified** — imported CSS module, wired `.heroCtaOnDark` for secondary CTA, removed placeholder className from primary CTA |
| `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx` | **Modified** — removed redundant zone wrapper, fixed smart quotes |
| `apps/hb-webparts/src/homepage/__tests__/compositionPreview.test.tsx` | **Modified** — updated zone 1 assertion for aria-label instead of visible text |
| `apps/hb-webparts/src/homepage/__tests__/interactiveStates.test.ts` | **Modified** — updated focus-visible assertion to exempt on-dark variants |
| `apps/hb-webparts/package.json` | **Modified** — version 0.0.3 → 0.0.4 |
| `docs/architecture/plans/MASTER/spfx/homepage/phase-12/Phase-B-05-Homepage-Top-Band-Integration-and-Polish.md` | **New** — implementation documentation |

---

## Key Decisions

1. **Removed section shell from top band.** A flagship surface should not have a utility-style heading label above it. The top band communicates its purpose through its content (greeting + hero), not through a section title. Accessibility is preserved via `aria-label`.
2. **`flex-start` over `stretch`.** With the welcome header now having variable height, stretch creates awkward visual imbalance. `flex-start` lets each surface express its natural content height.
3. **On-dark CTA class is scoped to the secondary link CTA only.** The primary button CTA uses the Fluent `colorNeutralForegroundOnBrand` token which already provides correct contrast on the gradient. Only the secondary link-variant CTA needs the white text override.
4. **Gap increased to 16px (HP_SPACE['2xl']).** The original 12px gap was appropriate for simpler surfaces but felt tight with the redesigned surfaces' stronger visual presence.

## Assumptions

1. The `hpZoneSection('topBand')` background tint (`rgba(34,83,145,0.03)`) remains appropriate — it provides subtle zone identity without competing with the surfaces' own backgrounds.
2. The `flex-start` alignment provides acceptable responsive behavior at narrow widths where the surfaces stack vertically.
3. The on-dark white outline at `rgba(255, 255, 255, 0.8)` provides sufficient focus visibility on the brand gradient.

## Open Issues

None.

## Acceptance Evidence

- [x] Top band reads as one coherent authored experience — consistent gap, aligned zone background, no redundant heading
- [x] Welcome and hero are visually related (shared zone tint, matched 1.75rem headlines) but clearly differentiated (left-accent vs bottom-border, personal greeting vs editorial hero)
- [x] Spacing and rhythm intentional — 16px gap, flex-start alignment, zone background wrapping both surfaces
- [x] Responsive behavior stable — flex-wrap preserves stacking at narrow widths, min-widths (280px welcome, 320px hero) unchanged
- [x] Motion and interaction polish restrained — on-dark CTA transitions respect reduced-motion, hero background transition gated by hook
- [x] All 72 tests pass (2 tests updated to match new structure)
- [x] check-types clean, lint clean, build clean (273 kB JS, 0.93 kB CSS)
