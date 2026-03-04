# HbcButton

Primary action button component for initiating user actions across the application.

## Import

```tsx
import { HbcButton } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger' | 'primary' | Visual style variant of the button |
| size | 'small' \| 'medium' \| 'large' | 'medium' | Button size |
| icon | ReactNode | undefined | Optional icon element to display before children |
| loading | boolean | false | Shows loading state with spinner, disables interaction |
| disabled | boolean | false | Disables the button and prevents clicks |
| children | ReactNode | required | Button label text |
| onClick | (event: React.MouseEvent) => void | undefined | Click handler callback |

## Usage

```tsx
<HbcButton variant="primary" size="medium" onClick={handleClick}>
  Save Changes
</HbcButton>

<HbcButton variant="danger" size="small" loading={isSubmitting}>
  Delete Item
</HbcButton>

<HbcButton variant="outline" icon={<PlusIcon />}>
  Add New
</HbcButton>
```

## Field Mode Behavior

In Field Mode (dark theme), button colors adapt using `hbcFieldTheme` tokens. Primary buttons maintain visual hierarchy with adjusted contrast ratios. Hover and active states increase brightness to remain visible on dark backgrounds.

## Accessibility

- Implements semantic `<button>` element with proper `role="button"`
- `aria-disabled` attribute reflects disabled state
- Focus-visible ring with 2px outline for keyboard navigation
- Loading state announced via `aria-busy`
- Sufficient color contrast (WCAG AA) maintained across all variants

## SPFx Constraints

No SPFx-specific constraints.
