# HbcConfirmDialog

Lightweight confirmation dialog for destructive or warning actions, wrapping HbcModal with Cancel/Confirm footer.

## Import

```tsx
import { HbcConfirmDialog } from '@hbc/ui-kit';
import type { HbcConfirmDialogProps } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| open | boolean | required | Whether the dialog is visible |
| onClose | () => void | required | Close handler (Cancel or backdrop) |
| onConfirm | () => void | required | Confirm handler |
| title | string | required | Dialog title |
| description | string | required | Descriptive body text |
| confirmLabel | string | 'Delete' | Confirm button label |
| cancelLabel | string | 'Cancel' | Cancel button label |
| variant | 'danger' \| 'warning' | 'danger' | Visual variant (red or amber) |
| loading | boolean | false | Show loading spinner on confirm button |
| className | string | undefined | Additional CSS class |

## Usage

```tsx
<HbcConfirmDialog
  open={showDelete}
  onClose={() => setShowDelete(false)}
  onConfirm={handleDelete}
  title="Delete Commitment"
  description="This action cannot be undone. Are you sure?"
  variant="danger"
  loading={isDeleting}
/>
```

## Field Mode Behavior

In Field Mode, the modal overlay and button colors adapt via `hbcFieldTheme` tokens. Danger variant maintains red tones for clarity.

## Accessibility

- Renders inside `HbcModal` with focus trap and `aria-modal="true"`
- Confirm and Cancel buttons are keyboard accessible
- Loading state disables Cancel and announces via `aria-busy`
- Backdrop click prevented to avoid accidental dismissal

## SPFx Constraints

No SPFx-specific constraints. Uses HbcModal internally which handles portal rendering.
