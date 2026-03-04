# HbcCard

Elevated surface container for grouping related content.

## Import

```tsx
import { HbcCard } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| elevation | 0 \| 1 \| 2 \| 3 | 1 | Shadow depth level for visual hierarchy |
| padding | 'none' \| 'small' \| 'medium' \| 'large' | 'medium' | Inner padding around content |
| onClick | (event: React.MouseEvent) => void | undefined | Click handler for interactive cards |
| children | ReactNode | required | Card content |

## Usage

```tsx
<HbcCard elevation={1} padding="medium">
  <HbcTypography intent="h3">Card Title</HbcTypography>
  <p>Card content goes here.</p>
</HbcCard>

<HbcCard elevation={2} padding="large" onClick={handleCardClick}>
  <h3>Clickable Card</h3>
  <p>Click to expand details.</p>
</HbcCard>

<HbcCard elevation={0} padding="none">
  <img src="image.jpg" alt="Card image" />
</HbcCard>
```

## Field Mode Behavior

Shadow and elevation are adjusted for Field Mode using darker shadow colors and hbcFieldTheme tokens. Lower elevations appear more subtle on dark backgrounds while maintaining visual separation.

## Accessibility

- When interactive, implements `role="region"` with descriptive `aria-label`
- Semantic heading structure for card titles
- Click targets are at least 44x44px for touch accessibility
- Keyboard navigation supported for interactive cards

## SPFx Constraints

No SPFx-specific constraints.
