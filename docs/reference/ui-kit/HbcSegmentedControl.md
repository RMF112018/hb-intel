# HbcSegmentedControl

Governed pill-group selector that composes `HbcButton` pills into an accessible `radiogroup` with full keyboard navigation.

## When to use

- Year/period selectors
- Mode toggles (e.g., "Active" / "Closed" / "All")
- Small filter controls with 2-7 discrete options
- Anywhere a segmented-button or toggle-group pattern is needed

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | required | Accessible group label (visible by default) |
| `showLabel` | `boolean` | `true` | Whether to render the label visually |
| `options` | `SegmentedOption<T>[]` | required | Available options |
| `value` | `T` | required | Currently selected value |
| `onChange` | `(value: T) => void` | required | Selection callback |
| `size` | `'sm' \| 'md' \| 'lg'` | `'sm'` | Button size |
| `disabled` | `boolean` | `false` | Disable all options |
| `className` | `string` | — | Additional CSS class |

### SegmentedOption

| Prop | Type | Description |
|------|------|-------------|
| `value` | `T` | Value passed to `onChange` |
| `label` | `string` | Display text |
| `disabled` | `boolean` | Disable individual option |

## Usage

```tsx
import { HbcSegmentedControl } from '@hbc/ui-kit';

const years = [
  { value: 2026, label: '2026' },
  { value: 2025, label: '2025' },
  { value: 2024, label: '2024' },
];

<HbcSegmentedControl
  label="Year:"
  options={years}
  value={selectedYear}
  onChange={setSelectedYear}
/>
```

## Accessibility

- `role="radiogroup"` with `aria-labelledby` pointing to the label
- Each button sets `aria-pressed` for selected state
- Arrow keys (Left/Right/Up/Down) navigate between options with wrapping
- Focus follows selection on keyboard navigation
- Supports `prefers-reduced-motion`

## Design tokens

- Label: `label` typography tokens (0.75rem, weight 600)
- Buttons: `HbcButton` primary/secondary variants
- Spacing: 10px wrapper gap, 6px pill gap

## Data attribute

`data-hbc-ui="segmented-control"` on the wrapper element.
