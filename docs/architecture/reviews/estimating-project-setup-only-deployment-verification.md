# Estimating Project Setup-Only Deployment Verification

> **Date**: 2026-03-30
> **Scope**: Verify Bids/Templates are hidden and blocked; Project Setup is the only active surface

---

## 1. Verification Summary

**PROJECT SETUP ONLY POSTURE VERIFIED**

All navigation surfaces show only Project Setup. Bids and Templates routes are not registered in the router. Direct access to `/` redirects to `/project-setup`. No visible CTAs or links reference Bids or Templates. The app lands on Project Setup on initial load.

---

## 2. UI Surfaces Checked

| Surface | Bids Visible? | Templates Visible? | Project Setup Visible? |
|---------|--------------|-------------------|----------------------|
| `toolPickerItems` (root-route.tsx:19-21) | No | No | Yes — single entry |
| Tool-picker nav buttons (root-route.tsx:31-38) | No | No | Yes — "Project Setup" only |
| `ShellLayout` simplified config | No | No | Yes |
| Empty states / CTAs in all pages | No references | No references | Correctly scoped |
| ProvisioningChecklist step labels | N/A | "Upload Project Templates" is a saga step label, not a navigation link | N/A |

---

## 3. Routes Checked

| Route | Registered? | Behavior |
|-------|-------------|----------|
| `/project-setup` | Yes | Renders `ProjectSetupPage` |
| `/project-setup/new` | Yes | Renders `NewRequestPage` (wizard) |
| `/project-setup/$requestId` | Yes | Renders `RequestDetailPage` |
| `/` | Yes (redirect only) | `beforeLoad` throws `redirect({ to: '/project-setup' })` |
| `/templates` | **No** | Not in `webpartRoutes` — TanStack Router not-found |
| `/bids` (never existed) | **No** | N/A — BidsPage was at `/` which now redirects |

### Route Registration Evidence

`routes.ts:49-54`:
```typescript
export const webpartRoutes = [
  indexRoute,          // / → redirect to /project-setup
  projectSetupRoute,   // /project-setup
  newProjectSetupRequestRoute, // /project-setup/new
  requestDetailRoute,  // /project-setup/$requestId
];
```

No `templatesRoute` or `bidsRoute` in the array.

---

## 4. Final Behavior for Hidden Pages

| Page | Access Attempt | Result |
|------|---------------|--------|
| Bids | Navigate to `/` | Redirects to `/project-setup` (redirect in `beforeLoad`) |
| Templates | Navigate to `/templates` | Not matched — TanStack Router default not-found |
| Templates | Click "Templates" tab | Tab does not exist — removed from `toolPickerItems` |

### Initial App Load

`router/index.ts:8`: `createMemoryHistory({ initialEntries: ['/project-setup'] })`

The app initializes directly at `/project-setup`. No intermediate redirect.

---

## 5. Re-Enable Instructions

To restore Bids and Templates in a future deployment:

### Step 1: Add routes back to `routes.ts`

```typescript
import { BidsPage } from '../pages/BidsPage.js';
import { TemplatesPage } from '../pages/TemplatesPage.js';

const bidsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: lazyRouteComponent(() => import('../pages/BidsPage.js').then((m) => ({ default: m.BidsPage }))),
});

const templatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/templates',
  component: lazyRouteComponent(() => import('../pages/TemplatesPage.js').then((m) => ({ default: m.TemplatesPage }))),
});

export const webpartRoutes = [
  bidsRoute,             // ← add back
  templatesRoute,        // ← add back
  projectSetupRoute,
  newProjectSetupRequestRoute,
  requestDetailRoute,
];
```

### Step 2: Add tabs back to `root-route.tsx`

```typescript
toolPickerItems: [
  { label: 'Bids', path: '/' },           // ← add back
  { label: 'Templates', path: '/templates' }, // ← add back
  { label: 'Project Setup', path: '/project-setup' },
],
```

### Step 3: Restore default landing (optional)

In `router/index.ts`, change initial entry back to `/`:
```typescript
history: createMemoryHistory({ initialEntries: ['/'] })
```

### Step 4: Remove the index redirect

In `routes.ts`, change the index route's `beforeLoad` to set workspace without redirecting.

---

## 6. Restriction Mechanism

| Mechanism | Type | Location |
|-----------|------|----------|
| Route non-registration | Route allowlist (by omission) | `routes.ts:49-54` — only 4 routes in `webpartRoutes` |
| Navigation hiding | Config-driven array | `root-route.tsx:19-21` — `toolPickerItems` has 1 entry |
| Default landing | Memory history init | `router/index.ts:8` — starts at `/project-setup` |
| Redirect safety net | Route-level redirect | `routes.ts:23` — `throw redirect({ to: '/project-setup' })` |

This is NOT a feature flag — it is a direct route-wiring restriction. The page code (`BidsPage.tsx`, `TemplatesPage.tsx`) is preserved in `pages/` for reversibility.

---

## 7. Test Results

| Check | Result |
|-------|--------|
| `pnpm --filter @hbc/spfx-estimating test` | 9 files, 68 passed, 2 todo |
| `pnpm --filter @hbc/spfx-estimating build` | Clean — 1,140 KB IIFE |
| Router test: starts at /project-setup | Pass |
| Router test: Project Setup routes registered | Pass |
| Router test: /templates NOT registered | Pass |
| Grep: no visible Bids/Templates CTAs | Confirmed — only code comments and preserved page files |

---

## 8. Manual SharePoint Validation Needed

- [ ] Deploy updated `.sppkg` to App Catalog
- [ ] Verify only "Project Setup" tab visible in the tool-picker navigation bar
- [ ] Verify initial page load shows the Project Setup request list
- [ ] Verify browser back/forward does not expose Bids or Templates
- [ ] Verify no console errors related to missing routes
