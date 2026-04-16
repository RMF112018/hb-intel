# SPFx Baseline — Wave 1

**Purpose:** Document the SPFx dependency baseline, build/release expectations, and constraints for Wave 1.
**Date:** 2026-03-15

---

## 1. Dependency Baseline

### 1a. SPFx is governed as a two-baseline split

The repo intentionally maintains **two distinct SPFx baselines** with
different scopes. They do not interact at runtime and are preflighted
at every packaging run by `tools/build-spfx-package.ts`.

| Baseline | Scope | Packages | Declared version | Install location |
|----------|-------|----------|------------------|------------------|
| **Shell toolchain baseline** | `tools/spfx-shell` (the SPFx gulp packaging project) | `@microsoft/sp-application-base`, `sp-build-web`, `sp-core-library`, `sp-loader`, `sp-module-interfaces`, `sp-property-pane`, `sp-webpart-base` | **`1.18.0` exact** | Own `node_modules/` under `tools/spfx-shell/`, installed via `npm` under Node 18.20.8 (excluded from the root pnpm workspace — see `pnpm-workspace.yaml` line `!tools/spfx-shell`) |
| **App-layer types baseline** | `apps/hb-publisher`, `apps/hb-webparts` (and any future SPFx-targeted app) | `@microsoft/sp-property-pane`, `@microsoft/sp-webpart-base` | **`^1.20.0`** | Root pnpm workspace (resolved to 1.22.2 at time of writing) |

#### Why the split is intentional

1. **Shell is SPFx's own toolchain.** `sp-build-web@1.18.0` is the gulp
   harness that produces the `.sppkg`; the bundled webpack runtime that
   ends up inside the package links against the shell's pinned
   `sp-webpart-base@1.18.0`. Upgrading this baseline means revalidating
   the entire packaging pipeline against a newer SPFx gulp/webpack stack
   and is an ADR-worthy decision, not a drive-by dependency bump.
2. **App-layer SPFx deps are type-only.** `apps/**/src/mount.tsx` imports
   nothing more than `type { WebPartContext } from '@microsoft/sp-webpart-base'`.
   Every app's `vite.config.ts` externalizes `@microsoft/*`
   (`rollupOptions.external`), so no app-layer SPFx version ever enters
   the packaged bytes. These declarations exist to give the TypeScript
   compiler and IDE the current SDK type surface, matching what a
   modern SharePoint tenant exposes to the bundle at runtime.
3. **Runtime isolation.** The SharePoint host resolves `@microsoft/*`
   against whatever the tenant is running; the shell's `1.18.0` bundle
   + the tenant's modern runtime negotiate compatibility via SPFx's own
   loader contract. The app-layer types baseline is not part of that
   negotiation because nothing from it ships.

#### Changing either baseline

- Raising the **shell baseline** requires: (a) an ADR explaining the
  reason, (b) revalidating `gulp bundle --ship` and `gulp package-solution --ship`
  on the new SPFx toolchain under Node 18 (or whatever Node the new
  SPFx version requires), (c) confirming the packaged
  `ComponentManifest.loaderConfig.scriptResources` still maps correctly
  to the shell-entry assets, (d) rerunning the Publisher hosted-load
  proof (`dist/sppkg/hb-publisher-hosted-load-proof.json`).
- Raising the **app-layer baseline** requires: (a) verifying the
  newer `@microsoft/sp-webpart-base` types still compile against the
  app mount entries with `tsc --noEmit`, (b) confirming the Vite
  external list still covers every `@microsoft/*` import path, (c)
  rerunning the package-truth proof.

### 1b. Other Wave 1 shared dependencies

| Dependency | Version | Notes |
|-----------|---------|-------|
| React | ^18.3.1 | Shared across all surfaces |
| React DOM | ^18.3.1 | |
| Vite | ^6.0.0 | Build tool for all apps |
| `@vitejs/plugin-react` | ^4.4.0 | React fast refresh |
| TanStack Query | ^5.75.0 | Server state management |
| TanStack Router | ^1.120.0 | Routing (SPFx apps use memory history in dev-harness) |
| Fluent UI v9 | ^9.56.0 | UI framework consumed via `@hbc/ui-kit` |
| Griffel | ^1.5.0 | CSS-in-JS (via `@hbc/ui-kit`) |
| Zustand | ^5.0.0 | Client state stores |
| TypeScript | ^5.7.0 | |

---

## 2. Build and Release Expectations

| Aspect | Value |
|--------|-------|
| Build command | `tsc --noEmit && vite build` |
| Lint command | `eslint src/ --ext .ts,.tsx` |
| Test command | `vitest run` |
| Output directory | `dist/` |
| Chunk splitting | Vendor chunks: `vendor-react`, `vendor-tanstack`, `vendor-fluent`, `vendor-zustand` |
| Dev server | HTTPS (`https: true, strictPort: true, cors: true`) |
| Auth mode (dev) | `HBC_AUTH_MODE='mock'` |
| Auth mode (prod) | `HBC_AUTH_MODE='spfx'` |
| Adapter mode (dev) | `HBC_ADAPTER_MODE='mock'` |
| Adapter mode (prod) | `HBC_ADAPTER_MODE='proxy'` |

### Port Assignments

| App | Port |
|-----|------|
| Accounting | 4001 |
| Estimating | 4002 |
| Project Hub | 4003 |
| Leadership | 4004 |
| Business Development | 4005 |
| Admin | 4006 |
| Safety | 4007 |
| Quality Control & Warranty | 4008 |
| Risk Management | 4009 |
| Operational Excellence | 4010 |
| Human Resources | 4011 |

Dev harness: port 3000. PWA: port 4000. HB Site Control: port 4012.

---

## 3. SPFx-Specific Constraints

| Constraint | Reason | Enforcement |
|-----------|--------|-------------|
| No direct `@fluentui/*` imports in app code | All UI through `@hbc/ui-kit` | ESLint rule (`@hb-intel/hbc` plugin) |
| No app-local design-system components | Reusable visual UI in `@hbc/ui-kit` only | Code review + no-go rule |
| Inline CSS only for connectivity components | Griffel not safe in SPFx iframe context | `HbcConnectivityBar` and `HbcSyncStatusBadge` use inline styles |
| No Service Worker API | Unavailable in SPFx iframe | `@hbc/session-state` falls back to polling sync (30s interval) |
| `@dnd-kit/core` not proven in SPFx | Drag-drop behavior in iframe context unverified | `@hbc/project-canvas` restricted for SPFx use until verified |
| All `@microsoft/*` externalized in build | Provided by SharePoint host runtime | Vite `rollupOptions.external` |
| Single entry point per webpart | SPFx loader requirement | Vite `rollupOptions.input` |

---

## 4. SPFx Authentication Model

- SPFx apps use `@hbc/auth/spfx` entry point
- `SpfxAdapter` normalizes SharePoint host identity into the shared `NormalizedAuthSession` contract
- Permission evaluation uses the same `usePermissionStore` as PWA
- `AadHttpClient` provides token acquisition for API calls in SPFx context
- Dev harness uses `MockAdapter` with `PersonaRegistry` persona selection

---

## Related Documents

- [Wave 1 Surface Readiness Rubric](./wave-1-surface-readiness-rubric.md)
- [PWA Shell Baseline](./pwa-shell-baseline.md)
- [Package Relationship Map](../../architecture/blueprint/package-relationship-map.md)
