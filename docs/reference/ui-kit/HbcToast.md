# HbcToast

Toast notification system for transient, non-blocking messages. Includes provider, hook, and container components.

## Import

```tsx
import { HbcToastProvider, useToast, HbcToastContainer } from '@hbc/ui-kit';
```

## Props

### HbcToastProvider

Wrap application root with this provider.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | required | Child components |

### useToast Hook

Returns object with `showToast` function.

| Function | Parameters | Description |
|----------|-----------|-------------|
| showToast | config: ToastConfig | Display toast notification |

### ToastConfig

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| message | string | required | Toast message text |
| category | 'success' \| 'error' \| 'warning' \| 'info' | 'info' | Visual variant |
| duration | number | 3000 | Auto-dismiss time in milliseconds |
| action | ReactNode | - | Optional action button |

## Usage

```tsx
function MyComponent() {
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast({
      message: 'Changes saved',
      category: 'success',
      duration: 3000,
    });
  };

  return (
    <>
      <button onClick={handleSuccess}>Save</button>
      <HbcToastContainer />
    </>
  );
}
```

## Field Mode Behavior

Toast surface uses dark background with light text and borders in Field Mode. Category-specific colors (success green, error red) maintain contrast on dark surfaces. Toast container positions adapt for dark theme visibility.

## Accessibility

- `role="alert"` on toast element for immediate announcement
- `aria-live="polite"` for non-blocking notification pattern
- Toast auto-dismiss timer respects `prefers-reduced-motion`
- Action button has clear aria-label
- Toast position announced to assistive technology
- Dismiss button always available via keyboard

## SPFx Constraints

No SPFx-specific constraints.
