# Estimating SPFx Module Handoff Fix — Closeout Report

**Date:** 2026-03-28
**Version:** 0.1.8
**Scope:** Make the shell-to-app module resolution deterministic so the Estimating web part loads instead of falling back to "App bundle failed to load."

## 1. Objective

Correct the remaining Estimating SPFx shell-to-app handoff defect by establishing an explicit global contract between the Vite-built IIFE app bundle and the SPFx shell web part, and gating the package build on a pre-package runtime smoke test.

## 2. Root Cause

The Vite IIFE format wraps exports as `var __hbIntel_estimating = (function(dt){ ... return dt })({});`. Whether `SPComponentLoader.loadScript()` can resolve this assignment depends on the SharePoint runtime's global-reading implementation, which varies by tenant, CDN configuration, and module-loader version.

The prior fix (v0.1.7) addressed the `signalR` externalization blocker and added a `loadScript` return-value capture with window-global fallback. However, the handoff remained fragile because:
1. The IIFE `var` declaration may not propagate to `window` in all host contexts (strict mode, AMD wrappers, module-scoped evaluation)
2. There was no explicit `globalThis` publication from the app bundle
3. There was no pre-package validation that the built bundle actually exposes the expected API

## 3. Changes Made

### `apps/estimating/src/mount.tsx`

Added an explicit global publication after the function definitions:

```ts
const api = { mount, unmount };
(globalThis as any).__hbIntel_estimating = api;
```

This ensures the API is always reachable via `globalThis.__hbIntel_estimating` regardless of how the IIFE wrapper assigns the return value.

### `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`

Rewrote the module resolution in `onInit()` with a three-tier resolution chain:

1. `SPComponentLoader.loadScript<IAppModule>()` return value (primary)
2. `(globalThis as any)[__APP_GLOBAL_NAME__]` (explicit publication fallback)
3. `(window as any)[__APP_GLOBAL_NAME__]` (legacy IIFE var fallback)

Added a hard-fail with `throw new Error(...)` and structured `console.error` diagnostics if the resolved module lacks `mount` or `unmount`. The silent fallback that previously rendered a static error div without logging has been replaced with an exception that surfaces the failure mode immediately in DevTools and SharePoint error telemetry.

### `tools/build-spfx-package.ts`

Added a pre-package runtime smoke test (Step 1b) that evaluates the built IIFE in a Node.js VM with a browser-like sandbox and asserts:
- `globalThis.__hbIntel_{domain}` exists after evaluation
- `.mount` is a function
- `.unmount` is a function

The smoke test runs after the IIFE format check and before the SPFx gulp build. If it fails, the domain's packaging is aborted.

Also added `import { Script, createContext } from 'node:vm'` and moved `globalName` computation earlier in the loop to support the smoke test.

### `apps/estimating/package.json`

Version bump: 0.1.7 → 0.1.8.

## 4. Proof from Built Artifacts

### App bundle (`estimating-app.js`)

- Contains `globalThis.__hbIntel_estimating=SV` (explicit publication, minified)
- IIFE closes with `dt.mount=sB,dt.unmount=aB,...,dt})({})` (no external dependencies)
- Size: 1,182,136 bytes (1,182 KB)

### Shell bundle (`shell-web-part_cc67ecbb87ccad796111.js`)

Contains all key tokens in the minified output:
- `loadScript` — uses SPComponentLoader resolution
- `globalThis` — reads explicit global publication
- `__hbIntel_estimating` — domain-specific global name
- `did not resolve` — the throw message for hard-fail path

### .sppkg (`hb-intel-estimating.sppkg`)

- Size: 333.3 KB
- `ClientSideAssets/estimating-app.js` (1,182,136 B)
- `ClientSideAssets/shell-web-part_cc67ecbb87ccad796111.js` (2,987 B)
- OPC structure verified (Content_Types, rels, AppManifest, features, webpart)

### Runtime smoke test

```
✓ Runtime smoke test passed: __hbIntel_estimating.mount() and .unmount() present
```

## 5. Verification

- **TypeScript:** `tsc --noEmit` passes (part of build script)
- **Vite build:** IIFE bundle with globalThis publication, no external signalR
- **SPFx gulp build:** Shell compiles with updated resolution logic, no TS errors
- **Runtime smoke test:** mount/unmount contract proven in Node VM before packaging
- **Tests:** 55 passed, 2 todo, 0 failures
- **Lint:** 0 errors (44 pre-existing warnings)

## 6. Deployment Readiness

**Status: Ready for upload.**

The shell-to-app handoff is now deterministic with three resolution tiers, the app bundle explicitly publishes to `globalThis`, and a pre-package smoke test gates every future build. The package is ready for redeployment to the SharePoint App Catalog.

## 7. Residual Risks

- **First real tenant validation:** The fix addresses all known failure modes for module resolution. The remaining risk is an unknown SharePoint-specific behavior that cannot be reproduced locally. The diagnostic logging and hard-fail error will surface the exact failure state if this occurs.
- **Cross-domain applicability:** The smoke test and globalThis publication pattern should be applied to other domain apps as they are packaged. The shell changes already apply to all domains since `ShellWebPart.ts` is shared.
