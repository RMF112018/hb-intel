# Phase 3: Dev Harness — Developer Guide

**Phase:** 3 | **Blueprint:** §1 (monorepo: apps/dev-harness) | **ADR:** 0005

## Overview

The dev-harness is a Vite SPA that integrates all six @hbc shared packages with mock data. It provides a tabbed preview of the PWA, 11 SPFx webparts, and HB Site Control. This is a dev-only tool — never deployed to production.

## Quick Start

```bash
# Start the dev server (port 3000)
pnpm turbo run dev --filter=@hbc/dev-harness

# Or from the app directory
cd apps/dev-harness && pnpm dev
```

Open http://localhost:3000 in your browser.

## Tab Navigation

The harness has 13 tabs:

| Tab | Shell Mode | Description |
|-----|-----------|-------------|
| PWA (Full Shell) | full | Complete ShellLayout with HeaderBar, ProjectPicker, AppLauncher |
| Project Hub | simplified | SPFx webpart simulation |
| Accounting | simplified | SPFx webpart simulation |
| Estimating | simplified | SPFx webpart simulation |
| Business Development | simplified | SPFx webpart simulation |
| Safety | simplified | SPFx webpart simulation |
| Quality Control | simplified | SPFx webpart simulation |
| Risk Management | simplified | SPFx webpart simulation |
| Leadership | simplified | SPFx webpart simulation |
| Operational Excellence | simplified | SPFx webpart simulation |
| Human Resources | simplified | SPFx webpart simulation |
| Admin | simplified | SPFx webpart simulation |
| HB Site Control | simplified | Mobile viewport (428px max-width) |

## Dev Controls

A floating panel in the bottom-right corner provides:

- **Theme toggle**: Switch between HB Intel light and dark themes
- **User/Project info**: Shows current mock user and active project
- **Feature flags**: Toggle individual feature flags on/off
- **Reset Mock Data**: Re-runs the bootstrap to reset all stores

## How HMR Works

The `vite.config.ts` aliases each `@hbc/*` import to the package's `src/` directory:

```ts
resolve: {
  alias: {
    '@hbc/models': path.resolve(__dirname, '../../packages/models/src'),
    // ... same for all 6 packages
  },
}
```

This means editing any file in `packages/*/src/` triggers instant hot module replacement in the browser without rebuilding package `dist/` directories.

## Mock Environment

The mock environment is bootstrapped synchronously before React renders:

1. **Auth store**: Admin user with `*:*` wildcard permissions
2. **Project store**: 3 mock projects (Harbor View, Riverside, Downtown Transit)
3. **Nav store**: Default workspace set to `project-hub`
4. **Feature flags**: `buyout-schedule` and `risk-matrix` enabled by default

The adapter mode is forced via Vite's `define` option:
```ts
define: {
  'process.env.HBC_ADAPTER_MODE': '"mock"',
  'process.env.HBC_AUTH_MODE': '"mock"',
}
```

## Demo Components

Different workspaces show different demo components:

- **DemoDataGrid**: Uses `useLeads()` hook → HbcDataTable + HbcCommandBar
- **DemoCharts**: Schedule progress (line) + Budget breakdown (pie) via HbcChart
- **DemoForms**: HbcTextField + HbcSelect + HbcCheckbox + HbcFormLayout

## Building

```bash
# Full monorepo build (includes dev-harness type-check + Vite build)
pnpm turbo run build

# Preview production build
cd apps/dev-harness && pnpm preview
```

## File Structure

```
apps/dev-harness/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    ├── main.tsx           # Entry: bootstrap → render
    ├── App.tsx            # Provider hierarchy
    ├── bootstrap.ts       # Zustand store seeding
    ├── harness.css        # Layout styles
    ├── TabRouter.tsx      # 13-tab navigation
    ├── DevControls.tsx    # Floating dev panel
    ├── tabs/
    │   ├── PwaPreview.tsx
    │   ├── WebpartPreview.tsx
    │   └── SiteControlPreview.tsx
    └── pages/
        ├── WorkspacePlaceholder.tsx
        ├── DemoDataGrid.tsx
        ├── DemoCharts.tsx
        └── DemoForms.tsx
```
