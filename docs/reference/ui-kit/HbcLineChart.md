# HbcLineChart

Typed convenience wrapper for line/time-series visualizations built on `HbcChart`.

## Import

```tsx
import { HbcLineChart } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `data` | `LineSeriesItem[]` | Yes | Line-series data consumed by the chart wrapper. |
| `height` | `string \| number` | No | Chart container height. Defaults to `400px`. |
| `options` | `EChartsOption` | No | Optional ECharts overrides. |
| `loading` | `boolean` | No | Shows loading state while data resolves. |

## Usage

```tsx
<HbcLineChart
  data={[
    { name: 'Forecast', points: [12, 16, 14, 19] },
  ]}
  options={{ tooltip: { trigger: 'axis' } }}
/>
```

## Accessibility

- Inherits accessible chart behaviors from `HbcChart`.
- Keep readable summary text for trend interpretation.

## Field Mode / Theme

Line stroke, axis, and legend colors map to active light/field theme tokens.

## Entry Points

Exported from the full entry point: `@hbc/ui-kit`.
See [entry-points.md](/Users/bobbyfetting/hb-intel/docs/reference/ui-kit/entry-points.md).

