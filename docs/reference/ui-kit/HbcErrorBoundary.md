# HbcErrorBoundary Component Reference

**Version:** 1.0
**Date:** 2026-03-07
**Status:** Documented in PH4C.8
**Decision Reference:** D-PH4C-12

## Overview

HbcErrorBoundary is a React Error Boundary wrapper that catches unhandled errors
in child components and displays a user-friendly error UI instead of a blank page.

## Props

```typescript
interface HbcErrorBoundaryProps {
  children: React.ReactNode;

  /** Optional fallback UI to display on error */
  fallback?: React.ReactNode;

  /** Optional callback when error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;

  /** Show error details in development mode */
  showDetails?: boolean;

  /** CSS class name for custom styling */
  className?: string;
}
```

## Usage Examples

### Basic Error Boundary
```tsx
import { HbcErrorBoundary } from '@hbc/ui-kit';

export const App = () => (
  <HbcErrorBoundary>
    <MyComplexComponent />
  </HbcErrorBoundary>
);
```

### With Custom Fallback
```tsx
<HbcErrorBoundary
  fallback={
    <div>Something went wrong. Please refresh the page.</div>
  }
  onError={(error) => logErrorToService(error)}
>
  <MyComponent />
</HbcErrorBoundary>
```

### With Development Details
```tsx
<HbcErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
  <MyComponent />
</HbcErrorBoundary>
```

## Accessibility

- Error message is always visible and announced to screen readers
- Error details are logically structured with clear headings
- Keyboard navigation to dismiss or retry is supported

## Testing

Test error boundaries using:
```tsx
// Test component that throws an error
const BadComponent = () => {
  throw new Error('Test error');
};

// In test:
<HbcErrorBoundary>
  <BadComponent />
</HbcErrorBoundary>
```

## Related Components

- `HbcEmptyState` — No-data state display
- `HbcLoadingState` — Loading skeleton placeholder
