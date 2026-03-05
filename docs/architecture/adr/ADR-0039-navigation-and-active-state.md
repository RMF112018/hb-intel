# ADR-0039: Navigation & Active State (D-04)

**Status:** Accepted
**Date:** 2026-03-05
**Phase:** 4b.5 — Navigation & Active State Implementation

## Context

The sidebar active state was **static and broken**: `WORKSPACE_SIDEBARS` factories in `workspace-config.ts` hardcoded `isActive: true` on the first item, `HbcAppShell.tsx` did not pass `activeItemId` to `HbcSidebar`, and there was no mechanism to derive active state from the current URL. Navigating between sidebar items never updated the highlight.

D-04 mandates that active sidebar state must be derived automatically from the router. Pages must never manually set active nav state.

**Key constraint:** `@tanstack/react-router` is only available in `apps/pwa`, not in `packages/shell` or `packages/ui-kit`. Router-derived active state must be computed in the PWA layer and passed down as the existing `activeItemId` prop.

## Decision

### 1. Router-Derived Active State (4b.5.1)

Active item ID is computed in `root-route.tsx` via `useRouterState().location.pathname`, matching against sidebar item `href` values. Path matching uses `startsWith` with trailing `/` guard to prevent false positives (e.g., `/project-hub` matching `/project-hubbing`).

### 2. `NAV_ITEMS` Registry (4b.5.3)

A centralized `NAV_ITEMS` array in `@hbc/shell` (`packages/shell/src/module-configs/nav-config.ts`) is the single source of truth for sidebar navigation metadata. Each entry specifies `key`, `label`, `path`, `workspace`, optional `requiredPermission`, and `order`.

`buildSidebarGroupsFromRegistry()` in `shell-bridge.ts` converts `NAV_ITEMS` → `SidebarNavGroup[]` without depending on `navStore.sidebarItems`.

### 3. `isActive` Removed from `SidebarItem` and `ToolPickerItem` (4b.5.2)

The `isActive` field was removed from both `SidebarItem` and `ToolPickerItem` interfaces in `@hbc/shell`. Active highlighting is computed at render time by comparing `item.id === activeItemId` (already implemented in `HbcSidebar.tsx`).

### 4. Per-Item Permission Filtering (4b.5.4)

`requiredPermission?: string` added to `SidebarNavItem` in `@hbc/ui-kit`. A new `PermissionFilteredItem` wrapper component in `HbcSidebar.tsx` uses `usePermission()` to hide (not disable) unauthorized items. This extends the existing `PermissionFilteredGroup` pattern to the item level.

## Consequences

- **No manual `setActiveNavItem` calls.** Active state is always in sync with the URL.
- **Adding a nav item = adding one object to `NAV_ITEMS`.** No need to touch workspace-config factories.
- **Shell/ui-kit remain framework-agnostic.** Router dependency stays in the PWA layer. `activeItemId` is just a string prop.
- **Permission-filtered items are reactive.** `usePermission()` is called at render time, auto-updating when permissions change.
- **`ToolPickerItem.isActive` removal** simplifies the header bar. Future tool-picker active state should also be router-derived (out of scope for 4b.5).
