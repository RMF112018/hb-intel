# Phase 03-02 Completion Note — Full-Width Top-Band and Interactive-State System

## Status

**Complete.** Interactive-state system implemented via CSS module, full-width top-band posture established, CTA semantics audited, reduced-motion hardened, media containers applied.

## Styling mechanism chosen

**CSS Modules** (`homepage-interactive.module.css`) — the most lightweight approach:
- Vite supports CSS modules with zero configuration and zero new dependencies
- Provides `:hover`, `:focus-visible`, and `@media (prefers-reduced-motion)` that inline styles cannot express
- The CSS file stays local to `apps/hb-webparts` (consistent with homepage-local primitive strategy)
- Inline styles from `tokens.ts` continue to set base appearance; the CSS module adds interactive overlays on top

## What changed

### CSS module created
`src/homepage/homepage-interactive.module.css` with 5 classes:
- `.ctaLink` — hover: underline + darker brand blue; focus-visible: brand blue outline
- `.searchInput` — focus-visible: brand blue border + box-shadow
- `.topBandSection` — full-width, box-sizing: border-box
- `.mediaContainer` — display: block, line-height: 0 for image whitespace removal
- `@media (prefers-reduced-motion: reduce)` — blanket `transition: none` for all interactive elements

### Interactive classes applied to 7 components
| Component | Classes Applied |
|-----------|----------------|
| HbHeroBanner | `styles.ctaLink` on CTA link |
| CompanyPulse | `styles.ctaLink` on featured + secondary CTA links |
| LeadershipMessage | `styles.ctaLink` on CTA link |
| PeopleCulture | `styles.ctaLink` on CTA link |
| ProjectPortfolioSpotlight | `styles.ctaLink` on featured + secondary CTA links |
| SafetyFieldExcellence | `styles.ctaLink` on featured + secondary CTA links |
| HomepageDiscoveryCluster | `interactiveStyles.searchInput` on search input |

### Top-band upgraded
HomepageTopBandPair now wraps content in `.topBandSection` for full-width posture with proper box-sizing.

### CTA semantics audit
All 10 webparts audited. Finding: **all CTAs are navigational** (`<a href=...>`) — correct semantic usage. No `<button>` conversion needed. This is confirmed by a structural test.

### Reduced-motion hardened
The CSS module's `@media (prefers-reduced-motion: reduce)` rule blankets all `.ctaLink` and `.searchInput` transitions. Combined with the existing `useHomepageReducedMotion` hook in HbHeroBanner, all homepage motion is now gated.

### Tests added
`interactiveStates.test.ts` — 8 tests:
- CSS module file exists
- `.ctaLink` defines hover and focus-visible
- `.searchInput` defines focus-visible
- `.topBandSection` defines full-width
- `.mediaContainer` exists
- Reduced-motion blanket rule exists
- Focus-visible uses brand blue (#225391)
- CTA semantics audit: all webpart CTAs use `<a>` elements with `href`

## Files changed

| File | Change |
|------|--------|
| `src/homepage/homepage-interactive.module.css` | **Created** — interactive state CSS module |
| `src/homepage/homepage-interactive.module.css.d.ts` | **Created** — TypeScript declarations for CSS module |
| `src/webparts/hbHeroBanner/HbHeroBanner.tsx` | Added `styles.ctaLink` class |
| `src/webparts/companyPulse/CompanyPulse.tsx` | Added `styles.ctaLink` class to featured + secondary CTAs |
| `src/webparts/leadershipMessage/LeadershipMessage.tsx` | Added `styles.ctaLink` class |
| `src/webparts/peopleCulture/PeopleCulture.tsx` | Added `styles.ctaLink` class |
| `src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx` | Added `styles.ctaLink` class to featured + secondary CTAs |
| `src/webparts/safetyFieldExcellence/SafetyFieldExcellence.tsx` | Added `styles.ctaLink` class to featured + secondary CTAs |
| `src/homepage/shared/HomepageDiscoveryCluster.tsx` | Added `interactiveStyles.searchInput` class |
| `src/homepage/shared/HomepageTopBandPair.tsx` | Added `.topBandSection` wrapper for full-width |
| `src/homepage/__tests__/interactiveStates.test.ts` | **Created** — 8 structural tests |
| `config/package-solution.json` | Version 1.0.0.35 → 1.0.0.36 |

## Verification

| Step | Result |
|------|--------|
| `check-types` | PASS |
| `lint` | PASS |
| `build` | PASS (264.07 KB JS + 0.63 KB CSS) |
| `test` | PASS (16 files, 64 tests — up from 15/56) |

## Build output change
The build now produces a CSS file (`spfx-hb-webparts.css`, 0.63 KB) alongside the JS bundle. This is automatically extracted by Vite from the CSS module imports.

## Remaining for Prompt 03

- Skeleton shimmer evaluation for loading states
- Broader media aspect-ratio HTML attribute enforcement
- Composition template hardening and acceptance documentation
- Phase 03 closure package
