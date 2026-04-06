# P03-04 Closure Report — Clean Rebuild and Deployment Proof

**Prompt:** `Prompt-04-Clean-Rebuild-And-Deployment-Proof.md`
**Date:** 2026-04-06
**Version:** 1.0.0.77

## Build Posture

Clean rebuild from scratch:
1. Removed `apps/hb-webparts/dist/`
2. Removed `dist/sppkg/hb-webparts.sppkg` and shim proof
3. Removed `tools/spfx-shell/sharepoint/`
4. `tsc --noEmit` → Pass
5. `eslint src/` → Pass
6. `vite build` → Pass (452.33 KB JS / 20.17 KB CSS)
7. `validate-manifests.ts` → All hb-webparts checks pass
8. `build-spfx-package.ts --domain hb-webparts` → Success

## A. Emitted Asset Proof

| Asset | Size | Status |
|-------|------|--------|
| `spfx-hb-webparts.css` | 20,167 bytes | Emitted, packaged in ClientSideAssets |
| `hb-webparts-app-4b4196ab.js` | 452,329 bytes | Emitted, content-hashed |
| `loadCss` in compiled shell | 1 occurrence | Shell loads CSS via `SPComponentLoader.loadCss()` |
| `28acd6a7` in packaged bundle | 1 occurrence | Signature Hero registered in WEBPART_RENDERERS |
| Hero CSS markers (surface, tagline, grain, lockup, greeting) | All present | CSS module rules emitted |
| `hiddenFromToolbox` in packaged XMLs | 10 of 10 | All non-hero webparts hidden |
| `.sppkg` | 213,167 bytes (208 KB) | Ready for upload |

## B. What Changed in the CSS/Runtime Seam (Phase 03 Summary)

### Root Cause (P03-01)
`ShellWebPart.ts` loaded only the JS bundle via `SPComponentLoader.loadScript()`. The companion CSS file (`spfx-hb-webparts.css`) was packaged in the `.sppkg` but never loaded at runtime — no `<link>` tag was created.

### Fix Applied (P03-01)
1. **ShellWebPart.ts**: Added `SPComponentLoader.loadCss(normalizedBase + __APP_CSS_NAME__)` in `onInit()`, before JS bundle load
2. **gulpfile.js**: Added `__APP_CSS_NAME__` to webpack DefinePlugin
3. **build-spfx-package.ts**: Added CSS auto-detection — scans `assets/` for `.css` files and passes filename as `APP_CSS_NAME`

### Validation Added (P03-02)
4. **validate-manifests.ts**: Added CSS emission proof — verifies emitted CSS contains expected hero class markers and meets minimum size threshold

### Runtime Proof (P03-03)
5. All 13 hero CSS module class hashes (module `18fbi`) have identical selectors in both CSS and JS bundles — zero mismatch
6. Host-style conflict analysis: all low risk, no `!important` overrides needed

## C. Stale Outputs Removed

- `apps/hb-webparts/dist/` — stale Vite output
- `dist/sppkg/hb-webparts.sppkg` — prior package without CSS loading
- `dist/sppkg/hb-webparts-shim-proof.json` — prior shim proof
- `tools/spfx-shell/sharepoint/` — prior package-solution output

## D. Checks Passed

| Check | Result |
|-------|--------|
| TypeScript type-check | Pass |
| ESLint | Pass |
| Vite build | Pass |
| CSS emission (markers + size) | Pass |
| Bundle registry (28acd6a7) | Pass |
| mount.tsx import + renderer | Pass |
| Manifest validation (source) | Pass |
| Orchestrator CSS detection | Pass |
| Shell loadCss compilation | Pass |
| supportsFullBleed preserved | Pass |
| hiddenFromToolbox (10/10) | Pass |
| .sppkg structure | Pass |

## E. CSS Load Path (Complete)

```
1. Vite build → dist/spfx-hb-webparts.css (20 KB)
2. Orchestrator → copies to tools/spfx-shell/assets/
3. Orchestrator → detects CSS, sets APP_CSS_NAME=spfx-hb-webparts.css
4. Gulp webpack → DefinePlugin injects __APP_CSS_NAME__="spfx-hb-webparts.css"
5. Package-solution → CSS included in .sppkg ClientSideAssets
6. SharePoint CDN → serves CSS from tenant CDN
7. ShellWebPart.onInit() → SPComponentLoader.loadCss(cdnBase + "spfx-hb-webparts.css")
8. Browser → <link rel="stylesheet"> injected → hero CSS applied
```

## F. Package Readiness

**Status: Ready for upload and normal hero iteration.**

The CSS/runtime seam is now fully repaired. The package is ready for:
- App Catalog upload
- Post-upload runtime verification per P03-03 checklist
- Normal hero visual iteration without further seam repairs

## G. Post-Upload Verification

After uploading `hb-webparts.sppkg`:

1. **Force refresh** (`Ctrl+Shift+R` or incognito window)
2. **DevTools → Console**: Confirm `[HB-Intel ShellWebPart] cssUrl: https://{cdn}/spfx-hb-webparts.css`
3. **DevTools → Network**: Confirm `spfx-hb-webparts.css` returns 200
4. **DevTools → Elements**: Confirm hero `<section>` has `_surface_18fbi_24` class
5. **DevTools → Computed**: Confirm `background-color: rgb(24, 27, 32)`, `min-height: 380px`
6. **Visual**: Dark charcoal surface, "Build with GRIT." dominant, greeting subordinate, asymmetric layout
7. **Toolbox**: Only "HB Signature Hero" visible in HB Intel group
8. **If stale**: Retract old package from App Catalog, re-upload, re-deploy
