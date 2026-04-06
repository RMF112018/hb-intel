# P03-02 Implementation Note — Fix CSS Emission and Shell Attachment

**Prompt:** `Prompt-02-Fix-CSS-Emission-And-Shell-Attachment.md`
**Date:** 2026-04-06
**Version:** 1.0.0.75

## Status of P03-01 Fixes

The core CSS loading fix was applied in P03-01:

| Fix | File | Status |
|-----|------|--------|
| `SPComponentLoader.loadCss()` call | `ShellWebPart.ts` | Applied |
| `__APP_CSS_NAME__` DefinePlugin injection | `gulpfile.js` | Applied |
| CSS auto-detection and `APP_CSS_NAME` env var | `build-spfx-package.ts` | Applied |

## What Changed in P03-02

### Build-time CSS emission proof

**File:** `tools/validate-manifests.ts`

Added CSS emission validation section that checks:

1. **Hero CSS class markers present** — Verifies `surface`, `tagline`, `grain`, `lockup`, `greeting` exist in the emitted `spfx-hb-webparts.css`. Catches silent CSS stripping or broken module extraction.
2. **CSS file size sanity** — Fails if CSS is under 1000 bytes (likely incomplete or stripped).

### Version bump

`package-solution.json`: `1.0.0.74` → `1.0.0.75`

## End-to-End Proof

Clean rebuild completed:
1. Removed stale `dist/`, `.sppkg`, and `sharepoint/` output
2. Fresh `vite build` → 452.33 KB JS / 20.17 KB CSS
3. `validate-manifests.ts` → all hb-webparts checks pass (manifest, registry, CSS emission)
4. `build-spfx-package.ts --domain hb-webparts` → success

### Orchestrator confirmed CSS detection
```
✓ Companion CSS detected: spfx-hb-webparts.css
```

### Compiled shell confirmed CSS loading
`loadCss` and `spfx-hb-webparts.css` both present in compiled `shell-web-part_*.js` (1 occurrence).

### CSS Load Path (complete)

```
1. Vite build extracts CSS → apps/hb-webparts/dist/spfx-hb-webparts.css
2. Orchestrator copies to → tools/spfx-shell/assets/spfx-hb-webparts.css
3. Orchestrator detects CSS → sets APP_CSS_NAME=spfx-hb-webparts.css
4. Webpack DefinePlugin → __APP_CSS_NAME__ = "spfx-hb-webparts.css"
5. ShellWebPart.onInit() → SPComponentLoader.loadCss(cdnBase + "spfx-hb-webparts.css")
6. SharePoint injects <link rel="stylesheet"> → hero CSS applied
```

### `.sppkg` proof
- File: `dist/sppkg/hb-webparts.sppkg` (213 KB)
- Contains `ClientSideAssets/spfx-hb-webparts.css` (20 KB)
- Shell entry shims load CSS via `SPComponentLoader.loadCss()`

## Validation

| Check | Result |
|-------|--------|
| `tsc --noEmit` | Pass |
| `eslint src/` | Pass |
| `vite build` | Pass |
| CSS contains hero markers (surface, tagline, grain, lockup, greeting) | Pass |
| CSS size > 1000 bytes | Pass (20,170 bytes) |
| `loadCss` in compiled shell | Confirmed |
| `spfx-hb-webparts.css` in `.sppkg` | Confirmed |
| Orchestrator CSS detection | Confirmed |
