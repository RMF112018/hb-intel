# P04-04 Closure Report — Clean Rebuild and SharePoint Proof

**Prompt:** `Prompt-04-Clean-Rebuild-And-SharePoint-Proof.md`
**Date:** 2026-04-06
**Version:** 1.0.0.81

## Build Posture

Clean rebuild from scratch:
1. Removed `apps/hb-webparts/dist/`
2. Removed `dist/sppkg/`
3. Removed `tools/spfx-shell/sharepoint/`, `temp/`, `dist/`
4. Removed stale shell `assets/*.js`, `*.css`
5. `tsc --noEmit` → Pass
6. `eslint src/` → Pass
7. `vite build` → Pass (452.57 KB JS / 20.07 KB CSS)
8. `build-spfx-package --domain hb-webparts` → Success

## A. Emitted Asset Proof

| Asset | Size | Status |
|-------|------|--------|
| `spfx-hb-webparts.css` | 20,068 bytes | Emitted, packaged in ClientSideAssets |
| `hb-webparts-app-d0094914.js` | 452,569 bytes | Emitted, content-hashed |
| `banner_home_7.png` | 2,862,677 bytes | Emitted from `public/`, packaged in ClientSideAssets |
| `loadCss` in compiled shell | 1 occurrence | Shell loads CSS via `SPComponentLoader.loadCss()` |
| `28acd6a7` in packaged bundle | 1 occurrence | Signature Hero registered in WEBPART_RENDERERS |
| `banner_home_7` in packaged bundle | 1 occurrence | Default banner constant present |
| `backgroundImageUrl` in compiled shell | 1 occurrence | Property pane field compiled |
| Hero CSS markers (surface, tagline, grain, lockup, greeting, photo, scrim) | All present | CSS module rules emitted |
| `supportsFullBleed: true` for 28acd6a7 | Verified | Full-width hero preserved |
| WebPart XMLs in sppkg | 11 of 11 | All webparts packaged |
| `.sppkg` | 3,017,510 bytes (2,947 KB) | Ready for upload |

## B. Visual Refinement Proof (P04-01 through P04-03 cumulative)

| Criterion | Before Phase 04 | After Phase 04 |
|-----------|----------------|----------------|
| Hero height | 380px desktop / 300px phone | 256px desktop / 200px phone |
| "HB Central" label | Present | Removed |
| Logo size | 18px / 0.55 opacity | 28px / 0.70 opacity |
| Text order | Tagline first, greeting second | Greeting first, tagline second |
| Background-position | center 40% | center center |
| Default background | Charcoal fallback only | `banner_home_7.png` via CDN |
| Background override | Not available | Property-pane `backgroundImageUrl` |
| Content padding | 2.5rem 3.5rem / gap 3rem | 1.75rem 3.5rem / gap 1.5rem |
| Identity gap | 1.5rem | 0.75rem |

## C. SharePoint Configurability Proof

### Property pane
- `backgroundImageUrl` field exposed in property pane (conditional — hero webpart only)
- Includes description text: "Enter a SharePoint-hosted image URL to override the default hero background."
- Placeholder: `https://your-tenant.sharepoint.com/sites/.../image.jpg`

### Resolution order
1. Property-pane `backgroundImageUrl` (if non-empty string)
2. CDN default: `{assetBaseUrl}banner_home_7.png`
3. Charcoal fallback: `hsl(220 12% 11%)` with material grain texture

### Reset behavior
Clearing the property-pane field restores the CDN default banner.

## D. Runtime Stability Proof

| Check | Result |
|-------|--------|
| CSS loads via `SPComponentLoader.loadCss()` | Confirmed (1 occurrence in compiled shell) |
| Hero manifest has `supportsFullBleed: true` | Confirmed |
| JS bundle not bloated by inlined image | Confirmed (452 KB, no base64) |
| CSS not bloated by inlined image | Confirmed (20 KB, no base64) |
| Image packaged as separate CDN asset | Confirmed in ClientSideAssets |
| No packaging pipeline changes required | Confirmed (existing flow copied image from dist/) |

## SharePoint Deployment Instructions

### Uploading the .sppkg
1. Navigate to **SharePoint Admin Center** → **App Catalog** → **Apps for SharePoint**
2. Upload `dist/sppkg/hb-webparts.sppkg`
3. Approve when prompted ("Do you trust hb-webparts?")
4. The package deploys to all sites (skipFeatureDeployment: true)

### Verifying the hero
1. Navigate to the HB Central homepage
2. The Signature Hero should display with:
   - `banner_home_7.png` as the background (center-cropped)
   - Greeting: "Good {morning/afternoon/evening}, {First Name}."
   - Tagline: "Build with GRIT."
   - Hedrick Brothers logo (28px, subtle)
   - No "HB Central" text
   - Shorter, tighter hero (256px desktop)

### Changing the background image
1. Edit the SharePoint page
2. Click the Signature Hero web part
3. Open the property pane (pencil icon)
4. In **Background Image** → **Background image URL**, paste a SharePoint-hosted image URL
5. The hero background updates immediately
6. Clear the field to revert to the default `banner_home_7.png`
7. Save and publish the page

**Recommended:** Use wide, low-clutter project or craft photography hosted in a SharePoint image library.

## Phase 04 Summary

| Prompt | Objective | Status |
|--------|-----------|--------|
| P04-01 | Refine hero visual composition | Complete |
| P04-02 | Implement default hero background asset | Complete |
| P04-03 | Add SharePoint-configurable background | Complete |
| P04-04 | Clean rebuild and SharePoint proof | Complete |

All four Phase 04 prompts are complete. The `.sppkg` is ready for SharePoint deployment and runtime validation.
