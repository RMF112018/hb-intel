# HbcConnectivityBar

Canonical top shell-status rail for connectivity and centralized shell-state messaging.

## Import

```tsx
import { HbcConnectivityBar } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| status | ConnectivityStatus | auto-detected | Legacy connectivity override (`online` \| `syncing` \| `offline`) for compatibility |
| shellStatus | ShellStatusSnapshot | - | Centralized shell-status snapshot from `@hbc/shell` resolver (preferred) |
| onShellAction | (action) => void | - | Handler for approved actions (`retry`, `sign-in-again`, `learn-more`) |

## Usage

```tsx
const statusSnapshot = resolveShellStatusSnapshot({
  lifecyclePhase: 'restoring',
  experienceState: 'recovery',
  hasAccessValidationIssue: false,
  hasFatalError: false,
  connectivitySignal: 'connected',
});

<HbcConnectivityBar
  shellStatus={statusSnapshot}
  onShellAction={(action) => {
    if (action === 'retry') {
      // Safe retry path
      retryBootstrap();
    }
  }}
/>
```

## Field Mode Behavior

Status rail colors adapt for dark surfaces in Field Mode. Connected state remains the minimal ambient rail, while non-connected centralized shell statuses may expand to show plain-language message and approved actions.

## Accessibility

- `role="status"` on bar container
- `aria-live="polite"` for dynamic status updates
- Status message is always announced to assistive technology
- Approved action buttons are rendered only when allowed by centralized shell-status snapshot
- Color is not the only indicator of status (text message included)
- Status changes are announced when they occur
- Dismiss button (if present) has clear aria-label

## SPFx Constraints

No SPFx-specific constraints. In simplified shell modes, the same rail component is reused while status derivation remains centralized in `@hbc/shell`.
