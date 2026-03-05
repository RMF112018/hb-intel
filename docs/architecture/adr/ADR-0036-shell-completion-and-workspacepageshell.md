# ADR-0036: Shell Completion & WorkspacePageShell

**Status:** Accepted
**Date:** 2026-03-05
**Phase:** 4b.2
**Deciders:** HB Intel Platform Team

## Context

Phase 4b.2 requires a fully-implemented `WorkspacePageShell` (the mandatory outer container for every page per D-01), a `packages/app-shell` PWA facade, migration of module-configs from ui-kit to shell, and completion of missing Storybook stories.

Key problems to solve:
1. **Circular dependency:** `module-configs/types.ts` imports from ui-kit internals (`layouts/types.ts`, `HbcCommandBar/types.ts`). Moving module-configs to `@hbc/shell` would create a shell->ui-kit->shell cycle since shell builds before ui-kit.
2. **WorkspacePageShell scope:** The existing 51-line component only supports title, description, status, and children.
3. **Auth adapter:** Plan references `useMsalAuth` which doesn't exist.

## Decisions

### D1: Extract shared UI types to `@hbc/models`

Extract 6 pure data-shape interfaces (`KpiCardData`, `LayoutTab`, `BreadcrumbItem`, `LayoutAction`, `DensityTier`, `StatusBarData`) to `@hbc/models/src/ui/`. These are data shapes, not components. `ReactNode` fields use type-only imports from `@types/react` (devDep on models).

The ui-kit `layouts/types.ts` and `HbcCommandBar/types.ts` re-export from `@hbc/models` for backward compatibility. Module-configs then import from `@hbc/models`, breaking the circular chain.

**Dependency graph:** `models` (no deps) -> `auth` -> `shell` (+ `@tanstack/react-table`) -> `ui-kit`. No cycles.

### D2: Auth adapter via `useShellAuth()`

Create `useShellAuth()` hook combining `useCurrentUser()` + `useAuthStore().isLoading` into a `ShellAuthContext` interface. Auth-gating stays at the route level (TanStack Router guards), not injected into WorkspacePageShell.

### D3: WorkspacePageShell layout prop scope

The `layout` prop is required (enforcing D-02 at type level) but does NOT drive actual layout rendering in this phase. Layout variant rendering is Phase 4b.3. The `listConfig` prop is defined and accepted but stored in React context for Phase 4b.3 consumption. State overlays (loading/empty/error) render in this phase.

## Consequences

- All downstream packages importing `KpiCardData`, `LayoutTab`, etc. from `@hbc/ui-kit` continue to work via re-exports
- Module-configs can now live in `@hbc/shell` without circular deps
- `@hbc/app-shell` provides a unified import point for PWA pages
- WorkspacePageShell enforces layout declaration at the type level, preparing for Phase 4b.3

## Alternatives Considered

- **Keep module-configs in ui-kit:** Would work but violates F-014 requirement and keeps config objects coupled to the component library
- **Move types to `@hbc/shell`:** Would still create shell->ui-kit dependency since other ui-kit components need these types
- **Inject auth into WorkspacePageShell:** Rejected in favor of route-level guards per TanStack Router pattern
