# HbcBarChart

Typed convenience wrapper for bar visualizations built on `HbcChart`.

## Import

```tsx
import { HbcBarChart } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `data` | `BarDataItem[]` | Yes | Bar series data consumed by the chart wrapper. |
| `height` | `string \| number` | No | Chart container height. Defaults to `400px`. |
| `options` | `EChartsOption` | No | Optional ECharts overrides. |
| `loading` | `boolean` | No | Shows loading state while data resolves. |

## Usage

```tsx
<HbcBarChart
  data={[
    { label: 'Jan', value: 12 },
    { label: 'Feb', value: 18 },
  ]}
  height={280}
/>
```

## Accessibility

- Uses chart semantics from `HbcChart` (`aria-label`, chart role description).
- Keep adjacent textual summaries/tables for non-visual consumption.

## Field Mode / Theme

Uses the same theme-aware color and axis token behavior as `HbcChart`.

## Entry Points

Exported from the full entry point: `@hbc/ui-kit`.
See [entry-points.md](/Users/bobbyfetting/hb-intel/docs/reference/ui-kit/entry-points.md).

