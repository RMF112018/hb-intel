# HbcBanner

Page-level notification banner for displaying messages, warnings, errors, or success states.

## Import

```tsx
import { HbcBanner } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | BannerVariant | 'info' | Visual style: 'info' \| 'success' \| 'warning' \| 'error' |
| message | string | required | Banner message text |
| dismissible | boolean | false | Allow user to close banner |
| onDismiss | () => void | - | Callback when banner is dismissed |
| action | ReactNode | - | Optional action button or link |

## Usage

```tsx
<HbcBanner
  variant="success"
  message="Project created successfully"
  dismissible={true}
  onDismiss={() => console.log('dismissed')}
  action={<button>View Project</button>}
/>
```

## Field Mode Behavior

Banner colors adapt for high contrast in Field Mode (dark theme). Warning and error variants use bright, saturated colors. Info and success variants use muted but distinct tones. Background, border, and text colors all adjust to maintain WCAG AA contrast ratios.

## Accessibility

- `role="alert"` for error and warning variants (immediate announcement)
- `role="status"` for info and success variants (polite announcement)
- `aria-live="assertive"` for alert role, `aria-live="polite"` for status role
- Dismiss button has clear aria-label
- Banner message is wrapped in live region for dynamic updates
- Color is not the only indicator of variant (icons or text prefix used)

## SPFx Constraints

No SPFx-specific constraints.
