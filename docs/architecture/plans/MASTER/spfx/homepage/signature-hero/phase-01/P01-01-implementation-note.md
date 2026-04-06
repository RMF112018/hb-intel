# P01-01 Implementation Note — Forensic Hero Reset and Repo Truth Lock

**Prompt:** `Prompt-01-Forensic-Hero-Reset-and-Repo-Truth.md`
**Date:** 2026-04-06
**Version:** 1.0.0.66

## Canonical Flagship Path

`HbSignatureHero` is the sole flagship homepage top-band surface.

- Component: `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHero.tsx`
- Manifest: `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHeroWebPart.manifest.json`
- Contract: `identity`, `backgroundImage`, `now` (3 props only)
- Composition: `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx` Zone 1

## What Changed

### Manifest cleanup — HbSignatureHero
- Removed stale default properties: `headline`, `message`, `metadata`, `cta`
- Updated description to reflect the actual minimal identity surface

### Toolbox hiding — legacy top-band surfaces
- `HbHeroBannerWebPart.manifest.json`: added `hiddenFromToolbox: true`, updated description to "standalone only"
- `PersonalizedWelcomeHeaderWebPart.manifest.json`: added `hiddenFromToolbox: true`, updated description to "standalone only"

### Governance deprecation
- `authoringGovernanceContracts.ts`: added optional `deprecated` field to `HomepageAuthoringGovernanceEntry`
- `authoringGovernance.ts`: marked `personalizedWelcomeHeader` and `hbHeroBanner` entries as `deprecated: true` with `@deprecated` JSDoc and updated zone intent

### Dead code removal
- Deleted `HomepageTopBandPair.tsx` — orphaned split-path composition shell (no imports, no exports)

### Version bump
- `package-solution.json`: `1.0.0.65` to `1.0.0.66` (solution + feature)

## What Was NOT Changed (and why)

- **HbSignatureHero.tsx** — already rebuilt as minimal premium identity surface (P18-02 through P18-04)
- **mount.tsx** — legacy components remain mountable for standalone/non-flagship use
- **topBandContracts.ts / topBandConfig.ts** — serve the retained legacy components
- **tokens.ts** — layout tokens serve legacy components if used standalone
- **shared/index.ts** — `HomepageTopBandPair` was never in the barrel export

## Validation

| Check | Result |
|-------|--------|
| `tsc --noEmit` | Pass |
| `eslint src/` | Pass |
| `vite build` | Pass (452.75 KB JS, 20.56 KB CSS) |
| `vitest run` | 13 pre-existing failures (bundle budget, component render tests) — none introduced by this change |
