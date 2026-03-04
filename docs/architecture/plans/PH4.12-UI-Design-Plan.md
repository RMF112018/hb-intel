# Phase 4 Development Plan — UI Foundation & HB Intel Design System - Task 12
**Version:** 2.1
**Supersedes:** PH4-UI-Design-Plan.md V2.0
**Governed by:** HB-Intel-Blueprint-V4.md · CLAUDE.md v1.2
**Date:** March 2026

## 12. Interaction Pattern Library

### Pattern: Focus Mode **[V2.1]**

Focus Mode reduces cognitive load when a user is actively composing or editing. It directly addresses the "information overload" and "too many options" criticisms documented in 60–70% of cross-platform user reviews.

**Activation:**
- **Touch/tablet (automatic):** Activates immediately when `CreateUpdateLayout` mounts on a `pointer: coarse` device.
- **Desktop (manual):** A `FocusModeEnter` icon button in the `CreateUpdateLayout` form header. Keyboard shortcut: `Cmd/Ctrl+Shift+F`.

**Visual changes when active:**
1. Sidebar collapses to 56px (icon-only) regardless of saved preference.
2. Dark header reduces to: Logo + breadcrumb + Cancel + Save. All other header elements hidden.
3. All non-form UI elements outside the form content area reduce to 40% opacity.
4. The form content area receives full focus ring treatment.

**Deactivation:**
- Click the `FocusModeExit` button in the form header.
- Keyboard shortcut: `Cmd/Ctrl+Shift+F` (toggle).
- Saving or cancelling the form always deactivates Focus Mode and restores full UI.
- On touch/tablet, Focus Mode is always active in `CreateUpdateLayout` — it cannot be manually deactivated to prevent accidental dismissal.

**Animations:**
- Sidebar collapse: `width 250ms cubic-bezier(0.4, 0, 0.2, 1)`
- Header element fade: `opacity 150ms ease-out`
- Background dim: `opacity 200ms ease-out`

### Pattern: AI Command Palette **[V2.1]**

`Cmd/Ctrl+K` opens `HbcCommandPalette` from anywhere in the application. See Section 6 for full specification. Key behavioral rules:

- The palette never replaces the existing navigation — it is an accelerator layer on top of it.
- Results from the Anthropic API are clearly marked with a ✦ sparkle icon.
- Queries that modify data (create, update) always show a confirmation step before executing.
- The palette respects the user's current role permissions — it does not surface tools or actions the user cannot access.
- All keyboard-only users must be able to accomplish any palette action without a mouse.

### Pattern: Confirm Destructive Action

```
Modal title: "Delete Punch Item #127?"
Body: "This action cannot be undone. The punch item and all associated photos and comments will be permanently deleted."
Footer: [Cancel (ghost)] [Delete (danger, primary position)]
```

### Pattern: Optimistic UI Update

Update UI immediately on user action. Dispatch API request in background. On failure: revert UI + `HbcToast` (error) with Retry button.

### Pattern: Loading States Hierarchy **[V2.1 — Shimmer Skeletons]**

| Context | Loading Component |
|---|---|
| Full page initial load | `HbcSpinner` (`lg`), centered |
| Tab content load | `HbcSpinner` (`md`), centered in tab panel |
| Table data fetch | Layout-matched shimmer skeleton rows (see §7.1) |
| Inline action | Spinner replaces button label. Button disabled |
| Chart data fetch | `HbcSpinner` (`md`) overlaid on chart container |
| Command Palette AI query | Animated ✦ sparkle indicator in result area |

**Minimum display time:** 300ms to prevent flicker.

### Pattern: Unsaved Changes Warning

`HbcForm` fires `onDirtyChange(true)` when any field is modified. Intercept navigation via React Router `useBlocker`:

```
Title: "Leave without saving?"
Body: "You have unsaved changes that will be lost if you leave this page."
Footer: [Stay & Save (primary)] [Leave without Saving (danger)]
```

### Pattern: Real-Time Status Updates (SignalR)

1. Status badge crossfade: `opacity + transform: scale` at 200ms. Badge scales `1.0 → 1.1 → 1.0` at 300ms. **[V2.1 micro-interaction]**
2. `HbcToast` (sync-status variant): `"[User Name] updated [Item Title] — [New Status]"`. Auto-dismiss when complete.
3. Update only the affected row via `queryClient.setQueryData` — no full table re-render.

### Pattern: Micro-Interaction Timing Specifications **[V2.1]**

All animations respect `prefers-reduced-motion`. When `prefers-reduced-motion: reduce`, transitions use `opacity` only (no transforms, no movement).

| Interaction | Duration | Easing |
|---|---|---|
| Page/route transition | 200ms cross-fade | `ease-out` |
| Sidebar expand/collapse | 250ms width | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Panel slide in/out | 250ms translateX | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Modal appear | 200ms opacity + scale | `ease-out` (scale 0.97→1.0) |
| Row hover background | 150ms | `ease` |
| Status badge change | 300ms opacity cross-fade | `ease-in-out` |
| Status badge pulse | 300ms scale 1.0→1.1→1.0 | `ease-in-out` |
| Skeleton shimmer sweep | 1500ms linear loop | `linear` |
| Focus Mode activation | 200ms opacity dim | `ease-out` |
| Connectivity bar expand | 100ms height | `ease` |
| Button loading state | 150ms opacity | `ease` |

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 4.12 completed: 2026-03-04
All 8 interaction patterns implemented:
  1. usePrefersReducedMotion hook (matchMedia pattern)
  2. HbcConfirmDialog (HbcModal sm wrapper)
  3. Focus Mode orchestration (deactivate, Cmd+Shift+F, dim overlay)
  4. Command Palette enhancements (confirmation step, permission filtering)
  5. useOptimisticMutation hook (toast-optional)
  6. useUnsavedChangesBlocker hook (router-agnostic)
  7. HbcStatusBadge animate prop (crossfade + pulse, reduced-motion safe)
  8. Barrel exports (hooks/index.ts, interactions/index.ts, src/index.ts)
Animation constants: TIMING object + badgePulse/crossfade keyframes + useReducedMotionStyles
Documentation added: docs/how-to/developer/phase-4.12-interaction-patterns.md
ADR created: docs/architecture/adr/ADR-0025-ui-interaction-pattern-library.md
Stories: HbcConfirmDialog.stories.tsx + Interactions.stories.tsx (6 stories)
Zero breaking changes — all new props are optional.
-->