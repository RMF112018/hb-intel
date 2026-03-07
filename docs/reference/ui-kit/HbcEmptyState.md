# HbcEmptyState Component Reference

**Version:** 1.0
**Date:** 2026-03-07
**Status:** Documented in PH4C.8
**Decision Reference:** D-PH4C-12

## Overview

HbcEmptyState is a flexible empty state component for displaying no-data or placeholder content.
It supports optional icons, titles, descriptions, and call-to-action buttons.

## Props

```typescript
interface HbcEmptyStateProps {
  /** Icon to display (Fluent Icon component or null) */
  icon?: React.ReactNode;

  /** Title text */
  title: string;

  /** Description or explanation text */
  description?: string;

  /** Optional primary action button */
  primaryAction?: {
    label: string;
    onClick: () => void;
  };

  /** Optional secondary action button */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };

  /** CSS class name for custom styling */
  className?: string;

  /** Optional aria-label for accessibility */
  'aria-label'?: string;
}
```

## Usage Examples

### Basic Empty State
```tsx
import { HbcEmptyState } from '@hbc/ui-kit';
import { SearchIcon } from '@fluentui/react-icons';

export const MyComponent = () => (
  <HbcEmptyState
    icon={<SearchIcon />}
    title="No Results Found"
    description="Try adjusting your search filters and try again."
  />
);
```

### With Actions
```tsx
<HbcEmptyState
  title="No Data Available"
  description="Get started by importing your first project."
  primaryAction={{
    label: 'Import Project',
    onClick: () => handleImport(),
  }}
/>
```

## Accessibility

- Always provide a meaningful `title` — this is the primary text for screen readers
- Use `description` for supplementary information, not as the only content
- Include action buttons with clear labels
- Component automatically handles focus management for keyboard navigation

## Testing

See `.stories.tsx` file for visual and accessibility test cases.

## Related Components

- `HbcErrorBoundary` — Error handling wrapper
- `HbcLoadingState` — Loading skeleton placeholder
