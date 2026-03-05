# HbcScoreBar

Horizontal score visualization bar with three color segments (red/amber/green) and a positional marker.

## Import

```tsx
import { HbcScoreBar } from '@hbc/ui-kit';
import type { HbcScoreBarProps } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| score | number | required | Score value from 0 to 100 |
| showLabel | boolean | false | Show numeric label above marker |
| height | string | '12px' | Bar height |
| className | string | undefined | Additional CSS class |

## Usage

```tsx
<HbcScoreBar score={75} showLabel />

<HbcScoreBar score={35} height="8px" />
```

## Color Segments

| Range | Color | Meaning |
|-------|-------|---------|
| 0 -- 40 | Red | Poor / at risk |
| 41 -- 69 | Amber | Needs attention |
| 70 -- 100 | Green | Good / on track |

The score is clamped to [0, 100]. A black marker is positioned at the score percentage.

## Field Mode Behavior

In Field Mode, segment colors maintain their semantic meaning. The bar background adapts via `hbcFieldTheme` tokens for dark surface contrast.

## Accessibility

- Uses `role="meter"` with proper ARIA attributes
- `aria-valuenow`, `aria-valuemin` (0), `aria-valuemax` (100)
- `aria-label="Score: {value}"` for screen readers
- Color segments supplemented by optional numeric label

## SPFx Constraints

No SPFx-specific constraints. Full-width responsive bar.
