# Estimating SPFx URL and Asset Declaration Fix — Closeout Report

**Date:** 2026-03-28
**Scope:** Fix malformed runtime asset URL and undeclared asset packaging seam for the Estimating SPFx web part.

## 1. Original Issue

After deploying `hb-intel-estimating.sppkg` to the SharePoint App Catalog, the web part failed at runtime with a RequireJS script-load error. SharePoint attempted to load:

```
https://hedrickbrotherscom.sharepoint.com/sites/appcatalog/ClientSideAssets/d01a9600-a68a-4afe-83a5-514339f47dbbestimating-app.js
```

The correct URL shape is:

```
https://hedrickbrotherscom.sharepoint.com/sites/appcatalog/ClientSideAssets/d01a9600-a68a-4afe-83a5-514339f47dbb/estimating-app.js
```

## 2. Confirmed Root Causes

### Root Cause 1: Malformed URL join (Prompt 01)

`ShellWebPart.ts` line 43 used plain string concatenation:

```ts
const bundleUrl = baseUrl + __APP_BUNDLE_NAME__;
```

SharePoint returns `internalModuleBaseUrls[0]` without a trailing slash. The concatenation produced `...47dbbestimating-app.js` — the solution GUID merged directly into the filename.

### Root Cause 2: Undeclared asset in .sppkg (Prompt 02)

`estimating-app.js` was injected into the `.sppkg` via post-hoc `zip -r` after `gulp package-solution` had already created the archive. This meant:

- The file was structurally present in the ZIP under `ClientSideAssets/`
- But it was NOT declared in the OPC metadata:
  - `_rels/ClientSideAssets.xml.rels` — no relationship entry for `estimating-app.js`
  - The file was invisible to SharePoint's CDN publishing pipeline

## 3. Changes Made

### Prompt 01 — URL normalization

**File:** `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`

```ts
// Before (broken):
const bundleUrl = baseUrl + __APP_BUNDLE_NAME__;

// After (fixed):
const normalizedBase = rawBaseUrl.endsWith('/') ? rawBaseUrl : rawBaseUrl + '/';
const bundleUrl = normalizedBase + __APP_BUNDLE_NAME__;
```

Added `console.debug` diagnostics logging the raw base URL and final bundle URL.

### Prompt 02 — Asset declaration via CopyWebpackPlugin

**File:** `tools/spfx-shell/gulpfile.js`

Added `CopyWebpackPlugin` to copy the Vite bundle from `assets/` into the webpack output during `gulp bundle --ship`. This makes `gulp package-solution` discover it as a first-class "client-side build resource" and include it through the authoritative OPC asset flow.

**File:** `tools/build-spfx-package.ts`

Removed the post-hoc `zip -r` injection step. The Vite bundle is now included naturally by `gulp package-solution`.

## 4. Rebuilt Package Result

**Path:** `dist/sppkg/hb-intel-estimating.sppkg`
**Size:** 319.1 KB (compressed)

### Package contents (16 files):

| File | Size |
|------|------|
| `AppManifest.xml` | 939 B |
| `[Content_Types].xml` | 961 B |
| `_rels/.rels` | 288 B |
| `_rels/AppManifest.xml.rels` | 484 B |
| `_rels/ClientSideAssets.xml.rels` | **662 B** |
| `_rels/feature_cb3b1520-....xml.rels` | 560 B |
| `feature_cb3b1520-....xml` | 287 B |
| `feature_cb3b1520-....xml.config.xml` | 189 B |
| `ClientSideAssets.xml` | 312 B |
| `ClientSideAssets.xml.config.xml` | 189 B |
| `WebPart_3c4dbd5c-....xml` | 1,828 B |
| **`ClientSideAssets/estimating-app.js`** | **1,126,373 B** |
| `ClientSideAssets/shell-web-part_a9daed90ab26d250e7fc.js` | 2,092 B |

### OPC relationship proof

`_rels/ClientSideAssets.xml.rels` now declares **both** assets:

```xml
<Relationship Type="...clientsideasset" Target="/ClientSideAssets/estimating-app.js" Id="r4"/>
<Relationship Type="...clientsideasset" Target="/ClientSideAssets/shell-web-part_a9daed90ab26d250e7fc.js" Id="r5"/>
```

### Runtime manifest proof

The embedded `ComponentManifest` confirms:

- `"componentType": "WebPart"` — web-part-only ✓
- `"supportedHosts": ["SharePointWebPart", "TeamsPersonalApp"]` — no `SharePointFullPage` ✓
- `"loaderConfig.internalModuleBaseUrls": ["HTTPS://SPCLIENTSIDEASSETLIBRARY/"]` — placeholder for CDN rewrite ✓
- `"loaderConfig.entryModuleId": "shell-web-part"` ✓
- `"preconfiguredEntries[0].title.default": "HB Intel Estimating"` ✓

### Shell runtime chain

1. SharePoint loads `shell-web-part_a9daed90ab26d250e7fc.js` via `loaderConfig.scriptResources`
2. `ShellWebPart.onInit()` reads `manifest.loaderConfig.internalModuleBaseUrls[0]`
3. Normalizes: adds trailing `/` if absent → `.../{solution-guid}/`
4. Builds URL: `normalizedBase + 'estimating-app.js'` → `.../{solution-guid}/estimating-app.js`
5. Calls `SPComponentLoader.loadScript(bundleUrl, { globalExportsName: '__hbIntel_estimating' })`
6. `render()` calls `window.__hbIntel_estimating.mount(domElement, context)`

The chain is internally consistent. The malformed URL can no longer occur.

## 5. Deployment Readiness

**Status: Ready for upload.**

The package is structurally correct, the URL join is fixed, the asset is formally declared, and the host model is web-part-only. The next step is a fresh upload to the SharePoint App Catalog.

## 6. Remaining Caveats

- The shell loads `estimating-app.js` via `SPComponentLoader.loadScript()` — a dynamic script load at runtime. If a SharePoint tenant has an unusually restrictive Content Security Policy, this could be blocked. Standard SharePoint CSP allows script execution from the client-side asset CDN.
- The `console.debug` diagnostics in `ShellWebPart.ts` are non-noisy in production (only visible with DevTools verbose logging) but can be removed in a future cleanup pass if desired.
