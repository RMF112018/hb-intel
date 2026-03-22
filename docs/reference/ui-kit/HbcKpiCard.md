# HbcKpiCard

Standalone KPI metric card with adaptive sizing, colored trend pill badge, semantic gradient wash, and click-to-filter capability.

## Import

```tsx
import { HbcKpiCard } from '@hbc/ui-kit';
import type { HbcKpiCardProps, KpiTrend } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | required | KPI label text (truncates with ellipsis at narrow widths) |
| value | string \| number | required | KPI display value (adaptive font: 20–28px via `clamp()`) |
| subtitle | string | undefined | Optional descriptor below value (e.g., "active work items") |
| trend | KpiTrend | undefined | Colored pill badge with direction arrow + label |
| color | string | undefined | Semantic color for 4px top border + 8% gradient wash |
| icon | ReactNode | undefined | Top-right icon (40% opacity, 80% on hover) |
| isActive | boolean | false | Active/selected state for click-to-filter |
| onClick | () => void | undefined | Click handler for click-to-filter |
| ariaLabel | string | undefined | Accessible label for the card |
| className | string | undefined | Additional CSS class |

### KpiTrend

| Field | Type | Description |
|-------|------|-------------|
| direction | 'up' \| 'down' \| 'flat' | Trend direction — determines arrow (↑/↓/→) and pill color |
| label | string | Trend label text (e.g., "+5% this week"). Truncates at narrow widths. |

## Usage

```tsx
<HbcKpiCard
  label="Open RFIs"
  value={42}
  subtitle="active items"
  color="#d32f2f"
  trend={{ direction: 'up', label: '+3 this week' }}
  icon={<AlertIcon size="sm" />}
  ariaLabel="Filter by Open RFIs: 42 items"
  isActive={activeFilter === 'rfis'}
  onClick={() => setActiveFilter('rfis')}
/>
```

## Adaptive Sizing

The card adapts to its rendered width via CSS `clamp()`:

| Property | Narrow (≤400px viewport) | Wide (≥600px viewport) |
|----------|--------------------------|------------------------|
| Value font | 1.25rem (20px) | 1.75rem (28px) |
| Horizontal padding | 10px | 20px |
| Vertical padding | 10px | 14px |
| Internal gap | 3px | 6px |
| Min-height | 80px | 100px |
| Trend pill max-width | 40px (arrow only) | 120px (full label) |

Content priority under constraint: value → label → trend arrow → subtitle (truncated) → trend label (hidden).

Label and subtitle use `text-overflow: ellipsis` for graceful truncation. No container queries required — `clamp()` with viewport-relative intermediates provides sufficient adaptivity.

## Trend Pill Badge

Trends render as colored pill badges (not plain text):
- **Up (improving):** green tinted background (`${success}18`), green text, ↑ arrow
- **Down (worsening):** red tinted background (`${error}18`), red text, ↓ arrow
- **Flat (no change):** neutral gray background, muted text, → arrow

Each pill has `border-radius: 10px`, `font-weight: 600`, `font-size: 0.6875rem`.

## Gradient Wash

When `color` is provided, the card applies a soft gradient: `linear-gradient(180deg, ${color}14 0%, transparent 40%)` — an 8% opacity "warm glow" from the top that reinforces the accent color identity.

## Field Mode Behavior

In Field Mode, card background and border colors adapt via Fluent `tokens.colorNeutralBackground1`. Trend indicator colors maintain semantic meaning on dark surfaces.

## Accessibility

- Keyboard accessible when clickable (Enter/Space to activate)
- `aria-label` prop for explicit accessible name
- Trend direction conveyed by `aria-label` ("Trend: improving/worsening/no change") and visual pill badge
- Active state indicated with blue border (top + bottom) and selected background
- Hover shadow provides visual feedback on clickable cards

## Grid Integration

Cards are designed for CSS Grid containers with `auto-fill` or explicit column counts:
- Recommended: `repeat(auto-fill, minmax(130px, 1fr))` for adaptive distribution
- Hero card: `gridColumn: '1 / -1'` for full-width span
- No hard `maxWidth` — grid/flex parents control card width
