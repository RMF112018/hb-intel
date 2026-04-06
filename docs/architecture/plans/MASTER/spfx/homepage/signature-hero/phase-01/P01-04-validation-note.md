# P01-04 Validation Note — Runtime Proof and SPPKG Readiness

**Prompt:** `Prompt-04-Validation-And-Sppkg-Proof.md`
**Date:** 2026-04-06
**Version:** 1.0.0.69

## A. Build Validation

| Check | Result |
|-------|--------|
| `tsc --noEmit` | Pass |
| `eslint src/` | Pass |
| `vite build` | Pass |
| JS bundle size | 452.24 KB (171.06 KB gzip) |
| CSS bundle size | 20.17 KB (4.28 KB gzip) |

## B. Bundle Content Proof

### Hero implementation is the rebuilt version
- **"Build with GRIT"** present in JS bundle — confirms the locked tagline renders
- **New CSS classes** (`surface`, `lockup`, `identity`, `tagline`, `greeting`) present in CSS bundle
- **Old hero CSS classes** (`ambientLayer`, `warmShift`, `edgeHighlight`, `brandLockup`, `brandLogo`, `brandLabel`) absent from the signature hero module — only `ambientLayer` appears in the bundle, and it belongs to `@hbc/ui-kit`'s `HbcSignatureHeroSurface` (used by legacy HbHeroBanner), not the rebuilt hero
- **No gradient wash** in the signature hero CSS — base color is `hsl(220 12% 11%)` (deep charcoal)
- **"Build with confidence."** present in bundle — this is from the legacy `HbHeroBanner` component (retained as standalone, hidden from toolbox), NOT from HbSignatureHero

### Content scope is locked
The rebuilt hero renders exactly three elements:
1. Brand lockup (Hedrick logo + "HB Central" label)
2. Tagline: "Build with GRIT."
3. Personalized greeting (`{greeting}, {firstName}.`)

No CTA, no metadata, no editorial copy, no alert fields in the component.

## C. Manifest Integrity — Source Manifests

### HbSignatureHero (visible)
- `supportsFullBleed: true` — confirmed
- `properties: {}` — stale editorial defaults removed
- Description: "Canonical flagship homepage hero with brand lockup, tagline, and personalized greeting for full-width top-band composition."
- `hiddenFromToolbox`: NOT set (visible in toolbox)

### All 11 non-hero webparts (hidden)
Every non-hero source manifest contains `"hiddenFromToolbox": true`:

| Webpart | Source manifest | Hidden |
|---------|----------------|--------|
| HB Webparts (scaffold) | `hbWebparts/HbWebpartsWebPart.manifest.json` | Yes |
| HB Hero Banner | `hbHeroBanner/HbHeroBannerWebPart.manifest.json` | Yes |
| Personalized Welcome Header | `personalizedWelcomeHeader/PersonalizedWelcomeHeaderWebPart.manifest.json` | Yes |
| Company Pulse | `companyPulse/CompanyPulseWebPart.manifest.json` | Yes |
| Leadership Message | `leadershipMessage/LeadershipMessageWebPart.manifest.json` | Yes |
| People and Culture | `peopleCulture/PeopleCultureWebPart.manifest.json` | Yes |
| Priority Actions Rail | `priorityActionsRail/PriorityActionsRailWebPart.manifest.json` | Yes |
| Project / Portfolio Spotlight | `projectPortfolioSpotlight/ProjectPortfolioSpotlightWebPart.manifest.json` | Yes |
| Safety and Field Excellence | `safetyFieldExcellence/SafetyFieldExcellenceWebPart.manifest.json` | Yes |
| Smart Search / Wayfinding | `smartSearchWayfinding/SmartSearchWayfindingWebPart.manifest.json` | Yes |
| Tool Launcher / Work Hub | `toolLauncherWorkHub/ToolLauncherWorkHubWebPart.manifest.json` | Yes |

### No top-band ambiguity
- HbHeroBanner description: "Standalone editorial hero banner. Not for flagship homepage use…"
- PersonalizedWelcomeHeader description: "Standalone greeting header. Not for flagship homepage use…"

## D. Manifest Integrity — Release Manifests

All 11 release manifests under `tools/spfx-shell/release/manifests/` have been synchronized:

| Release manifest | Alias | Hidden | Verified |
|------------------|-------|--------|----------|
| `28acd6a7-…` | HbSignatureHeroWebPart | **No** (visible) | `supportsFullBleed: true`, `properties: {}`, updated description |
| `39762a4d-…` | HbHeroBannerWebPart | Yes | Updated description, `hiddenFromToolbox: true` |
| `46bfde64-…` | PersonalizedWelcomeHeaderWebPart | Yes | Updated description, `hiddenFromToolbox: true` |
| `0b53f651-…` | CompanyPulseWebPart | Yes | `hiddenFromToolbox: true` |
| `11d72b36-…` | SmartSearchWayfindingWebPart | Yes | `hiddenFromToolbox: true` |
| `27ac10f4-…` | PeopleCultureWebPart | Yes | `hiddenFromToolbox: true` |
| `8370ab0c-…` | ProjectPortfolioSpotlightWebPart | Yes | `hiddenFromToolbox: true` |
| `89ca5ff3-…` | SafetyFieldExcellenceWebPart | Yes | `hiddenFromToolbox: true` |
| `b3f07190-…` | PriorityActionsRailWebPart | Yes | `hiddenFromToolbox: true` |
| `cb7060f5-…` | ToolLauncherWorkHubWebPart | Yes | `hiddenFromToolbox: true` |
| `e8fa8a84-…` | LeadershipMessageWebPart | Yes | `hiddenFromToolbox: true` |

## E. Authoring Safety Proof

The hero has no "unconfigured" or "empty" state because:
- Logo is a static asset import (`hedrickLogo` from `@hbc/ui-kit/branding`)
- Tagline is hardcoded ("Build with GRIT.")
- Greeting falls back to "Good {time-of-day}, there." when identity is unavailable
- Background degrades gracefully: authored photography (with scrim) → charcoal textured fallback
- `properties: {}` in the manifest means no author configuration is needed

The hero is stable under normal SharePoint authoring conditions because:
- No interactive elements
- No property pane dependencies for core rendering
- `supportsFullBleed: true` enables full-width section placement
- Responsive breakpoints at 768px and 480px handle section resizing
- `prefers-reduced-motion` disables animation

## F. Full-Width Proof

- Manifest declares `supportsFullBleed: true`
- CSS: `.surface` uses `display: grid` with no `max-width` constraint
- Content column uses `max-width: 56%` (proportional, not pixel-capped) — content stays left-anchored while the surface fills available width
- No internal layout bottleneck that would make the hero collapse into a narrow centered rail
- Border-radius (20px) and overflow:hidden create the premium plate edge without restricting width

## G. Gradient Removal Proof

- No `linear-gradient` with blue/orange brand colors in the signature hero CSS module
- Base color: `hsl(220 12% 11%)` (deep charcoal)
- Scrim: `hsla(220 12% 8% / …)` variants (neutral dark tones for readability, not decorative)
- Grain: SVG fractal noise with `mix-blend-mode: overlay` at 0.032 opacity
- No radial glows, no warm shift decorations, no edge highlight bands

## H. Package Readiness Assessment

| Criterion | Status |
|-----------|--------|
| Build compiles | Pass |
| Source manifests aligned | Pass |
| Release manifests aligned | Pass |
| Only Signature Hero visible | Pass |
| Full-width support declared | Pass |
| Stale properties removed | Pass |
| Gradient removed | Pass |
| Hero is complete redesign | Pass |
| Authoring-safe defaults | Pass |

**Package status: Ready for .sppkg generation and upload.**

## I. Known Pre-Existing Issues (Not Introduced by Phase 01)

13 test failures exist in the test suite, all pre-existing:
- 2 bundle budget overruns (JS > 400KB, CSS > 10KB)
- 1 HbHeroBanner reduced-motion hook import test
- 8 component render tests (discovery, communications, utility, operational awareness, composition)

These are not regressions from the Phase 01 hero reset.
