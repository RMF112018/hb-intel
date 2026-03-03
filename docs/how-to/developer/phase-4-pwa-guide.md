# Phase 4: PWA Developer Guide

## Overview

The PWA (`apps/pwa/`) is the primary user-facing application — a Vite-based Progressive Web App with TanStack Router, MSAL auth infrastructure, and all 14 workspace routes.

## Running the PWA

```bash
# Start PWA dev server (mock mode, port 4000)
pnpm turbo run dev --filter=@hbc/pwa

# Build for production
pnpm turbo run build

# Preview production build locally
cd apps/pwa && pnpm preview
```

**Dev server URL:** http://localhost:4000

## Auth Mode Switching

The PWA supports dual-mode authentication controlled by `HBC_AUTH_MODE`:

| Mode | When | Behavior |
|------|------|----------|
| `mock` | `vite dev` (development) | Synchronous bootstrap, no Azure AD needed |
| `msal` | `vite build` (production) | Async MSAL init, Azure AD redirect flow |

### Override for Interim Deployments

To deploy to Vercel with mock auth:
```bash
VITE_MSAL_CLIENT_ID="" HBC_AUTH_MODE=mock pnpm build
```

### MSAL Configuration (Production)

Set these environment variables:
```
VITE_MSAL_CLIENT_ID=<your-azure-ad-client-id>
VITE_MSAL_AUTHORITY=https://login.microsoftonline.com/<tenant-id>
VITE_MSAL_REDIRECT_URI=https://your-domain.com
VITE_MSAL_SCOPES=User.Read
```

## Adding a New Workspace

1. **Add the workspace ID** to `WorkspaceId` union in `packages/shell/src/types.ts`
2. **Create the page component** in `apps/pwa/src/pages/MyWorkspacePage.tsx`
3. **Add a route** in `apps/pwa/src/router/workspace-routes.ts`:
   ```ts
   export const myWorkspaceRoute = createWorkspaceRoute(
     'my-workspace',
     () => import('../pages/MyWorkspacePage.js').then((m) => ({ default: m.MyWorkspacePage })),
   );
   ```
4. **Add to `allRoutes` array** in the same file
5. **Optionally add metadata** in `workspace-config.ts` (tool-picker items, sidebar items)

## Project Structure

```
apps/pwa/
├── index.html              # SPA entry
├── package.json            # Dependencies + scripts
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite + PWA plugin config
└── src/
    ├── main.tsx            # Dual-mode entry point
    ├── App.tsx             # Provider hierarchy
    ├── bootstrap.ts        # Mock environment seeding
    ├── pwa.css             # Global styles + shell layout
    ├── env.d.ts            # Vite env type declarations
    ├── auth/
    │   ├── msal-config.ts  # MSAL configuration
    │   ├── msal-init.ts    # MSAL initialization flow
    │   └── MsalGuard.tsx   # MsalProvider + auth template
    ├── router/
    │   ├── index.ts        # Router factory + type registration
    │   ├── root-route.tsx  # Root route with ShellLayout
    │   ├── workspace-routes.ts  # 14 workspace routes + index redirect
    │   ├── route-guards.ts      # Imperative auth/permission guards
    │   └── workspace-config.ts  # Static workspace metadata
    ├── components/
    │   ├── WorkspacePageShell.tsx  # Shared page wrapper
    │   ├── LoadingFallback.tsx     # Route loading state
    │   └── ErrorFallback.tsx       # Route error state
    └── pages/
        ├── ProjectHubPage.tsx      # MVP
        ├── AccountingPage.tsx      # MVP
        ├── EstimatingPage.tsx      # MVP
        ├── LeadershipPage.tsx      # MVP
        ├── BusinessDevelopmentPage.tsx  # MVP
        ├── SchedulingPage.tsx      # Placeholder
        ├── BuyoutPage.tsx          # Placeholder
        ├── CompliancePage.tsx      # Placeholder
        ├── ContractsPage.tsx       # Placeholder
        ├── RiskPage.tsx            # Placeholder
        ├── ScorecardPage.tsx       # Placeholder
        ├── PmpPage.tsx             # Placeholder
        ├── AdminPage.tsx           # Placeholder
        ├── SiteControlPage.tsx     # Placeholder
        └── NotFoundPage.tsx        # 404 catch-all
```

## Key Patterns

### Provider Hierarchy
```
FluentProvider (hbcLightTheme)
  └─ MsalProvider (conditional: only when authMode === 'msal')
       └─ QueryClientProvider
            └─ HbcErrorBoundary
                 └─ RouterProvider
                      └─ ShellLayout (root route, mode='full')
                           └─ <Outlet /> (lazy-loaded pages)
```

### Route Guards (Imperative Zustand)
TanStack Router `beforeLoad` runs outside React. Guards use Zustand `.getState()`:
```ts
beforeLoad: () => {
  const user = useAuthStore.getState().currentUser;
  if (!user) throw redirect({ to: '/' });
}
```

### Shell-Router Integration
Shell callbacks wire to `router.navigate()` per ADR-0003 (shell decoupled from router).
