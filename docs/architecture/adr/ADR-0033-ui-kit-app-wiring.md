# ADR-0033: UI-Kit App Shell Wiring Strategy

**Status:** Accepted
**Date:** 2026-03-04
**Phase:** 4.19

## Context

The `@hbc/ui-kit` package contains `HbcAppShell`, a fully-styled application shell with Griffel CSS,
dark header, connectivity bar, Field Mode toggle, collapsible sidebar, and responsive bottom nav.
However, the PWA, dev-harness, and hb-site-control apps used `ShellLayout` from `@hbc/shell` — an
unstyled semantic HTML wrapper — resulting in zero visible design system changes at runtime.

## Decision

Replace `ShellLayout` with `HbcAppShell` in all consumer apps, using bridge functions to adapt
existing Zustand store data (flat `SidebarItem[]`, `ICurrentUser`) to the shapes `HbcAppShell`
expects (`SidebarNavGroup[]`, `ShellUser`).

### Key Design Choices

1. **Bridge functions over store refactor** — Rather than restructuring `useNavStore` to emit
   `SidebarNavGroup[]` directly (which would break workspace-routes.ts and all sidebar factories),
   we convert at the consumption boundary. This is the minimal-change, low-risk approach.

2. **Keep `@hbc/shell` package** — `ShellLayout` and its stores remain for backwards compatibility
   and for any future consumers that need unstyled semantic HTML. The shell package's Zustand stores
   (`useNavStore`, `useProjectStore`) continue to be the single source of truth for navigation state.

3. **Nested FluentProviders** — `App.tsx` keeps its `FluentProvider` for auth loading states (which
   render before the router). `HbcAppShell` provides its own inner `FluentProvider` with dynamic
   theme switching (light ↔ field). In Fluent UI v9, nested providers are supported; the innermost
   one wins for its subtree.

4. **PWA-specific bridge module** — `shell-bridge.ts` lives in `apps/pwa/src/utils/` because the
   mapping logic (workspace descriptors, icon choices) is PWA-specific. The dev-harness duplicates
   the minimal bridge inline since it has different workspace labels.

## Consequences

- PWA now displays the full HB Intel design system shell
- Field Mode toggle, connectivity bar, and responsive bottom nav are functional
- No changes required to SPFx webpart apps (already wired correctly)
- `@hbc/shell` package remains intact; only its consumer usage in root routes changed

## Update: `@hbc/app-shell` Removed (2026-03-05)

The redundant `@hbc/app-shell` package — a thin re-export wrapper over `@hbc/ui-kit/app-shell` —
has been deleted. Its sole consumer (`@hbc/spfx`) was migrated to import directly from
`@hbc/ui-kit/app-shell`. This eliminates the unnecessary indirection layer and establishes
`@hbc/ui-kit` as the single authoritative source for all shell UI components.

See [PH4-Shell-Consolidation.md](../plans/PH4-Shell-Consolidation.md) for full details.
