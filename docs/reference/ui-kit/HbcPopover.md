# HbcPopover

Contextual popover for displaying additional information or actions near a target element.

## Import

```tsx
import { HbcPopover } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| open | boolean | false | Controls popover visibility |
| onDismiss | () => void | required | Callback when popover closes |
| target | ReactNode | required | Anchor element that popover positions relative to |
| size | PopoverSize | 'medium' | Size variant: 'small' \| 'medium' \| 'large' |
| children | ReactNode | required | Popover content |

## Usage

```tsx
const [open, setOpen] = useState(false);

<HbcPopover
  open={open}
  onDismiss={() => setOpen(false)}
  target={<button>Click me</button>}
  size="medium"
>
  <p>Additional information or actions go here</p>
</HbcPopover>
```

## Field Mode Behavior

Popover surface uses dark background with light borders and text in Field Mode. Content remains high-contrast and readable. Shadow and border colors adapt for dark theme visibility.

## Accessibility

- `aria-haspopup="dialog"` on trigger element
- `aria-expanded="true|false"` updated dynamically
- Focus management: focus moves to popover on open, returns to trigger on close
- Keyboard support: Escape key closes popover
- `role="dialog"` on popover container
- Content properly labeled with aria-label or aria-labelledby

## SPFx Constraints

No SPFx-specific constraints.
