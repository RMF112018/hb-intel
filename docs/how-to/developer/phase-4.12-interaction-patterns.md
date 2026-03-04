# Phase 4.12 — Interaction Pattern Library (Developer Guide)

**Reference:** PH4.12-UI-Design-Plan.md §12, Blueprint §1d

## Overview

Phase 4.12 delivers 8 interaction patterns that orchestrate existing ui-kit components. These are primarily hooks and utilities, not major new visual components.

## New Hooks

### `usePrefersReducedMotion`

Detects the user's `prefers-reduced-motion: reduce` OS setting.

```tsx
import { usePrefersReducedMotion } from '@hbc/ui-kit';

const prefersReduced = usePrefersReducedMotion();
// true when user has enabled reduced motion
```

### `useOptimisticMutation`

Generic optimistic update pattern with automatic revert on failure.

```tsx
import { useOptimisticMutation } from '@hbc/ui-kit';
import { useToast } from '@hbc/ui-kit';

const toast = useToast();
const { mutate, isPending } = useOptimisticMutation({
  mutationFn: (id: string) => api.deleteItem(id),
  onOptimisticUpdate: (id) => setItems(prev => prev.filter(i => i.id !== id)),
  onRevert: (id) => setItems(prev => [...prev, removedItem]),
  onShowError: (msg) => toast.addToast({ category: 'error', message: msg }),
});
```

**Key design decision:** The hook accepts `onShowError` callback instead of importing `useToast` directly. This keeps it composable and avoids requiring `HbcToastProvider` in scope.

### `useUnsavedChangesBlocker`

Router-agnostic dirty form protection.

```tsx
import { useUnsavedChangesBlocker, HbcConfirmDialog } from '@hbc/ui-kit';

const { showPrompt, setShowPrompt, confirmNavigation, cancelNavigation } =
  useUnsavedChangesBlocker({ isDirty: form.isDirty });

// Wire to your router's blocker:
// const blocker = useBlocker(isDirty);
// useEffect(() => { if (blocker.state === 'blocked') setShowPrompt(true); }, [blocker]);

<HbcConfirmDialog
  open={showPrompt}
  onClose={cancelNavigation}
  onConfirm={confirmNavigation}
  title="Leave without saving?"
  description="You have unsaved changes that will be lost."
  confirmLabel="Leave without Saving"
  cancelLabel="Stay & Save"
  variant="danger"
/>
```

## New Components

### `HbcConfirmDialog`

Thin wrapper over `HbcModal size="sm"` for destructive action confirmations.

```tsx
import { HbcConfirmDialog } from '@hbc/ui-kit';

<HbcConfirmDialog
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="Delete Commitment"
  description="This action cannot be undone."
  confirmLabel="Delete"
  variant="danger"
  loading={isDeleting}
/>
```

Props: `open`, `onClose`, `onConfirm`, `title`, `description`, `confirmLabel`, `cancelLabel`, `variant` (`'danger' | 'warning'`), `loading`, `className`.

## Enhanced Components

### Focus Mode (CreateUpdateLayout)

- **Keyboard shortcut:** `Cmd/Ctrl+Shift+F` toggles Focus Mode on desktop
- **Deactivate on save/cancel:** Focus Mode automatically deactivates when the user saves or cancels
- **Dim overlay:** 40% opacity dim on non-form content when Focus Mode is active

### HbcCommandPalette

- **Confirmation step:** Results with `requiresConfirmation: true` show `HbcConfirmDialog` before executing
- **Permission filtering:** Pass `permissionFilter` prop to hide results based on user permissions

### HbcStatusBadge

- **`animate` prop:** When true, plays crossfade + pulse animation on variant change
- Respects `prefers-reduced-motion` (opacity-only, no transforms)

## Animation Constants

```tsx
import { TIMING } from '@hbc/ui-kit';

TIMING.sidebarCollapse  // '250ms'
TIMING.backgroundDim    // '200ms'
TIMING.badgePulse       // '300ms'
TIMING.crossfade        // '200ms'
// ... etc.
```

## Convenience Barrel

All PH4.12 exports are also available from a single import path:

```tsx
import {
  usePrefersReducedMotion,
  useOptimisticMutation,
  useUnsavedChangesBlocker,
  HbcConfirmDialog,
} from '@hbc/ui-kit/interactions';
```
