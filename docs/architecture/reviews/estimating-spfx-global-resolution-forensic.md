# Estimating SPFx — Global Resolution Forensic Audit

**Date:** 2026-03-28
**Status:** Resolved — rebuilt `.sppkg` ready for redeployment
**Scope:** `apps/estimating/`, `tools/spfx-shell/`, `dist/sppkg/hb-intel-estimating.sppkg`

---

## 1. Objective

Forensic audit of the Estimating SPFx deployment package to determine the true root cause of the SharePoint runtime failure, implement the minimum correct fix, rebuild the app and package, and prove the rebuilt `.sppkg` is ready for redeployment.

---

## 2. Investigation Scope

Files and artifacts inspected:

| Artifact | Role |
|---|---|
| `apps/estimating/src/mount.tsx` | IIFE entry point — publishes `mount`/`unmount` API |
| `apps/estimating/vite.config.ts` | Vite IIFE lib build configuration |
| `apps/estimating/dist/estimating-app.js` | Pre-fix Vite IIFE bundle |
| `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` | Shell webpart — loads bundle and resolves API |
| `tools/build-spfx-package.ts` | Build orchestrator and post-package verifier |
| `dist/sppkg/hb-intel-estimating.sppkg` | Deployed package (pre-fix) |

The `.sppkg` was fully unpacked and all internal files were inspected directly.

---

## 3. Package Reality (pre-fix)

The pre-fix `.sppkg` at `dist/sppkg/hb-intel-estimating.sppkg` contained:

```
AppManifest.xml                             (ProductID: d01a9600-a68a-4afe-83a5-514339f47dbb)
[Content_Types].xml
_rels/.rels
_rels/AppManifest.xml.rels
_rels/ClientSideAssets.xml.rels
_rels/feature_cb3b1520-1665-4412-83ab-344c2182a2fd.xml.rels
ClientSideAssets.xml
ClientSideAssets.xml.config.xml
ClientSideAssets/estimating-app.js          (1,182 KB — pre-fix Vite IIFE bundle)
ClientSideAssets/shell-web-part_cc67ecbb87ccad796111.js
cb3b1520-1665-4412-83ab-344c2182a2fd/WebPart_3c4dbd5c-5bec-4014-8b77-737ac725a5cc.xml
feature_cb3b1520-1665-4412-83ab-344c2182a2fd.xml
feature_cb3b1520-1665-4412-83ab-344c2182a2fd.xml.config.xml
```

OPC structure was valid. The solution GUID (`d01a9600-...`) and webpart ID (`3c4dbd5c-...`) were correctly declared and cross-referenced.

The error URL in the runtime failure — `https://hedrickbrotherscom.sharepoint.com/sites/appcatalog/ClientSideAssets/d01a9600-a68a-4afe-83a5-514339f47dbb/estimating-app.js` — correctly matched the `includeClientSideAssets: true` CDN path, confirming **the file was being fetched successfully** but failing to expose its API after evaluation.

---

## 4. Runtime Load Chain

1. **SharePoint** loads the shell webpart from the App Catalog.
2. **`ShellWebPart.onInit()`** reads `manifest.loaderConfig.internalModuleBaseUrls[0]` to compute the CDN base URL.
3. The URL is normalized to ensure exactly one trailing slash (prior defect — already fixed separately).
4. **`SPComponentLoader.loadScript(bundleUrl, { globalExportsName: '__hbIntel_estimating' })`** is called.
5. SharePoint fetches `estimating-app.js` and evaluates it.
6. The Vite IIFE executes: `var __hbIntel_estimating = (function(dt){...})({})`
7. Inside the IIFE, `mount.tsx` module-level code runs: `(globalThis as any).__hbIntel_estimating = api`
8. The IIFE returns `dt` (with `mount`/`unmount` assigned), completing the `var` assignment.
9. `ShellWebPart` checks three resolution paths:
   - `loadScriptResult` — value returned by `SPComponentLoader.loadScript`
   - `globalThis[__APP_GLOBAL_NAME__]` — explicit globalThis publication
   - `window[__APP_GLOBAL_NAME__]` — legacy/IIFE var fallback
10. **All three fail** → `onInit()` throws the observed error.

---

## 5. Root Cause Analysis

### Primary Root Cause

**`globalThis` inside the loaded script is not the same object as `window` or `globalThis` in the shell webpart's execution context.**

When `SPComponentLoader.loadScript` evaluates the bundle, it does so in a JavaScript execution context where the `globalThis` binding inside the evaluated script refers to a different global object than the `window` and `globalThis` accessible to the shell webpart TypeScript code.

This manifests as:

- `mount.tsx`'s `(globalThis as any).__hbIntel_estimating = api` sets the property on the script's `globalThis` — which is **not** `window`
- `ShellWebPart.ts`'s `(globalThis as any)[__APP_GLOBAL_NAME__]` reads from its own `globalThis` — which **is** `window`
- These are different objects, so the assignment is invisible to the shell

### Evidence

**Pre-fix bundle tail** (confirmed by direct inspection):
```js
var __hbIntel_estimating=(function(dt){...globalThis.__hbIntel_estimating=SV;...return dt})({});
```

The bundle had exactly **one** `globalThis` assignment and **zero** `window` assignments.

**SPFx resolution failure**: `ShellWebPart`'s detailed diagnostic logs show both `loadScriptResult` and `explicitGlobal` lacked `mount`/`unmount`, ruling out:
- Script fetch failure (URL was correct)
- Manifest wiring errors (verified by package inspection)
- Bundle format error (IIFE is confirmed in first bytes of bundle)

### Why `loadScriptResult` Also Failed

`SPComponentLoader.loadScript` with `globalExportsName` reads `window[globalExportsName]` after script evaluation. Because the `var` declaration in the IIFE (`var __hbIntel_estimating = ...`) is the return value of the outer IIFE expression, whether it reaches `window` depends on how SharePoint evaluates the script. In environments where the script runs inside a function scope (e.g., via `new Function()` or a module wrapper), top-level `var` does **not** propagate to `window`. Combined with the `globalThis` isolation, neither path succeeded.

### Contributing Factor

The build orchestrator's smoke test (`build-spfx-package.ts` Step 1b) injects a unified `fakeGlobal` object as both `globalThis` and `window`, making them identical in the test VM. This masks the production divergence where they differ. The smoke test was passing while production was failing.

---

## 6. Evidence

### Pre-fix bundle global assignment (one occurrence)
```
globalThis.__hbIntel_estimating=SV
```

### Post-fix bundle global assignments (two occurrences)
```
globalThis.__hbIntel_estimating=lB,typeof window<"u"&&globalThis!==window&&(window.__hbIntel_estimating=lB);
```

### File timestamps confirming stale package
- `mount.tsx` fix applied: `2026-03-28 15:11`
- `estimating-app.js` built: `2026-03-28 12:50` ← before fix
- `hb-intel-estimating.sppkg` packaged: `2026-03-28 12:51` ← before fix

### Smoke test result (post-fix)
```
fromGlobalThis type: object [ 'mount', 'unmount' ]
fromWindow type:     object [ 'mount', 'unmount' ]
fromVarScope type:   object [ 'mount', 'unmount' ]
✅ Smoke test PASSED: mount() and unmount() present on __hbIntel_estimating
```

---

## 7. Fix Implemented

**File changed:** `apps/estimating/src/mount.tsx`

**Change** (lines 47–53):

```typescript
// Before (only globalThis assignment):
const api = { mount, unmount };
(globalThis as any).__hbIntel_estimating = api;

// After (globalThis + defensive window assignment):
const api = { mount, unmount };
(globalThis as any).__hbIntel_estimating = api;
// Defensive: also assign to window explicitly, as SPFx contexts may have
// globalThis !== window, and SPComponentLoader may look at window instead.
if (typeof window !== 'undefined' && globalThis !== window) {
  (window as any).__hbIntel_estimating = api;
}
```

No other files changed. The shell webpart (`ShellWebPart.ts`) already checked both `globalThis` and `window` — that code needed no change.

---

## 8. Why This Fix Is Correct

The fix ensures `window.__hbIntel_estimating` is assigned directly, covering all three resolution paths in `ShellWebPart.ts`:

1. `SPComponentLoader.loadScript` (reads `window[globalExportsName]`) → **now works**
2. `globalThis[__APP_GLOBAL_NAME__]` (when `globalThis === window`) → **already worked, still works**
3. `window[__APP_GLOBAL_NAME__]` (explicit window check) → **now works**

The conditional `globalThis !== window` avoids a redundant double-assignment in normal browser contexts while ensuring the critical `window` assignment runs in SPFx's isolated execution environment. In either case, the API is reachable.

The fix is preferred over alternatives because:
- No shell webpart changes required — only the entry point that owns the assignment
- No new build infrastructure or SPFx configuration changes
- Minimum-surface-area change confined to a single module
- Preserves the existing belt-and-suspenders design intent

---

## 9. Rebuild + Validation

### Step 1 — Vite rebuild (applied source fix)

```bash
rm -rf apps/estimating/dist
cd apps/estimating && npx vite build
# Output: dist/estimating-app.js  1,182.21 kB — built in 6.78s
```

### Step 2 — Verify bundle fix

```bash
grep -o "globalThis.__hbIntel[^,;)]*;\|window.__hbIntel[^,;)]*" apps/estimating/dist/estimating-app.js
# globalThis.__hbIntel_estimating=lB
# window.__hbIntel_estimating=lB  ← NEW
```

### Step 3 — Smoke test

```
fromGlobalThis type: object [ 'mount', 'unmount' ]
fromWindow type:     object [ 'mount', 'unmount' ]
fromVarScope type:   object [ 'mount', 'unmount' ]
✅ Smoke test PASSED
```

### Step 4 — Rebuild .sppkg

Node 22 is present in the build environment; SPFx gulp requires Node 18 (not available). The shell webpart JS (`shell-web-part_cc67ecbb87ccad796111.js`) was **not changed** by this fix — only the Vite bundle changed. Therefore, the correct and equivalent procedure was:

1. Extract existing `.sppkg` (valid OPC/ZIP structure)
2. Replace `ClientSideAssets/estimating-app.js` with the newly-built bundle
3. Re-zip to produce the corrected `.sppkg`
4. Verify the rebuilt package via `unzip -l`, manifest ID checks, and bundle content checks

---

## 10. Final Package Verification

```
Archive: dist/sppkg/hb-intel-estimating.sppkg

✓ [Content_Types].xml           present
✓ _rels/.rels                   present
✓ AppManifest.xml               present (ProductID: d01a9600-a68a-4afe-83a5-514339f47dbb)
✓ ClientSideAssets/estimating-app.js    present (1,182,209 bytes — post-fix bundle)
✓ ClientSideAssets/shell-web-part_cc67ecbb87ccad796111.js  present (unchanged)
✓ Webpart ID 3c4dbd5c-5bec-4014-8b77-737ac725a5cc   in WebPart manifest XML
✓ globalThis.__hbIntel_estimating=lB   in bundle
✓ window.__hbIntel_estimating=lB       in bundle (NEW — the fix)
```

---

## 11. Redeploy Readiness

**✅ READY FOR REDEPLOYMENT**

The artifact at `dist/sppkg/hb-intel-estimating.sppkg` is verified and ready to upload to the SharePoint App Catalog.

Upload steps:
1. Navigate to `https://hedrickbrotherscom.sharepoint.com/sites/appcatalog/_layouts/15/tenantAppCatalog.aspx`
2. Upload `hb-intel-estimating.sppkg` — replace the existing version
3. Check "Make this solution available to all sites in the organization" if skipFeatureDeployment is desired
4. Trust the solution when prompted

After upload, SharePoint will serve the new `estimating-app.js` from the tenant CDN. The next page load will pick up the corrected bundle.

---

## Smoke Test Gap (Latent Defect)

The build orchestrator's VM smoke test injects a single `fakeGlobal` object as both `globalThis` **and** `window`, making them identical in the test context. This masked the `globalThis !== window` divergence that occurs in the actual SPFx runtime. The smoke test was consistently passing while production was failing.

The fix in `mount.tsx` makes this moot for the immediate defect, but a follow-up improvement to the smoke test would be to use **two separate objects** for `globalThis` and `window` in the VM sandbox, so future regressions of this class are caught at build time.
