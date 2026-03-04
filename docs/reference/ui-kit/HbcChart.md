# HbcChart

ECharts wrapper components for data visualization including bar, donut, and line charts.

## Import

```tsx
import { HbcChart, HbcBarChart, HbcDonutChart, HbcLineChart } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | 'bar' \| 'donut' \| 'line' \| 'scatter' | required | Chart type |
| data | unknown[] | required | Data series for chart |
| options | EChartsOption | undefined | ECharts configuration overrides |
| height | string \| number | '400px' | Chart container height |
| loading | boolean | false | Shows loading spinner |

## Usage

```tsx
<HbcBarChart
  data={chartData}
  height="300px"
  options={{
    xAxis: { type: 'category' },
    yAxis: { type: 'value' }
  }}
/>

<HbcDonutChart
  data={donutData}
  height={250}
  loading={isLoading}
/>

<HbcLineChart
  data={timeSeriesData}
  options={{
    tooltip: { trigger: 'axis' }
  }}
/>
```

## Field Mode Behavior

Chart color palette adapts to Field Mode. Series colors shift to lighter, more saturated variants suitable for dark backgrounds. Axes text, labels, and legend use hbcFieldTheme token colors for visibility on dark surfaces.

## Accessibility

- Charts have `aria-label` describing the data visualization
- `aria-roledescription="chart"` identifies as chart to screen readers
- Data table alternative provided for complex visualizations
- Color-blind friendly palette with patterns as supplementary encoding
- Keyboard navigation for interactive elements (if applicable)

## SPFx Constraints

ECharts library must be externalized in SPFx manifests. Do not bundle echarts in SPFx web part packages. Configure as external dependency in webpackConfig or use dynamic import with fallback.
