# ADR-0007: SPFx Vite-First Build Strategy

**Status:** Accepted
**Date:** 2026-03-03
**Context:** Phase 5 — 11 SPFx Webpart Apps (Blueprint §1, §2a, §2b, §2c)

## Decision

### Vite-First, SPFx-Wrapping Deferred

Each SPFx webpart is built as a standalone Vite application during development. The native SPFx gulp/webpack/.sppkg wrapping is deferred to a future phase. This avoids:
- TypeScript version conflicts between SPFx toolchain (TS 4.x) and monorepo (TS 5.x)
- Duplicate bundler configurations (webpack + Vite)
- Heavy `@microsoft/sp-*` dependencies during rapid development

### WorkspaceId Expansion (14 → 19)

Five SPFx-only workspace IDs were added: `safety`, `quality-control-warranty`, `risk-management`, `operational-excellence`, `human-resources`. These are not present in the PWA's navigation but exist in the shared `WorkspaceId` union for type-safe routing across all apps.

### Memory-Based TanStack Router

SPFx webparts use `createMemoryHistory` instead of browser history. In SharePoint, the host page owns the URL bar — embedded webparts must not manipulate `window.location`. Memory routing enables:
- Sub-page navigation within a webpart (e.g., `/` → `/budgets` → `/invoices`)
- Type-safe route definitions identical to the PWA pattern
- No URL side-effects that would conflict with SharePoint page navigation

### ShellLayout mode='simplified'

All webparts render `ShellLayout mode='simplified'`, which omits ProjectPicker, BackToProjectHub, and AppLauncher from the render tree. The simplified header shows only the workspace title and tool-picker items.

### Dual-Mode Auth (SPFx vs Mock)

Each webpart's `main.tsx` checks `resolveAuthMode()`:
- **mock** (development): `bootstrapMockEnvironment()` seeds Zustand stores with demo data
- **spfx** (production): `bootstrapSpfxAuth(pageContext)` extracts user identity and permissions from SharePoint's `pageContext`

The `ISpfxPageContext` interface in `@hbc/auth` is a lightweight mirror of SPFx's page context — it avoids importing `@microsoft/sp-*` types into shared packages.

### Port Assignments

Each webpart gets a unique dev server port to allow parallel development:

| App | Port |
|-----|------|
| PWA | 4000 |
| project-hub | 4001 |
| accounting | 4002 |
| estimating | 4003 |
| leadership | 4004 |
| business-development | 4005 |
| admin | 4006 |
| safety | 4007 |
| quality-control-warranty | 4008 |
| risk-management | 4009 |
| operational-excellence | 4010 |
| human-resources | 4011 |

### WorkspacePageShell in @hbc/ui-kit

The `WorkspacePageShell` component (page-level wrapper with title, description, and content area) was moved from `apps/pwa/src/components/` to `packages/ui-kit/` so both the PWA and all 11 webparts can reuse it without duplication.

## Consequences

- 11 webpart apps can be developed and tested independently with `pnpm turbo run dev --filter=@hbc/spfx-{name}`
- No SPFx toolchain dependency until deployment wrapping phase
- Memory router prevents URL conflicts when webparts are embedded in SharePoint pages
- `@hbc/shell` remains router-agnostic (same component renders in PWA and SPFx contexts)
- All 19 workspace builds pass in the Turborepo pipeline (6 packages + 13 apps)
- SPFx `.sppkg` packaging will be added as a thin deployment layer in a future phase
