# ADR-0022: UI Messaging & Feedback System

**Status:** Accepted
**Date:** 2026-03-04
**Phase:** 4.9

## Context

Phase 4.9 introduces the Messaging & Feedback System. Key design decisions were needed around toast categories, tooltip content restrictions, banner dismiss behavior, and spinner display timing.

## Decision

### 1. V2.1 Three-Category Toast Restriction

**Only three toast categories are permitted:** `success`, `error`, `sync-status`.

- `success` — auto-dismisses after 3 seconds
- `error` — requires manual dismissal (X button)
- `sync-status` — programmatic dismissal via `dismissToast`/`dismissCategory`

**Rationale:** Eliminates ambiguity between `info`/`warning` toasts and banners. Persistent messages belong in `HbcBanner`, not toasts. The `ToastCategory` TypeScript union enforces this at compile time.

### 2. Banner Dismiss Logic

- `onDismiss` callback controls dismissibility
- Omitting `onDismiss` renders a non-dismissible (critical) banner
- No auto-dismiss timer on banners — they persist until user action or programmatic removal
- Banners are in document flow (no z-index), not fixed/overlaid

**Rationale:** Critical system messages must not be accidentally dismissed. In-flow rendering avoids z-index conflicts with overlays.

### 3. Tooltip String-Only Content

`HbcTooltip.content` accepts `string`, not `ReactNode`. Interactive content must use `HbcPopover`.

**Rationale:** WCAG 2.1 SC 1.4.13 requires that tooltips contain no interactive content. Enforcing `string` at the type level prevents violations.

### 4. Spinner Minimum Display Time

The `useMinDisplayTime(isLoading, 300)` hook debounces spinner visibility to prevent flash-of-spinner on fast operations.

**Rationale:** Sub-300ms loading states create jarring flicker. The hook ensures the spinner is visible long enough to be perceived as intentional feedback.

## Consequences

- Developers cannot add `info` or `warning` toast categories without modifying the `ToastCategory` type
- Tooltip cannot render buttons, links, or form elements
- Banner dismiss behavior is controlled entirely by the consumer (no auto-dismiss)
- Spinner consumers should use `useMinDisplayTime` to avoid flash
