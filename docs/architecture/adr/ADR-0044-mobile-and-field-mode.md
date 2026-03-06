# ADR-0044: Mobile & Field Mode (Phase 4b.10)

**Status:** Accepted
**Date:** 2026-03-06
**Deciders:** Architecture team
**Relates to:** D-09 (Binding Decision — Mobile/Field Mode), ADR-0022

## Context

Phase 4b.10 requires automatic detection and switching between Office (desktop) and Field (mobile) modes per binding decision D-09. Prior to this ADR, `useFieldMode` only toggled dark theme via localStorage — it did not detect viewport width or HB Site Control app context. The shell (`HbcAppShell`) rendered both sidebar and bottom nav based on tablet breakpoint, not mode. The `supportedModes` prop on `WorkspacePageShell` existed in types but was unused.

## Decisions

### 1. Auto-detect + manual override for `useFieldMode`

Field mode is auto-detected when:
- Viewport width ≤ 767px (via `useIsMobile()`)
- Running inside HB Site Control app (via `data-hbc-app="hb-site-control"` HTML attribute)

When auto-detected as field, manual toggle is ignored. Desktop users retain the manual toggle via `toggleFieldMode()` (localStorage-backed). The hook returns both `isFieldMode: boolean` (backward-compatible) and `mode: AppMode` (`'office' | 'field'`).

### 2. HB Site Control detection via HTML attribute

`apps/hb-site-control/src/main.tsx` sets `document.documentElement.dataset.hbcApp = 'hb-site-control'` before React render. This is a static marker read once by `useFieldMode`. No runtime communication or context provider required.

### 3. Shell chrome switching at HbcAppShell level

| Mode | Chrome |
|------|--------|
| `office` | HbcHeader + HbcSidebar + content with sidebar margin |
| `field` | HbcHeader + content (no sidebar) + HbcBottomNav + bottom padding |

The shell conditionally renders `HbcSidebar` (office only) and `HbcBottomNav` (field only). Focus Mode overlay works in both modes.

### 4. Dual density systems

- **Theme-level** (`useDensity`): Field mode defaults to `comfortable` (40px row height). Office mode auto-detects from pointer type. User override (localStorage) is respected in both modes.
- **DataTable-level** (`useAdaptiveDensity`): Already handles `isFieldMode` param, defaulting to `touch` tier (64px). No changes needed — DataTable has its own specialized density system.

### 5. `supportedModes` guard

`WorkspacePageShell` checks its `supportedModes` prop against the current `mode`. If the current mode is not in the declared array, it renders `HbcEmptyState` with a "not available in {mode} mode" message. If `supportedModes` is undefined, all modes are supported (backward-compatible default).

### 6. SignalR reconnect-on-focus

`useSignalR` in HB Site Control pauses mock event generation when `document.hidden === true` and resumes on foreground return. In Phase 7, this handler will call `hubConnection.start()` for real SignalR reconnection.

## Consequences

- All mode-switching logic is centralized in `useFieldMode` and `HbcAppShell` — pages never contain breakpoint logic (D-09 enforced)
- `isFieldMode` boolean remains backward-compatible for existing consumers
- New `mode` property enables explicit office/field branching where needed
- `AppMode` type exported from `@hbc/ui-kit` for consumer use
- HB Site Control is always in field mode regardless of viewport width
