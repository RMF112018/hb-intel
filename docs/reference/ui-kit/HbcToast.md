# HbcToast

Toast notification system for transient, non-blocking messages. Part of the Phase 4b.9 Notifications & Feedback System (D-08).

**Binding decision D-08:** All transient user feedback MUST be triggered via `useToast()`. Inline feedback components are prohibited. Persistent page-level warnings use `HbcBanner` via the `banner` prop on `WorkspacePageShell`.

## Import

```tsx
// From ui-kit (library consumers)
import { useToast } from '@hbc/ui-kit';

// From app-shell (PWA page authors)
import { useToast } from '@hbc/app-shell';
```

> **Important:** `HbcToastProvider` and `HbcToastContainer` are mounted once in `ShellLayout`. Pages should only import `useToast`.

## useToast Hook

Returns an object with convenience methods and low-level API.

### Convenience API (Recommended)

```ts
const { toast } = useToast();

toast.success('Risk item saved.');
toast.error('Failed to save. Please try again.');
toast.warning('Record locked by another user.');
toast.info('Export started. Download will begin shortly.');
```

Each method returns the toast `id` (string) for programmatic dismissal.

### Low-Level API

```ts
const { addToast, dismissToast, dismissCategory } = useToast();

// Add with explicit config
const id = addToast({ category: 'success', message: 'Saved.' });

// Dismiss by id
dismissToast(id);

// Dismiss all toasts of a category
dismissCategory('info');
```

## Toast Categories

| Category | Auto-dismiss | Dismiss mechanism | ARIA role | Icon |
|----------|-------------|-------------------|-----------|------|
| `success` | 3 000 ms | Automatic | `status` | StatusCompleteIcon (green) |
| `error` | Never | Manual close button | `alert` | StatusOverdueIcon (red) |
| `warning` | 5 000 ms | Automatic | `alert` | StatusAttentionIcon (amber) |
| `info` | 4 000 ms | Automatic | `status` | StatusInfoIcon (blue) |

## Canonical Mutation Wiring (4b.9.3)

Wire `useToast` to TanStack Query mutation lifecycle callbacks:

```tsx
import { useToast } from '@hbc/app-shell';
import { useMutation } from '@tanstack/react-query';

function useCreateRiskItem() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: RiskItemInput) => api.createRiskItem(data),
    onSuccess: () => toast.success('Risk item created.'),
    onError: (err) => toast.error(err.message ?? 'Failed to create risk item.'),
  });
}

// Usage in page component:
function RiskItemPage() {
  const { mutate, isPending } = useCreateRiskItem();

  return (
    <WorkspacePageShell layout="form" title="New Risk Item" isLoading={isPending}>
      <RiskItemForm onSubmit={(data) => mutate(data)} />
    </WorkspacePageShell>
  );
}
```

### Pattern Rules

- **DO:** Wire `toast.success()` / `toast.error()` to `onSuccess` / `onError` callbacks
- **DO:** Use `toast.info()` for async operations like exports or background syncs
- **DO:** Use `toast.warning()` for non-critical caution (e.g., "Record locked by another user")
- **DON'T:** Show inline `<Alert>` or `<MessageBar>` components — use `useToast()` instead
- **DON'T:** Mount `HbcToastContainer` in page components — it lives in `ShellLayout`

## Banner vs Toast Decision Guide

| Condition | Use |
|-----------|-----|
| Transient feedback (save, delete, error) | `useToast()` |
| Async operation status (export, sync) | `useToast()` with `info` category |
| Persistent page-level warning (locked record) | `WorkspacePageShell` `banner` prop |
| System-wide alert (maintenance window) | `WorkspacePageShell` `banner` prop |

## Props

### HbcToastProviderProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Child components |
| `maxVisible` | `number` | `3` | Maximum simultaneous visible toasts |

### ToastConfig (low-level API)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `category` | `'success' \| 'error' \| 'warning' \| 'info'` | required | Toast category |
| `message` | `ReactNode` | required | Toast message content |
| `icon` | `ReactNode` | — | Override default category icon |

### ToastApi (convenience API)

| Method | Signature | Description |
|--------|-----------|-------------|
| `success` | `(message: ReactNode, icon?: ReactNode) => string` | Show success toast (3 s auto-dismiss) |
| `error` | `(message: ReactNode, icon?: ReactNode) => string` | Show error toast (manual dismiss) |
| `warning` | `(message: ReactNode, icon?: ReactNode) => string` | Show warning toast (5 s auto-dismiss) |
| `info` | `(message: ReactNode, icon?: ReactNode) => string` | Show info toast (4 s auto-dismiss) |

## Field Mode Behavior

Toast surface uses dark background with light text and borders in Field Mode. Category-specific colors (success green, error red, warning amber, info blue) maintain contrast on dark surfaces. Toast container positions adapt for dark theme visibility.

## Accessibility

- Error/warning toasts use `role="alert"` for immediate screen reader announcement
- Success/info toasts use `role="status"` for polite (non-interrupting) announcement
- Container uses `aria-live="polite"` for accessible notification pattern
- Dismiss button on error toasts has `aria-label="Dismiss toast"`
- Auto-dismiss timers are long enough to be read (3–5 seconds)

## SPFx Constraints

No SPFx-specific constraints. `HbcToastContainer` uses `createPortal` to `document.body`, which is available in SPFx.
