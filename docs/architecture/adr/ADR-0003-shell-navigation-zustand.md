# ADR-0003: Procore-Inspired Shell with Zustand Navigation

**Status:** Accepted
**Date:** 2026-03-03
**Context:** Blueprint §1f (shell package structure), §2c (Procore-aligned navigation), §2e (Zustand stores)

## Decision

Create `@hbc/shell` as the application shell package providing Procore-inspired navigation UI, Zustand-based navigation and project state, and structural React components with dual-mode support (full PWA vs simplified SPFx).

## Key Design Choices

### 1. Shell-Specific Types in @hbc/shell (Not @hbc/models)

Navigation types (`WorkspaceId`, `ToolPickerItem`, `SidebarItem`, `WorkspaceDescriptor`) are shell concerns and live in `@hbc/shell/types`, not in `@hbc/models`. Domain data types stay in `@hbc/models`; UI navigation constructs stay in the shell.

### 2. WorkspaceId as String Union (Not Enum)

`WorkspaceId` is a TypeScript string union type with a companion `WORKSPACE_IDS` runtime array. This is consistent with `@hbc/models` conventions where most identifiers use string unions rather than enums. The runtime array enables iteration in `AppLauncher` without sacrificing type safety.

### 3. Callback-Based Navigation (Not URL Strings)

`ToolPickerItem` and `SidebarItem` use `onClick: () => void` callbacks instead of URL strings. This keeps the shell decoupled from TanStack Router (Phase 4) — apps inject navigation behavior, the shell never calls router directly.

### 4. Dual-Mode via `mode` Prop (Not Separate Components)

`ShellLayout` accepts `mode?: 'full' | 'simplified'`. In `'simplified'` mode (SPFx/HB Site Control), `ProjectPicker` and `AppLauncher` are unmounted entirely (not CSS-hidden) to eliminate dead code from the SPFx bundle. This is a structural decision — conditional rendering at the component level, not CSS display toggling.

### 5. Zustand for All Shell State (No React Context)

Both `projectStore` and `navStore` use Zustand exclusively (Blueprint §2e). `setActiveWorkspace()` atomically clears `toolPickerItems` and `sidebarItems` to prevent stale nav flash during workspace transitions.

### 6. data-hbc-shell Attributes as Styling Hooks

All components use `data-hbc-shell="*"` attributes instead of CSS classes. This provides stable styling hooks for `@hbc/ui-kit` (Phase 2.6) without coupling to a specific CSS methodology.

## Navigation Rules (Blueprint §2c)

1. `ProjectPicker` — rendered only when `mode === 'full' && activeWorkspace === 'project-hub'`
2. `BackToProjectHub` — rendered when `mode === 'full' && activeWorkspace !== 'project-hub' && activeProject !== null`
3. `AppLauncher` — rendered only when `mode === 'full'`
4. `ContextualSidebar` — conditional on navStore items or sidebarSlot prop
5. Label: "Back to the Project Hub {activeProject.name}" (exact Blueprint wording)

## Consequences

- Shell components have zero CSS — styling deferred to `@hbc/ui-kit` (Phase 2.6).
- Apps must inject navigation callbacks; shell never performs routing.
- `projectStore.availableProjects` provides synchronous access for `ProjectPicker` (avoids async waterfall on dropdown open).
- `navStore.setActiveWorkspace()` must be called before setting new tool/sidebar items to prevent stale flash.
