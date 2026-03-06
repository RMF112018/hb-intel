# ADR-0006: PWA Standalone Architecture

**Status:** Accepted
**Date:** 2026-03-03
**Context:** Phase 4 — apps/pwa

## Decision

### Vite PWA with TanStack Router Code-Based Routes

The PWA uses Vite as the build tool with `vite-plugin-pwa` for service worker generation and manifest management. Routes are defined in code using TanStack Router (not file-based routing) to allow:
- Type-safe route definitions with `createRoute()`
- Imperative `beforeLoad` guards using Zustand `.getState()` (outside React tree)
- A `createWorkspaceRoute()` factory that standardizes route creation for all 14 workspaces

### Shell-Router Callback Integration

Per ADR-0003, `@hbc/shell` remains decoupled from `@tanstack/react-router`. The root route component renders `ShellLayout` with `<Outlet />` as children and wires shell callbacks to `router.navigate()`:

```tsx
<ShellLayout
  mode="full"
  onWorkspaceSelect={(id) => router.navigate({ to: `/${id}` })}
  onBackToProjectHub={() => router.navigate({ to: '/project-hub' })}
  onProjectSelect={(p) => useProjectStore.getState().setActiveProject(p)}
>
  <Outlet />
</ShellLayout>
```

### MSAL Dual-Mode Authentication

The app supports dual-mode auth (Blueprint §2b):
- **mock mode** (development): Synchronous `bootstrapMockEnvironment()` seeds all Zustand stores before React renders
- **msal mode** (production): Async `initializeMsalAuth()` initializes MSAL, handles redirect promise, attempts silent token

`resolveAuthMode()` auto-detects mode from `process.env.HBC_AUTH_MODE` (defined by Vite at build time).

### Lazy Loading

All 14 workspace pages are lazy-loaded via `lazyRouteComponent()`. The workspace route factory ensures each route:
1. Syncs `navStore.setActiveWorkspace()` in `beforeLoad`
2. Sets tool-picker and sidebar items from static workspace config
3. Lazy-loads the page component

### Project Persistence

`useProjectStore` now uses `zustand/middleware/persist` with localStorage (key: `hbc-project-store`). Only `activeProject` is persisted. Mock bootstrap overwrites persisted value in dev mode.

## Consequences

- PWA can be deployed to Vercel (MVP) or Azure Static Web Apps (migration-ready)
- All workspace pages load on-demand, keeping initial bundle size minimal
- Shell package remains router-agnostic (reusable for SPFx in Phase 5)
- MSAL auth infrastructure is ready but requires Azure AD app registration for production
- Proxy adapters remain stubs until Phase 7 (Azure Functions)
