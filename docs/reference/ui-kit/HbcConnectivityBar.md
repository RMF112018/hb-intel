# HbcConnectivityBar

Network status indicator bar displaying connectivity state and retry options.

## Import

```tsx
import { HbcConnectivityBar } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| status | ConnectivityStatus | 'online' | Current connection state: 'online' \| 'offline' \| 'degraded' |
| retryAction | () => void | - | Callback for retry button click |
| message | string | - | Custom status message |

## Usage

```tsx
const [status, setStatus] = useState('online');

<HbcConnectivityBar
  status={status}
  message="Connection lost. Retrying..."
  retryAction={() => {
    // Retry logic
    reconnect();
  }}
/>
```

## Field Mode Behavior

Status bar colors adapt for dark surfaces in Field Mode. Online state uses muted green, offline uses red, degraded uses yellow/orange. All colors maintain WCAG AA contrast ratios against dark background. Bar background and text colors adapt appropriately.

## Accessibility

- `role="status"` on bar container
- `aria-live="polite"` for dynamic status updates
- Status message is always announced to assistive technology
- Retry button has clear `aria-label="Retry connection"`
- Color is not the only indicator of status (text message included)
- Status changes are announced when they occur
- Dismiss button (if present) has clear aria-label

## SPFx Constraints

No SPFx-specific constraints.
