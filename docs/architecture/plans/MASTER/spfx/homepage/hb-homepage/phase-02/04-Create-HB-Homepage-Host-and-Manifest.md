# 04 — Create HB Homepage Host and Manifest

## Objective

Implement the `hb-homepage` webpart host with adjacent manifest, shell hierarchy, zone wrappers, and error boundaries.

## Files created

| File | Purpose |
|------|---------|
| `src/webparts/hbHomepage/HbHomepage.tsx` | Root entry component |
| `src/webparts/hbHomepage/HbHomepageShell.tsx` | Shell composition with zone ordering and layout |
| `src/webparts/hbHomepage/HbHomepageShell.module.css` | Shell layout styles (responsive, reduced-motion aware) |
| `src/webparts/hbHomepage/HbHomepageShell.module.css.d.ts` | CSS module type declaration |
| `src/webparts/hbHomepage/hbHomepageContract.ts` | Webpart ID, props interfaces |
| `src/webparts/hbHomepage/ZoneErrorBoundary.tsx` | Per-zone React error boundary |
| `src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` | Adjacent SPFx manifest |
| `src/webparts/hbHomepage/zones/CompanyPulseZone.tsx` | CompanyPulse zone wrapper |
| `src/webparts/hbHomepage/zones/LeadershipMessageZone.tsx` | LeadershipMessage zone wrapper |
| `src/webparts/hbHomepage/zones/ProjectPortfolioSpotlightZone.tsx` | ProjectPortfolioSpotlight zone wrapper |
| `src/webparts/hbHomepage/zones/PeopleCulturePublicZone.tsx` | PeopleCulturePublic zone wrapper |
| `src/webparts/hbHomepage/zones/HbKudosZone.tsx` | HbKudos zone wrapper |

## Manifest posture

- **ID:** `e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf`
- **Alias:** `HbHomepageWebPart`
- **supportsFullBleed:** `true` — intentional full-width capability for communication sites
- **hiddenFromToolbox:** `false` — available for page authors to place
- **Group:** HB Intel (`5c03119e-3074-46fd-976b-c60198311f70`)

## Shell behavior under non-ideal states

- **Loading:** Each embedded module handles its own loading state independently.
- **Empty/sparse:** Modules render their own empty states. Shell maintains layout integrity.
- **Error:** `ZoneErrorBoundary` catches per-zone errors, logs to console, renders null for the failed zone. Other zones remain functional.
- **Partial config:** All props optional. Missing config slices result in modules rendering their default/empty behavior.
- **Reduced motion:** CSS `prefers-reduced-motion: reduce` disables all animation/transition duration in the shell scope.

## Compile verification

- `pnpm --filter @hbc/spfx-hb-webparts check-types` — passes cleanly
- `pnpm --filter @hbc/spfx-hb-webparts build` — produces `hb-webparts-app.js` (1,014 KB) and CSS (153 KB)
- No new lint issues introduced (all existing lint errors are pre-existing in unrelated files)

## Boundary for Prompt 05

All five zone wrappers are implemented and rendering through the shell. Prompts 05-07 closure notes document the embedding proof per module group.
