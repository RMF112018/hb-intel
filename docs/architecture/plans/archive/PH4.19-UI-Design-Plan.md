# Phase 4.19 — UI-Kit App Wiring (Integration Gap Resolution)

**Status:** Complete
**Date:** 2026-03-04
**Reference:** Blueprint §1d (ui-kit), §2c (shell integration)

## Context

Phase 4 (4.3–4.18) built the complete `@hbc/ui-kit` V2.1 design system with 37+ styled components,
but the PWA rendered using the unstyled `ShellLayout` from `@hbc/shell` (plain semantic HTML with
`data-hbc-shell` attributes) instead of `HbcAppShell` from `@hbc/ui-kit` (Griffel styles, dark
header, connectivity bar, Field Mode, bottom nav).

## Root Cause

Two parallel shell systems existed:

| System | Package | Styled? |
|--------|---------|---------|
| `ShellLayout` → `HeaderBar` + `ContextualSidebar` | `@hbc/shell` | No |
| `HbcAppShell` → `HbcHeader` + `HbcSidebar` + `HbcConnectivityBar` + `HbcBottomNav` | `@hbc/ui-kit` | Yes |

The PWA root route, dev-harness PwaPreview, and hb-site-control root route all used `ShellLayout`.

## Data Flow Gap

- `ShellLayout` reads flat `SidebarItem[]` from `useNavStore`
- `HbcAppShell` expects `SidebarNavGroup[]` (grouped/hierarchical) with `icon: ReactNode` + `href: string`
- `HbcAppShell` expects `ShellUser` while auth store provides `ICurrentUser`

## Resolution

1. Created `apps/pwa/src/utils/shell-bridge.ts` with bridge functions:
   - `mapNavStoreToSidebarGroups()` — converts flat `SidebarItem[]` → `SidebarNavGroup[]`
   - `mapCurrentUserToShellUser()` — converts `ICurrentUser` → `ShellUser`
2. Replaced `ShellLayout` with `HbcAppShell` in:
   - `apps/pwa/src/router/root-route.tsx`
   - `apps/dev-harness/src/tabs/PwaPreview.tsx`
   - `apps/hb-site-control/src/router/root-route.tsx`
3. Kept `FluentProvider` in `App.tsx` — nested FluentProviders are fine in Fluent UI v9
4. No changes to SPFx webpart apps (already use `HbcAppShell` via `@hbc/app-shell`)

## Files Modified

| File | Action |
|------|--------|
| `apps/pwa/src/utils/shell-bridge.ts` | **NEW** — bridge functions |
| `apps/pwa/src/router/root-route.tsx` | ShellLayout → HbcAppShell |
| `apps/dev-harness/src/tabs/PwaPreview.tsx` | ShellLayout → HbcAppShell |
| `apps/hb-site-control/src/router/root-route.tsx` | ShellLayout → HbcAppShell |

## Verification

- `pnpm turbo run build --filter=@hbc/pwa --filter=@hbc/dev-harness --filter=@hbc/hb-site-control` — all 9 tasks successful, zero errors
