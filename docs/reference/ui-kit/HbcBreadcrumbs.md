# HbcBreadcrumbs

Breadcrumb navigation component for displaying current location within a hierarchy.

## Import

```tsx
import { HbcBreadcrumbs } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | BreadcrumbItem[] | required | Array of breadcrumb objects with label and href |
| maxItems | number | undefined | Maximum items to show before collapsing (undefined = show all) |
| onNavigate | (href: string) => void | - | Callback when user clicks breadcrumb |

### BreadcrumbItem

| Property | Type | Description |
|----------|------|-------------|
| label | string | Display text |
| href | string | Navigation target |

## Usage

```tsx
<HbcBreadcrumbs
  items={[
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: 'My Project', href: '/projects/123' },
  ]}
  maxItems={3}
  onNavigate={(href) => navigate(href)}
/>
```

## Field Mode Behavior

Breadcrumb separators and text use muted colors in Field Mode to reduce visual noise while maintaining contrast. Links remain distinguishable and interactive.

## Accessibility

- `nav` wrapper with `aria-label="Breadcrumb"`
- Each breadcrumb link is semantic `<a>` or `<button>`
- Last item (current page) has `aria-current="page"`
- Collapsed items use `aria-label` to describe hidden breadcrumbs
- Keyboard navigation: Tab through links, Enter to navigate
- Focus indicators clearly visible

## SPFx Constraints

No SPFx-specific constraints.
