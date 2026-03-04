# HbcErrorBoundary

Error boundary wrapper for graceful error handling and recovery UI.

## Import

```tsx
import { HbcErrorBoundary } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| fallback | ReactNode | undefined | Custom fallback UI when error occurs |
| onError | (error: Error, info: ErrorInfo) => void | undefined | Callback invoked on error capture |
| children | ReactNode | required | Child components to wrap |

## Usage

```tsx
<HbcErrorBoundary
  onError={(error, info) => console.error('Error:', error)}
  fallback={<HbcEmptyState title="Something went wrong" description="Please refresh the page." />}
>
  <MyComponent />
</HbcErrorBoundary>

<HbcErrorBoundary>
  <DashboardContent />
</HbcErrorBoundary>
```

## Field Mode Behavior

Error styling adapts in Field Mode with increased contrast for error messages and backgrounds. Error icons and text use brighter hues suitable for dark backgrounds.

## Accessibility

- Displays error UI with `role="alert"` to announce failures to screen readers
- Error message is descriptive and actionable
- Recovery actions (buttons) are keyboard accessible
- Error context is provided without overwhelming users

## SPFx Constraints

No SPFx-specific constraints.
