# HbcKpiCard

Standalone KPI metric card with trend indicator, semantic color border, and click-to-filter capability.

## Import

```tsx
import { HbcKpiCard } from '@hbc/ui-kit';
import type { HbcKpiCardProps, KpiTrend } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | required | KPI label text |
| value | string \| number | required | KPI display value |
| trend | KpiTrend | undefined | Optional trend indicator |
| color | string | undefined | Semantic color for 3px top border |
| isActive | boolean | false | Active/selected state for click-to-filter |
| onClick | () => void | undefined | Click handler for click-to-filter |
| className | string | undefined | Additional CSS class |

### KpiTrend

| Field | Type | Description |
|-------|------|-------------|
| direction | 'up' \| 'down' \| 'flat' | Trend direction |
| label | string | Trend label text (e.g., "+5% this week") |

## Usage

```tsx
<HbcKpiCard
  label="Open RFIs"
  value={42}
  color="#d32f2f"
  trend={{ direction: 'up', label: '+3 this week' }}
  isActive={activeFilter === 'rfis'}
  onClick={() => setActiveFilter('rfis')}
/>
```

## Field Mode Behavior

In Field Mode, card background and border colors adapt via `hbcFieldTheme` tokens. Trend indicator colors maintain semantic meaning on dark surfaces.

## Accessibility

- Keyboard accessible when clickable (Enter/Space to activate)
- Trend direction conveyed by both arrow icon and label text
- Active state indicated with blue border and background change
- Hover shadow provides visual feedback on clickable cards

## SPFx Constraints

No SPFx-specific constraints. Min-width 160px, max-width 240px with flex layout.
