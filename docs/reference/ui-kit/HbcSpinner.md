# HbcSpinner

Loading indicator component for displaying progress or loading state.

## Import

```tsx
import { HbcSpinner } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | SpinnerSize | 'medium' | Visual size: 'tiny' \| 'small' \| 'medium' \| 'large' |
| label | string | - | Accessibility label (required if no aria-label on parent) |
| appearance | 'primary' \| 'inverted' | 'primary' | Color variant for context |

## Usage

```tsx
<HbcSpinner size="medium" label="Loading projects..." appearance="primary" />
```

## Field Mode Behavior

In Field Mode, spinner uses inverted colors (light spinner on dark background). When appearance="inverted", colors adapt further for contrast. Appearance should match the parent context's visual treatment.

## Accessibility

- `role="progressbar"` on spinner element
- `aria-label` or `aria-labelledby` must be provided
- `aria-busy="true"` should be set on parent container
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax` optional for determinate progress
- Label must clearly indicate what is loading
- Spinner is marked as non-interactive (no tabindex)

## SPFx Constraints

No SPFx-specific constraints.
