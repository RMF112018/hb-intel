# SPFx Baseline — Wave 1

**Purpose:** Document the SPFx dependency baseline, build/release expectations, and constraints for Wave 1.
**Date:** 2026-03-15

---

## 1. Dependency Baseline

| Dependency | Version | Notes |
|-----------|---------|-------|
| SharePoint Framework | ^1.20.0 | `@microsoft/sp-core-library`, `sp-property-pane`, `sp-webpart-base` |
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

**No required upgrades for Wave 1.** SP SDK ^1.20.0 is current. All dependencies are aligned across the 11 SPFx apps.

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
