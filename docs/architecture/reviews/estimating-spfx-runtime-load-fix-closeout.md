# Estimating SPFx Runtime Load Fix — Closeout Report

**Date:** 2026-03-28
**Version:** 0.1.7
**Scope:** Fix runtime failure where the Estimating SPFx web part displays "App bundle failed to load." after deployment.

## 1. Original Issue

After deploying the structurally correct `hb-intel-estimating.sppkg` (v0.1.6) to the SharePoint App Catalog, the web part loaded the shell successfully but rendered the fallback error message:

```
App bundle failed to load.
```

The shell web part was executing, but `_appModule` was `undefined` by the time `render()` ran — meaning the Estimating IIFE bundle either failed to execute or failed to expose the expected `mount`/`unmount` contract.

## 2. Confirmed Root Causes

### Root Cause 1 (Critical blocker): `@microsoft/signalr` externalized by broad regex

`apps/estimating/vite.config.ts` used a broad regex for externals:

```ts
external: [/^@microsoft\//, /^@msinternal\//]
```

This matched `@microsoft/signalr`, which is **not** provided by the SPFx runtime — it is a standalone npm package used by `@hbc/provisioning` → `useProvisioningSignalR.ts`.

The resulting IIFE bundle closed with:

```js
})({},signalR);
```

Since no `signalR` global exists on the SharePoint page, this threw `ReferenceError: signalR is not defined` before the IIFE could assign to `window.__hbIntel_estimating`. The module was never created.

### Root Cause 2 (Resilience gap): `loadScript()` return value discarded

`ShellWebPart.ts` discarded the resolved return value from `SPComponentLoader.loadScript()` and relied exclusively on `window[__APP_GLOBAL_NAME__]`:

```ts
await SPComponentLoader.loadScript(bundleUrl, { globalExportsName: __APP_GLOBAL_NAME__ });
this._appModule = (window as any)[__APP_GLOBAL_NAME__] as IAppModule | undefined;
```

No diagnostic logging existed for the failure path, making it impossible to determine from the browser console whether the bundle failed to load, failed to execute, or failed to expose the expected interface.

## 3. Changes Made

### Fix 1 — Explicit externals list (`apps/estimating/vite.config.ts`)

Replaced the broad `/^@microsoft\//` regex with an explicit list of the four packages actually provided by the SPFx runtime:

```ts
external: [
  '@microsoft/sp-webpart-base',
  '@microsoft/sp-property-pane',
  '@microsoft/sp-core-library',
  '@microsoft/sp-loader',
  /^@msinternal\//,
],
```

Removed the `'@microsoft/signalr': 'signalR'` entry from the IIFE globals map.

`@microsoft/signalr` (~56 KB minified) is now bundled into the IIFE, making the bundle self-sufficient for SharePoint runtime loading.

### Fix 2 — Module capture and diagnostics (`tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`)

Updated `onInit()` to use the `loadScript()` return value as the primary module source with the window global as fallback:

```ts
const scriptResult = await SPComponentLoader.loadScript(bundleUrl, {
  globalExportsName: __APP_GLOBAL_NAME__,
}) as IAppModule | undefined;
const windowModule = (window as any)[__APP_GLOBAL_NAME__] as IAppModule | undefined;
this._appModule = scriptResult || windowModule;
```

Added `console.debug` diagnostics after load (type and keys of both sources) and `console.error` diagnostics to the `render()` fallback path logging: `bundleName`, `globalName`, `moduleExists`, `hasMountFn`, `hasUnmountFn`, and `windowGlobalExists`.

### Fix 3 — Version bump (`apps/estimating/package.json`)

Bumped from `0.1.6` → `0.1.7`.

## 4. Rebuilt Package Result

**Path:** `dist/sppkg/hb-intel-estimating.sppkg`
**Size:** 333.2 KB (compressed, up from 319.1 KB due to inlined signalR)

### Key assets in package:

| File | Size |
|------|------|
| `ClientSideAssets/estimating-app.js` | 1,181,966 B |
| `ClientSideAssets/shell-web-part_01ec68b4596d1a592a42.js` | 2,803 B |

### IIFE bundle proof

Before (broken):
```js
})({},signalR);
```

After (fixed):
```js
})({});
```

The bundle now takes only the exports object as a parameter — no external runtime globals required.

### Shell bundle proof

The compiled shell bundle now contains:
```js
const r = await i.SPComponentLoader.loadScript(a, { globalExportsName: "__hbIntel_estimating" });
const o = window.__hbIntel_estimating;
this._appModule = r || o;
```

The `loadScript()` return value is captured and used as the primary module source.

### Export contract proof

The IIFE bundle properly exports:
```js
return dt.mount=xV, dt.unmount=wV, Object.defineProperty(dt, Symbol.toStringTag, {value:"Module"}), dt
```

Both `mount` and `unmount` are assigned to the module object.

## 5. Verification

- **TypeScript:** `tsc --noEmit` passes (part of the `build` script)
- **Vite build:** Produces valid IIFE bundle without external signalR reference
- **SPFx gulp build:** Compiles shell with updated logic, no TypeScript errors
- **Package build:** `build-spfx-package.ts --domain estimating` succeeds with all structure checks passing
- **Tests:** 55 passed, 2 todo, 0 failures
- **Lint:** 27 pre-existing errors (all in unrelated files: `ProvisioningChecklist.tsx`, `FailureDetailCard.tsx`, `BidsPage.tsx`), 0 new errors from this change

## 6. Deployment Readiness

**Status: Ready for upload.**

The package is structurally correct, the IIFE bundle is self-sufficient, the shell captures the module from `loadScript()`, and diagnostic logging is in place for any future debugging. The next step is a fresh upload to the SharePoint App Catalog.

## 7. Remaining Notes

- **Bundle size:** The estimating IIFE grew by ~56 KB (1,126 KB → 1,182 KB) from inlining `@microsoft/signalr`. This is acceptable — the dependency is required at runtime and was never provided by the SharePoint page.
- **Cross-domain impact:** The `ShellWebPart.ts` changes apply to all 11 domain web parts since the shell is shared. The changes are safe — they add a fallback path and diagnostics without altering the success path for already-working domains.
- **Other domains:** Any other domain app that uses `@hbc/provisioning` and has the same broad `/^@microsoft\//` external regex should be updated to the explicit list pattern to prevent the same failure. This is a preventive follow-up, not a blocking issue.
