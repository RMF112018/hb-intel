# Phase 4.9 — Messaging & Feedback System (Developer How-To)

**Phase:** 4.9
**Reference:** PH4.9-UI-Design-Plan.md §9, Blueprint §1d

## Components

### HbcBanner

Full-width status bar rendered in document flow below the header. Use for page-level notifications.

```tsx
import { HbcBanner } from '@hbc/ui-kit';

<HbcBanner variant="warning" onDismiss={() => setDismissed(true)}>
  Your session will expire in 5 minutes.
</HbcBanner>
```

**When to use:** Page-level persistent messages (sync status, system alerts, feature announcements).

**Variants:** `info` | `success` | `warning` | `error`

- `warning`/`error` use `role="alert"` for screen readers
- `info`/`success` use `role="status"`
- Omit `onDismiss` for critical non-dismissible banners

### HbcToast (V2.1 Three-Category Restriction)

Ephemeral notifications in a fixed bottom-right stack. **Only three categories are allowed:**

| Category | Auto-dismiss | Dismiss mechanism |
|----------|-------------|-------------------|
| `success` | 3 seconds | Automatic |
| `error` | Never | Manual X button |
| `sync-status` | Never | Programmatic via `dismissToast`/`dismissCategory` |

```tsx
import { HbcToastProvider, useToast, HbcToastContainer } from '@hbc/ui-kit';

// Wrap your app
<HbcToastProvider maxVisible={3}>
  <App />
  <HbcToastContainer />
</HbcToastProvider>

// In any component
const { addToast, dismissToast, dismissCategory } = useToast();
addToast({ category: 'success', message: 'Changes saved.' });
const id = addToast({ category: 'sync-status', message: 'Syncing...' });
dismissToast(id); // or dismissCategory('sync-status');
```

**No `info` or `warning` toasts exist.** If you need persistent warnings, use `HbcBanner`.

### HbcTooltip

Lightweight text-only tooltip. For interactive content, use `HbcPopover`.

```tsx
import { HbcTooltip } from '@hbc/ui-kit';

<HbcTooltip content="Save your current changes" position="top" showDelay={300}>
  <button>Save</button>
</HbcTooltip>
```

- `content` is `string` only — never `ReactNode`
- Positions: `top` | `bottom` | `left` | `right` (auto-flips at viewport edge)
- Show delay: 300ms on hover (configurable), immediate on focus
- Max-width: 280px
- No focus trap (non-interactive)

### HbcSpinner

CSS border spinner for loading states.

```tsx
import { HbcSpinner, useMinDisplayTime } from '@hbc/ui-kit';

const showSpinner = useMinDisplayTime(isLoading, 300);
{showSpinner && <HbcSpinner size="md" label="Loading project data" />}
```

**Sizes:** `sm` (20px) | `md` (40px) | `lg` (64px)

### useMinDisplayTime Hook

Prevents flash-of-spinner by ensuring the spinner stays visible for at least N milliseconds.

```tsx
const visible = useMinDisplayTime(isLoading, 300);
// visible stays true for at least 300ms after isLoading was last true
```

### HbcEmptyState (Enhanced)

Now supports `icon` (replaces `illustration`), `primaryAction` + `secondaryAction` (replaces `action`), and uses `<h2>` heading.

```tsx
import { HbcEmptyState, HbcButton } from '@hbc/ui-kit';

<HbcEmptyState
  title="No commitments found"
  description="Import from Procore or create locally."
  icon={<DrawingSheet size="lg" color="#8B95A5" />}
  primaryAction={<HbcButton>Import</HbcButton>}
  secondaryAction={<HbcButton variant="secondary">Create Local</HbcButton>}
/>
```

Deprecated props `illustration` and `action` still work for backward compatibility.

## Decision Summary

- Toast categories limited to 3 (V2.1) — compile-time enforced via `ToastCategory` type
- Tooltip content is `string` only — prevents interactive content violations
- Banner has no z-index (in document flow, not fixed)
- Toast container portaled to `document.body` at `Z_INDEX.toast` (1300)
