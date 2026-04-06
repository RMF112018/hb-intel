# P04-02 Closure Report — Implement Default Hero Background Asset

**Prompt:** `Prompt-02-Implement-Default-Hero-Background-Asset.md`
**Date:** 2026-04-06
**Version:** 1.0.0.79

## Objective

Use the provided `banner_home_7.png` as the default hero background in a deployment-safe way without embedding the user's local filesystem path in shipped runtime code.

## Architecture Decision: CDN-Resolved Asset URL

Vite lib mode (IIFE output) inlines all imported assets regardless of `assetsInlineLimit` — a 2.8 MB PNG would bloat the JS bundle to 4.2 MB or the CSS to 3.8 MB. Neither is acceptable.

**Chosen approach:** Place the image in Vite's `public/` directory so it is copied unprocessed to `dist/`. The existing `build-spfx-package` pipeline copies all `dist/` files into `ClientSideAssets/` within the `.sppkg`. At runtime, the SPFx shell resolves the CDN base URL from the manifest's `loaderConfig.internalModuleBaseUrls[0]` and passes it as `assetBaseUrl` to the mounted component, which constructs `{assetBaseUrl}banner_home_7.png`.

**Fallback behavior:** When `assetBaseUrl` is not available (e.g., dev-harness, Storybook, or non-SPFx context), and no `backgroundImage` override is provided, the hero renders with the deep charcoal fallback surface — same as before.

## Asset Placement

| Location | Purpose |
|----------|---------|
| `apps/hb-webparts/public/banner_home_7.png` | Source image — Vite copies to `dist/` unprocessed |
| `apps/hb-webparts/dist/banner_home_7.png` | Build output — `build-spfx-package` copies to shell `assets/` |
| `.sppkg ClientSideAssets/banner_home_7.png` | Runtime — served from SharePoint CDN at the same base URL as JS/CSS |

## Changes Applied

### 1. Image copied into repo
- Source: user-provided local path (not stored in code)
- Destination: `apps/hb-webparts/public/banner_home_7.png` (2.8 MB)
- Vite copies `public/` contents to `dist/` during build

### 2. CDN base URL threaded through SPFx runtime

**`tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`:**
- Added `_assetBaseUrl` instance property to store `normalizedBase`
- Added `runtimeConfig.assetBaseUrl = this._assetBaseUrl` in `render()`

**`apps/hb-webparts/src/mount.tsx`:**
- Added `assetBaseUrl` to `MountConfig` interface
- Extracts `assetBaseUrl` from config and passes to HbSignatureHero renderer

### 3. Hero component wired to use default banner

**`apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHero.tsx`:**
- Added `DEFAULT_BANNER` constant (`banner_home_7.png`)
- Added `assetBaseUrl` prop to `HbSignatureHeroProps`
- Computes `heroBackground = backgroundImage ?? (assetBaseUrl + DEFAULT_BANNER)`
- Renders `.photo` div with background image only when URL is available

### 4. Background positioning corrected

**`apps/hb-webparts/src/webparts/hbSignatureHero/signature-hero.module.css`:**
- Changed `background-position: center 40%` → `center center` for true center-crop

## Files Changed

| File | Change |
|------|--------|
| `apps/hb-webparts/public/banner_home_7.png` | New — repo-controlled default banner image |
| `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHero.tsx` | Add `assetBaseUrl` prop, wire default banner URL |
| `apps/hb-webparts/src/webparts/hbSignatureHero/signature-hero.module.css` | Update background-position to `center center` |
| `apps/hb-webparts/src/mount.tsx` | Thread `assetBaseUrl` from config to hero renderer |
| `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` | Store and pass CDN base URL as `assetBaseUrl` |
| `tools/spfx-shell/config/package-solution.json` | Version 1.0.0.78 → 1.0.0.79 |

## Verification

| Check | Scope | Result |
|-------|-------|--------|
| `tsc --noEmit` | `@hbc/spfx-hb-webparts` | Pass |
| `eslint src/` | `@hbc/spfx-hb-webparts` | Pass |
| `vite build` | `@hbc/spfx-hb-webparts` | Pass (452.42 KB JS / 20.07 KB CSS) |
| `banner_home_7.png` in `dist/` | Build output | Present (2.8 MB, unprocessed) |
| JS bundle size | Regression check | 452 KB — no inlining, no bloat |

## What Was NOT Changed

- No image compression, distortion, or format conversion
- No new dependencies
- No packaging pipeline changes (existing `build-spfx-package` already copies all `dist/` files)
- No regression to full-width section behavior
- Runtime CSS loading behavior preserved

## Remaining Phase 04 Prompts

- **P04-03**: Add SharePoint-configurable background override via property pane
- **P04-04**: Clean rebuild and SharePoint proof
