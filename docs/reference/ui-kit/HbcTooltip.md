# HbcTooltip

Informational tooltip for providing contextual help or descriptive text on hover or focus.

## Import

```tsx
import { HbcTooltip } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| content | string \| ReactNode | required | Tooltip content text or element |
| position | TooltipPosition | 'top' | Placement: 'top' \| 'bottom' \| 'left' \| 'right' |
| delay | number | 200 | Delay before showing tooltip (milliseconds) |
| children | ReactNode | required | Element that triggers tooltip |

## Usage

```tsx
<HbcTooltip content="Click to expand" position="top" delay={200}>
  <button>Expand</button>
</HbcTooltip>
```

## Field Mode Behavior

Tooltip background and text colors invert for Field Mode to ensure contrast against dark surfaces. Tooltip uses light background with dark text, arrows and shadows adapt accordingly.

## Accessibility

- `role="tooltip"` on tooltip element
- `aria-describedby` links trigger element to tooltip
- Tooltip automatically generated unique ID
- Triggered on hover and focus (keyboard accessible)
- Keyboard: Tab to trigger element, tooltip appears on focus
- Escape key closes tooltip
- Tooltip content can include interactive elements (with caveats)

## SPFx Constraints

No SPFx-specific constraints.
