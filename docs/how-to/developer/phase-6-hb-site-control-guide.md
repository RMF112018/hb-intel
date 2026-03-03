# Phase 6: HB Site Control Developer Guide

**Foundation Plan Phase 6 | Blueprint §1, §2a, §2b, §2c, §2i**

## Overview

HB Site Control is a mobile-first Vite application for field personnel. It provides:
- **Observations tracking** — Procore-aligned field observations
- **Safety monitoring** — Real-time safety incident tracking with SignalR simulation
- **Mobile dashboard** — Summary cards with navigation to sub-pages

## Quick Start

```bash
# Start the dev server (port 4012)
pnpm turbo run dev --filter=@hbc/hb-site-control

# Build for production
pnpm turbo run build --filter=@hbc/hb-site-control

# Preview production build
pnpm turbo run preview --filter=@hbc/hb-site-control
```

Open `http://localhost:4012` in Chrome DevTools mobile emulation (iPhone 14, 390×844).

## Auth Modes

HB Site Control supports three authentication modes controlled by `HBC_AUTH_MODE`:

| Mode | When | Behavior |
|------|------|----------|
| `mock` | `vite dev` | Seeds Zustand stores with field worker persona and demo data |
| `msal` | Production standalone | Azure AD login via MSAL (configured in Phase 7) |
| `spfx` | Embedded in SharePoint | Auth from SharePoint page context |

In development, `HBC_AUTH_MODE` defaults to `"mock"`. The mock bootstrap creates:
- A "Field Worker" user with `project:read` and `document:write` permissions
- Two sample projects (Harbor View Medical Center, Riverside Office Complex)
- Feature flags for observations and safety monitoring

## App Structure

```
apps/hb-site-control/
├── package.json                    # @hbc/* workspace deps + react-native-web + vite-plugin-pwa
├── tsconfig.json                   # Extends tsconfig.base.json
├── vite.config.ts                  # React + PWA plugins, RNW alias, port 4012
├── index.html                      # Mobile viewport meta, touch-action
└── src/
    ├── env.d.ts                    # Vite ImportMetaEnv types
    ├── main.tsx                    # Tri-mode entry point
    ├── App.tsx                     # FluentProvider > QueryClientProvider > HbcErrorBoundary > RouterProvider
    ├── bootstrap.ts                # Mock data seeding for development
    ├── app.css                     # Mobile-first global styles
    ├── hooks/
    │   └── useSignalR.ts           # Mock SignalR simulation
    ├── router/
    │   ├── index.ts                # Browser history router factory
    │   ├── root-route.tsx          # ShellLayout mode='simplified'
    │   └── routes.ts               # 3 routes: /, /observations, /safety-monitoring
    └── pages/
        ├── HomePage.tsx            # Mobile dashboard with summary cards
        ├── ObservationsPage.tsx    # Observations list with data table
        └── SafetyMonitoringPage.tsx # Real-time safety monitoring
```

## Adding a New Page

1. Create the page component in `src/pages/NewPage.tsx`:
   ```tsx
   import type { ReactNode } from 'react';
   import { WorkspacePageShell } from '@hbc/ui-kit';

   export function NewPage(): ReactNode {
     return (
       <WorkspacePageShell title="New Page" description="Description here">
         {/* Page content */}
       </WorkspacePageShell>
     );
   }
   ```

2. Add a route in `src/router/routes.ts`:
   ```ts
   const newRoute = createRoute({
     getParentRoute: () => rootRoute,
     path: '/new-page',
     component: lazyRouteComponent(
       () => import('../pages/NewPage.js').then((m) => ({ default: m.NewPage })),
     ),
   });
   ```

3. Add the route to the `appRoutes` array export.

## useSignalR Hook

The `useSignalR` hook provides mock real-time events in development:

```tsx
import { useSignalR } from '../hooks/useSignalR.js';

function MyComponent() {
  const { events, isConnected, lastEvent, clearEvents } = useSignalR(5000);
  // events: SignalREvent[] — most recent first, max 50
  // isConnected: boolean — true after 500ms connection simulation
  // lastEvent: SignalREvent | null — the most recent event
  // clearEvents: () => void — reset event list
}
```

In Phase 7, this hook will be replaced with a real `@microsoft/signalr` HubConnection. The interface is designed to be swappable without page changes.

## Offline Testing

After building for production:

```bash
pnpm turbo run build --filter=@hbc/hb-site-control
pnpm turbo run preview --filter=@hbc/hb-site-control
```

1. Open `http://localhost:4012` in Chrome
2. Open DevTools → Application → Service Workers
3. Verify the service worker is registered and active
4. Go to DevTools → Network → check "Offline"
5. Reload the page — the app should load from the service worker cache

## Mobile-First Design Guidelines

- **Touch targets:** Minimum 48px height/width (enforced in `app.css`)
- **Safe areas:** Padding uses `env(safe-area-inset-*)` for notch devices
- **Content padding:** 16px (reduced from PWA's 24px for mobile density)
- **Scroll behavior:** `overscroll-behavior: contain` prevents bounce
- **Motion:** Respects `prefers-reduced-motion` media query

## Key Differences from PWA

| Aspect | PWA (apps/pwa) | HB Site Control |
|--------|----------------|-----------------|
| Shell mode | `full` | `simplified` |
| Router | Browser history | Browser history |
| Offline | vite-plugin-pwa | vite-plugin-pwa |
| Target | Desktop-first | Mobile-first |
| Pages | 19 workspaces | 3 focused pages |
| RNW | No | Yes (future-proofing) |
| SignalR | No | Yes (mock) |
| Port | 4000 | 4012 |
