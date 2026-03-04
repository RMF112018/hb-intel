# HbcEmptyState

Empty state placeholder for displaying when no data or content is available.

## Import

```tsx
import { HbcEmptyState } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| icon | ReactNode | required | Icon or illustration element |
| title | string | required | Primary empty state heading |
| description | string | required | Descriptive text explaining the empty state |
| action | ReactNode | undefined | Optional CTA element (button, link) |

## Usage

```tsx
<HbcEmptyState
  icon={<DocumentIcon />}
  title="No Documents"
  description="Create your first document to get started."
  action={<HbcButton onClick={handleCreate}>Create Document</HbcButton>}
/>

<HbcEmptyState
  icon={<SearchIcon />}
  title="No Results"
  description="Try adjusting your search filters."
/>
```

## Field Mode Behavior

The muted background adapts to Field Mode with a darker, less saturated tone. Icon and text colors remain visible on the darker surface. The overall card background uses hbcFieldTheme elevation levels.

## Accessibility

- Implements `role="status"` to announce empty state to screen readers
- Title is semantic heading (h2 level)
- Description provides context for the empty condition
- Action button is keyboard accessible and properly labeled

## SPFx Constraints

No SPFx-specific constraints.
