# HbcDonutChart

Typed convenience wrapper for donut/pie visualizations built on `HbcChart`.

## Import

```tsx
import { HbcDonutChart } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `data` | `DonutDataItem[]` | Yes | Donut slice data consumed by the chart wrapper. |
| `height` | `string \| number` | No | Chart container height. Defaults to `400px`. |
| `options` | `EChartsOption` | No | Optional ECharts overrides. |
| `loading` | `boolean` | No | Shows loading state while data resolves. |

## Usage

```tsx
<HbcDonutChart
  data={[
    { label: 'Open', value: 8 },
    { label: 'Closed', value: 21 },
  ]}
/>
```

## Accessibility

- Inherits accessible chart behaviors from `HbcChart`.
- Pair with labels/tables when precise values are critical.

## Field Mode / Theme

Donut colors and labels adapt automatically to active theme tokens.

## Entry Points

Exported from the full entry point: `@hbc/ui-kit`.
See [entry-points.md](/Users/bobbyfetting/hb-intel/docs/reference/ui-kit/entry-points.md).

