# P03-01 Forensic Audit Note — Runtime CSS Audit

**Prompt:** `Prompt-01-Forensic-Runtime-CSS-Audit.md`
**Date:** 2026-04-06
**Version:** 1.0.0.74

## Source Truth

The rebuilt hero source defines:

| Property | Source Value |
|----------|-------------|
| Surface background | `hsl(220 12% 11%)` (deep charcoal) |
| Surface min-height | 380px |
| Content max-width | 56% (asymmetric left-anchor) |
| Tagline font-size | 3.5rem, weight 800 |
| Logo height | 18px, opacity 0.55 |
| Greeting prefix opacity | 0.55 |
| Greeting name font-size | 1.625rem |
| Border-radius | 20px |
| Grain texture | SVG fractal noise, 0.032 opacity, overlay blend |

## Source-to-Runtime Mismatch Table

| Layer | Source Intent | Emitted Artifact | Browser Reality | Mismatch Point |
|-------|-------------|-----------------|-----------------|----------------|
| CSS module | `signature-hero.module.css` with `.surface`, `.content`, etc. | Emitted in `spfx-hb-webparts.css` (20.17 KB) | **Never loaded** | CSS file is in `.sppkg` but nobody requests it |
| CSS class names | Hashed module classes (e.g., `_surface_18fbi_24`) | Present in both CSS and JS bundles | Classes exist on DOM elements but have no styling rules | **CSS file not loaded** |
| JS bundle | `hb-webparts-app.js` references CSS module classes | Loaded via `SPComponentLoader.loadScript()` | Loads and renders correct markup | JS is fine |
| CSS asset | `spfx-hb-webparts.css` in ClientSideAssets | Packaged in `.sppkg` | **Never requested by the browser** | No `<link>` or `<style>` tag created |

## Named Failure Seam

### **ShellWebPart.ts does not load CSS** (CRITICAL)

The shell webpart (`ShellWebPart.ts`) loads only the JS bundle via `SPComponentLoader.loadScript()`. There is **no CSS loading call**. The Vite build extracts CSS to a separate `spfx-hb-webparts.css` file, but the JS bundle does not self-inject it — it relies on an external mechanism to load the stylesheet.

The CSS file is:
- Present in source (`apps/hb-webparts/dist/spfx-hb-webparts.css`)
- Copied to shell assets (`tools/spfx-shell/assets/spfx-hb-webparts.css`)
- Packaged in `.sppkg` (`ClientSideAssets/spfx-hb-webparts.css`)
- Declared in the OOXML relationships (`ClientSideAssets.xml.rels`)
- **Never loaded at runtime** — no `<link>` tag is created

### Why SharePoint doesn't auto-load it

SPFx auto-loads CSS that is referenced in the manifest's `loaderConfig.scriptResources` or inlined by webpack's style-loader. The Vite-built CSS file is just a packaged static asset — SharePoint treats it as a blob but does not inject `<link>` tags for arbitrary CSS files in ClientSideAssets.

### Fix applied

Added `SPComponentLoader.loadCss(cssUrl)` call in `ShellWebPart.ts` `onInit()`, before the JS bundle loads. The CSS filename is injected at build time via webpack DefinePlugin (`__APP_CSS_NAME__`), set by the build orchestrator which auto-detects companion CSS files in the domain's dist output.

## Fix Details

### `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- Added `declare const __APP_CSS_NAME__: string;`
- Added CSS loading block after CDN base URL normalization:
  ```typescript
  if (typeof __APP_CSS_NAME__ === 'string' && __APP_CSS_NAME__) {
    SPComponentLoader.loadCss(normalizedBase + __APP_CSS_NAME__);
  }
  ```

### `tools/spfx-shell/gulpfile.js`
- Added `const appCssName = process.env.APP_CSS_NAME || '';`
- Added `__APP_CSS_NAME__: JSON.stringify(appCssName)` to DefinePlugin

### `tools/build-spfx-package.ts`
- Added CSS detection step: scans `SHELL_DIR/assets/` for `.css` files after Vite output copy
- Passes detected CSS filename as `APP_CSS_NAME` in the shell build environment

## Validation

| Check | Result |
|-------|--------|
| `tsc --noEmit` (hb-webparts) | Pass |
| `eslint src/` (hb-webparts) | Pass |
| `vite build` (hb-webparts) | Pass (452.33 KB JS / 20.17 KB CSS) |
| Shell compiles with `__APP_CSS_NAME__` | Pass |
| `loadCss` present in compiled shell output | Confirmed (1 occurrence) |
