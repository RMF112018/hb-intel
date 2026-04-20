# PH7-BW-2 — SPFx Auth Bridge: bootstrapSpfxAuth() + SharePoint Context Adapter

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md §2b (dual-mode auth locked)
**Date:** 2026-03-07
**Priority:** HIGH — Feature routes cannot enforce RBAC in SharePoint without this
**Depends on:** BW-1 (WebPart entry point must exist to call this)
**Blocks:** BW-7 (RBAC mapping builds on top of this)

---

## Summary

The Blueprint locks dual-mode authentication: PWA uses MSAL, SPFx webparts use **native SharePoint context** (`this.context.pageContext.user`). This task implements the bridge between SharePoint's `WebPartContext` (available only in `BaseClientSideWebPart.onInit()`) and the `useAuthStore` / `usePermissionStore` Zustand stores that the rest of the application reads.

Currently, `packages/auth/src/spfx/` exists as a directory but `bootstrapSpfxAuth()` is either a stub or unimplemented. This task completes the implementation.

---

## Why It Matters

- SharePoint's `this.context.pageContext.user` contains the authenticated user's email, display name, and UPN
- SharePoint's `this.context.spHttpClient` is needed for PnPjs-based data access (the SPFx adapter path)
- SharePoint's `this.context.aadTokenProviderFactory` provides access tokens for Azure AD calls without MSAL
- None of this is available outside `BaseClientSideWebPart` — it must be captured in `onInit()` and stored for the application to use
- Without this bridge, all RBAC guards (`FeatureGate`, `PermissionGate`, `RoleGate`) will fail or silently pass because `useAuthStore` will have no user

---

## Architecture: What bootstrapSpfxAuth() Must Do

```
SharePoint Page
  └── BaseClientSideWebPart.onInit()
        └── bootstrapSpfxAuth(this.context)
              ├── 1. Extract user identity from pageContext
              ├── 2. Resolve SP group membership (async)
              ├── 3. Map groups → permission keys (via SpfxRbacAdapter — BW-7)
              ├── 4. Call useAuthStore.getState().setUser(currentUser)
              ├── 5. Call usePermissionStore.getState().setPermissions(permissionKeys)
              ├── 6. Store raw WebPartContext for PnPjs adapter access
              └── 7. Mark auth as 'spfx' mode in authStore
```

---

## Files to Create / Modify

### New: `packages/auth/src/spfx/SpfxContextAdapter.ts`

```typescript
/**
 * SpfxContextAdapter
 * Bridges the SPFx WebPartContext to HB Intel's auth stores.
 * Called once during WebPart.onInit() — never called in PWA mode.
 */
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { useAuthStore, usePermissionStore } from '../stores/index.js';
import type { ICurrentUser } from '@hbc/models';

/** Module-level singleton — accessed by PnPjs adapters after bootstrap */
let _spfxContext: WebPartContext | null = null;

/**
 * Returns the stored WebPartContext for use by data-access adapters.
 * Throws if called before bootstrapSpfxAuth().
 */
export function getSpfxContext(): WebPartContext {
  if (!_spfxContext) {
    throw new Error(
      'getSpfxContext() called before bootstrapSpfxAuth(). ' +
      'Ensure bootstrapSpfxAuth() is awaited in WebPart.onInit().'
    );
  }
  return _spfxContext;
}

/**
 * Main entry point called by every BaseClientSideWebPart.onInit().
 * Populates useAuthStore and usePermissionStore from SharePoint page context.
 *
 * @param context - The WebPartContext from this.context inside the webpart class
 * @param permissionKeys - Resolved permission keys (from SpfxRbacAdapter in BW-7).
 *   Pass empty array initially; BW-7 wires the full resolution.
 */
export async function bootstrapSpfxAuth(
  context: WebPartContext,
  permissionKeys: string[] = []
): Promise<void> {
  // 1. Store context singleton for PnPjs adapters
  _spfxContext = context;

  // 2. Build ICurrentUser from SharePoint page context
  const { user, site } = context.pageContext;
  const currentUser: ICurrentUser = {
    id: user.loginName,
    displayName: user.displayName,
    email: user.email,
    roles: [], // Populated by SpfxRbacAdapter in BW-7
  };

  // 3. Mark auth mode as 'spfx' and set user
  const authStore = useAuthStore.getState();
  authStore.beginBootstrap('spfx');
  authStore.setUser(currentUser);

  // 4. Set permissions (empty until BW-7 wires the RBAC resolution)
  usePermissionStore.getState().setPermissions(permissionKeys);

  // 5. Set feature flags (conservative defaults for SPFx — BW-7 refines these)
  usePermissionStore.getState().setFeatureFlags({
    'buyout-schedule': true,
    'risk-matrix': true,
  });

  // 6. Mark bootstrap complete
  authStore.completeBootstrap();
}
```

### New: `packages/auth/src/spfx/index.ts`

```typescript
export { bootstrapSpfxAuth, getSpfxContext } from './SpfxContextAdapter.js';
```

### Modify: `packages/auth/src/index.ts`

Ensure the spfx subpath is re-exported or document the subpath import:

```typescript
// packages/auth/src/index.ts — add spfx re-export
// NOTE: spfx is available via subpath import '@hbc/auth/spfx' (see package.json exports)
// Do NOT re-export here — would pull sp-webpart-base into PWA bundle
```

### Modify: `packages/auth/package.json`

Add the `exports` field to expose the `spfx` subpath without contaminating the main bundle:

```json
{
  "name": "@hbc/auth",
  "exports": {
    ".": {
      "import": "./src/index.ts",
      "default": "./src/index.ts"
    },
    "./spfx": {
      "import": "./src/spfx/index.ts",
      "default": "./src/spfx/index.ts"
    }
  }
}
```

**Critical:** The `./spfx` subpath import must be used in webpart apps only. The main `@hbc/auth` import must never pull in `@microsoft/sp-webpart-base` (it's a SharePoint-only dependency with no PWA equivalent).

---

## AuthStore Compatibility Check

The `bootstrapSpfxAuth()` implementation calls:
- `useAuthStore.getState().beginBootstrap('spfx')` — must accept `'spfx'` as an `AuthMode`
- `useAuthStore.getState().setUser(currentUser)` — existing API
- `useAuthStore.getState().completeBootstrap()` — must exist or equivalent finalizer

Verify `packages/auth/src/stores/authStore.ts` supports `beginBootstrap('spfx')`. If `AuthMode` only includes `'mock' | 'msal'`, add `'spfx'`:

```typescript
// packages/auth/src/stores/authStore.ts
export type AuthMode = 'mock' | 'msal' | 'spfx';
```

---

## Webpart Entry Point Update

Each `[Domain]WebPart.ts` created in BW-1 passes `this.context` directly. No changes to the webpart class are needed beyond what BW-1 already specifies:

```typescript
// Already in BW-1 template:
public async onInit(): Promise<void> {
  await super.onInit();
  await bootstrapSpfxAuth(this.context);
}
```

BW-7 (RBAC Mapping) extends this call to pass resolved permission keys:

```typescript
// After BW-7:
public async onInit(): Promise<void> {
  await super.onInit();
  const permissionKeys = await resolveSpfxPermissions(this.context);
  await bootstrapSpfxAuth(this.context, permissionKeys);
}
```

---

## Data Access Adapter Integration

The `getSpfxContext()` export is used by the SharePoint adapter in `@hbc/data-access` to initialize PnPjs:

```typescript
// packages/data-access/src/adapters/sharepoint/SharePointAdapter.ts
import { getSpfxContext } from '@hbc/auth/spfx';
import { spfi, SPFx } from '@pnp/sp';

function createSpClient() {
  const context = getSpfxContext();
  return spfi().using(SPFx(context));
}
```

This wiring must be verified or added to the SharePoint adapter during this task.

---

## resolveAuthMode() Integration

The existing `resolveAuthMode()` in `@hbc/auth` must return `'spfx'` when the app is loaded inside a SharePoint webpart context. Currently it likely only distinguishes `'mock'` vs `'msal'`.

Update `packages/auth/src/adapters/resolveAuthMode.ts`:

```typescript
export function resolveAuthMode(): AuthMode {
  // SPFx detection: window._spPageContextInfo is injected by SharePoint
  if (typeof window !== 'undefined' && (window as Window & { _spPageContextInfo?: unknown })._spPageContextInfo) {
    return 'spfx';
  }
  if (import.meta.env.VITE_AUTH_MODE === 'mock' || import.meta.env.DEV) {
    return 'mock';
  }
  return 'msal';
}
```

This allows `main.tsx` to correctly identify the runtime context, even though `main.tsx` is never the entry point in SPFx production — it is relevant for local dev testing via Vite against a real SharePoint dev tenant.

---

## Verification

```bash
# TypeScript check — ensure @hbc/auth/spfx subpath resolves
pnpm tsc --noEmit -p packages/auth/tsconfig.json

# Verify subpath import works in accounting app
node -e "import('@hbc/auth/spfx').then(m => console.log(Object.keys(m)))"

# Check AuthMode includes 'spfx'
grep -r "AuthMode" packages/auth/src/stores/authStore.ts
```

---

## Definition of Done

- [x] `packages/auth/src/spfx/SpfxContextAdapter.ts` created with `bootstrapSpfxAuth()` and `getSpfxContext()`
- [x] `packages/auth/src/spfx/index.ts` created with named exports
- [x] `packages/auth/package.json` exports field includes `./spfx` subpath
- [x] `AuthMode` type includes `'spfx'` — already existed as `LegacyAuthMode`
- [x] `resolveAuthMode()` detects `window._spPageContextInfo` for SPFx context — already existed via `hasSpfxRuntimeContext()`
- [ ] SharePoint data-access adapter uses `getSpfxContext()` for PnPjs initialization — deferred to data-access wiring task
- [x] No `@microsoft/sp-webpart-base` imports in main `@hbc/auth` entry point
- [x] TypeScript compiles without errors
- [x] `bootstrapSpfxAuth()` correctly populates `useAuthStore` and `usePermissionStore`

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 7-BW-2 completed: 2026-03-08
Implementation approach: Dual export strategy — renamed existing spfx/index.ts to spfx/hostBridge.ts
  (lightweight, no sp-webpart-base dependency) and created new SpfxContextAdapter.ts with WebPartContext-based
  bootstrapSpfxAuth(). New spfx/index.ts re-exports from SpfxContextAdapter only, serving as @hbc/auth/spfx
  subpath entry point. Root index.ts imports from hostBridge.ts — preserves backward compatibility.
Files changed:
  - packages/auth/src/spfx/hostBridge.ts (renamed from index.ts — git mv)
  - packages/auth/src/spfx/SpfxContextAdapter.ts (NEW)
  - packages/auth/src/spfx/index.ts (NEW — subpath entry)
  - packages/auth/src/spfx/hostBridge.test.ts (renamed from index.test.ts — git mv)
  - packages/auth/src/index.ts (updated import paths)
  - packages/auth/package.json (added ./spfx export + @microsoft/sp-webpart-base devDep)
Build verified: 24/24 green
Next: BW-3 (SPFx Config/Manifests)
-->
