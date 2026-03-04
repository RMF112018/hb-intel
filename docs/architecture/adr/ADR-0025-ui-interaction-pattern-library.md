# ADR-0025: UI Interaction Pattern Library

**Status:** Accepted
**Date:** 2026-03-04
**Phase:** 4.12

## Context

Phase 4.11 delivered Form Architecture. The ui-kit needs standardized interaction patterns for Focus Mode orchestration, optimistic mutations, unsaved changes protection, destructive confirmations, and real-time badge animations. These patterns must compose existing components rather than introduce new visual systems.

## Decision

### 1. Router-agnostic `useUnsavedChangesBlocker`

The ui-kit has NO router dependency. The hook handles `beforeunload` for browser tab close and exposes `showPrompt`/`confirmNavigation`/`cancelNavigation` for the consumer to wire to their router's `useBlocker`. It does NOT import React Router, TanStack Router, or any routing library.

**Rationale:** The ui-kit is consumed by multiple apps that may use different routers. Coupling to a specific router would break portability.

### 2. Toast-optional `useOptimisticMutation`

The hook accepts an optional `onShowError` callback rather than directly calling `useToast()`. Consumers pass `toast.addToast(...)` as the callback.

**Rationale:** This avoids requiring `HbcToastProvider` in scope and keeps the hook composable. It can be used in contexts where toast is not available (e.g., background workers, tests).

### 3. Focus Mode dim via CSS pseudo-element

The `CreateUpdateLayout` uses a `::after` pseudo-element with `position: fixed` and `opacity: 0.4` to dim non-form content. The form content area sits above the dim via `z-index: 2`.

**Rationale:** This is simpler than the alternative of adding a dim class to every non-form element via `data-focus-mode` attribute selectors. It also works without knowledge of the shell's DOM structure.

### 4. HbcConfirmDialog wraps HbcModal

Thin wrapper with `HbcModal size="sm"` and `preventBackdropClose`. No new visual system — just standardized composition.

**Rationale:** Avoids duplicating modal infrastructure. Keeps the design system consistent.

### 5. Badge animation via `animate` prop

HbcStatusBadge gets an optional `animate` prop. When true AND variant changes, plays crossfade + pulse. Respects `prefers-reduced-motion` (opacity-only, no transforms).

**Rationale:** Opt-in animation avoids surprising behavior in static contexts while enabling real-time status updates.

### 6. Named TIMING constants

All animation durations are centralized in `TIMING` object in `animations.ts` rather than scattered magic numbers.

**Rationale:** Ensures consistent timing across the design system and makes it easy to adjust globally.

## Consequences

- All new props are optional — zero breaking changes to existing consumers
- `HbcConfirmDialog` is reusable beyond command palette (forms, data tables, etc.)
- Router integration remains the consumer's responsibility
- Reduced-motion users get accessible alternatives automatically
