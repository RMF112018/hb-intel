# Analytics Architecture Contract

## Objective

Add a PCC-owned analytics system using direct `echarts` for MVP. The system must support previewable charts, deterministic sample data, reduced-motion behavior, theme integration, accessibility fallbacks, and dashboard-aware placement.

## Dependency

The user installs:

```bash
pnpm --filter @hbc/spfx-project-control-center add echarts
```

The local agent must not install dependencies.

## Direct ECharts MVP Rule

Use `echarts` directly. Do not install `echarts-for-react`.

Recommended import style:

```ts
import * as echarts from 'echarts/core';
import type { ECharts, EChartsOption } from 'echarts';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  SVGRenderer,
]);
```

The exact imports may vary based on chosen chart types, but avoid importing unnecessary charts/components if practical.

## Required Files

```text
apps/project-control-center/src/analytics/PccEchartsCanvas.tsx
apps/project-control-center/src/analytics/PccEchartsCanvas.module.css
apps/project-control-center/src/analytics/PccAnalyticsCard.tsx
apps/project-control-center/src/analytics/PccAnalyticsCard.module.css
apps/project-control-center/src/analytics/pccAnalyticsA11y.ts
apps/project-control-center/src/analytics/pccAnalyticsFixtures.ts
apps/project-control-center/src/analytics/pccAnalyticsOptions.ts
apps/project-control-center/src/analytics/pccAnalyticsTheme.ts
apps/project-control-center/src/analytics/pccAnalyticsTypes.ts
apps/project-control-center/src/analytics/pccAnalyticsViewModels.ts
apps/project-control-center/src/analytics/index.ts
```

## Core Types

```ts
export type PccAnalyticsState =
  | 'ready'
  | 'preview'
  | 'degraded'
  | 'empty'
  | 'source-unavailable';

export type PccAnalyticsChartKind =
  | 'donut'
  | 'stacked-bar'
  | 'grouped-bar'
  | 'line'
  | 'area'
  | 'progress-bars'
  | 'matrix';

export interface PccAnalyticsSummaryItem {
  readonly label: string;
  readonly value: string;
  readonly tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
}

export interface PccAnalyticsViewModel {
  readonly id: string;
  readonly title: string;
  readonly eyebrow: string;
  readonly description: string;
  readonly state: PccAnalyticsState;
  readonly stateLabel: string;
  readonly sourceLabel: string;
  readonly sampleData: boolean;
  readonly summary: readonly PccAnalyticsSummaryItem[];
  readonly chartKind: PccAnalyticsChartKind;
  readonly dataset: readonly Record<string, unknown>[];
  readonly accessibilitySummary: string;
}
```

## `PccEchartsCanvas`

Responsibilities:

- initialize ECharts on mount;
- dispose on unmount;
- apply options on update;
- resize on container change;
- support `forceAnimationDisabled` for tests;
- disable animation when reduced-motion is preferred;
- expose `data-pcc-analytics-chart="<id>"`;
- expose `data-pcc-analytics-state="<state>"`;
- expose `data-pcc-analytics-sample-data="true|false"`;
- never be the only source of critical information.

## `PccAnalyticsCard`

Responsibilities:

- wrap `PccDashboardCard`;
- accept `spanOverrides`;
- render product-grade preview/degraded explanation;
- render summary list/table fallback;
- render `PccEchartsCanvas`;
- support optional gateway action;
- use non-color-only states.

## Preview / Degraded Copy

Use product-grade copy:

```text
Preview analytics · sample project data
This preview uses deterministic sample project data until the source read model is connected.
```

Do not use:

```text
TODO
Mock chart
Dummy data
Developer preview
Fake data
```

## Reduced Motion

Use:

```ts
window.matchMedia('(prefers-reduced-motion: reduce)')
```

If true, set ECharts option `animation: false`.

## Accessibility

Each analytics card must include:

- visible title;
- state/source label;
- summary text;
- fallback list/table;
- `aria-label` or `aria-describedby`;
- no color-only legend;
- no tooltip-only critical facts.

## Theme Mapping

Create `pccAnalyticsTheme.ts` to map PCC/HB tokens into chart colors:

- text primary;
- text muted;
- border/gridline;
- info;
- success;
- warning;
- danger;
- neutral;
- HB orange accent;
- command navy only where appropriate.

Do not hardcode arbitrary chart palettes in individual components.

## Post-MVP TODO

Add:

```ts
// TODO(post-mvp): Re-evaluate echarts-for-react after MVP if it materially
// improves chart lifecycle handling, animation quality, responsiveness,
// accessibility integration, or maintainability versus the PCC-owned direct
// echarts wrapper.
```
