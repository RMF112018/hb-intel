# ADR-0008: HB Site Control Mobile-First Architecture

**Status:** Accepted
**Date:** 2026-03-03
**Context:** Phase 6 — HB Site Control Field App (Blueprint §1, §2a, §2b, §2c, §2i)

## Decision

### Mobile-First Standalone App

`apps/hb-site-control` is a dedicated mobile-first Vite application for field personnel. It replicates Procore Observations and safety/job-site monitoring capabilities with a touch-optimized UI, offline support, and simplified shell.

### Browser History (Not Memory)

Unlike SPFx webparts that use memory history, HB Site Control uses `createBrowserHistory`. As a standalone deployable app (not embedded in SharePoint), the URL bar reflects navigation state — critical for:
- Mobile "back" button functionality
- Deep linking to specific pages (e.g., `/observations`)
- Bookmarking and sharing URLs

### Tri-Mode Auth

Supports all three auth modes via `resolveAuthMode()`:
- **mock** — development (`bootstrapMockEnvironment()` with field worker persona)
- **msal** — standalone mobile web deployment (Azure AD login)
- **spfx** — embedded in SharePoint (if used as a webpart in future)

### PWA with vite-plugin-pwa

Uses `vite-plugin-pwa` with:
- `registerType: 'autoUpdate'` for seamless service worker updates
- Precache strategy for core assets (10 entries)
- `standalone` display mode in web manifest (mobile installable)
- Theme color `#004B87` matching the HB Intel design system

### react-native-web Future-Proofing

Added `react-native-web` as a dependency with Vite alias (`react-native` → `react-native-web`). Current Phase 6 uses standard React + @hbc/ui-kit components. The alias enables gradual migration to React Native primitives in a future phase without build configuration changes.

### SignalR Simulation

`useSignalR` hook provides a mock event stream via `setInterval` in development:
- Generates random safety events every 5 seconds
- Returns `{ events, isConnected, lastEvent, clearEvents }`
- Interface designed for future swap to `@microsoft/signalr` HubConnection in Phase 7
- Max 50 events retained in state to prevent memory growth

### ShellLayout mode='simplified'

Like SPFx webparts, HB Site Control uses `ShellLayout mode='simplified'`, which omits ProjectPicker, BackToProjectHub, and AppLauncher. The mobile-focused shell shows only essential navigation.

### Port Assignment

HB Site Control is assigned port 4012, following the established sequence (PWA: 4000, SPFx webparts: 4001–4011).

### Mobile-First CSS

- Minimum touch target size 48px (WCAG 2.5.5)
- `env(safe-area-inset-*)` for notch device support
- `overscroll-behavior: contain` to prevent bounce
- `prefers-reduced-motion` media query for accessibility
- 16px base padding (reduced from PWA's 24px for mobile density)

## Consequences

- Field personnel get a purpose-built mobile app optimized for on-site use
- Offline capability via service worker ensures usability in low-connectivity areas
- Browser history enables native mobile navigation patterns
- `react-native-web` alias enables future React Native migration path
- SignalR mock interface is production-ready for Phase 7 backend integration
- Full monorepo builds now complete 20 tasks (6 packages + 14 apps)
- Mobile-first CSS patterns established for reuse in future mobile-targeted apps
