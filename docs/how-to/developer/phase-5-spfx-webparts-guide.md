# Phase 5: SPFx Webparts Developer Guide

## Overview

Phase 5 creates 11 SPFx-targeted webpart apps using the Vite-first approach. Each app is a standalone Vite build with `ShellLayout mode='simplified'`, memory-based TanStack Router, and dual-mode auth (mock for dev, SPFx for production).

## Running a Webpart

```bash
# Start a specific webpart dev server
pnpm turbo run dev --filter=@hbc/spfx-project-hub

# Build all webparts
pnpm turbo run build

# Build a specific webpart
pnpm turbo run build --filter=@hbc/spfx-accounting
```

## Port Assignments

| Webpart | Package Name | Port | WorkspaceId |
|---------|-------------|------|-------------|
| project-hub | @hbc/spfx-project-hub | 4001 | project-hub |
| accounting | @hbc/spfx-accounting | 4002 | accounting |
| estimating | @hbc/spfx-estimating | 4003 | estimating |
| leadership | @hbc/spfx-leadership | 4004 | leadership |
| business-development | @hbc/spfx-business-development | 4005 | business-development |
| admin | @hbc/spfx-admin | 4006 | admin |
| safety | @hbc/spfx-safety | 4007 | safety |
| quality-control-warranty | @hbc/spfx-quality-control-warranty | 4008 | quality-control-warranty |
| risk-management | @hbc/spfx-risk-management | 4009 | risk-management |
| operational-excellence | @hbc/spfx-operational-excellence | 4010 | operational-excellence |
| human-resources | @hbc/spfx-human-resources | 4011 | human-resources |

## Auth Mode Switching

Each webpart supports dual-mode authentication controlled by `HBC_AUTH_MODE`:

| Mode | When | Behavior |
|------|------|----------|
| `mock` | `vite dev` (development) | Synchronous bootstrap, demo data seeded |
| `spfx` | `vite build` (production) | Auth from SharePoint `pageContext` |

The mode is resolved by `resolveAuthMode()` from `@hbc/auth`. In dev, `bootstrapMockEnvironment()` seeds all Zustand stores. In production, `bootstrapSpfxAuth(pageContext)` extracts the SharePoint user identity.

## Webpart Structure

Each webpart follows this structure:

```
apps/{webpart-name}/
├── package.json                    # Vite + @hbc/* workspace deps
├── tsconfig.json                   # Extends tsconfig.base.json
├── vite.config.ts                  # React plugin, aliases, port
├── index.html                      # SPA entry
└── src/
    ├── env.d.ts                    # Vite ImportMetaEnv
    ├── main.tsx                    # Dual-mode entry
    ├── App.tsx                     # Provider hierarchy
    ├── bootstrap.ts                # Mock data seeding
    ├── webpart.css                 # Layout styles
    ├── router/
    │   ├── index.ts                # Memory router factory
    │   ├── root-route.tsx          # ShellLayout mode='simplified'
    │   └── routes.ts               # Workspace-scoped routes
    └── pages/
        └── ...                     # 2-4 pages per webpart
```

## Key Differences from PWA

| Aspect | PWA | SPFx Webparts |
|--------|-----|---------------|
| ShellLayout mode | `full` | `simplified` |
| Router history | Browser (`createBrowserHistory`) | Memory (`createMemoryHistory`) |
| Auth mode | `mock` / `msal` | `mock` / `spfx` |
| URL manipulation | Yes (browser URL bar) | No (memory-only) |
| PWA features | Service worker, manifest | None |
| Navigation | All 19 workspaces | Single workspace only |

## Adding a New Page to a Webpart

1. Create the page component in `apps/{webpart-name}/src/pages/MyPage.tsx`:
   ```tsx
   import type { ReactNode } from 'react';
   import { WorkspacePageShell } from '@hbc/ui-kit';

   export function MyPage(): ReactNode {
     return (
       <WorkspacePageShell title="My Page" description="Page description">
         {/* Page content */}
       </WorkspacePageShell>
     );
   }
   ```

2. Add the route in `apps/{webpart-name}/src/router/routes.ts`:
   ```ts
   export const myPageRoute = createRoute({
     getParentRoute: () => rootRoute,
     path: '/my-page',
     component: lazyRouteComponent(
       () => import('../pages/MyPage.js').then((m) => ({ default: m.MyPage })),
     ),
   });
   ```

3. Add the route to `routeTree.addChildren([..., myPageRoute])` in the same file.

4. Optionally update `bootstrap.ts` to add navigation items for the new page.

## Provider Hierarchy

```
FluentProvider (hbcLightTheme)
  └─ QueryClientProvider
       └─ HbcErrorBoundary
            └─ RouterProvider
                 └─ ShellLayout (root route, mode='simplified')
                      └─ <Outlet /> (lazy-loaded pages)
```

## Pages Per Webpart

| Webpart | Pages |
|---------|-------|
| project-hub | DashboardPage, PreconstructionPage, DocumentsPage, TeamPage |
| accounting | OverviewPage, BudgetsPage, InvoicesPage |
| estimating | BidsPage, TemplatesPage, ProjectSetupPage |
| leadership | KpiDashboardPage, PortfolioOverviewPage |
| business-development | PipelinePage, OpportunitiesPage |
| admin | SystemSettingsPage, ErrorLogPage, ProvisioningFailuresPage |
| safety | IncidentsPage, InspectionsPage |
| quality-control-warranty | QualityChecksPage, WarrantyTrackingPage |
| risk-management | RiskRegisterPage, MitigationPage |
| operational-excellence | MetricsPage, ProcessImprovementPage |
| human-resources | StaffingPage, CertificationsPage |
