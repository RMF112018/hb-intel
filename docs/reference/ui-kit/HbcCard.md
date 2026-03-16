# HbcCard

Elevated surface container for grouping related content with visual weight differentiation.

## Import

```tsx
import { HbcCard } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | required | Card body content |
| header | ReactNode | undefined | Optional header content (rendered above body with border divider) |
| footer | ReactNode | undefined | Optional footer content (rendered below body with border divider) |
| className | string | undefined | Additional CSS class |
| weight | `'primary'` \| `'standard'` \| `'supporting'` | `'standard'` | Visual weight class — controls elevation, border, and padding treatment |

### Weight Classes (WS1-T04)

| Weight | Elevation | Border | Background | Padding | Use For |
|--------|-----------|--------|------------|---------|---------|
| `primary` | Level 2 (raised) | 2px brand-focus border | surface-0 | Generous (24px body, 20px header) | Most important current-context information |
| `standard` | Level 1 (card) | 1px default border | surface-0 | Standard (24px body, 16px header) | Default card treatment |
| `supporting` | Level 0 (flat) | 1px default border | surface-1 | Compact (16px body, 12px header) | Metadata, history, secondary context |

## Usage

```tsx
{/* Primary card draws attention */}
<HbcCard weight="primary" header={<h2>Active Project</h2>}>
  <p>Key metrics and urgent items.</p>
</HbcCard>

{/* Standard card (default) */}
<HbcCard header={<h3>Project Details</h3>}>
  <p>General content container.</p>
</HbcCard>

{/* Supporting card recedes */}
<HbcCard weight="supporting" header={<h4>Recent Activity</h4>}>
  <p>Change log and secondary context.</p>
</HbcCard>
```

## Field Mode Behavior

Shadow and elevation are adjusted for Field Mode using darker shadow colors and hbcFieldTheme tokens. Lower elevations appear more subtle on dark backgrounds while maintaining visual separation.

## Accessibility

- Semantic heading structure for card titles
- Weight classes maintain sufficient contrast between border treatments
- `data-hbc-card-weight` attribute available for testing and inspection

## SPFx Constraints

No SPFx-specific constraints.
